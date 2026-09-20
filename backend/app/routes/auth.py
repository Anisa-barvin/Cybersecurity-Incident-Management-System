from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta, datetime
from ..database import get_database
from ..schemas.user import UserCreate, UserResponse, UserInDB
from ..schemas.auth import Token
from ..utils.security import verify_password, get_password_hash, create_access_token
from ..utils.dependencies import get_current_user
from ..config import settings
from bson import ObjectId

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate):
    db = get_database()
    
    # Check existing user
    if await db.users.find_one({"username": user.username}):
        raise HTTPException(status_code=409, detail="Username already registered")
    if await db.users.find_one({"email": user.email}):
        raise HTTPException(status_code=409, detail="Email already registered")
        
    hashed_password = get_password_hash(user.password)
    user_dict = user.dict()
    user_dict["password_hash"] = hashed_password
    del user_dict["password"]
    user_dict["created_at"] = datetime.utcnow()
    
    # For safety, normal registration only creates USER role
    user_dict["role"] = "USER"
    
    result = await db.users.insert_one(user_dict)
    created_user = await db.users.find_one({"_id": result.inserted_id})
    created_user["_id"] = str(created_user["_id"])
    return created_user

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = get_database()
    user = await db.users.find_one({"username": form_data.username})
    if not user or not verify_password(form_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"], "role": user["role"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user
