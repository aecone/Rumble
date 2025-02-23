from flask import Flask
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials
from routes.user_routes import user_routes

app = Flask(__name__)
CORS(app)  # Allow frontend to make requests

# Initialize Firebase
try:
    firebase_admin.get_app()  # Check if already initialized
except ValueError:
    cred = credentials.Certificate(r"C:\Users\crazy\Downloads\rumble-swipeconnect-firebase-adminsdk-fbsvc-6923445e97.json")  # Replace with actual path
    firebase_admin.initialize_app(cred)

# Register routes
app.register_blueprint(user_routes, url_prefix="/api")

if __name__ == "__main__":
    app.run(debug=True)
