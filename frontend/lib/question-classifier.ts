import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

// Initialize LLM
const llm = new ChatOpenAI({
  model: "openrouter/free",
  temperature: 0.7,
  openAIApiKey: process.env.OPENROUTER_API_KEY,
  configuration: {
    baseURL: "https://openrouter.ai/api/v1"
  }
});

function isDatabaseQuery(message: string) {

  const dbKeywords = [
    "customer",
    "order",
    "product",
    "sales",
    "revenue",
    "total",
    "count",
    "top",
    "list",
    "show",
    "average",
    "sum",
    "group",
    "monthly",
    "yearly"
  ];

  return dbKeywords.some(keyword =>
    message.toLowerCase().includes(keyword)
  );

}

export async function classifyQuestion(question: string): Promise<{ isDataQuery: boolean; confidence: number; reason?: string }> {
  // Use simple keyword-based classification for now
  const isData = isDatabaseQuery(question);
  return {
    isDataQuery: isData,
    confidence: isData ? 0.8 : 0.6,
    reason: isData ? 'Contains database keywords' : 'No database keywords found'
  };
}

export async function generateFollowUpQuestions(question: string): Promise<{ response: string; followUpQuestions: string[] }> {
  const systemPrompt = `You are a helpful AI assistant for a SQL query bot with access to a database.

Database context:
I can analyze data from these tables:
- customers (id, first_name, last_name, email, phone, gender, date_of_birth, city, state, country, created_at)
- orders (id, customer_id, order_date, status, payment_method, total_amount, shipping_city, shipping_state, shipping_country)
- order_items (id, order_id, product_id, quantity, price, total)
- products (id, name, category, price, cost, stock, created_at)

Relationships: customers 1-N orders 1-N order_items N-1 products

For general questions, respond briefly and suggest 2-3 specific database questions they could ask instead. Keep it conversational and helpful.

Respond in JSON format: {{"response": "brief conversational response", "followUpQuestions": ["question 1", "question 2", "question 3"]}}

Examples:
- If they ask "who are you" -> {"response": "I'm your database assistant! I can help you analyze customer data, sales trends, or product performance.", "followUpQuestions": ["What are our top-selling products?", "Show me customers by city", "What's our total revenue?"]}
- If they ask "what can you do" -> {"response": "I can analyze your business data. Ask me about sales performance, customer behavior, inventory, or order trends.", "followUpQuestions": ["What's our monthly revenue?", "Which products are most popular?", "Show me orders by status"]}

Keep the response under 2 sentences and provide 2-3 specific, actionable follow-up questions.`;

  const promptTemplate = ChatPromptTemplate.fromMessages([
    ["system", systemPrompt],
    ["human", question]
  ]);

  try {
    const chain = promptTemplate.pipe(llm);
    const response = await chain.invoke({});
    
    const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
    
    // Clean and parse JSON response
    const cleanedContent = content.replace(/```json/gi, "").replace(/```/g, "").trim();
    
    try {
      const parsed = JSON.parse(cleanedContent);
      return {
        response: parsed.response || "I'm your database assistant! I can help analyze customer data, sales trends, or product performance.",
        followUpQuestions: parsed.followUpQuestions || ["What are our top-selling products?", "Show me customers by city", "What's our total revenue?"]
      };
    } catch {
      // Fallback if JSON parsing fails
      return {
        response: "I'm your database assistant! I can help analyze customer data, sales trends, or product performance.",
        followUpQuestions: ["What are our top-selling products?", "Show me customers by city", "What's our total revenue?"]
      };
    }
  } catch (error) {
    console.error('Follow-up response generation error:', error);
    return {
      response: "I'm your database assistant! I can help analyze customer data, sales trends, or product performance.",
      followUpQuestions: ["What are our top-selling products?", "Show me customers by city", "What's our total revenue?"]
    };
  }
}