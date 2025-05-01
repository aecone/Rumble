import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Firebase Credentials Path
FIREBASE_CREDENTIALS = os.getenv("FIREBASE_CREDENTIALS")

# Ensure the path is set
if not FIREBASE_CREDENTIALS:
    raise ValueError("Missing FIREBASE_CREDENTIALS in .env file!")
