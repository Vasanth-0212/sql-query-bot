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

export async function generateSQL(question: string, schema: string): Promise<string> {
  const systemPrompt = `You are a PostgreSQL expert. Convert question to SQL using this schema:

${schema}

Rules:
- Only return SQL
- No explanation
- Only SELECT queries
- Use proper joins
- Use LIMIT 50 unless aggregation
- PostgreSQL syntax only
- Be selective with columns - only include what's specifically requested
- For "show me X by Y" queries, typically only need X and Y columns
- For counting/summary queries, only include the grouping columns and aggregates
- Avoid returning unnecessary contact details unless specifically asked

Examples:
- "Show me customers by city" → SELECT first_name, last_name, city FROM customers ORDER BY city
- "Count customers by state" → SELECT state, COUNT(*) FROM customers GROUP BY state
- "Top products by revenue" → SELECT name, SUM(price * quantity) as revenue FROM products p JOIN order_items oi ON p.id = oi.product_id GROUP BY p.name ORDER BY revenue DESC

Return clean, efficient SQL that answers the specific question without extra data.`;

  const promptTemplate = ChatPromptTemplate.fromMessages([
    ["system", systemPrompt],
    ["human", question]
  ]);

  try {
    const chain = promptTemplate.pipe(llm);
    const response = await chain.invoke({});
    
    const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
    
    // Clean SQL
    const cleanedSQL = content.replace(/```sql/gi, "").replace(/```/g, "").trim();
    
    if (!cleanedSQL) {
      throw new Error('LLM returned empty SQL');
    }
    
    return cleanedSQL;
  } catch (error) {
    console.error('SQL Generation Error:', error);
    throw new Error(`Failed to generate SQL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
