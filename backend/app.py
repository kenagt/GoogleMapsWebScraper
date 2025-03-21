from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.routes import include_router

# Create the application outside of any function
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
include_router(app)

# For running directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=5000, reload=True)