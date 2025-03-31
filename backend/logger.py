# logger.py
import logging
import os

LOG_FILE = "/tmp/app.log"

# Make sure the log directory exists (Render-safe)
os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)

# Root logger config
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(name)s - %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler()  # Optional: also prints to console
    ]
)

# You can also expose a reusable logger for app.py
app_logger = logging.getLogger("FlaskApp")
app_logger.info("Logger initialized in logger.py")
