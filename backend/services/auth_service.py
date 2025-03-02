from flask import request, jsonify
from firebase_admin import auth

def verify_token():
    """Verifies Firebase ID token from Authorization header."""
    
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return None, (jsonify({"error": "Missing Authorization header"}), 403)

    if not auth_header.startswith("Bearer "):
        return None, (jsonify({"error": "Invalid token format"}), 403)

    token = auth_header.split("Bearer ")[-1]  # Extract the token
    print(f"Received token: {token[:20]}...")  # Debug: Print part of the token

    try:
        decoded_token = auth.verify_id_token(token)
        print(f"Decoded token: {decoded_token}")  # Debug: Print the decoded token
        return decoded_token, None
    except auth.ExpiredIdTokenError:
        return None, (jsonify({"error": "Expired token"}), 403)
    except auth.InvalidIdTokenError:
        return None, (jsonify({"error": "Invalid token"}), 403)
    except auth.RevokedIdTokenError:
        return None, (jsonify({"error": "Revoked token"}), 403)
    except Exception as e:
        print(f"Token verification failed: {e}")  # Debugging log
        return None, (jsonify({"error": "Failed to verify token"}), 403)
