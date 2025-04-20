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


# Allow any origin (full access)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)


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
# Helper to inject IP into each log record

@app.before_request
def log_request():
    ip = request.headers.get('X-Forwarded-For', request.remote_addr)
    request.real_ip = ip  # Save it into Flask's request object
    logger.info(f"{request.method} {request.path}")



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
            
            if len(parts) == 5:
                timestamp, level, _, ip, message = parts
            elif len(parts) == 4:
                # If no IP (older or system logs), fake it
                timestamp, level, _, message = parts
                ip = 'N/A'
            else:
                continue  # Skip weird badly formatted lines

            # Extract HTTP method from message if it exists
            method = ""
            if message.startswith(("GET", "POST", "PUT", "DELETE", "HEAD", "PATCH", "OPTIONS")):
                method = message.split(" ")[0]

            log_entries.append({
                "timestamp": timestamp,
                "level": level,
                "ip": ip,
                "method": method,
                "message": message
            })




        log_entries.reverse()

        return render_template_string("""
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
                    td:hover {
                        background-color: #e0f7fa;
                    }
                    #clearFilterBtn:hover {
                        background-color: #0056b3;
                    }
                    .na-ip {
                        font-style: italic;
                        color: #888888;
                    }

                </style>
            </head>
            <body>
                <h2>Flask Logs (Live)</h2>
                <button id="clearFilterBtn" style="display:none; margin-bottom: 10px; padding: 8px 12px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Clear Filter
                </button>
                <table id="logTable">
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Level</th>
                            <th>IP Address</th>
                            <th>Method</th>
                            <th>Message</th>
                        </tr>
                    </thead>
                    <tbody>
                        {% for entry in log_entries %}
                        <tr data-ip="{{ entry.ip }}">
                            <td>{{ entry.timestamp }}</td>
                            <td class="{{ entry.level.lower() }}">{{ entry.level }}</td>
                            <td>{{ entry.ip }}</td>
                            <td>{{ entry.method }}</td>
                            <td>{{ entry.message }}</td>
                        </tr>
                        {% endfor %}
                    </tbody>
                </table>


                <script>
                        const clearFilterBtn = document.getElementById('clearFilterBtn');

                        const tableBody = document.getElementById('logTable').querySelector('tbody');
                        const eventSource = new EventSource('/stream-logs');
                        const maxRows = 500;

                        const ipColors = {};  // Map IP → color
                        let currentFilterIp = null;

                        function getColorForIp(ip) {
                            if (!ipColors[ip]) {
                                const hue = Math.floor(Math.random() * 360);
                                ipColors[ip] = `hsl(${hue}, 70%, 90%)`;
                            }
                            return ipColors[ip];
                        }

                        function applyRowColor(row, ip) {
                            if (ip === "N/A") {
                                row.style.backgroundColor = "#eeeeee"; // Light gray for missing IP
                            } else {
                                row.style.backgroundColor = getColorForIp(ip); // Color by IP otherwise
                            }
                        }


                        function filterRowsByIp(ip) {
                            currentFilterIp = ip;
                            document.querySelectorAll('tr[data-ip]').forEach(row => {
                                if (ip === null || row.getAttribute('data-ip') === ip) {
                                    row.style.display = '';
                                } else {
                                    row.style.display = 'none';
                                }
                            });

                            // Show or hide the Clear Filter button
                            if (ip) {
                                clearFilterBtn.style.display = 'inline-block';
                            } else {
                                clearFilterBtn.style.display = 'none';
                            }
                        }


                        // Add click listeners to IP cells
                        function makeIpClickable(td, ip) {
                            td.style.cursor = 'pointer';
                            td.title = 'Click to filter by this IP';
                            td.addEventListener('click', (e) => {
                                if (currentFilterIp === ip) {
                                    filterRowsByIp(null);  // Unfilter
                                } else {
                                    filterRowsByIp(ip);    // Filter
                                }
                            });
                        }

                        // Initial page load: color and make IPs clickable
                        document.querySelectorAll('tr[data-ip]').forEach(row => {
                            const ip = row.getAttribute('data-ip');
                            applyRowColor(row, ip);
                            const ipCell = row.cells[2]; // 3rd column = IP
                            makeIpClickable(ipCell, ip);
                        });

                        // Handle new logs from SSE
                        eventSource.onmessage = function(event) {
                            const parts = event.data.split(" - ");
                            let timestamp = parts[0] || "";
                            let level = parts[1] || "";
                            let ip = "N/A";
                            let message = "";

                            if (parts.length === 5) {
                                ip = parts[3];
                                message = parts[4];
                            } else if (parts.length === 4) {
                                message = parts[3];
                            }

                            // Extract method
                            let method = "";
                            if (message.startsWith("GET") || message.startsWith("POST") || message.startsWith("PUT") ||
                                message.startsWith("DELETE") || message.startsWith("HEAD") || message.startsWith("PATCH") || message.startsWith("OPTIONS")) {
                                method = message.split(" ")[0];
                            }


                                const ipClass = ip === "N/A" ? "na-ip" : "";
                                newRow.innerHTML = `
                                    <td>${timestamp}</td>
                                    <td class="${level.toLowerCase()}">${level}</td>
                                    <td class="${ipClass}">${ip}</td>
                                    <td>${method}</td>
                                    <td>${message}</td>
                                `;



                                applyRowColor(newRow, ip);

                                // Make the new IP cell clickable
                                const ipCell = newRow.cells[2];
                                makeIpClickable(ipCell, ip);

                                if (tableBody.firstChild) {
                                    tableBody.insertBefore(newRow, tableBody.firstChild);
                                } else {
                                    tableBody.appendChild(newRow);
                                }

                                setTimeout(() => {
                                    newRow.classList.remove('new-log');
                                }, 1000);

                                while (tableBody.rows.length > maxRows) {
                                    tableBody.deleteRow(tableBody.rows.length - 1);
                                }

                                // If filtering is active, re-apply it
                                if (currentFilterIp) {
                                    filterRowsByIp(currentFilterIp);
                                }
                            }
                        };

                        eventSource.onerror = function(err) {
                            console.error("EventSource failed:", err);
                            eventSource.close();
                        };
                        clearFilterBtn.addEventListener('click', () => {
                        filterRowsByIp(null);
                    });
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
            f.seek(0, os.SEEK_END)
            while True:
                line = f.readline()
                if line:
                    yield f"data: {line.strip()}\n\n"
                else:
                    # send empty heartbeat every 15 seconds
                    yield f": keep-alive\n\n"
                    time.sleep(15)

    return Response(generate(), mimetype="text/event-stream")



if __name__ == "__main__":
    app.run(debug=True)