from flask import Blueprint, request, jsonify
from firebase_admin import firestore
from services.firebase_service import get_user_profile, update_user_profile, update_user_settings, delete_user_account, create_user_in_firebase
from services.auth_service import verify_token
from google.cloud.firestore_v1 import FieldFilter

db = firestore.client()
match_routes = Blueprint('match_routes', __name__)

@match_routes.route('/suggested_users', methods=['POST'])
def suggested_users():
    """
    GET /suggested_users

    Returns a list of suggested users for the authenticated user.

    Accepts optional filters: major, gradYear, hobbies, orgs,
    careerPath, interestedIndustries, userType, mentorshipAreas 

    Filters out:
      - The authenticated user themselves
      - Users they’ve already liked
      - Users they’ve already matched with

    Returns:
        JSON: {
            "users": [
                {
                    "id": "<user_id>",
                    "firstName": "Alice",
                    "major": "Computer Science",
                    "bio": "Love coding and hiking!"
                },
                ...
            ]
        }
    """
    try:
        decoded_token, error = verify_token()
        if error:
            return error

        user_id = decoded_token["uid"]
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
        user_data = get_user_profile(user_id)
        suggested = []
        for doc in docs:
            uid = doc.id
            if uid == user_id or uid in user_data.get('liked_users', {}) or uid in user_data.get('matched_users', []):
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
    POST /swipe

    Handles a swipe action initiated by the authenticated user.
    - Adds the swiped user to the `liked_users` map.
    - If the swiped user has also liked the current user, it's a match.
      - Both users are added to each other's `matched_users` array.
      - A new conversation is created in the `conversations` collection.

    Request JSON:
        {
            "swipedID": "<target_user_id>"
        }

    Returns:
        JSON: { "match": true } on mutual like
        JSON: { "match": false } otherwise
    """
    try:
        decoded_token, error = verify_token()
        if error:
            return error

        user_id = decoded_token["uid"]
        data = request.json or {}
        swiped_id = data.get("swipedID")
        if not swiped_id:
            return jsonify({"error": "Missing 'swipedID' in request body"}), 400

        if user_id == swiped_id:
            return jsonify({"error": "Users cannot swipe on themselves"}), 400

        user_doc = db.collection('users').document(user_id)
        swiped_doc = db.collection('users').document(swiped_id)

        user_doc.update({f'liked_users.{swiped_id}': True})

        swiped_user_doc = swiped_doc.get()
        if swiped_user_doc.exists:
            swiped_user_data = swiped_user_doc.to_dict()
            if user_id in swiped_user_data.get('liked_users', {}):
                user_doc.update({'matched_users': firestore.ArrayUnion([swiped_id])})
                swiped_doc.update({'matched_users': firestore.ArrayUnion([user_id])})
                
                new_convo_id = "_".join(sorted([user_id, swiped_id]))
                new_convo_data = {
                    'participants': [user_id, swiped_id],
                    'lastMessage': None,
                    'lastUpdated': firestore.SERVER_TIMESTAMP
                }
                db.collection('conversations').document(new_convo_id).set(new_convo_data)
                return jsonify({"match": True})

        return jsonify({"match": False})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@match_routes.route('/matches', methods=['GET'])
def get_matches():
    """
    GET /matches

    Retrieves a list of user IDs that the authenticated user has matched with.

    Returns:
        JSON: {
            "matches": ["user_id_1", "user_id_2", ...]
        }
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

@match_routes.route('/conversation', methods=['GET'])
def get_conversation():
    """
    GET /conversation?target_id=<target_user_id>

    Retrieves all messages exchanged between the authenticated user and the specified target user.
    Only allowed if the users are matched.

    Query Parameters:
        targetID (str): The ID of the user to retrieve the conversation with.

    Returns:
        JSON: {
            "messages": [
                {
                    "id": "<message_id>",
                    "text": "Hey!",
                    "sender_id": "<user_id>",
                    "timestamp": "<timestamp>"
                },
                ...
            ]
        }
    """
    try:
        decoded_token, error = verify_token()
        if error:
            return error

        target_id = request.args.get('targetID')
        if not target_id:
            return jsonify({"error": "Missing 'targetID'"}), 400

        user_id = decoded_token["uid"]
        user_doc = db.collection('users').document(user_id).get()
        if not user_doc.exists:
            return jsonify({"error": "User not found"}), 404

        user_data = user_doc.to_dict()
        if target_id not in user_data.get('matched_users', []):
            return jsonify({"error": "You are not matched with target user"}), 404

        messages = []
        convo_id = "_".join(sorted((user_id, target_id)))
        conversation = db.collection('conversations').document(convo_id).collection('messages').stream()
        for message in conversation:
            content = message.to_dict()
            content['id'] = message.id
            messages.append(content)
            
        return jsonify({'messages': messages})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@match_routes.route('/message', methods=['POST'])
def send_message():
    """
    POST /message

    Sends a message from the authenticated user to a matched user.
    Only allowed if the users are matched.

    Request JSON:
        {
            "targetID": "<recipient_user_id>",
            "message": "Hey, how are you?"
        }

    Returns:
        JSON: {
            "success": true,
            "messageID": "<firestore_message_doc_id>"
        }
    """
    try:
        decoded_token, error = verify_token()
        if error:
            return error
        
        data = request.json or {}
        target_id = data.get("targetID")
        message = data.get("message")

        if not target_id or not message or not message.strip():
            return jsonify({"error": "Missing 'targetID' or 'message'"}), 400
        
        user_id = decoded_token["uid"]
        user_doc = db.document(f'users/{user_id}').get()
        if not user_doc.exists:
            return jsonify({"error": "User not found"}), 404

        user_data = user_doc.to_dict()
        if target_id not in user_data.get('matched_users', []):
            return jsonify({"error": "You are not matched with target user"}), 404
        
        convo_id = "_".join(sorted((user_id, target_id)))
        message_data = {
            'text': message.strip(),
            'sender_id': user_id,
            'timestamp': firestore.SERVER_TIMESTAMP
        }
        
        _, message_doc = db.collection('conversations').document(convo_id).collection('messages').add(message_data)

        return jsonify({
            'success': True,
            'messageID': message_doc.id
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
