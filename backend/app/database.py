from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings
import logging

class Database:
    client: AsyncIOMotorClient = None

db = Database()

async def connect_to_mongo():
    try:
        db.client = AsyncIOMotorClient(settings.MONGODB_URI)
        logging.info("Connected to MongoDB")
        
        # Create indexes
        database = get_database()
        
        # Users indexes
        await database.users.create_index("username", unique=True)
        await database.users.create_index("email", unique=True)
        
        # Incidents indexes
        await database.incidents.create_index("incident_id", unique=True)
        await database.incidents.create_index("incident_type")
        await database.incidents.create_index("severity")
        await database.incidents.create_index("status")
        await database.incidents.create_index("reported_by.username")
        await database.incidents.create_index("reported_date")
        
        # Audit Logs indexes
        await database.audit_logs.create_index("username")
        await database.audit_logs.create_index("action")
        await database.audit_logs.create_index("resource_id")
        await database.audit_logs.create_index("timestamp")
        
    except Exception as e:
        logging.error(f"Error connecting to MongoDB: {e}")
        raise e

async def close_mongo_connection():
    if db.client:
        db.client.close()
        logging.info("Closed MongoDB connection")

def get_database():
    return db.client[settings.DATABASE_NAME]
