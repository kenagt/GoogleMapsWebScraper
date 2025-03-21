from flask import Flask
from flask_cors import CORS
from routes.routes import register_routes

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    # Register all routes
    register_routes(app)
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)