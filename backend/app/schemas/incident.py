from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ActionTaken(BaseModel):
    action: str
    performed_by: str
    performed_at: datetime = Field(default_factory=datetime.utcnow)

class UserRef(BaseModel):
    user_id: str
    username: str

class IncidentBase(BaseModel):
    incident_type: str
    severity: str
    description: str
    affected_system: str
    status: str = "Open"
    
class IncidentCreate(IncidentBase):
    actions_taken: Optional[List[str]] = []

class IncidentUpdate(BaseModel):
    severity: Optional[str] = None
    status: Optional[str] = None
    assigned_to: Optional[UserRef] = None
    new_action: Optional[str] = None

class IncidentInDB(IncidentBase):
    id: str = Field(alias="_id")
    incident_id: str
    reported_by: UserRef
    reported_date: datetime
    actions_taken: List[ActionTaken] = []
    assigned_to: Optional[UserRef] = None
    created_at: datetime
    updated_at: datetime
