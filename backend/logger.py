import logging
import pytz
from datetime import datetime, UTC

LOG_FILE = "/tmp/app.log"

class NewYorkFormatter(logging.Formatter):
    def converter(self, timestamp):
        dt_utc = datetime.fromtimestamp(timestamp, UTC)
        ny_tz = pytz.timezone('America/New_York')
        return dt_utc.replace(tzinfo=pytz.utc).astimezone(ny_tz)

    def formatTime(self, record, datefmt=None):
        dt = self.converter(record.created)
        if datefmt:
            return dt.strftime(datefmt)
        else:
            return dt.strftime("%Y-%m-%d %I:%M:%S %p %Z")

class RequestIPFilter(logging.Filter):
    def filter(self, record):
        try:
            from flask import request
            forwarded_for = request.headers.get('X-Forwarded-For', '')
            if forwarded_for:
                record.ip = forwarded_for.split(',')[0].strip()
            else:
                record.ip = request.remote_addr or 'N/A'
        except RuntimeError:
            record.ip = 'N/A'
        return True

# ✅ Custom flush handler for file
class FlushFileHandler(logging.FileHandler):
    def emit(self, record):
        super().emit(record)
        self.flush()

formatter = NewYorkFormatter(
    "%(asctime)s - %(levelname)s - %(name)s - %(ip)s - %(message)s",
    datefmt="%Y-%m-%d %I:%M:%S %p %Z"
)

# File handler (for /logs endpoint)
file_handler = FlushFileHandler(LOG_FILE)
file_handler.setFormatter(formatter)

# Stream handler (for Render + Better Stack)
stream_handler = logging.StreamHandler()
stream_handler.setFormatter(formatter)

logger = logging.getLogger("FlaskApp")
logger.setLevel(logging.INFO)
logger.addHandler(file_handler)
logger.addHandler(stream_handler)

werkzeug_logger = logging.getLogger("werkzeug")
werkzeug_logger.setLevel(logging.INFO)
werkzeug_logger.addHandler(file_handler)
werkzeug_logger.addHandler(stream_handler)

# IP filter for both
ip_filter = RequestIPFilter()
logger.addFilter(ip_filter)
werkzeug_logger.addFilter(ip_filter)
