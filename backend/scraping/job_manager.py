import os
import json

class JobManager:
    def __init__(self, jobs_dir='jobs'):
        self.jobs_dir = jobs_dir
        
        # Create jobs directory if it doesn't exist
        if not os.path.exists(self.jobs_dir):
            os.makedirs(self.jobs_dir)
            
        # Load existing jobs
        self.jobs = self._load_jobs()
    
    def _load_jobs(self):
        """Load all jobs from the jobs directory"""
        jobs_data = {}
        if os.path.exists(self.jobs_dir):
            for filename in os.listdir(self.jobs_dir):
                if filename.endswith('.json'):
                    job_id = filename[:-5]  # Remove .json extension
                    file_path = os.path.join(self.jobs_dir, filename)
                    try:
                        with open(file_path, 'r') as f:
                            job_data = json.load(f)
                            jobs_data[job_id] = job_data
                    except json.JSONDecodeError:
                        print(f"Error reading job file: {file_path}")
        return jobs_data
    
    def save_job(self, job_id, job_data):
        """Save a job to file and update in-memory cache"""
        file_path = os.path.join(self.jobs_dir, f"{job_id}.json")
        with open(file_path, 'w') as f:
            json.dump(job_data, f, indent=2)
        self.jobs[job_id] = job_data
        
    def get_job(self, job_id):
        """Get a job by ID directly from file to ensure latest data"""
        file_path = os.path.join(self.jobs_dir, f"{job_id}.json")
        if os.path.exists(file_path):
            try:
                with open(file_path, 'r') as f:
                    return json.load(f)
            except json.JSONDecodeError:
                return None
        return None
        
    def update_job_status(self, job_id, status, results=None, completion_time=None):
        """Update a job's status and optionally its results"""
        job = self.get_job(job_id)
        if job:
            job['status'] = status
            if results is not None:
                job['results'] = results
            if completion_time is not None:
                job['completedAt'] = completion_time
            self.save_job(job_id, job)
            return True
        return False
        
    def get_all_jobs(self):
        """Get all jobs (refreshes from disk first)"""
        self.jobs = self._load_jobs()
        return self.jobs