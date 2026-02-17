from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import db_manager

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Initialize database on server startup"""
    print("🚀 Starting SQL Query Bot...")
    if db_manager.is_connected():
        print("✅ Database ready")
    else:
        print("❌ Database initialization failed")

from routes.chat import router
app.include_router(router)

