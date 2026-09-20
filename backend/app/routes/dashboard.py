from fastapi import APIRouter, Depends
from ..database import get_database
from ..utils.dependencies import get_current_user
from ..schemas.dashboard import DashboardStatistics

router = APIRouter()

@router.get("/statistics", response_model=DashboardStatistics)
async def get_statistics(current_user: dict = Depends(get_current_user)):
    db = get_database()
    
    # Base match: if user is not admin, only show stats for their own incidents
    match_stage = {}
    if current_user["role"] != "ADMIN":
        match_stage["reported_by.username"] = current_user["username"]
        
    pipeline = [
        {"$match": match_stage},
        {
            "$group": {
                "_id": None,
                "total_incidents": {"$sum": 1},
                "critical": {"$sum": {"$cond": [{"$eq": ["$severity", "Critical"]}, 1, 0]}},
                "high": {"$sum": {"$cond": [{"$eq": ["$severity", "High"]}, 1, 0]}},
                "medium": {"$sum": {"$cond": [{"$eq": ["$severity", "Medium"]}, 1, 0]}},
                "low": {"$sum": {"$cond": [{"$eq": ["$severity", "Low"]}, 1, 0]}},
                "open": {"$sum": {"$cond": [{"$eq": ["$status", "Open"]}, 1, 0]}},
                "under_investigation": {"$sum": {"$cond": [{"$eq": ["$status", "Under Investigation"]}, 1, 0]}},
                "resolved": {"$sum": {"$cond": [{"$eq": ["$status", "Resolved"]}, 1, 0]}},
                "closed": {"$sum": {"$cond": [{"$eq": ["$status", "Closed"]}, 1, 0]}}
            }
        }
    ]
    
    cursor = db.incidents.aggregate(pipeline)
    result = await cursor.to_list(length=1)
    
    if result:
        stats = result[0]
        stats.pop("_id", None)
        return DashboardStatistics(**stats)
    else:
        return DashboardStatistics(
            total_incidents=0, critical=0, high=0, medium=0, low=0, 
            open=0, under_investigation=0, resolved=0, closed=0
        )

@router.get("/severity")
async def get_severity_chart(current_user: dict = Depends(get_current_user)):
    db = get_database()
    match_stage = {}
    if current_user["role"] != "ADMIN":
        match_stage["reported_by.username"] = current_user["username"]
        
    pipeline = [
        {"$match": match_stage},
        {"$group": {"_id": "$severity", "count": {"$sum": 1}}}
    ]
    cursor = db.incidents.aggregate(pipeline)
    results = await cursor.to_list(length=10)
    return [{"name": r["_id"], "value": r["count"]} for r in results if r["_id"]]

@router.get("/status")
async def get_status_chart(current_user: dict = Depends(get_current_user)):
    db = get_database()
    match_stage = {}
    if current_user["role"] != "ADMIN":
        match_stage["reported_by.username"] = current_user["username"]
        
    pipeline = [
        {"$match": match_stage},
        {"$group": {"_id": "$status", "count": {"$sum": 1}}}
    ]
    cursor = db.incidents.aggregate(pipeline)
    results = await cursor.to_list(length=10)
    return [{"name": r["_id"], "value": r["count"]} for r in results if r["_id"]]

@router.get("/types")
async def get_types_chart(current_user: dict = Depends(get_current_user)):
    db = get_database()
    match_stage = {}
    if current_user["role"] != "ADMIN":
        match_stage["reported_by.username"] = current_user["username"]
        
    pipeline = [
        {"$match": match_stage},
        {"$group": {"_id": "$incident_type", "count": {"$sum": 1}}}
    ]
    cursor = db.incidents.aggregate(pipeline)
    results = await cursor.to_list(length=20)
    return [{"name": r["_id"], "value": r["count"]} for r in results if r["_id"]]
