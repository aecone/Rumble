# tests/test_chat.py
# Test cases T081, T082
"""
Chat feature tests

T081 – Mentee responds in that chat
T082 – Chat history persists after “logout / login”
"""
import pytest
import tests.mock_firebase as mock_firebase  # gives access to the in‑memory Firestore
from services.firebase_service import get_convo_id  # deterministic conversation ID  :contentReference[oaicite:0]{index=0}&#8203;:contentReference[oaicite:1]{index=1}

MENTOR_ID = "user_1"   # pre‑populated mentor (see mock_firebase.populate_mock_users)
MENTEE_ID = "user_2"   # pre‑populated mentee


def _fetch_messages(as_user, with_user, client):
    """Utility: return list of message dicts from the conversation endpoint."""
    res = client.get(
        "/api/conversation",
        query_string={"targetID": with_user},
        headers={"Authorization": f"Bearer {as_user}"},
    )
    assert res.status_code == 200
    return res.get_json()["messages"]


# ---------- T081 ----------
def test_t081_mentee_can_respond(client):
    """Mentee replies; message is stored & visible to mentor."""
    reply = "Thanks mentor – ready to start!"

    send = client.post(
        "/api/message",
        json={"targetID": MENTOR_ID, "message": reply},
        headers={"Authorization": f"Bearer {MENTEE_ID}"},
    )
    assert send.status_code == 200
    payload = send.get_json()
    assert payload["success"] and payload["messageID"]

    # Mentor should now see the reply
    visible_to_mentor = _fetch_messages(MENTOR_ID, MENTEE_ID, client)
    assert any(msg["text"] == reply and msg["sender_id"] == MENTEE_ID for msg in visible_to_mentor)


# ---------- T082 ----------
def test_t082_chat_history_persists_after_relogin(client):
    """
    Make sure previously exchanged messages are still there after a
    'logout → login' cycle (simulated by a fresh test client).
    """
    # --- Arrange: create two fresh messages (one each direction) ---
    client.post(
        "/api/message",
        json={"targetID": MENTEE_ID, "message": "History check 1"},
        headers={"Authorization": f"Bearer {MENTOR_ID}"},
    )
    client.post(
        "/api/message",
        json={"targetID": MENTOR_ID, "message": "History check 2"},
        headers={"Authorization": f"Bearer {MENTEE_ID}"},
    )

    # --- Act: start a brand‑new Flask test client (simulates new login) ---
    from app import create_app  # your factory pattern
    new_app = create_app(testing=True)
    with new_app.test_client() as fresh_client:
        fresh_client.environ_base["HTTP_AUTHORIZATION"] = "Bearer ignored_for_mock"

        history = _fetch_messages(MENTOR_ID, MENTEE_ID, fresh_client)

    # --- Assert: both earlier messages are still present ---
    texts = [m["text"] for m in history]
    assert "History check 1" in texts and "History check 2" in texts
    assert len(history) >= 2, "Chat history should not be lost"

