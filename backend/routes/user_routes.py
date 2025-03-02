from flask import Blueprint, request, jsonify
from services.firebase_service import get_user_profile, update_user_profile, delete_user_account
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
