import pytest
from http import HTTPStatus

# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _post_suggested(client, payload: dict | None = None, *, user: str = "user_3"):
    """Convenience wrapper to hit /api/suggested_users as a given user."""
    payload = payload or {}
    return client.post(
        "/api/suggested_users",
        json=payload,
        headers={"Authorization": f"Bearer {user}"},
    )

# ---------------------------------------------------------------------------
# T083 – T086
# ---------------------------------------------------------------------------

def test_T083_single_tag_filter(client):
    """T083 – Single‑tag filter should return only matching users."""
    resp = _post_suggested(client, {"careerPath": "Software Engineer"})
    assert resp.status_code == HTTPStatus.OK
    users = resp.get_json()["users"]

    # Expect exactly user_1 (Software Engineer) and no others
    assert {u["id"] for u in users} == {"user_1"}


def test_T084_multi_tag_filter(client):
    """T084 – Multi‑tag (AND) filter should return users matching *all* tags."""
    payload = {
        "careerPath": "Software Engineer",
        "interestedIndustries": ["Tech"],
    }
    resp = _post_suggested(client, payload)
    assert resp.status_code == HTTPStatus.OK
    users = resp.get_json()["users"]
    assert {u["id"] for u in users} == {"user_1"}


def test_T085_no_match_filter(client):
    """T085 – Filters that match nobody should return an empty list and no error."""
    payload = {
        "hobbies": ["Baking"],
        "interestedIndustries": ["RocketScience"],
    }
    resp = _post_suggested(client, payload)
    assert resp.status_code == HTTPStatus.OK
    assert resp.get_json()["users"] == []


def test_T086_reset_filters_returns_all(client):
    """T086 – Clearing filters should broaden results (>= previous count)."""
    # user_3 has no likes/matches, so should see both user_1 and user_2 when no filters.
    narrow_resp = _post_suggested(client, {"careerPath": "Software Engineer"})
    assert narrow_resp.status_code == HTTPStatus.OK
    narrow_count = len(narrow_resp.get_json()["users"])

    reset_resp = _post_suggested(client, {})
    assert reset_resp.status_code == HTTPStatus.OK
    reset_users = reset_resp.get_json()["users"]

    # Expect >= (usually 2) users after clearing filters
    assert len(reset_users) >= narrow_count
    ids = {u["id"] for u in reset_users}
    assert {"user_1", "user_2"}.issubset(ids)
