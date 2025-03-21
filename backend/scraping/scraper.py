from selenium import webdriver
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from scraping.domain_explorer import DomainExplorer
from scraping.email_output import EmailOutput
import time
import json
import re
import unicodedata
import queue

class GoogleMapsScraper:
    def __init__(self):
        chrome_options = Options()
        chrome_options.add_argument("--headless=new")
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--start-fullscreen')
        
        self.driver = webdriver.Chrome(options=chrome_options)
        self.wait = WebDriverWait(self.driver, 10)
        
    def scrape(self, location, radius, type_filter):
        results = []
        
        # Handle different types of searches
        if type_filter == 'both':
            results.extend(self._scrape_type(location, radius, 'hotels'))
            results.extend(self._scrape_type(location, radius, 'restaurants'))
        else:
            results.extend(self._scrape_type(location, radius, type_filter))

        return results
        
    def scrape_website_emails(self, job_file):
        # Read the JSON file
        with open(job_file, 'r') as file:
            json_data = json.load(file)

       # Extract all website fields
        websites = []
        for result in json_data['results']:
            website = result.get('website')
            if website is not None:  # This will include websites that are explicitly null
                websites.append(website)

        # Filter out None values if you want only actual websites
        actual_websites = [website for website in websites if website]
                
        self.perform_email_scraping(websites, json_data, job_file)

    def perform_email_scraping(self, websites, json_data, job_file):
        # Define two queues to work with. Set maxsize for the main queue
        domainqueue = queue.Queue(maxsize=5000)
        emailsqueue = queue.Queue()

        # Start our threads
        for _i in range(20):
            t = DomainExplorer(domainqueue, emailsqueue)
            t.daemon = True
            t.start()

        print(f"Started {20} Threads")

        # Start our collector thread
        results_thread = EmailOutput(emailsqueue, json_data, job_file)
        results_thread.daemon = True
        results_thread.start()

        # Add domains to the queue from a context manager to save memory
        
        for domain in websites:
            domainqueue.put(domain)

        # Gracefully join our queues so that our threads can exit
        domainqueue.join()
        print("Domains finished processing")
        
        emailsqueue.join()
        print("Collector finished processing")

    def scrape_google_maps_urls(self):
        # Google maps and results are successfully loaded
        # Initialize the output list
        items = []

        while True:
            try:
                # Find all the businesses in the search results
                businesses = WebDriverWait(self.driver, 10).until(
                    EC.presence_of_all_elements_located((By.CLASS_NAME, 'hfpxzc')))
            except Exception as e:
                # If no businesses are found, break the loop
                break

            time.sleep(3)

            # Store the URLs of the businesses
            items.extend(businesses)
            
            print(f"Loaded URL number: {str(len(businesses))}")
            
            # Scroll down to load more businesses
            self.driver.execute_script("arguments[0].scrollIntoView();", businesses[-1])
            time.sleep(3)
            
            #break

            try:
                # Check if new businesses are loaded
                new_businesses = WebDriverWait(self.driver, 10).until(
                    EC.presence_of_all_elements_located((By.CLASS_NAME, 'hfpxzc')))
                if len(new_businesses) == len(businesses):
                    # If no new businesses are loaded, break the loop
                    break
            except Exception as e:
                # If an exception occurs, break the loop
                print(f"An error occurred: {e}")
                print(f"An error occurred: {e.__traceback__.tb_lineno}")
                break

        print(f"Final scrolled URL number: {str(len(businesses))}")

        return businesses
    
    def _scrape_type(self, location, radius, type_filter):
         # Construct Google Maps search URL
        search_query = f"{type_filter} in {location} within { radius } km"
        url = f"https://www.google.com/maps/search/{search_query.replace(' ', '+')}/"
        
        print(f"Starting scrape for: {url}")
        self.driver.get(url)
        
        # Wait for results to load
        wait = WebDriverWait(self.driver, 10)
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "div[role='feed']")))
        
        # Extract place data - Updated with the new CSS selector
        results = []
        place_elements = []
        try:
            place_elements = self.scrape_google_maps_urls()
            print(len(place_elements))
        except Exception as e:
            print(f"An error occurred: {e}")
            print(f"An error occurred: {e.__traceback__.tb_lineno}")
    
        # Process each business one by one
        for item in place_elements:
            try:
                # Click on item to load details
                item.click()
                time.sleep(3)
                
                # Extract information
                name = self.wait.until(
                    EC.presence_of_element_located(
                        (By.CSS_SELECTOR, "h1.lfPIob")
                    )
                ).text

                try:
                    rating = self.driver.find_element(
                        By.CSS_SELECTOR, 
                        "div.fontDisplayLarge"
                    ).text.split()[0]
                except:
                    rating = 0
                    
                try:
                    reviews = self.driver.find_element(
                        By.XPATH, 
                        "//div[@class='HHrUdb']/span"
                    ).text.split()[0]
                except:
                    reviews = 0
                    
                try:
                    address = self.driver.find_element(
                        By.CSS_SELECTOR,
                        "[data-item-id*='address']"
                    ).text
                    address = self.clean_text(address)
                except:
                    address = ""
                    
                try:
                    website = self.driver.find_element(
                        By.CSS_SELECTOR,
                        "a[data-item-id='authority']"
                    ).get_attribute('href')
                except:
                    website = None
                    
                try:
                    phone = self.driver.find_element(
                        By.CSS_SELECTOR,
                        "[data-item-id*='phone']"
                    ).text
                    phone = self.clean_text(phone)
                except:
                    phone = None
                    
                results.append({
                    'name': name,
                    'address': address,
                    'rating': rating,
                    'reviews': reviews,
                    'type': type_filter,
                    'phone': phone,
                    'website': website,
                    'emails': ""
                })
                print(f"Results number: {str(len(results))}")
                
            except Exception as e:
                print(f"Error extracting item details: {e}")
                print(f"An error occurred: {e.__traceback__.tb_lineno}")
                continue

        return results
       
    def clean_text(self, text):
        # Normalize Unicode characters
        normalized = unicodedata.normalize('NFKD', text)
        # Remove control characters and keep only printable ASCII
        return ''.join(ch for ch in normalized if unicodedata.category(ch)[0] != 'C')

    def extract_number(self, text):
        if not isinstance(text, str):
            return None  # or raise TypeError("Input must be a string")

        # Replace commas with periods (European decimal style)
        text = text.replace(",", ".")

        # Use a regular expression to find a floating-point number
        match = re.search(r"[-+]?\d*\.?\d+", text)  # Matches integers or floats

        if match:
            try:
                return float(match.group(0))
            except ValueError:
                return None  # Handle cases where the matched string isn't a valid float
        else:
            return None

    def close(self):
        self.driver.quit()