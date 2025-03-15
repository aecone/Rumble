import logging
from flask import Flask, request

LOG_FILE = "/tmp/app.log"  # Store logs in a writable directory on Render

# Set up logging
logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,  # Capture all INFO, WARNING, ERROR, CRITICAL logs
    format="%(asctime)s - %(levelname)s - %(name)s - %(message)s",
)

logger = logging.getLogger("FlaskApp")

# Capture Flask's built-in logs (requests, errors)
werkzeug_logger = logging.getLogger("werkzeug")
werkzeug_logger.setLevel(logging.INFO)
werkzeug_logger.addHandler(logging.FileHandler(LOG_FILE))

logger.info("Flask App Started - Logging Initialized")
