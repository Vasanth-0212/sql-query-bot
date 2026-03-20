import { Pool } from 'pg';

interface QueryResult<T = Record<string, unknown>[]> {
  success: boolean;
  data?: T;
  error?: string;
  rowCount?: number;
}

interface TableColumn {
  name: string;
  type: string;
  nullable: boolean;
  default: string | null;
  maxLength: number | null;
  precision: number | null;
  scale: number | null;
  isPrimaryKey: boolean;
}

interface TableSchema {
  table: string;
  columns: TableColumn[];
  primaryKeys: string[];
}

class NeonDatabaseService {
  private pool: Pool | null = null;
  private initialized: boolean = false;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (this.initialized || !process.env.DATABASE_URL) {
      return;
    }

    try {
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });

      // Test connection
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      client.release();

      this.initialized = true;
      console.log('✅ Neon database connected successfully');
    } catch (error) {
      console.error('❌ Failed to connect to Neon database:', error);
      this.pool = null;
    }
  }

  async executeQuery(query: string): Promise<QueryResult> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.pool) {
      return {
        success: false,
        error: 'Database connection not available'
      };
    }

    // Basic SQL injection protection - only allow SELECT queries
    const trimmedQuery = query.trim().toLowerCase();
    if (!trimmedQuery.startsWith('select') && !trimmedQuery.startsWith('with')) {
      return {
        success: false,
        error: 'Only SELECT queries are allowed for security reasons'
      };
    }

    try {
      const client = await this.pool.connect();
      const result = await client.query(query);
      client.release();

      return {
        success: true,
        data: result.rows,
        rowCount: result.rowCount || undefined
      };
    } catch (error) {
      console.error('Database query error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown database error'
      };
    }
  }

  async testConnection(): Promise<QueryResult> {
    try {
      const result = await this.executeQuery('SELECT 1 as test_connection');
      if (result.success) {
        return {
          success: true,
          data: [{ status: 'Database connection successful' }],
          rowCount: 1
        };
      }
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }

  async getSchema(): Promise<QueryResult<TableSchema[]>> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.pool) {
      return {
        success: false,
        error: 'Database connection not available'
      };
    }

    try {
      const client = await this.pool.connect();
      
      // Get all tables in the public schema
      const tablesQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `;
      const tablesResult = await client.query(tablesQuery);
      
      const schema: TableSchema[] = [];
      
      // For each table, get its columns
      for (const tableRow of tablesResult.rows) {
        const tableName = tableRow.table_name;
        
        const columnsQuery = `
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default,
            character_maximum_length,
            numeric_precision,
            numeric_scale
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = $1
          ORDER BY ordinal_position
        `;
        
        const columnsResult = await client.query(columnsQuery, [tableName]);
        
        // Get primary key information
        const primaryKeyQuery = `
          SELECT a.attname
          FROM pg_constraint c
          JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
          WHERE c.conrelid = $1::regclass
          AND c.contype = 'p'
        `;
        const primaryKeyResult = await client.query(primaryKeyQuery, [tableName]);
        const primaryKeys = primaryKeyResult.rows.map(row => row.attname);
        
        schema.push({
          table: tableName,
          columns: columnsResult.rows.map(col => ({
            name: col.column_name,
            type: col.data_type,
            nullable: col.is_nullable === 'YES',
            default: col.column_default,
            maxLength: col.character_maximum_length,
            precision: col.numeric_precision,
            scale: col.numeric_scale,
            isPrimaryKey: primaryKeys.includes(col.column_name)
          })),
          primaryKeys: primaryKeys
        });
      }
      
      client.release();

      return {
        success: true,
        data: schema,
        rowCount: schema.length
      };
    } catch (error) {
      console.error('Database schema error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve database schema'
      };
    }
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.initialized = false;
    }
  }
}

// Create singleton instance
const neonDB = new NeonDatabaseService();

export { NeonDatabaseService, neonDB };
export type { QueryResult };
