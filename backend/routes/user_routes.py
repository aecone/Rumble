from flask import Blueprint, request, jsonify
from services.firebase_service import get_user_profile, update_user_profile
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

    print("Received profile update request:", data)  # Debugging log

    if "bio" not in data or "profile_picture_url" not in data:
        print("Error: Missing required fields")
        return jsonify({"error": "Missing required fields"}), 400

    updated = update_user_profile(user_id, data["bio"], data["profile_picture_url"])
    if updated:
        updated_profile = get_user_profile(user_id)  # Fetch updated profile
        print("Profile updated successfully:", updated_profile)  # Debugging log
        return jsonify(updated_profile), 200  # Return updated profile data
    
    print("Error: Profile update failed")
    return jsonify({"error": "Profile update failed"}), 500



#email, password, first name, last name, bday, major, ethnicity, gender, pronouns 

