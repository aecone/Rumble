from flask import Blueprint, request, jsonify
from services.firebase_service import get_user_profile, update_user_profile, delete_user_account, create_user_in_firebase
from services.auth_service import verify_token


user_routes = Blueprint("user_routes", __name__)

@user_routes.route("/profile", methods=["GET"])
def get_profile():
    """Fetch logged-in user's profile."""
    decoded_token, error = verify_token()
    if error:
        return error  # Return error response if token is invalid

    user_id = decoded_token["uid"]
    profile = get_user_profile(user_id)
    
    if profile:
        return jsonify(profile), 200
    return jsonify({"error": "Profile not found"}), 404

@user_routes.route("/profile", methods=["PUT"])
def edit_profile():
    """Allow user to edit their own profile."""
    decoded_token, error = verify_token()
    if error:
        return error

    user_id = decoded_token["uid"]
    data = request.json
    print("Received data:", data)

    print("Received profile update request:", data)  # Debugging log

    required_fields = [
        "firstName", "lastName", "birthday", "major", 
        "ethnicity", "gender", "pronouns", "bio", "profile_picture_url"
    ]

    # Ensure all required fields are present
    if not all(field in data for field in required_fields):
        missing_fields = [field for field in required_fields if field not in data]
        print(f"Error: Missing required fields - {missing_fields}")
        return jsonify({"error": f"Missing required fields: {missing_fields}"}), 400

   
    updated = update_user_profile(
        user_id, 
        data["firstName"], 
        data["lastName"], 
        data["birthday"], 
        data["major"], 
        data["ethnicity"], 
        data["gender"], 
        data["pronouns"], 
        data["bio"], 
        data["profile_picture_url"]
    )
    if updated:
        updated_profile = get_user_profile(user_id)  # Fetch updated profile
        print("Profile updated successfully:", updated_profile)  # Debugging log
        return jsonify(updated_profile), 200  # Return updated profile data
    
    print("Error: Profile update failed")
    return jsonify({"error": "Profile update failed"}), 500

@user_routes.route("/delete_account", methods=["DELETE"])
def delete_account():
    """API endpoint to delete a user's account."""
    decoded_token, error = verify_token()
    if error:
        print("Error verifying token:", error)
        return error

    user_id = decoded_token["uid"]  # Firebase UID

    # Call the isolated function
    result = delete_user_account(user_id)

    if "error" in result:
        return jsonify(result), 500
    return jsonify(result), 200

@user_routes.route("/create_user", methods=["POST"])
def create_user():
    """
    API endpoint to create a new user in Firebase Auth & Firestore.
    - Stores profile information in Firestore.
    - Initializes `liked_users` as an empty HashMap.
    - Initializes `matched_users` as an empty List.
    """
    try:
        data = request.json
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        user_data = {
            "firstName": data.get("firstName", ""),
            "lastName": data.get("lastName", ""),
            "birthday": data.get("birthday", ""),
            "major": data.get("major", ""),
            "ethnicity": data.get("ethnicity", ""),
            "gender": data.get("gender", ""),
            "pronouns": data.get("pronouns", ""),
            "bio": "",
            "profile_picture_url": "",
            "email": email,
            "liked_users": {},  # Initialize as an empty HashMap
            "matched_users": []  # Initialize as an empty List
        }

        result = create_user_in_firebase(email, password, user_data)
        status_code = 201 if "user_id" in result else 500

        return jsonify(result), status_code

    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

