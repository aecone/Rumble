import os
import json
import base64
import firebase_admin
from firebase_admin import credentials, firestore, auth

# Load Firebase credentials from environment variable
firebase_credentials_b64 = os.getenv("FIREBASE_CREDENTIALS")
if firebase_credentials_b64:
    firebase_credentials_json = base64.b64decode(firebase_credentials_b64).decode("utf-8")
    firebase_credentials = json.loads(firebase_credentials_json)

    # Ensure Firebase is initialized
    if not firebase_admin._apps:
        cred = credentials.Certificate(firebase_credentials)
        firebase_admin.initialize_app(cred)
else:
    raise ValueError("FIREBASE_CREDENTIALS environment variable is not set")

# Initialize Firestore client
db = firestore.client()

def get_user_profile(user_id):
    """Retrieve a user's profile from Firestore."""
    user_ref = db.collection("users").document(user_id).get()
    return user_ref.to_dict() if user_ref.exists else None

def update_user_profile(user_id, profile_data):
    """Update a user's profile."""
    user_ref = db.collection("users").document(user_id)
    user_ref.set({"profile": profile_data}, merge=True)
    return True

def update_user_settings(user_id, settings_data):
    """Update a user's settings."""
    user_ref = db.collection("users").document(user_id)
    user_ref.set({"settings": settings_data}, merge=True)
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




"""Extra firebase functions

- To delete all users in Firebase Auth, you can use the following function:

"""

def delete_all_users():
    batch_size = 1000  # Firebase allows max 1000 at a time
    users_to_delete = []

    # List all users
    page = auth.list_users()
    while page:
        for user in page.users:
            users_to_delete.append(user.uid)

            # Delete in batches
            if len(users_to_delete) >= batch_size:
                auth.delete_users(users_to_delete)
                print(f"Deleted {len(users_to_delete)} users")
                users_to_delete = []

        # Get next batch
        page = page.next_page_token and auth.list_users(page_token=page.next_page_token)

    # Delete remaining users
    if users_to_delete:
        auth.delete_users(users_to_delete)
        print(f"Deleted {len(users_to_delete)} users")

    print("All users deleted successfully.")

# To delete all auth users, run function delete_all_users()