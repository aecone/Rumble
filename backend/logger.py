import logging
import pytz
from datetime import datetime

LOG_FILE = "/tmp/app.log"

class NewYorkFormatter(logging.Formatter):
    def converter(self, timestamp):
        dt_utc = datetime.fromtimestamp(timestamp, tz=pytz.utc)
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
                # Take only the first IP
                record.ip = forwarded_for.split(',')[0].strip()
            else:
                record.ip = request.remote_addr or 'N/A'
        except RuntimeError:
            record.ip = 'N/A'
        return True
class FlushFileHandler(logging.FileHandler):
    def emit(self, record):
        super().emit(record)
        self.flush()

formatter = NewYorkFormatter(
    "%(asctime)s - %(levelname)s - %(name)s - %(ip)s - %(message)s",
    datefmt="%Y-%m-%d %I:%M:%S %p %Z"
)

handler = FlushFileHandler(LOG_FILE)
handler.setFormatter(formatter)

logger = logging.getLogger("FlaskApp")
logger.setLevel(logging.INFO)
logger.addHandler(handler)

werkzeug_logger = logging.getLogger("werkzeug")
werkzeug_logger.setLevel(logging.INFO)
werkzeug_logger.addHandler(handler)

# Add IP filter to both loggers
ip_filter = RequestIPFilter()
logger.addFilter(ip_filter)
werkzeug_logger.addFilter(ip_filter)
