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


def test_swipe_success(client):
    response = client.post("/api/swipe", json={"swipedID": "user_2"})
    print("RESPONSE JSON:", response.json)
    assert response.status_code == 200
