from flask import Flask, request, jsonify
from flask_cors import CORS
from scraper import GoogleMapsScraper
import uuid
from datetime import datetime
import threading
import json

app = Flask(__name__)
CORS(app)

# Store jobs in memory (in production, use a proper database)
jobs = {}

def run_scraping_job(job_id, location, radius, type_filter):
    scraper = GoogleMapsScraper()
    try:
        jobs[job_id]['status'] = 'running'
        
        results = scraper.scrape(location, radius, type_filter)
        
        jobs[job_id]['status'] = 'completed'
        jobs[job_id]['results'] = results
        jobs[job_id]['completedAt'] = datetime.utcnow().isoformat()
        
    except Exception as e:
        jobs[job_id]['status'] = 'failed'
        print(f"Scraping failed: {e}")
    finally:
        scraper.close()

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
        'createdAt': datetime.utcnow().isoformat(),
        'results': []
    }
    
    jobs[job_id] = job
    
    # Start scraping in background
    thread = threading.Thread(
        target=run_scraping_job,
        args=(job_id, location, radius, type_filter)
    )
    thread.start()
    
    return jsonify(job)

@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    return jsonify(list(jobs.values()))

@app.route('/api/jobs/<job_id>', methods=['GET'])
def get_job(job_id):
    job = jobs.get(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    return jsonify(job)

if __name__ == '__main__':
    app.run(debug=True, port=5000)