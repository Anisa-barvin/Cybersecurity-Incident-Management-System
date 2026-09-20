from fastapi import APIRouter, Depends, HTTPException, Query
from ..database import get_database
from ..schemas.user import UserResponse
from ..utils.dependencies import get_current_admin
from bson import ObjectId

router = APIRouter()

@router.get("/", response_model=list[UserResponse])
async def get_users(current_admin: dict = Depends(get_current_admin)):
    db = get_database()
    users = []
    async for user in db.users.find({}, {"password_hash": 0}):
        user["_id"] = str(user["_id"])
        users.append(user)
    return users

@router.delete("/{user_id}")
async def delete_user(user_id: str, current_admin: dict = Depends(get_current_admin)):
    db = get_database()
    try:
        obj_id = ObjectId(user_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID")
        
    # Prevent self-deletion
    if str(current_admin["_id"]) == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
        
    result = await db.users.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {"message": "User deleted successfully"}
