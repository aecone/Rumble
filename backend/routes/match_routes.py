from flask import Blueprint, request, jsonify
from firebase_admin import firestore
from services.firebase_service import (
    get_convo_id,
    get_user_profile,
    send_notification,
    update_user_profile,
    update_user_settings,
    delete_user_account,
    create_user_in_firebase
)
from services.auth_service import verify_token
from google.cloud.firestore_v1 import FieldFilter

db = firestore.client()
match_routes = Blueprint('match_routes', __name__)

@match_routes.route('/suggested_users', methods=['POST'])
def suggested_users():
    """
    POST /suggested_users
    Returns a list of user summaries matching the provided filters.

    Filters supported (any combination):
      - profile.major (string)
      - profile.gradYear (int or string)
      - profile.hobbies (list of strings)
      - profile.orgs (list of strings)
      - profile.careerPath (string)
      - profile.interestedIndustries (list of strings)
      - profile.userType (string)
      - profile.mentorshipAreas (list of strings)

    Only users who are not the requester and not already liked/matched are returned.
    """
    try:
        decoded_token, error = verify_token()
        if error:
            return error

        user_id = decoded_token['uid']
        data = request.get_json(silent=True) or {}

        # Build raw filters
        raw_filters = {
            'major': data.get('major', '').strip(),
            'gradYear': data.get('gradYear', None),
            'hobbies': data.get('hobbies', []),
            'orgs': data.get('orgs', []),
            'careerPath': data.get('careerPath', '').strip(),
            'interestedIndustries': data.get('interestedIndustries', []),
            'userType': data.get('userType', '').strip(),
            'mentorshipAreas': data.get('mentorshipAreas', []),
        }

        # Retrieve all user docs
        docs = db.collection('users').stream()
        user_data = get_user_profile(user_id) or {}
        suggested = []

        # Iterate and filter in Python
        for doc in docs:
            uid = doc.id
            # Skip self, liked, or matched
            if uid == user_id:
                continue
            if uid in user_data.get('liked_users', {}) or uid in user_data.get('matched_users', []):
                continue

            d = doc.to_dict()
            profile = d.get('profile', {})
            settings = d.get('settings', {})

            # Apply each filter; if any fail, skip this user
            match = True
            for key, value in raw_filters.items():
                if isinstance(value, str) and value:
                    if profile.get(key) != value:
                        match = False
                        break
                elif isinstance(value, int):
                    if profile.get(key) != value:
                        match = False
                        break
                elif isinstance(value, list) and value:
                    # require at least one overlap
                    target = profile.get(key, [])
                    if not any(item in target for item in value):
                        match = False
                        break
            if not match:
                continue

            # Passed all filters; construct summary
            suggested.append({
                'id': uid,
                'firstName': settings.get('firstName', 'Unknown'),
                'lastName': settings.get('lastName', ''),
                'ethnicity': settings.get('ethnicity', ''),
                'gender': settings.get('gender', ''),
                'pronouns': settings.get('pronouns', ''),
                'bio': profile.get('bio', ''),
                'major': profile.get('major', ''),
                'gradYear': profile.get('gradYear', ''),
                'hobbies': profile.get('hobbies', []),
                'orgs': profile.get('orgs', []),
                'careerPath': profile.get('careerPath', ''),
                'interestedIndustries': profile.get('interestedIndustries', []),
                'mentorshipAreas': profile.get('mentorshipAreas', []),
            })

        return jsonify({'users': suggested}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@match_routes.route('/swipe', methods=['POST'])
def swipe():
    # … your existing code …
    try:
        decoded_token, error = verify_token()
        if error:
            return error

        user_id = decoded_token["uid"]
        swiped_id = (request.json or {}).get("swipedID")

        if not swiped_id:
            return jsonify({"error": "Missing 'swipedID'"}), 400
        if user_id == swiped_id:
            return jsonify({"error": "Users cannot swipe on themselves"}), 400

        user_doc = db.collection('users').document(user_id)
        swiped_doc = db.collection('users').document(swiped_id)

        user_doc.update({f'liked_users.{swiped_id}': True})

        swiped_user_doc = swiped_doc.get()
        if swiped_user_doc.exists:
            data = swiped_user_doc.to_dict()
            if user_id in data.get('liked_users', {}):
                user_doc.update({'matched_users': firestore.ArrayUnion([swiped_id])})
                swiped_doc.update({'matched_users': firestore.ArrayUnion([user_id])})

                convo_id = get_convo_id(user_id, swiped_id)
                db.collection('conversations').document(convo_id).set({
                    'participants': [user_id, swiped_id],
                    'lastMessage': None,
                    'lastUpdated': firestore.SERVER_TIMESTAMP
                })

                token = data.get('notification_token')
                name = f"{data.get('settings', {}).get('firstName', 'Someone')} {data.get('settings', {}).get('lastName', '')}"

                if not token:
                    return jsonify({"error": "User has no notification token"}), 400

                send_notification(
                    token,
                    "RUmble",
                    f"You matched with {name}.",
                    {'userID': user_id, 'matchName': name, 'screen': '/messagingChat'}
                )

                return jsonify({"match": True, "notified": True}), 200

        return jsonify({"match": False})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@match_routes.route("/matches", methods=["GET"])
def get_matches():
    # … unchanged …
    decoded_token, error = verify_token()
    if error:
        return error

    user_id = decoded_token["uid"]
    profile = get_user_profile(user_id)
    if not profile:
        return jsonify({"error": "User profile not found"}), 404

    matches = profile.get("matched_users", [])
    if not matches:
        return jsonify({"matches": []}), 200

    detailed = []
    for m in matches:
        p = get_user_profile(m)
        if p:
            p["id"] = m
            detailed.append(p)

    return jsonify({"matches": detailed}), 200


@match_routes.route('/conversation', methods=['GET'])
def get_conversation():
    """
    GET /conversation?targetID=<user>
    """
    try:
        decoded_token, error = verify_token()
        if error:
            return error

        target_id = request.args.get('targetID')
        if not target_id:
            return jsonify({"error": "Missing 'targetID'"}), 400

        user_id = decoded_token["uid"]
        user_doc = db.collection("users").document(user_id).get()
        if not user_doc.exists:
            return jsonify({"error": "User not found"}), 404

        data = user_doc.to_dict()
        if target_id not in data.get('matched_users', []):
            return jsonify({"error": "You are not matched with target user"}), 404

        convo_id = get_convo_id(user_id, target_id)
        msgs = db.collection('conversations') \
                 .document(convo_id) \
                 .collection('messages') \
                 .stream()

        # Build a JSON‑safe response, dropping the SERVER_TIMESTAMP placeholder
        out = []
        for m in msgs:
            doc = m.to_dict()
            out.append({
                'id': m.id,
                'text': doc.get('text'),
                'sender_id': doc.get('sender_id'),
            })

        return jsonify({'messages': out})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@match_routes.route('/message', methods=['POST'])
def send_message():
    # … your existing code …
    try:
        decoded_token, error = verify_token()
        if error:
            return error

        body = request.json or {}
        target_id = body.get("targetID")
        text = body.get("message", "").strip()

        if not target_id or not text:
            return jsonify({"error": "Missing 'targetID' or 'message'"}), 400

        user_id = decoded_token["uid"]
        user_doc = db.collection("users").document(user_id).get()
        if not user_doc.exists:
            return jsonify({"error": "User not found"}), 404

        data = user_doc.to_dict()
        if target_id not in data.get("matched_users", []):
            return jsonify({"error": "You are not matched with target user"}), 404

        convo_id = get_convo_id(user_id, target_id)
        message_data = {
            'text': text,
            'sender_id': user_id,
            'timestamp': firestore.SERVER_TIMESTAMP
        }

        _, msg_doc = db.collection('conversations') \
                       .document(convo_id) \
                       .collection('messages') \
                       .add(message_data)

        target_doc = db.collection("users").document(target_id).get()
        if target_doc.exists:
            td = target_doc.to_dict()
            tok = td.get("notification_token")
            name = data.get("settings", {}).get("firstName", "Someone")

            if tok:
                send_notification(
                    tok,
                    f"New Message from {name}!",
                    text,
                    {'userID': user_id, 'matchName': name, 'screen': '/messagingChat'}
                )
                db.collection('conversations').document(convo_id).update({
                    'lastMessage': text,
                    'lastUpdated': firestore.SERVER_TIMESTAMP
                })

        return jsonify({'success': True, 'messageID': msg_doc.id})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
