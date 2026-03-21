import { NextRequest, NextResponse } from 'next/server';
import { neonDB } from '@/lib/database';
import { generateSQL } from '@/lib/sql-generator';
import { formatResponse } from '@/lib/response-formatter';
import { validateSQL } from '@/lib/sql-validator';
import { classifyQuestion, generateFollowUpQuestions } from '@/lib/question-classifier';

// Hardcoded database schema
const DATABASE_SCHEMA = `customers(id PK, first_name, last_name, email, phone, gender, date_of_birth, city, state, country, created_at)
orders(id PK, customer_id FK->customers.id, order_date, status, payment_method, total_amount, shipping_city, shipping_state, shipping_country)
order_items(id PK, order_id FK->orders.id, product_id FK->products.id, quantity, price, total)
products(id PK, name, category, price, cost, stock, created_at)

Relationships:
customers 1-N orders
orders 1-N order_items
products 1-N order_items`;

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    // Classify the question to determine if it needs SQL querying
    const classification = await classifyQuestion(question);
    console.log(`Question classification: ${classification.isDataQuery ? 'Data Query' : 'General'} (confidence: ${classification.confidence})`);

    // If it's a general question, respond with follow-up suggestions
    if (!classification.isDataQuery) {
      const followUpResponse = await generateFollowUpQuestions(question);
      const response = {
        text: followUpResponse.response,
        followUpQuestions: followUpResponse.followUpQuestions,
        isConversational: true
      };

      return NextResponse.json({
        response,
        "response_format" : "general"
      });
    }

    // Proceed with SQL generation for data queries
    let sqlQuery: string = '';
    let lastError: string = '';
    const maxRetries = 3;

    // Try to generate and validate SQL with retries
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Generate SQL
        sqlQuery = await generateSQL(question, DATABASE_SCHEMA);
        console.log(sqlQuery);
        
        // Validate the generated SQL
        const validation = await validateSQL(sqlQuery);
        
        if (validation.valid) {
          // If valid, break out of retry loop
          break;
        } else {
          lastError = validation.error || 'Unknown validation error';
          console.log(`Attempt ${attempt} failed validation: ${lastError}`);
          
          // If this is the last attempt, return error
          if (attempt === maxRetries) {
            return NextResponse.json({
              error: 'Failed to generate valid SQL after multiple attempts',
              details: lastError,
              sql: sqlQuery
            }, { status: 400 });
          }
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
        console.log(`Attempt ${attempt} failed: ${lastError}`);
        
        // If this is the last attempt, return error
        if (attempt === maxRetries) {
          return NextResponse.json({
            error: 'Failed to generate SQL after multiple attempts',
            details: lastError
          }, { status: 400 });
        }
      }
    }

    // Execute the validated query
    const queryResult = await neonDB.executeQuery(sqlQuery);
    if (!queryResult.success) {
      return NextResponse.json({
        error: 'Failed to execute query',
        details: queryResult.error,
        sql: sqlQuery
      }, { status: 400 });
    }

    // Format response with charts
    const response = await formatResponse(question, queryResult.data || []);
    console.log(response);

    return NextResponse.json({
      response,
      "response_format" : "data"
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}