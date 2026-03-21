import { ChatOpenAI } from "@langchain/openai";
import { BotPayload } from '@/types';

// Initialize LLM
const llm = new ChatOpenAI({
  model: "openrouter/free",
  temperature: 0.7,
  openAIApiKey: process.env.OPENROUTER_API_KEY,
  configuration: {
    baseURL: "https://openrouter.ai/api/v1"
  }
});

export async function formatResponse(question: string, data: Record<string, unknown>[]): Promise<BotPayload> {
  try {
    const dataStr = JSON.stringify(data, null, 2);
    const prompt = `You are a data analyst. Analyze this data and provide a response with charts and follow-up questions.

Question: ${question}

Data: ${dataStr}

Return JSON format: {
  "text": "explanation of the data",
  "barchart": {"labels": [], "values": [], "xLabel": "", "yLabel": ""},
  "piechart": {"labels": [], "values": []},
  "followUpQuestions": ["question 1", "question 2", "question 3"]
}

For follow-up questions, suggest 2-3 relevant questions that would help the user explore this data further. Examples:
- If showing customers by city: "Which city has the most customers?", "Show me customers in [city name]", "What's the total revenue by city?"
- If showing products by revenue: "Which products are least profitable?", "Show sales trends over time", "What categories perform best?"
- If showing orders by status: "What's the average order value?", "Show pending orders", "What's the fulfillment rate?"

Make follow-up questions specific and actionable based on the actual data shown.`;
    
    const response = await llm.invoke(prompt);
    const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
    
    // Extract JSON from response
    let jsonStr = content.trim();
    if (jsonStr.includes("```json")) {
      const start = jsonStr.indexOf("```json") + 7;
      const end = jsonStr.indexOf("```", start);
      jsonStr = jsonStr.substring(start, end).trim();
    }
    
    const parsed = JSON.parse(jsonStr);
    
    // Ensure followUpQuestions is an array
    if (!parsed.followUpQuestions || !Array.isArray(parsed.followUpQuestions)) {
      parsed.followUpQuestions = [];
    }
    
    return parsed;
  } catch {
    // Simple fallback with basic follow-up questions
    return {
      text: 'Found ' + data.length + ' results for your query.',
      barchart: { labels: [], values: [], xLabel: "", yLabel: "" },
      piechart: { labels: [], values: [] },
      followUpQuestions: [
        "Show me more details",
        "What are the top results?",
        "Can you summarize this data?"
      ]
    };
  }
}

export async function generateConversationalResponse(question: string): Promise<BotPayload> {
  try {
    const prompt = 'You are a helpful SQL assistant. Respond to: ' + question;
    const response = await llm.invoke(prompt);
    const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
    
    return {
      text: content,
      barchart: { labels: [], values: [], xLabel: "", yLabel: "" },
      piechart: { labels: [], values: [] }
    };
  } catch {
    return {
      text: "I'm here to help you analyze your data. Ask me questions about your database!",
      barchart: { labels: [], values: [], xLabel: "", yLabel: "" },
      piechart: { labels: [], values: [] }
    };
  }
}
