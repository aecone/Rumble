from flask import request, jsonify
from firebase_admin import auth
import logging
logger = logging.getLogger(__name__)

def verify_token():
    """Verifies Firebase ID token from Authorization header."""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        logger.warning("Missing Authorization header")  # Debugging log
          # Debugging log

        return None, (jsonify({"error": "Missing Authorization header"}), 403)

    try:
        decoded_token = auth.verify_id_token(auth_header)
        return decoded_token, None
    except auth.ExpiredIdTokenError:
        return None, (jsonify({"error": "Expired token"}), 403)
    except auth.InvalidIdTokenError:
        return None, (jsonify({"error": "Invalid token"}), 403)
    except auth.RevokedIdTokenError:
        return None, (jsonify({"error": "Revoked token"}), 403)
    except Exception as e:
        logger.warning(f"Token verification failed: {e}")  # Debugging log
          # Debugging log

        return None, (jsonify({"error": "Failed to verify token"}), 403)
