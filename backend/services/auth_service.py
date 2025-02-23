from firebase_admin import auth
from flask import request, jsonify

def verify_token():
    """Extract and verify Firebase ID token from request header."""
    token = request.headers.get("Authorization")

    if not token:
        return None, jsonify({"error": "Authorization token missing"}), 401  # ✅ Return (None, error)

    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token, None  # ✅ Return (decoded_token, None) when valid
    except Exception as e:
        return None, jsonify({"error": "Invalid or expired token"}), 403  # ✅ Return (None, error)
