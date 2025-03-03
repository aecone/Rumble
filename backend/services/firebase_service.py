import firebase_admin
from firebase_admin import credentials, firestore, auth
from config import FIREBASE_CREDENTIALS  # Import from config.py

# Ensure Firebase is initialized
if not firebase_admin._apps:
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


def delete_user_account(user_id):
    try:
        print(f"Attempting to delete user: {user_id}")  # Debugging

        # Delete user document from Firestore
        user_ref = db.collection("users").document(user_id)  # Ensure correct indentation
        if user_ref.get().exists:
            user_ref.delete()
            print(f"Deleted Firestore user document: {user_id}")
        else:
            print(f"User {user_id} not found in Firestore")

        # Delete user from Firebase Authentication
        auth.delete_user(user_id)
        print(f"Deleted Firebase Auth user: {user_id}")

        return {"message": "Account successfully deleted"}

    except auth.UserNotFoundError:
        print(f"User {user_id} not found in Firebase Auth")
        return {"error": "User not found"}, 404

    except Exception as e:
        print(f"Error deleting user {user_id}: {str(e)}")
        return {"error": "Failed to delete account"}, 500

def create_user_in_firebase(email, password, user_data):
    """
    Creates a new user in Firebase Authentication and Firestore.

    Args:
        email (str): User email.
        password (str): User password.
        user_data (dict): User profile data.

    Returns:
        dict: Success or error message.
    """
    try:
        # Create user in Firebase Authentication
        user = auth.create_user(email=email, password=password)
        user_id = user.uid

        # Store user details in Firestore
        user_ref = db.collection("users").document(user_id)
        user_ref.set(user_data)

        return {"message": "User created successfully", "user_id": user_id}

    except Exception as e:
        print(f"Error creating user: {str(e)}")
        return {"error": "Failed to create user"}
