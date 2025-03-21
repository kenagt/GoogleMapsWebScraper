"""Email Collector class"""
from threading import Thread
import json

class EmailOutput(Thread):
    """Email Collector Class"""
    def __init__(self, results, json_data, job_file):
        Thread.__init__(self)
        self.work = results
        self.json_data = json_data
        self.job_file = job_file

    def run(self):
        while True:
            domain, emaillist = self.work.get()
            print(domain)
            for website in self.json_data['results']:
                if website["website"] == domain:  # This will include websites that are explicitly null
                    website["emails"] = emaillist

            print(self.job_file)
            # Write the updated JSON back to the file
            with open(self.job_file, 'w') as file:
                json.dump(self.json_data, file, indent=4)
            
            self.work.task_done()