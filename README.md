# Google Maps Scraping Service

This is a Flask-based backend service that scrapes Google Maps data using Selenium.

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Install Chrome browser (if not already installed)

3. Start the server:
```bash
python app.py
```

The server will run on http://localhost:5000

## API Endpoints

### Start Scraping
- POST `/api/scrape`
- Body:
```json
{
  "location": "New York",
  "radius": 5,
  "type": "both" // "hotels", "restaurants", or "both"
}
```

### Get All Jobs
- GET `/api/jobs`

### Get Job by ID
- GET `/api/jobs/<job_id>`

## Notes
- The service runs scraping jobs in the background
- Results are stored in memory (use a proper database in production)
- Scraping is limited to 3 scrolls per search for demo purposes