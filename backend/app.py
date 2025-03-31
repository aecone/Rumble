from flask import Flask, request, render_template_string
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials
from routes.user_routes import user_routes
from routes.match_routes import match_routes
import os
from logger import app_logger  # <-- import the logger here
import datetime

app = Flask(__name__)
CORS(app)

# Firebase init
firebase_credentials_path = os.getenv("FIREBASE_CREDENTIALS")
if firebase_credentials_path:
    try:
        firebase_admin.get_app()
    except ValueError:
        cred = credentials.Certificate(firebase_credentials_path)
        firebase_admin.initialize_app(cred)
else:
    raise ValueError("FIREBASE_CREDENTIALS environment variable is not set")

# Register routes
app.register_blueprint(user_routes, url_prefix="/api")
app.register_blueprint(match_routes, url_prefix="/api")

@app.before_request
def log_request():
    app_logger.info(f"{request.method} {request.path} - IP: {request.remote_addr}")

@app.after_request
def log_response(response):
    app_logger.info(f"{request.method} {request.path} - Status {response.status_code}")
    return response

@app.route("/")
def home():
    return "Hi! Nothing much here. Just default route. U better be authorized to access the API routes or else!! :< .", 200

@app.route("/logs")
def get_logs():
    try:
        with open("/tmp/app.log", "r") as file:
            log_lines = file.readlines()

        from datetime import datetime
        log_entries = []
        for line in log_lines:
            parts = line.strip().split(" - ")
            if len(parts) >= 4:
                timestamp, level, name, message = parts[:4]
                try:
                    dt = datetime.strptime(timestamp, "%Y-%m-%d %H:%M:%S,%f")
                    formatted_timestamp = dt.strftime("%I:%M %p").lstrip("0")
                except ValueError:
                    formatted_timestamp = timestamp
                log_entries.append({
                    "timestamp": formatted_timestamp,
                    "level": level,
                    "message": f"[{name}] {message}"
                })

        log_entries.reverse()

        return render_template_string("""
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
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
                <h2>Flask Logs (Recent First)</h2>
                <table>
                    <tr>
                        <th>Time</th>
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
