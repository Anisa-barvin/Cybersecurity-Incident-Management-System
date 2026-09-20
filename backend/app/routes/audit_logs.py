from fastapi import APIRouter, Depends, Query
from ..database import get_database
from ..utils.dependencies import get_current_admin
import math

router = APIRouter()

@router.get("/")
async def get_audit_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_admin: dict = Depends(get_current_admin)
):
    db = get_database()
    total = await db.audit_logs.count_documents({})
    total_pages = math.ceil(total / limit)
    
    cursor = db.audit_logs.find({}).sort("timestamp", -1).skip((page - 1) * limit).limit(limit)
    logs = []
    async for log in cursor:
        log["_id"] = str(log["_id"])
        logs.append(log)
        
    return {
        "data": logs,
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": total_pages
    }
