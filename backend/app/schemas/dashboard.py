from pydantic import BaseModel

class DashboardStatistics(BaseModel):
    total_incidents: int
    critical: int
    high: int
    medium: int
    low: int
    open: int
    under_investigation: int
    resolved: int
    closed: int
