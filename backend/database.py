from langchain_community.utilities import SQLDatabase
from dotenv import load_dotenv
import os
from typing import Optional
from sqlalchemy import text

load_dotenv()

class DatabaseManager:
    _instance: Optional['DatabaseManager'] = None
    _db: Optional[SQLDatabase] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseManager, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._db is None:
            self.initialize_database()
    
    def initialize_database(self) -> bool:
        """Initialize database connection"""
        try:
            database_url = os.getenv(
                "DATABASE_URL", 
                "postgresql://neondb_owner:npg_I1NTimfVns0l@ep-cold-paper-a1ix5o17-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
            )
            
            self._db = SQLDatabase.from_uri(database_url)
            print(self._db.get_table_info())
            
            # Test connection
            self._db.run("SELECT 1")
            print("✅ Database connected successfully")
            return True
            
        except Exception as e:
            print(f"❌ Database connection failed: {str(e)}")
            self._db = None
            return False
    
    def get_database(self) -> Optional[SQLDatabase]:
        """Get database instance"""
        return self._db
    
    def is_connected(self) -> bool:
        """Check if database is connected"""
        return self._db is not None
    
    def get_schema(self) -> str:
        """Get database schema information"""
        if not self.is_connected():
            return "Error: Database not connected"
        
        try:
            return self._db.get_table_info()
        except Exception as e:
            return f"Error getting schema: {str(e)}"
    
    def execute_query(self, query: str):
        if not self.is_connected():
            return {"error": "Database not connected"}

        try:
            engine = self._db._engine

            with engine.connect() as conn:
                result = conn.execute(text(query))

                # fetch column names
                columns = result.keys()

                # fetch rows
                rows = result.fetchall()

                # convert to list of dict
                data = [dict(zip(columns, row)) for row in rows]

            return {
                "sql_query": query,
                "results": data,
                "row_count": len(data)
            }

        except Exception as e:
            return {"error": str(e)}
    
    def reconnect(self) -> bool:
        """Reconnect to database"""
        self._db = None
        return self.initialize_database()

# Global instance
db_manager = DatabaseManager()
