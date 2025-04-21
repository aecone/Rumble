from flask import Flask, request, render_template_string, Response
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials
from routes.user_routes import user_routes
from routes.match_routes import match_routes
import logging
import os
import time

LOG_FILE = "/tmp/app.log"

def create_app(testing: bool = False):
    app = Flask(__name__)
    app.config['TESTING'] = testing

    # Allow any origin (full access)
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

    # Firebase setup
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

    # Logging setup
    logging.basicConfig(
        filename=LOG_FILE,
        level=logging.INFO,
        format="%(asctime)s - %(levelname)s - %(name)s - %(message)s",
    )
    logger = logging.getLogger("FlaskApp")
    logger.info("Flask App Started - Logging Initialized")

    @app.before_request
    def log_request():
        ip = request.headers.get('X-Forwarded-For', request.remote_addr)
        request.real_ip = ip
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
                    timestamp, level, _, message = parts
                    ip = 'N/A'
                else:
                    continue

                method = message.split(" ")[0] if message.startswith(
                    ("GET", "POST", "PUT", "DELETE", "HEAD", "PATCH", "OPTIONS")) else ""

                log_entries.append({
                    "timestamp": timestamp,
                    "level": level,
                    "ip": ip,
                    "method": method,
                    "message": message
                })

            log_entries.reverse()
            return render_template_string("... your full log viewer HTML here ...", log_entries=log_entries)

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
                        yield f": keep-alive\n\n"
                        time.sleep(15)
        return Response(generate(), mimetype="text/event-stream")

    return app

# 🔁 For running directly (e.g., python app.py)
if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
