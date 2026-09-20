from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import connect_to_mongo, close_mongo_connection
from .routes import auth, incidents, dashboard, users, audit_logs

app = FastAPI(
    title="CyberShield API",
    description="Cybersecurity Incident Management System API",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

# Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(incidents.router, prefix="/api/incidents", tags=["Incidents"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(audit_logs.router, prefix="/api/audit-logs", tags=["Audit Logs"])

@app.get("/")
def read_root():
    return {"message": "Welcome to CyberShield API"}
