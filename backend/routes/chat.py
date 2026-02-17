from fastapi import APIRouter
from pydantic import BaseModel
from database import db_manager
from prompt import create_sql_chain, generate_final_response
import json
import re

router = APIRouter()

class Query(BaseModel):
    question: str


def clean_sql(query: str):
    query = re.sub(r"```sql", "", query, flags=re.IGNORECASE)
    query = re.sub(r"```", "", query)
    return query.strip()


@router.post("/chat")
def generate_sql_query(req: Query):

    # 1️⃣ Get schema
    current_schema = db_manager.get_schema()

    # 2️⃣ Generate SQL
    sql_chain = create_sql_chain(current_schema)
    question =  req.question
    response = sql_chain.invoke({"question": question})

    sql_query = clean_sql(response.content.strip())

    # 3️⃣ Execute SQL
    results = db_manager.execute_query(sql_query)

    # 4️⃣ Send to second LLM for formatting
    final_response = generate_final_response(
        question=question,
        sql_results=results
    )

    return {
        "response": final_response
    }