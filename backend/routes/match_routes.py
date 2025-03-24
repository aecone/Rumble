from flask import Blueprint, request, jsonify
from firebase_admin import firestore
from services.auth_service import verify_token

db = firestore.client()
match_routes = Blueprint('match_routes', __name__)

@match_routes.route('/suggested_users', methods=['GET'])
def suggested_users():
    """
    Returns a list of suggested users for the authenticated user.
    Includes basic profile info: id, firstName, major, and bio.
    """
    try:
        decoded_token, error = verify_token()
        if error:
            return error

        current_user_id = decoded_token["uid"]

        users_ref = db.collection('users')
        docs = users_ref.stream()

        suggested = []
        for doc in docs:
            uid = doc.id
            if uid == current_user_id:
                continue

            data = doc.to_dict()
            suggested.append({
                "id": uid,
                "firstName": data.get("settings", {}).get("firstName", "Unknown"),
                "major": data.get("profile", {}).get("major", ""),
                "bio": data.get("profile", {}).get("bio", "")
            })


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
