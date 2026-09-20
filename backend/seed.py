import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import sys
import os

# Add app to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.config import settings
from app.utils.security import get_password_hash
from datetime import datetime, timedelta

async def seed_database():
    print(f"Connecting to MongoDB at {settings.MONGODB_URI}...")
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = client[settings.DATABASE_NAME]
    
    print("Clearing existing data...")
    await db.users.delete_many({})
    await db.incidents.delete_many({})
    await db.audit_logs.delete_many({})
    
    print("Creating admin user...")
    admin_user = {
        "full_name": "System Administrator",
        "username": "admin",
        "email": "admin@cybershield.local",
        "password_hash": get_password_hash("admin123"),
        "role": "ADMIN",
        "created_at": datetime.utcnow()
    }
    admin_res = await db.users.insert_one(admin_user)
    admin_id = str(admin_res.inserted_id)
    
    print("Creating normal users...")
    user1 = {
        "full_name": "Alice Security",
        "username": "alice",
        "email": "alice@cybershield.local",
        "password_hash": get_password_hash("password123"),
        "role": "USER",
        "created_at": datetime.utcnow()
    }
    user2 = {
        "full_name": "Bob Analyst",
        "username": "bob",
        "email": "bob@cybershield.local",
        "password_hash": get_password_hash("password123"),
        "role": "USER",
        "created_at": datetime.utcnow()
    }
    
    user1_res = await db.users.insert_one(user1)
    user2_res = await db.users.insert_one(user2)
    
    print("Seeding incidents...")
    incidents = [
        {
            "incident_id": "INC-1001",
            "incident_type": "Phishing",
            "severity": "High",
            "description": "User received malicious email asking for credentials.",
            "affected_system": "Email Server",
            "status": "Under Investigation",
            "reported_by": {"user_id": str(user1_res.inserted_id), "username": "alice"},
            "reported_date": datetime.utcnow() - timedelta(days=2),
            "created_at": datetime.utcnow() - timedelta(days=2),
            "updated_at": datetime.utcnow() - timedelta(days=1),
            "actions_taken": [
                {"action": "Email removed from inbox", "performed_by": "admin", "performed_at": datetime.utcnow() - timedelta(days=1)}
            ],
            "assigned_to": {"user_id": admin_id, "username": "admin"}
        },
        {
            "incident_id": "INC-1002",
            "incident_type": "Malware",
            "severity": "Critical",
            "description": "Ransomware detected on file server.",
            "affected_system": "File Server FS01",
            "status": "Open",
            "reported_by": {"user_id": str(user2_res.inserted_id), "username": "bob"},
            "reported_date": datetime.utcnow() - timedelta(hours=5),
            "created_at": datetime.utcnow() - timedelta(hours=5),
            "updated_at": datetime.utcnow() - timedelta(hours=5),
            "actions_taken": [],
            "assigned_to": None
        },
        {
            "incident_id": "INC-1003",
            "incident_type": "Unauthorized Access",
            "severity": "Medium",
            "description": "Failed login attempts from suspicious IP.",
            "affected_system": "VPN Gateway",
            "status": "Resolved",
            "reported_by": {"user_id": admin_id, "username": "admin"},
            "reported_date": datetime.utcnow() - timedelta(days=5),
            "created_at": datetime.utcnow() - timedelta(days=5),
            "updated_at": datetime.utcnow() - timedelta(days=4),
            "actions_taken": [
                {"action": "Blocked IP address", "performed_by": "admin", "performed_at": datetime.utcnow() - timedelta(days=4)}
            ],
            "assigned_to": {"user_id": admin_id, "username": "admin"}
        }
    ]
    
    await db.incidents.insert_many(incidents)
    print("Seeding complete! You can log in as admin / admin123")
    
if __name__ == "__main__":
    asyncio.run(seed_database())
