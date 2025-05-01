# Test cases T070, T074

import logging

def test_verify_token_mocked_everywhere(client):
    # Import from patched modules (backend structure assumed)
    from services.auth_service import verify_token as svc_verify
    from routes.match_routes import verify_token as match_verify
    from routes.user_routes import verify_token as user_verify

    with client.application.test_request_context(headers={"Authorization": "Bearer test_user"}):
        for fn in [svc_verify, match_verify, user_verify]:
            decoded, error = fn()
            assert error is None
            assert decoded["uid"] == "test_user"

# Test case T070
def test_swipe_success(client, mock_firestore):
    # Arrange
    swiping_user_id = "user_3"  # A user not yet matched or liked anyone
    swiped_user_id = "user_2"   # Pre-populated user in mock Firestore

    # Act
    response = client.post(
        "/api/swipe",
        json={"swipedID": swiped_user_id},
        headers={"Authorization": f"Bearer {swiping_user_id}"}
    )

    # Assert
    assert response.status_code == 200

    # Verify that the swiped user ID was added to the swiping user's liked_users via Firestore field update
    swiping_user_data = mock_firestore.collection("users") \
                                  .document(swiping_user_id) \
                                  .get() \
                                  .to_dict()
    field_key = f"liked_users.{swiped_user_id}"
    assert field_key in swiping_user_data
    assert swiping_user_data[field_key] is True

# Test case T074
def test_swipe_match_creates_match_and_conversation(client, mock_firestore):
    # Arrange: define user IDs
    swiping_user_id = "user_3"
    swiped_user_id = "user_1"
    from services.firebase_service import get_convo_id

    # Simulate that user_1 has previously liked user_3
    mock_firestore.collection("users").document(swiped_user_id).set(
        {"liked_users": {swiping_user_id: True}},
        merge=True
    )

    # Act: user_3 swipes right on user_1
    response = client.post(
        "/api/swipe",
        json={"swipedID": swiped_user_id},
        headers={"Authorization": f"Bearer {swiping_user_id}"}
    )

    # Assert status
    assert response.status_code == 200

    # Verify both users have each other in matched_users
    user3_data = mock_firestore.collection("users").document(swiping_user_id).get().to_dict()
    user1_data = mock_firestore.collection("users").document(swiped_user_id).get().to_dict()
    assert "matched_users" in user3_data and swiped_user_id in user3_data["matched_users"]
    assert "matched_users" in user1_data and swiping_user_id in user1_data["matched_users"]

    # Verify a conversation document was created
    convo_id = get_convo_id(swiping_user_id, swiped_user_id)
    convo_doc = mock_firestore.collection("conversations").document(convo_id).get()
    assert convo_doc.exists
