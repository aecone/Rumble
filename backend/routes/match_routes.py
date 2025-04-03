from flask import Blueprint, request, jsonify
from firebase_admin import firestore
from services.auth_service import verify_token
from google.cloud.firestore_v1 import FieldFilter

db = firestore.client()
match_routes = Blueprint('match_routes', __name__)

@match_routes.route('/suggested_users', methods=['POST'])
def suggested_users():
    """
    Returns a list of suggested users for the authenticated user.
    Accepts optional filters: major, gradYear, hobbies, orgs,
    careerPath, interestedIndustries, userType, mentorshipAreas.
    """
    try:
        decoded_token, error = verify_token()
        if error:
            return error

        current_user_id = decoded_token["uid"]
        data = request.get_json(silent=True) or {}

        # Define filterable fields
        raw_filters = {
            "major": data.get("major", ""),
            "gradYear": data.get("gradYear", None),
            "hobbies": data.get("hobbies", []),
            "orgs": data.get("orgs", []),
            "careerPath": data.get("careerPath", ""),
            "interestedIndustries": data.get("interestedIndustries", []),
            "userType": data.get("userType", ""),
            "mentorshipAreas": data.get("mentorshipAreas", [])
        }
        print(f"{raw_filters} raw filters")
        users_ref = db.collection("users")
        query = users_ref

        for key, value in raw_filters.items():
            field_path = f"profile.{key}"

            if isinstance(value, str) and value.strip():
                query = query.where(filter=FieldFilter(field_path, "==", value.strip()))
            elif isinstance(value, int):
                query = query.where(filter=FieldFilter(field_path, "==", value))
            elif isinstance(value, list) and value:
                query = query.where(filter=FieldFilter(field_path, "array_contains_any", value))

        docs = query.stream()

        suggested = []
        for doc in docs:
            uid = doc.id
            if uid == current_user_id:
                continue

            data = doc.to_dict()
            suggested.append({
                "id": uid,
                "firstName": data.get("settings", {}).get("firstName", "Unknown"),
                "lastName": data.get("settings", {}).get("lastName", ""),
                "ethnicity": data.get("settings", {}).get("ethnicity", ""),
                "gender": data.get("settings", {}).get("gender", ""),
                "pronouns": data.get("settings", {}).get("pronouns", ""),
                "bio": data.get("profile", {}).get("bio", ""),
                "major": data.get("profile", {}).get("major", ""),
                "gradYear": data.get("profile", {}).get("gradYear", ""),
                "hobbies": data.get("profile", {}).get("hobbies", []),
                "orgs": data.get("profile", {}).get("orgs", []),
                "careerPath": data.get("profile", {}).get("careerPath", ""),
                "interestedIndustries": data.get("profile", {}).get("interestedIndustries", []),
                "mentorshipAreas": data.get("profile", {}).get("mentorshipAreas", [])
            })
        print(f"{suggested} suggested users")
        return jsonify({"users": suggested})

    except Exception as e:
        return jsonify({"error": str(e)}), 500



@match_routes.route('/swipe', methods=['POST'])
def swipe():
    """
    Handles a swipe action:
    - Updates the authenticated user's liked_users hashmap.
    - Checks if the swiped user already liked the authenticated user.
    - If a mutual like exists, adds both users to matched_users.
    """
    try:
        decoded_token, error = verify_token()
        if error:
            return error

        user_id = decoded_token["uid"]
        data = request.json
        swiped_id = data.get("swiped_id")
        if not swiped_id:
            return jsonify({"error": "Missing 'swiped_id' in request body"}), 400

        if user_id == swiped_id:
            return jsonify({"error": "Users cannot swipe on themselves"}), 400

        user_ref = db.collection('users').document(user_id)
        swiped_ref = db.collection('users').document(swiped_id)

        # Add swiped user to the authenticated user's liked_users hashmap
        user_ref.update({f'liked_users.{swiped_id}': True})

        # Check if the swiped user already liked the authenticated user
        swiped_user_doc = swiped_ref.get()
        if swiped_user_doc.exists:
            swiped_user_data = swiped_user_doc.to_dict()
            if user_id in swiped_user_data.get('liked_users', {}):
                # It's a match: add each other to matched_users list
                user_ref.update({'matched_users': firestore.ArrayUnion([swiped_id])})
                swiped_ref.update({'matched_users': firestore.ArrayUnion([user_id])})
                return jsonify({"match": True})

        return jsonify({"match": False})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@match_routes.route('/matches', methods=['GET'])
def get_matches():
    """
    Retrieves all matches for the authenticated user.
    """
    try:
        decoded_token, error = verify_token()
        if error:
            return error

        user_id = decoded_token["uid"]
        user_doc = db.collection('users').document(user_id).get()
        if user_doc.exists:
            user_data = user_doc.to_dict()
            return jsonify({"matches": user_data.get('matched_users', [])})

        return jsonify({"error": "User not found"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500
