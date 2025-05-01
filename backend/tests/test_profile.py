# Tests T056 - T065 – Profile update and deletion
# ---------------------------------------------------------------------------

import pytest
from http import HTTPStatus

# ---------------------------------------------------------------------------
# Utility helpers
# ---------------------------------------------------------------------------

def _seed_user(db, uid="test_user"):
    """Create a minimal user document so update routes have something to edit."""
    doc = db.collection("users").document(uid)
    if not doc.get().exists:
        doc.set(
            {
                "settings": {
                    "firstName": "Old",
                    "lastName": "Name",
                    "email": "student@rutgers.edu",
                    "birthday": "2000-01-01",
                    "ethnicity": "Asian",
                    "gender": "Female",
                    "pronouns": "she/her",
                },
                "profile": {
                    "bio": "Hello!",
                    "profilePictureUrl": "",
                    "major": "Computer Science",
                    "gradYear": 2025,
                    "hobbies": [],
                    "orgs": [],
                    "careerPath": "Engineer",
                    "interestedIndustries": [],
                    "userType": "mentee",
                    "mentorshipAreas": [],
                },
                "liked_users": {},
                "matched_users": [],
            }
        )
    return uid


def _auth_header(uid):
    return {"Authorization": f"Bearer {uid}"}

# ---------------------------------------------------------------------------
# T056 – Edit and save name
# ---------------------------------------------------------------------------

def test_T056_edit_name(client, mock_firestore):
    uid = _seed_user(mock_firestore)
    payload = {
        "firstName": "Jordan",
        "lastName": "Smith",
        "email": "student@rutgers.edu",
        "birthday": "2000-01-01",
        "ethnicity": "Asian",
        "gender": "Female",
        "pronouns": "they/them",
    }
    resp = client.put("/api/update_settings", json=payload, headers=_auth_header(uid))
    assert resp.status_code == HTTPStatus.OK
    updated = resp.get_json()["settings"]
    assert updated["firstName"] == "Jordan" and updated["lastName"] == "Smith"

# ---------------------------------------------------------------------------
# T057 – Edit gender/pronouns
# ---------------------------------------------------------------------------

def test_T057_edit_gender_pronouns(client, mock_firestore):
    uid = _seed_user(mock_firestore)
    payload = {
        "firstName": "Jordan",
        "lastName": "Smith",
        "email": "student@rutgers.edu",
        "birthday": "2000-01-01",
        "ethnicity": "Asian",
        "gender": "Non-binary",
        "pronouns": "they/them",
    }
    resp = client.put("/api/update_settings", json=payload, headers=_auth_header(uid))
    assert resp.status_code == HTTPStatus.OK
    data = resp.get_json()["settings"]
    assert data["gender"] == "Non-binary" and data["pronouns"] == "they/them"

# ---------------------------------------------------------------------------
# T058 – Change major
# ---------------------------------------------------------------------------

def test_T058_change_major(client, mock_firestore):
    uid = _seed_user(mock_firestore)
    payload = {
        "bio": "Hello!",
        "profilePictureUrl": "",
        "major": "Public Health",
        "gradYear": 2025,
        "hobbies": [],
        "orgs": [],
        "careerPath": "Engineer",
        "interestedIndustries": [],
        "userType": "mentee",
        "mentorshipAreas": [],
    }
    resp = client.put("/api/update_profile", json=payload, headers=_auth_header(uid))
    assert resp.status_code == HTTPStatus.OK
    assert resp.get_json()["profile"]["major"] == "Public Health"

# ---------------------------------------------------------------------------
# T059 – Edit ethnicity
# ---------------------------------------------------------------------------

def test_T059_edit_ethnicity(client, mock_firestore):
    uid = _seed_user(mock_firestore)
    payload = {
        "firstName": "Jordan",
        "lastName": "Smith",
        "email": "student@rutgers.edu",
        "birthday": "2000-01-01",
        "ethnicity": "Latino",
        "gender": "Non-binary",
        "pronouns": "they/them",
    }
    resp = client.put("/api/update_settings", json=payload, headers=_auth_header(uid))
    assert resp.status_code == HTTPStatus.OK
    assert resp.get_json()["settings"]["ethnicity"] == "Latino"

# ---------------------------------------------------------------------------
# T061 – Batch update many fields
# ---------------------------------------------------------------------------

def test_T061_batch_update(client, mock_firestore):
    uid = _seed_user(mock_firestore)
    # Update both settings and profile in one go (two calls)
    settings_payload = {
        "firstName": "Jamie",
        "lastName": "Lee",
        "email": "student@rutgers.edu",
        "birthday": "2000-01-01",
        "ethnicity": "Caucasian",
        "gender": "Male",
        "pronouns": "he/him",
    }
    profile_payload = {
        "bio": "New bio",
        "profilePictureUrl": "",
        "major": "Biology",
        "gradYear": 2026,
        "hobbies": ["Reading"],
        "orgs": ["Club"],
        "careerPath": "Doctor",
        "interestedIndustries": ["Health"],
        "userType": "mentee",
        "mentorshipAreas": [],
    }
    resp1 = client.put("/api/update_settings", json=settings_payload, headers=_auth_header(uid))
    resp2 = client.put("/api/update_profile", json=profile_payload, headers=_auth_header(uid))
    assert resp1.status_code == HTTPStatus.OK and resp2.status_code == HTTPStatus.OK
    combined = client.get("/api/profile", headers=_auth_header(uid)).get_json()
    assert combined["settings"]["firstName"] == "Jamie"
    assert combined["profile"]["major"] == "Biology"

# ---------------------------------------------------------------------------
# T062 – Persistence after re-login (simulated)
# ---------------------------------------------------------------------------

def test_T062_persistence(client, mock_firestore):
    uid = _seed_user(mock_firestore)
    # Change name
    payload = {
        "firstName": "Persistent",
        "lastName": "User",
        "email": "student@rutgers.edu",
        "birthday": "2000-01-01",
        "ethnicity": "Asian",
        "gender": "Female",
        "pronouns": "she/her",
    }
    client.put("/api/update_settings", json=payload, headers=_auth_header(uid))
    # Simulate new session: new client still uses same uid
    persisted = client.get("/api/profile", headers=_auth_header(uid))
    assert persisted.status_code == HTTPStatus.OK
    assert persisted.get_json()["settings"]["firstName"] == "Persistent"

# ---------------------------------------------------------------------------
# T065 – Account deletion
# ---------------------------------------------------------------------------

def test_T065_delete_account(client, mock_firestore):
    uid = _seed_user(mock_firestore)
    del_resp = client.delete("/api/delete_account", headers=_auth_header(uid))
    assert del_resp.status_code == HTTPStatus.OK
    # Profile should now be gone
    prof_resp = client.get("/api/profile", headers=_auth_header(uid))
    assert prof_resp.status_code == HTTPStatus.NOT_FOUND
