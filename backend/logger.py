import logging

# Set up logging configuration
logging.basicConfig(
    filename="app.log",  # All logs will be stored here
    level=logging.INFO,   # Log only INFO and higher level logs
    format="%(asctime)s - %(levelname)s - %(name)s - %(message)s",
)

# Create a logger object that can be used in all files
logger = logging.getLogger("FlaskApp")
