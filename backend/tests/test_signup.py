# Tests (T001 – T009)

import pytest
from http import HTTPStatus

# ---------------------------------------------------------------------------
# Helper utilities
# ---------------------------------------------------------------------------

def _create_user(client, *, email: str = "student@scarletmail.rutgers.edu", password: str = "StrongPass123!", **extra):
    """Send a POST request to the create_user endpoint.

    Args:
        client: Flask test client fixture (defined in conftest.py).
        email: Email address to use for sign‑up.
        password: Password to use for sign‑up.
        **extra: Any additional JSON fields to include in the body (e.g., profile
            or settings data). They are merged into the base payload so test
            cases can supply optional data without having to repeat boilerplate.

    Returns:
        flask.testing.FlaskClient.response: Raw response from the request.
    """
    payload = {
        "email": email,
        "password": password,
        **extra,
    }
    return client.post("/api/create_user", json=payload)

# ---------------------------------------------------------------------------
# Test‑case implementations (T001 – T009)
# ---------------------------------------------------------------------------

def test_T001_create_account_success(client):
    """T001 – Verify account creation with valid data and allowed domain."""
    response = _create_user(client)
    assert response.status_code == HTTPStatus.CREATED
    data = response.get_json()
    assert data.get("message") == "User created successfully"
    assert "user_id" in data, "Expected a user_id in the successful response"


def test_T002_duplicate_email_rejected(client, mock_firestore):
    """T002 – Ensure system prevents account creation with a duplicate email."""
    # Pre‑condition: an account already exists
    _create_user(client, email="student@rutgers.edu")

    # Attempt to create another account with the same email (or logically
    # duplicate in Firebase Auth terms).
    dup_response = _create_user(
        client,
        email="student@rutgers.edu",
        password="AnotherStrong123!",
    )

    assert dup_response.status_code in {
        HTTPStatus.BAD_REQUEST,
        HTTPStatus.CONFLICT,
        HTTPStatus.INTERNAL_SERVER_ERROR,
    }, "Duplicate email should not allow account creation"
    assert "error" in dup_response.get_json()


def test_T003_reject_email_outside_allowed_domains(client):
    """T003 – Reject emails that are not scarletmail/rutgers domains."""
    resp = _create_user(client, email="user@gmail.com")
    assert resp.status_code == HTTPStatus.BAD_REQUEST
    assert "Only @rutgers.edu or @scarletmail.rutgers.edu emails are allowed" in resp.get_json().get("error", "")


def test_T004_reject_typo_in_allowed_domain(client):
    """T004 – Detect obvious typo (missing 'l') in scarletmail domain."""
    resp = _create_user(client, email="user@scarletmai.rutgers.edu")
    assert resp.status_code == HTTPStatus.BAD_REQUEST
    assert "Invalid email domain" in resp.get_json().get("error", "")


def test_T005_reject_minor_domain_typo(client):
    """T005 – Detect missing 's' in 'rutgers'."""
    resp = _create_user(client, email="user@scarletmail.rutger.edu")
    assert resp.status_code == HTTPStatus.BAD_REQUEST
    assert "Invalid email domain" in resp.get_json().get("error", "")


def test_T006_reject_incorrect_email_suffix(client):
    """T006 – Detect incorrect TLD or suffix in email."""
    resp = _create_user(client, email="user@scarletmai.rutgers.edue")
    assert resp.status_code == HTTPStatus.BAD_REQUEST
    assert "Invalid email domain" in resp.get_json().get("error", "")


def test_T007_password_complexity_enforced(client):
    """T007 – Ensure passwords too short or lacking complexity are rejected."""
    resp = _create_user(client, email="student@rutgers.edu", password="12345")
    assert resp.status_code == HTTPStatus.BAD_REQUEST
    assert any(
        msg in resp.get_json().get("error", "")
        for msg in ["Password too short", "Password must be at least 6 characters"]
    )


def test_T008_required_fields_validated(client):
    """T008 – Neither email nor password supplied – expect validation errors."""
    resp = client.post("/api/create_user", json={})
    assert resp.status_code == HTTPStatus.BAD_REQUEST
    err_msg = resp.get_json().get("error", "").lower()
    assert "email" in err_msg and "password" in err_msg


def test_T009_all_fields_missing(client):
    """T009 – All form fields left blank – ensure sign‑up cannot proceed."""
    resp = client.post("/api/create_user", json={"email": "", "password": ""})
    assert resp.status_code == HTTPStatus.BAD_REQUEST
    assert "Email and password are required" in resp.get_json().get("error", "")
