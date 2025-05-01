from flask import Flask, Blueprint, request, jsonify
from services.firebase_service import get_user_profile, update_user_profile, update_user_settings, delete_user_account, create_user_in_firebase
from services.auth_service import verify_token
from firebase_admin import firestore
from http import HTTPStatus
from difflib import SequenceMatcher
import logging
logger = logging.getLogger(__name__)

db = firestore.client()
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
        return jsonify(profile), HTTPStatus.OK
    return jsonify({"error": "Profile not found"}), HTTPStatus.NOT_FOUND

@user_routes.route("/update_profile", methods=["PUT"])
def edit_profile():
    """Allow user to edit their own profile."""
    decoded_token, error = verify_token()
    if error:
        return error

    user_id = decoded_token["uid"]
    data = request.json
    logger.info(f"Received data: {data}")
    print(f"Received data: {data}")

    required_fields = ["bio", "profilePictureUrl", "major", "gradYear", "hobbies", "orgs", "careerPath", "interestedIndustries", "userType", "mentorshipAreas"]
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({"error": f"Missing required fields: {missing_fields}"}), HTTPStatus.BAD_REQUEST

    profile_data = {field: data[field] for field in required_fields}
    if update_user_profile(user_id, profile_data):
        return jsonify(get_user_profile(user_id)), HTTPStatus.OK
    return jsonify({"error": "Profile update failed"}), HTTPStatus.INTERNAL_SERVER_ERROR

@user_routes.route("/update_settings", methods=["PUT"])
def edit_settings():
    """Allow user to edit their settings."""
    decoded_token, error = verify_token()
    if error:
        return error

    user_id = decoded_token["uid"]
    data = request.json
    logger.info(f"Received data: {data}")
    print(f"Received data: {data}")

    required_fields = ["firstName", "lastName", "email", "birthday", "ethnicity", "gender", "pronouns"]
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({"error": f"Missing required fields: {missing_fields}"}), HTTPStatus.BAD_REQUEST

    settings_data = {field: data[field] for field in required_fields}
    if update_user_settings(user_id, settings_data):
        return jsonify(get_user_profile(user_id)), HTTPStatus.OK
    return jsonify({"error": "Settings update failed"}), HTTPStatus.INTERNAL_SERVER_ERROR

@user_routes.route("/delete_account", methods=["DELETE"])
def delete_account():
    """API endpoint to delete a user's account."""
    decoded_token, error = verify_token()
    if error:
        logger.warning(f"Error verifying token: {error}")
        print(f"Error verifying token: {error}")
        return error

    result = delete_user_account(decoded_token["uid"])
    if "error" in result:
        return jsonify(result), HTTPStatus.INTERNAL_SERVER_ERROR
    return jsonify(result), HTTPStatus.OK

@user_routes.route("/create_user", methods=["POST"])
def create_user():
    """
    API endpoint to create a new user in Firebase Auth & Firestore.
    - Validates email domain, duplicate emails, password rules, and required fields.
    - Stores profile information in Firestore.
    - Initializes `liked_users` as an empty map and `matched_users` as an empty list.
    """
    try:
        data = request.json or {}
        email = data.get("email", "").strip().lower()
        password = data.get("password", "").strip()

        # Required fields check
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), HTTPStatus.BAD_REQUEST

        # Password length/complexity check
        if len(password) < 6:
            return jsonify({"error": "Password must be at least 6 characters"}), HTTPStatus.BAD_REQUEST

        # Domain validation: exact match
        allowed_domains = ["rutgers.edu", "scarletmail.rutgers.edu"]
        domain = email.split("@")[-1]
        if domain not in allowed_domains:
            # Minor typo detection using sequence similarity
            for ad in allowed_domains:
                if SequenceMatcher(None, domain, ad).ratio() >= 0.9:
                    return jsonify({"error": "Invalid email domain"}), HTTPStatus.BAD_REQUEST
            # Completely invalid domain
            return jsonify({"error": "Only @rutgers.edu or @scarletmail.rutgers.edu emails are allowed"}), HTTPStatus.BAD_REQUEST

        # Duplicate Email Check
        for doc in db.collection("users").stream():
            existing = doc.to_dict().get("settings", {}).get("email", "").lower()
            if existing == email:
                return jsonify({"error": "Email already in use"}), HTTPStatus.BAD_REQUEST

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
            "matched_users": [],
            "notification_token": None
        }

        result = create_user_in_firebase(email, password, user_data)
        if "error" in result:
            return jsonify(result), HTTPStatus.INTERNAL_SERVER_ERROR
        return jsonify(result), HTTPStatus.CREATED

    except Exception as e:
        logger.warning(f"Error processing request: {e}")
        print(f"Error processing request: {e}")
        return jsonify({"error": "Internal server error"}), HTTPStatus.INTERNAL_SERVER_ERROR

@user_routes.route("/set_notification_token", methods=["POST"])
def set_notification_token():
    """
    Stores or updates the notification token.
    """
    decoded_token, error = verify_token()
    if error:
        return error
    data = request.json or {}
    user_id = data.get("userID")
    token = data.get("token")
    if not user_id or not token:
        return jsonify({'error': 'user_id and token required'}), HTTPStatus.BAD_REQUEST

    user_ref = db.collection('users').document(user_id)
    if not user_ref.get().exists:
        return jsonify({'fail': 'user not found'}), HTTPStatus.NOT_FOUND
    user_ref.update({"notification_token": token})
    return jsonify({'notice': 'success!'}), HTTPStatus.CREATED
