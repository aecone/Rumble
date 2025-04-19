import logging
from flask import Flask, request
import pytz
from datetime import datetime

LOG_FILE = "/tmp/app.log"

# Custom formatter for New York timezone, 12-hr time
class NewYorkFormatter(logging.Formatter):
    def converter(self, timestamp):
        dt_utc = datetime.utcfromtimestamp(timestamp)
        ny_tz = pytz.timezone('America/New_York')
        return dt_utc.replace(tzinfo=pytz.utc).astimezone(ny_tz)

    def formatTime(self, record, datefmt=None):
        dt = self.converter(record.created)
        if datefmt:
            return dt.strftime(datefmt)
        else:
            return dt.isoformat()

# New log format: Timestamp - Level - Logger Name - IP - Message
formatter = NewYorkFormatter(
    "%(asctime)s - %(levelname)s - %(name)s - %(ip)s - %(message)s", 
    datefmt="%Y-%m-%d %I:%M:%S %p %Z"   # 12-hr clock with AM/PM
)

# Set up handler
handler = logging.FileHandler(LOG_FILE)
handler.setFormatter(formatter)

logger = logging.getLogger("FlaskApp")
logger.setLevel(logging.INFO)
logger.addHandler(handler)

werkzeug_logger = logging.getLogger("werkzeug")
werkzeug_logger.setLevel(logging.INFO)
werkzeug_logger.addHandler(handler)
