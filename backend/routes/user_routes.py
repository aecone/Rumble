from flask import Blueprint, request, jsonify
from services.firebase_service import get_user_profile, update_user_profile, update_user_settings, delete_user_account, create_user_in_firebase
from services.auth_service import verify_token
from logger import logger  # Import the logger

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


@user_routes.route("/update_profile", methods=["PUT"])
def edit_profile():
    """Allow user to edit their own profile."""
    decoded_token, error = verify_token()
    if error:
        return error

    user_id = decoded_token["uid"]
    data = request.json
    #logger.info("Received data: {data}")
    print("Received data: {data}")

    required_fields = [ "bio", "profilePictureUrl", "major", "gradYear", "hobbies", "orgs", "careerPath", "interestedIndustries", "userType", "mentorshipAreas"]

    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({"error": f"Missing required fields: {missing_fields}"}), 400

    profile_data = {field: data[field] for field in required_fields}

    updated = update_user_profile(user_id, profile_data)

    if updated:
        updated_profile = get_user_profile(user_id)
        #logger.info("Profile updated successfully: {updated_profile}")
        print("Profile updated successfully: {updated_profile}")

        return jsonify(updated_profile), 200

    return jsonify({"error": "Profile update failed"}), 500


@user_routes.route("/update_settings", methods=["PUT"])
def edit_settings():
    """Allow user to edit their settings."""
    decoded_token, error = verify_token()
    if error:
        return error

    user_id = decoded_token["uid"]
    data = request.json
    #logger.info("Received data: {data}")
    print("Received data: {data}")

    required_fields = ["firstName", "lastName", "email", "birthday", "ethnicity", "gender", "pronouns"]

    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({"error": f"Missing required fields: {missing_fields}"}), 400

    settings_data = {field: data[field] for field in required_fields}

    updated = update_user_settings(user_id, settings_data)

    if updated:
        updated_settings = get_user_profile(user_id)
        #logger.info("Profile updated successfully: {updated_settings}")
        print("Profile updated successfully: {updated_settings}")

        return jsonify(updated_settings), 200

    return jsonify({"error": "Settings update failed"}), 500


@user_routes.route("/delete_account", methods=["DELETE"])
def delete_account():
    """API endpoint to delete a user's account."""
    decoded_token, error = verify_token()
    if error:
        #logger.warning("Error verifying token: {error}")
        print("Error verifying token: {error}")

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

        # Assemble Firestore document
        user_data = {
            "settings": {
                "firstName": data.get("firstName", ""),
                "lastName": data.get("lastName", ""),
                "email": email,
                "birthday": data.get("birthday", ""),
                "ethnicity": data.get("ethnicity", ""),
                "gender": data.get("gender", ""),
                "pronouns": data.get("pronouns", "")
            },
            "profile": {
                "bio": "",
                "profilePictureUrl": data.get("profilePictureUrl", ""),
                "major": data.get("major", ""),
                "gradYear": data.get("gradYear", None),
                "hobbies": data.get("hobbies", []),
                "orgs": data.get("orgs", []),
                "careerPath": data.get("careerPath", ""),
                "interestedIndustries": data.get("interestedIndustries", []),
                "userType": data.get("userType", "mentee"),
                "mentorshipAreas": data.get("mentorshipAreas", [])
            },
            "liked_users": {},
            "matched_users": []
        }
        #logger.info("Writing user data to Firestore:")
        print("Writing user data to Firestore:")

        #logger.info(user_data)
        print(user_data)


        # Use your service to create the user
        result = create_user_in_firebase(email, password, user_data)

        if "error" in result:
            return jsonify(result), 500

        return jsonify(result), 201

    except Exception as e:
        #logger.warning(f"Error processing request: {str(e)}")
        print(f"Error processing request: {str(e)}")

        return jsonify({"error": "Internal server error"}), 500
