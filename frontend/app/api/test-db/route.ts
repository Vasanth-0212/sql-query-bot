import { NextRequest, NextResponse } from 'next/server';
import { execute_query, test_connection } from '@/app/actions/database';
import { neonDB } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Test database connection
    const connectionTest = await test_connection();

    // If action is 'schema', return database schema
    if (action === 'schema') {
      const schemaResult = await neonDB.getSchema();
      const statusCode = schemaResult.success ? 200 : 400;
      
      return NextResponse.json({
        message: 'Database schema',
        schema: schemaResult,
        connection: connectionTest
      }, { status: statusCode });
    }
    
    return NextResponse.json({
      message: 'Database test endpoint',
      connection: connectionTest,
      usage: {
        method: 'POST',
        body: {
          query: 'SELECT * FROM your_table LIMIT 10'
        },
        description: 'Send a POST request with a query parameter to execute SQL queries'
      },
      endpoints: {
        'GET /api/test-db': 'Test connection and usage info',
        'GET /api/test-db?action=schema': 'Get database schema',
        'POST /api/test-db': 'Execute SQL queries'
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Test endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json({
        success: false,
        error: 'Query parameter is required in the request body'
      }, { status: 400 });
    }

    // Execute the query using the server action
    const result = await execute_query(query);

    // Return appropriate HTTP status based on result
    const statusCode = result.success ? 200 : 400;
    
    return NextResponse.json(result, { status: statusCode });
  } catch (error) {
    console.error('Test route error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
