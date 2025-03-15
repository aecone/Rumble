from flask import Flask, request, render_template_string
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

# Store logs in `/tmp/` because it's writable in Render
LOG_FILE = "/tmp/app.log"

logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(name)s - %(message)s",
)

logger = logging.getLogger("FlaskApp")
logger.info(" Flask App Started - Logging Initialized")

@app.before_request
def log_request():
    logger.info(f"{request.method} {request.path} - IP: {request.remote_addr}")

@app.after_request
def log_response(response):
    logger.info(f"{request.method} {request.path} - Status {response.status_code}")
    return response

@app.route("/")
def home():
    return "Hi! Nothing much here. Just default route. U better be authorized to access the API routes or else!! :< .", 200


@app.route("/logs")
def get_logs():
    try:
        with open(LOG_FILE, "r") as file:
            log_lines = file.readlines()

        # Convert log lines into structured data
        log_entries = []
        for line in log_lines:
            parts = line.strip().split(" - ")  # Split by " - " separator
            if len(parts) >= 4:
                timestamp, level, _, message = parts[:4]  # Extract log details (ignore `name`)
                log_entries.append({"timestamp": timestamp, "level": level, "message": message})

        # Render logs as an HTML table
        return render_template_string("""
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Flask Logs</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
                    table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1); }
                    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background-color: #007bff; color: white; }
                    .info { color: #007bff; }
                    .warning { color: #ffa500; }
                    .error { color: #dc3545; }
                </style>
            </head>
            <body>
                <h2>Flask Logs</h2>
                <table>
                    <tr>
                        <th>Timestamp</th>
                        <th>Level</th>
                        <th>Message</th>
                    </tr>
                    {% for entry in log_entries %}
                    <tr>
                        <td>{{ entry.timestamp }}</td>
                        <td class="{{ entry.level.lower() }}">{{ entry.level }}</td>
                        <td>{{ entry.message }}</td>
                    </tr>
                    {% endfor %}
                </table>
            </body>
            </html>
        """, log_entries=log_entries)

    except Exception as e:
        return f"<p>Error reading logs: {str(e)}</p>", 500

if __name__ == "__main__":
    app.run(debug=True)