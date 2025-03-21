import os

class Config:
    """Application configuration"""
    JOBS_DIR = os.environ.get('JOBS_DIR', 'jobs')
    DEBUG = os.environ.get('DEBUG', 'True') == 'True'
    PORT = int(os.environ.get('PORT', 5000))
    
    @classmethod
    def get_jobs_dir(cls):
        """Get the jobs directory, creating it if it doesn't exist"""
        if not os.path.exists(cls.JOBS_DIR):
            os.makedirs(cls.JOBS_DIR)
        return cls.JOBS_DIR