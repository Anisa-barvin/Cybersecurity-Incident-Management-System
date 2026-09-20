from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    full_name: str
    username: str
    email: EmailStr
    role: str = "USER"

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: str = Field(alias="_id")
    created_at: datetime
    
class UserResponse(UserBase):
    id: str = Field(alias="_id")
    created_at: datetime
