from flask import Flask, request, jsonify
from flask_cors import CORS
from scraper import GoogleMapsScraper
import uuid
from datetime import datetime, timezone
import threading
import json
import os

app = Flask(__name__)
CORS(app)

# Create jobs directory if it doesn't exist
JOBS_DIR = 'jobs'
if not os.path.exists(JOBS_DIR):
    os.makedirs(JOBS_DIR)

def load_jobs():
    jobs_data = {}
    # Check if jobs directory exists and has files
    if os.path.exists(JOBS_DIR):
        for filename in os.listdir(JOBS_DIR):
            if filename.endswith('.json'):
                job_id = filename[:-5]  # Remove .json extension
                file_path = os.path.join(JOBS_DIR, filename)
                try:
                    with open(file_path, 'r') as f:
                        job_data = json.load(f)
                        jobs_data[job_id] = job_data
                except json.JSONDecodeError:
                    print(f"Error reading job file: {file_path}")
    return jobs_data

def save_job(job_id, job_data):
    file_path = os.path.join(JOBS_DIR, f"{job_id}.json")
    with open(file_path, 'w') as f:
        json.dump(job_data, f, indent=2)

# Initialize jobs from files
jobs = load_jobs()

def run_scraping_job(job_id, location, radius, type_filter):
    scraper = GoogleMapsScraper()
    try:
        # Update job status to running
        job_file = os.path.join(JOBS_DIR, f"{job_id}.json")
        with open(job_file, 'r') as f:
            job = json.load(f)
        
        job['status'] = 'running'
        save_job(job_id, job)
        
        results = scraper.scrape(location, radius, type_filter)
        
        # Update job with results
        with open(job_file, 'r') as f:
            job = json.load(f)
        
        job['status'] = 'completed'
        job['results'] = results
        job['completedAt'] = str(datetime.now(timezone.utc))
        save_job(job_id, job)
        
    except Exception as e:
        # Update job status to failed
        try:
            with open(job_file, 'r') as f:
                job = json.load(f)
            
            job['status'] = 'failed'
            save_job(job_id, job)
        except:
            pass
        print(f"Scraping failed: {e}")
        print(f"An error occurred: {e.__traceback__.tb_lineno}")
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
        'createdAt': str(datetime.now(timezone.utc)),
        'results': []
    }
    
    # Save the new job
    save_job(job_id, job)
    
    # Start scraping in background
    thread = threading.Thread(
        target=run_scraping_job,
        args=(job_id, location, radius, type_filter)
    )
    thread.start()
    
    return jsonify(job)

@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    current_jobs = load_jobs()
    return jsonify(list(current_jobs.values()))

@app.route('/api/jobs/<job_id>', methods=['GET'])
def get_job(job_id):
    job_file = os.path.join(JOBS_DIR, f"{job_id}.json")
    if os.path.exists(job_file):
        try:
            with open(job_file, 'r') as f:
                job = json.load(f)
            return jsonify(job)
        except:
            return jsonify({'error': 'Error reading job file'}), 500
    return jsonify({'error': 'Job not found'}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5000)