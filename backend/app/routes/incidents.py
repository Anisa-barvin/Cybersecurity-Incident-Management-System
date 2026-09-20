from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime
from ..database import get_database
from ..schemas.incident import IncidentCreate, IncidentUpdate, IncidentInDB, ActionTaken, UserRef
from ..utils.dependencies import get_current_user, get_current_admin
from bson import ObjectId
import math

router = APIRouter()

async def log_audit(db, user, action, resource, resource_id, details=None):
    audit_entry = {
        "user_id": str(user["_id"]),
        "username": user["username"],
        "action": action,
        "resource": resource,
        "resource_id": resource_id,
        "details": details or {},
        "timestamp": datetime.utcnow()
    }
    await db.audit_logs.insert_one(audit_entry)

@router.post("/", response_model=IncidentInDB, status_code=status.HTTP_201_CREATED)
async def create_incident(incident: IncidentCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    
    # Generate simple sequential incident ID or random for now
    count = await db.incidents.count_documents({})
    incident_id = f"INC-{1000 + count + 1}"
    
    incident_dict = incident.dict(exclude={"actions_taken"})
    incident_dict["incident_id"] = incident_id
    incident_dict["reported_by"] = {
        "user_id": str(current_user["_id"]),
        "username": current_user["username"]
    }
    incident_dict["reported_date"] = datetime.utcnow()
    incident_dict["created_at"] = datetime.utcnow()
    incident_dict["updated_at"] = datetime.utcnow()
    
    actions = []
    if incident.actions_taken:
        for action in incident.actions_taken:
            actions.append({
                "action": action,
                "performed_by": current_user["username"],
                "performed_at": datetime.utcnow()
            })
    incident_dict["actions_taken"] = actions
    
    result = await db.incidents.insert_one(incident_dict)
    
    await log_audit(db, current_user, "INCIDENT_CREATED", "incident", incident_id)
    
    created = await db.incidents.find_one({"_id": result.inserted_id})
    created["_id"] = str(created["_id"])
    return created

@router.get("/")
async def get_incidents(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    incident_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    query = {}
    
    # If not admin, maybe restrict to only their incidents? Wait, the requirements say:
    # USER can: "View incidents", "View their own reported incidents" 
    # ADMIN can: "View all incidents". 
    # Let's enforce that normal users only see their own.
    if current_user["role"] != "ADMIN":
        query["reported_by.username"] = current_user["username"]
        
    if search:
        query["$or"] = [
            {"incident_id": {"$regex": search, "$options": "i"}},
            {"incident_type": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"affected_system": {"$regex": search, "$options": "i"}},
            {"reported_by.username": {"$regex": search, "$options": "i"}}
        ]
    
    if severity and severity.lower() != "all":
        query["severity"] = severity
    if status and status.lower() != "all":
        query["status"] = status
    if incident_type and incident_type.lower() != "all":
        query["incident_type"] = incident_type
        
    total = await db.incidents.count_documents(query)
    total_pages = math.ceil(total / limit)
    
    cursor = db.incidents.find(query).sort("created_at", -1).skip((page - 1) * limit).limit(limit)
    incidents = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        incidents.append(doc)
        
    return {
        "data": incidents,
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": total_pages
    }

@router.get("/{incident_id}", response_model=IncidentInDB)
async def get_incident(incident_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    incident = await db.incidents.find_one({"incident_id": incident_id})
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    if current_user["role"] != "ADMIN" and incident["reported_by"]["username"] != current_user["username"]:
        raise HTTPException(status_code=403, detail="Not authorized to view this incident")
        
    incident["_id"] = str(incident["_id"])
    return incident

@router.put("/{incident_id}", response_model=IncidentInDB)
async def update_incident(incident_id: str, update_data: IncidentUpdate, current_user: dict = Depends(get_current_admin)):
    db = get_database()
    incident = await db.incidents.find_one({"incident_id": incident_id})
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    update_dict = {}
    details = {}
    
    if update_data.severity and update_data.severity != incident.get("severity"):
        update_dict["severity"] = update_data.severity
        details["old_severity"] = incident.get("severity")
        details["new_severity"] = update_data.severity
        
    if update_data.status and update_data.status != incident.get("status"):
        update_dict["status"] = update_data.status
        details["old_status"] = incident.get("status")
        details["new_status"] = update_data.status
        
    if update_data.assigned_to:
        update_dict["assigned_to"] = update_data.assigned_to.dict()
        details["assigned_to"] = update_data.assigned_to.username
        
    push_dict = {}
    if update_data.new_action:
        action_doc = {
            "action": update_data.new_action,
            "performed_by": current_user["username"],
            "performed_at": datetime.utcnow()
        }
        push_dict["actions_taken"] = action_doc
        
    if update_dict or push_dict:
        update_dict["updated_at"] = datetime.utcnow()
        update_op = {}
        if update_dict:
            update_op["$set"] = update_dict
        if push_dict:
            update_op["$push"] = push_dict
            
        await db.incidents.update_one({"incident_id": incident_id}, update_op)
        
        # Log audit if status or assignment changed
        if "status" in update_dict or "assigned_to" in update_dict or "severity" in update_dict:
            await log_audit(db, current_user, "INCIDENT_UPDATED", "incident", incident_id, details)
            
    updated = await db.incidents.find_one({"incident_id": incident_id})
    updated["_id"] = str(updated["_id"])
    return updated

@router.delete("/{incident_id}")
async def delete_incident(incident_id: str, current_user: dict = Depends(get_current_admin)):
    db = get_database()
    result = await db.incidents.delete_one({"incident_id": incident_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Incident not found")
        
    await log_audit(db, current_user, "INCIDENT_DELETED", "incident", incident_id)
    return {"message": "Incident deleted successfully"}
