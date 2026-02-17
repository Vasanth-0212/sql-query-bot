from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from database import db_manager
from dotenv import load_dotenv
import os
import json
from datetime import date, datetime
from decimal import Decimal

class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (date, datetime)):
            return obj.isoformat()
        elif isinstance(obj, Decimal):
            return float(obj)
        return super().default(obj)

load_dotenv()

# Gemini LLM (UNCHANGED)
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash-lite",
    temperature=0,
    google_api_key=os.getenv("GEMINI_API_KEY")
)

# Get dynamic schema
dynamic_schema = db_manager.get_schema()


# ==============================
# SQL GENERATION CHAIN
# ==============================
def create_sql_chain(schema: str = None):
    current_schema = schema or dynamic_schema

    system_prompt = f"""
You are a PostgreSQL expert.

Convert the user question into SQL.

Rules:
- Only return SQL
- No explanation
- Only SELECT queries
- Use proper joins
- Use LIMIT 50 unless aggregation
- PostgreSQL syntax only

DATABASE SCHEMA:
{current_schema}
"""

    prompt_template = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{question}")
    ])

    return prompt_template | llm


# ==============================
# RESPONSE FORMATTER CHAIN
# ==============================
def create_response_chain():
    system_prompt = """
You are a data analyst.

You will receive:
- user question
- SQL results (JSON)

Return JSON ONLY in this format:

{{
  "text": "short explanation",
  "barchart": {{
    "labels": [],
    "values": [],
    "xLabel": "",
    "yLabel": ""
  }},
  "piechart": {{
    "labels": [],
    "values": []
  }}
}}

Rules:
- ALWAYS return all 3 keys
- Only ONE chart should contain data
- If question is analytical → return chart
- If simple lookup → charts empty
- No explanation outside JSON
"""

    prompt_template = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "Question: {question}\n\nSQL Results:\n{results}")
    ])

    return prompt_template | llm


response_chain = create_response_chain()


# ==============================
# ORCHESTRATOR FUNCTION
# ==============================
def generate_final_response(question: str, sql_results):
    try:
        formatted = json.dumps(sql_results, cls=CustomJSONEncoder)

        res = response_chain.invoke({
            "question": question,
            "results": formatted
        })
        print(res , "vas111")  

        # Extract JSON from markdown code blocks
        content = res.content
        if "```json" in content:
            # Extract JSON from markdown code block
            start = content.find("```json") + 7
            end = content.find("```", start)
            json_str = content[start:end].strip()
        else:
            json_str = content.strip()
        
        return json.loads(json_str)

    except Exception as e:
        return {
            "text": "Error generating response",
            "barchart": {"labels": [], "values": [], "xLabel": "", "yLabel": ""},
            "piechart": {"labels": [], "values": []}
        }