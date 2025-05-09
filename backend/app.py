from flask import Flask
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials
from routes.user_routes import user_routes
from routes.match_routes import match_routes
import os
import logging
logging.basicConfig(level=logging.INFO)

def create_app(testing: bool = False):
    app = Flask(__name__)
    app.config['TESTING'] = testing

    # Allow any origin (full access)
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

    setup_firebase()
    register_routes(app)

    return app

def setup_firebase():
    firebase_credentials_path = os.getenv("FIREBASE_CREDENTIALS")
    if firebase_credentials_path:
        try:
            firebase_admin.get_app()  # Check if already initialized
        except ValueError:
            cred = credentials.Certificate(firebase_credentials_path)
            firebase_admin.initialize_app(cred)
    else:
        raise ValueError("FIREBASE_CREDENTIALS environment variable is not set")

def register_routes(app):
    app.register_blueprint(user_routes, url_prefix="/api")
    app.register_blueprint(match_routes, url_prefix="/api")

    @app.route("/")
    def home():
        return "Welcome to the API root. Please ensure proper authorization to access protected routes.", 200

# For running directly (e.g., python app.py)
app = create_app()
if __name__ == "__main__":
    app.run(debug=True)
