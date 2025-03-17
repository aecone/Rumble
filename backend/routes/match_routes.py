from flask import Blueprint, request, jsonify
from firebase_admin import firestore
from services.auth_service import verify_token

db = firestore.client()
match_routes = Blueprint('match_routes', __name__)

@match_routes.route('/swipe', methods=['POST'])
def swipe():
    """
    Handles user swiping action.
    - Requires Firebase authentication.
    - Updates `liked_users` for the swiper.
    - Checks if the swiped user already liked back.
    - If a match is found, both users are added to `matched_users`.
    """
    try:
        # Verify Firebase ID token
        decoded_token, error = verify_token()
        if error:
            return error  # Return the authentication error

        user_id = decoded_token["uid"]  # Get authenticated user ID
        data = request.json
        swiped_id = data.get("swiped_id")

        if not swiped_id:
            return jsonify({"error": "Missing 'swiped_id' in request body"}), 400

        if user_id == swiped_id:
            return jsonify({"error": "Users cannot swipe on themselves"}), 400

        # References to Firestore documents
        user_ref = db.collection('users').document(user_id)
        swiped_ref = db.collection('users').document(swiped_id)

        # Add swiped user to `liked_users` HashMap
        user_ref.update({f'liked_users.{swiped_id}': True})

        # Check if the swiped user already liked the swiper
        swiped_user_doc = swiped_ref.get()
        if swiped_user_doc.exists:
            swiped_user_data = swiped_user_doc.to_dict()
            if user_id in swiped_user_data.get('liked_users', {}):
                # It's a match! Add both users to `matched_users`
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
    - Requires Firebase authentication.
    - Reads `matched_users` list from Firestore.
    """
    try:
        # Verify Firebase ID token
        decoded_token, error = verify_token()
        if error:
            return error  # Return the authentication error

        user_id = decoded_token["uid"]  # Get authenticated user ID

        user_doc = db.collection('users').document(user_id).get()
        if user_doc.exists:
            user_data = user_doc.to_dict()
            return jsonify({"matches": user_data.get('matched_users', [])})

        return jsonify({"error": "User not found"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500
