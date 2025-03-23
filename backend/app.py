from flask import Flask
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials
from routes.user_routes import user_routes
from routes.match_routes import match_routes
import logging
import os
import json
import base64

log = logging.getLogger('werkzeug')
# log.setLevel(logging.ERROR)  # Suppresses logs but keeps errors

app = Flask(__name__)
CORS(app)  # Allow frontend to make requests

# Load Firebase credentials from environment variable
firebase_credentials_path = os.getenv("FIREBASE_CREDENTIALS")
if firebase_credentials_path:
    try:
        firebase_admin.get_app()  # Check if already initialized
    except ValueError:
        cred = credentials.Certificate(firebase_credentials_path)
        firebase_admin.initialize_app(cred)
else:
    raise ValueError("FIREBASE_CREDENTIALS environment variable is not set")

# Register routes
app.register_blueprint(user_routes, url_prefix="/api")
app.register_blueprint(match_routes, url_prefix="/api")

if __name__ == "__main__":
    app.run(debug=True)