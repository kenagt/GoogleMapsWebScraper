import threading
from datetime import datetime, timezone
from scraping.scraper import GoogleMapsScraper

class ScrapingService:
    def __init__(self, job_manager):
        self.job_manager = job_manager
        
    def start_scraping_job(self, job_id, location, radius, type_filter):
        """Start a new scraping job in a background thread"""
        thread = threading.Thread(
            target=self._run_scraping_job,
            args=(job_id, location, radius, type_filter)
        )
        thread.daemon = True  # Make thread exit when main thread exits
        thread.start()
        
    def _run_scraping_job(self, job_id, location, radius, type_filter):
        """Run the actual scraping process"""
        scraper = GoogleMapsScraper()
        try:
            # Update job status to running
            self.job_manager.update_job_status(job_id, 'running')
            
            # Run the scraping
            results = scraper.scrape(location, radius, type_filter)
            
            # Update job with results
            completion_time = str(datetime.now(timezone.utc))
            self.job_manager.update_job_status(
                job_id, 
                'completed', 
                results=results, 
                completion_time=completion_time
            )
            
            # Get the job file path and scrape emails
            job_file = f"{self.job_manager.jobs_dir}/{job_id}.json"
            scraper.scrape_website_emails(job_file)

        except Exception as e:
            # Update job status to failed
            self.job_manager.update_job_status(job_id, 'failed')
            print(f"Scraping failed: {e}")
            print(f"An error occurred: {e.__traceback__.tb_lineno}")
        finally:
            scraper.close()