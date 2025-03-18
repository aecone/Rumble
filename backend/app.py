from flask import Flask
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials
from routes.user_routes import user_routes
import logging
import os
import json
import base64

log = logging.getLogger('werkzeug')
# log.setLevel(logging.ERROR)  # Suppresses logs but keeps errors

app = Flask(__name__)
CORS(app)  # Allow frontend to make requests

# Load Firebase credentials from environment variable
firebase_credentials_b64 = os.getenv("FIREBASE_CREDENTIALS")
if firebase_credentials_b64:
    firebase_credentials_json = base64.b64decode(firebase_credentials_b64).decode('utf-8')
    firebase_credentials = json.loads(firebase_credentials_json)

    # Initialize Firebase
    try:
        firebase_admin.get_app()  # Check if already initialized
    except ValueError:
        cred = credentials.Certificate(firebase_credentials)
        firebase_admin.initialize_app(cred)
else:
    raise ValueError("FIREBASE_CREDENTIALS environment variable is not set")

# Register routes
app.register_blueprint(user_routes, url_prefix="/api")

if __name__ == "__main__":
    app.run(debug=True)