from flask import request, jsonify
from job_manager import JobManager
from scraping_service import ScrapingService
import uuid
from datetime import datetime, timezone

job_manager = JobManager()
scraping_service = ScrapingService(job_manager)

def register_routes(app):
    @app.route('/api/scrape', methods=['POST'])
    def start_scraping():
        data = request.json
        location = data.get('location')
        radius = data.get('radius', 5)
        type_filter = data.get('type', 'both')
        
        if not location:
            return jsonify({'error': 'Location is required'}), 400
            
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
        
        return jsonify(job)

    @app.route('/api/jobs', methods=['GET'])
    def get_jobs():
        jobs = job_manager.get_all_jobs()
        return jsonify(list(jobs.values()))

    @app.route('/api/jobs/<job_id>', methods=['GET'])
    def get_job(job_id):
        job = job_manager.get_job(job_id)
        if job:
            return jsonify(job)
        return jsonify({'error': 'Job not found'}), 404