from flask import Flask, request, render_template_string
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials
from routes.user_routes import user_routes
from routes.match_routes import match_routes
import logging
import os
from flask import Response
import time

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

        log_entries = []
        for line in log_lines:
            parts = line.strip().split(" - ")
            if len(parts) >= 4:
                timestamp, level, _, message = parts[:4]
                log_entries.append({"timestamp": timestamp, "level": level, "message": message})

        log_entries.reverse()

        return render_template_string("""
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Flask Logs (Live)</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
                    table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1); }
                    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background-color: #007bff; color: white; }
                    .info { color: #007bff; }
                    .warning { color: #ffa500; }
                    .error { color: #dc3545; }
                    .new-log {
                        animation: flash 1s ease;
                    }
                    @keyframes flash {
                        from { background-color: yellow; }
                        to { background-color: white; }
                    }
                </style>
            </head>
            <body>
                <h2>Flask Logs (Live)</h2>
                <table id="logTable">
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Level</th>
                            <th>Message</th>
                        </tr>
                    </thead>
                    <tbody>
                        {% for entry in log_entries %}
                        <tr>
                            <td>{{ entry.timestamp }}</td>
                            <td class="{{ entry.level.lower() }}">{{ entry.level }}</td>
                            <td>{{ entry.message }}</td>
                        </tr>
                        {% endfor %}
                    </tbody>
                </table>

                <script>
                    const tableBody = document.getElementById('logTable').querySelector('tbody');
                    const eventSource = new EventSource('/stream-logs');
                    const maxRows = 500; // Max rows to keep

                    eventSource.onmessage = function(event) {
                        const parts = event.data.split(" - ");
                        if (parts.length >= 4) {
                            const timestamp = parts[0];
                            const level = parts[1];
                            const message = parts[3];

                            const newRow = document.createElement('tr');
                            newRow.classList.add('new-log');
                            newRow.innerHTML = `
                                <td>${timestamp}</td>
                                <td class="${level.toLowerCase()}">${level}</td>
                                <td>${message}</td>
                            `;

                            // Insert at the top
                            if (tableBody.firstChild) {
                                tableBody.insertBefore(newRow, tableBody.firstChild);
                            } else {
                                tableBody.appendChild(newRow);
                            }

                            // Remove highlight after animation
                            setTimeout(() => {
                                newRow.classList.remove('new-log');
                            }, 1000);

                            // Trim old rows if too many
                            while (tableBody.rows.length > maxRows) {
                                tableBody.deleteRow(tableBody.rows.length - 1);
                            }
                        }
                    };

                    eventSource.onerror = function(err) {
                        console.error("EventSource failed:", err);
                        eventSource.close();
                    };
                </script>
            </body>
            </html>
        """, log_entries=log_entries)

    except Exception as e:
        return f"<p>Error reading logs: {str(e)}</p>", 500


@app.route("/stream-logs")
def stream_logs():
    def generate():
        if not os.path.exists(LOG_FILE):
            yield "data: No logs yet.\n\n"
            return
        
        with open(LOG_FILE, 'r') as f:
            f.seek(0, os.SEEK_END)  # Go to the end of the file (only new lines)
            while True:
                line = f.readline()
                if line:
                    yield f"data: {line.strip()}\n\n"
                else:
                    time.sleep(1)  # Sleep briefly then check again

    return Response(generate(), mimetype="text/event-stream")


if __name__ == "__main__":
    app.run(debug=True)