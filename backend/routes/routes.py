from fastapi import APIRouter, HTTPException
from scraping.job_manager import JobManager
from services.scraping_service import ScrapingService
import uuid
from datetime import datetime, timezone
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

# Define request models
class ScrapeRequest(BaseModel):
    location: str
    radius: int = 5
    type: str = "both"

# Initialize router
router = APIRouter()

# Initialize managers and services
job_manager = JobManager()
scraping_service = ScrapingService(job_manager)

@router.post("/api/scrape")
async def start_scraping(request: ScrapeRequest):
    location = request.location
    radius = request.radius
    type_filter = request.type
    
    if not location:
        raise HTTPException(status_code=400, detail="Location is required")
            
    job_id = str(uuid.uuid4())
    job = {
        'id': job_id,
        'location': location,
        'radius': radius,
        'type': type_filter,
        'status': 'pending',
        'createdAt': str(datetime.now(timezone.utc)),
        'results': []
    }
    
    # Save the job and start scraping
    job_manager.save_job(job_id, job)
    scraping_service.start_scraping_job(job_id, location, radius, type_filter)
    
    return job

@router.get("/api/jobs")
async def get_jobs():
    jobs = job_manager.get_all_jobs()
    return list(jobs.values())

@router.get("/api/jobs/{job_id}")
async def get_job(job_id: str):
    job = job_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

def include_router(app):
    """Function to include the router in the main app"""
    app.include_router(router)