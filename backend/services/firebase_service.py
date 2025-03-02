import firebase_admin
from firebase_admin import credentials, firestore
from config import FIREBASE_CREDENTIALS  # Import from config.py

# Ensure Firebase is initialized
try:
    firebase_admin.get_app()
except ValueError:
    cred = credentials.Certificate(FIREBASE_CREDENTIALS)
    firebase_admin.initialize_app(cred)
    
db = firestore.client()

def get_user_profile(user_id):
    """Retrieve a user's profile from Firestore."""
    user_ref = db.collection("users").document(user_id).get()
    return user_ref.to_dict() if user_ref.exists else None

def update_user_profile(user_id, firstName, lastName, birthday, major, ethnicity, gender, pronouns, bio, profile_picture_url):
    """Update a user's profile."""
    user_ref = db.collection("users").document(user_id)
    user_ref.set({"firstName": firstName,  
"lastName": lastName,  
"birthday": birthday,  
"major": major,  
"ethnicity": ethnicity,  
"gender": gender,  
"pronouns": pronouns,  
"bio": bio,  
"profile_picture_url": profile_picture_url  
}, merge=True)
    return True
