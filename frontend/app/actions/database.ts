"use server";

import { neonDB, QueryResult } from '@/lib/database';

class QueryExecutor {
  private dbService = neonDB;

  async execute_query(query: string): Promise<QueryResult> {
    // Input validation
    if (!query || typeof query !== 'string') {
      return {
        success: false,
        error: 'Query parameter is required and must be a string'
      };
    }

    // Trim whitespace
    const trimmedQuery = query.trim();
    
    if (!trimmedQuery) {
      return {
        success: false,
        error: 'Query cannot be empty'
      };
    }

    try {
      // Execute the query using the database service
      const result = await this.dbService.executeQuery(trimmedQuery);
      
      // Log successful queries (remove in production)
      if (result.success) {
        console.log(`Query executed successfully. Rows returned: ${result.rowCount || 0}`);
      }

      return result;
    } catch (error) {
      console.error('Unexpected error in execute_query:', error);
      return {
        success: false,
        error: 'An unexpected error occurred while executing the query'
      };
    }
  }

  async test_connection(): Promise<QueryResult> {
    try {
      return await this.dbService.testConnection();
    } catch (error) {
      console.error('Connection test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }
}

// Create singleton instance
const queryExecutor = new QueryExecutor();

// Export the server action
export const execute_query = queryExecutor.execute_query.bind(queryExecutor);
export const test_connection = queryExecutor.test_connection.bind(queryExecutor);

// Export the class if needed for other uses
export { QueryExecutor };
