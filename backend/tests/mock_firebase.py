import logging
from flask import request, jsonify

logging.basicConfig(level=logging.DEBUG)

class MockFirestoreDocument:
    def __init__(self, data=None):
        self._data = data or {}
        self.exists = bool(data)

    def get(self):
        return self

    def set(self, data, merge=False):
        if merge:
            self._data.update(data)
        else:
            self._data = data
        self.exists = True

    def to_dict(self):
        return self._data

    def delete(self):
        self._data = {}
        self.exists = False

    def update(self, data):
        self.set(data, merge=True)

    def collection(self, name):
        if not hasattr(self, "_subcollections"):
            self._subcollections = {}
        if name not in self._subcollections:
            self._subcollections[name] = MockFirestoreCollection()
        return self._subcollections[name]


    @property
    def id(self):
        return self._data.get("uid", "mock_id")


class MockFirestoreCollection:
    def __init__(self):
        self._docs = {}

    def document(self, doc_id):
        if doc_id not in self._docs:
            self._docs[doc_id] = MockFirestoreDocument({"uid": doc_id})
        return self._docs[doc_id]

    def where(self, *args, **kwargs):
        return self

    def stream(self):
        return self._docs.values()

    def add(self, data):
        doc_id = f"doc_{len(self._docs)+1}"
        doc = MockFirestoreDocument(data)
        self._docs[doc_id] = doc
        return None, doc


class MockFirestoreClient:
    def __init__(self):
        self._collections = {"users": MockFirestoreCollection(), "conversations": MockFirestoreCollection()}

    def collection(self, name):
        return self._collections.setdefault(name, MockFirestoreCollection())


class MockAuthUser:
    def __init__(self, uid):
        self.uid = uid

class MockFirebaseAuth:
    def create_user(self, email, password):
        return MockAuthUser(uid=f"mock_{email}")

    def delete_user(self, uid):
        return

    def list_users(self, page_token=None):
        class Page:
            users = []
            next_page_token = None
        return Page()


# Mocked globals
mock_db = MockFirestoreClient()
mock_auth = MockFirebaseAuth()


# --- Mocked helper functions ---

def get_convo_id(user_id_1, user_id_2, prefix=""):
    parts = sorted([user_id_1, user_id_2])
    return f"{prefix}_" + "_".join(parts)

def get_user_profile(user_id):
    doc = mock_db.collection("users").document(user_id).get()
    return doc.to_dict() if doc.exists else None

def update_user_profile(user_id, profile_data):
    doc = mock_db.collection("users").document(user_id)
    doc.set({"profile": profile_data}, merge=True)
    return True

def update_user_settings(user_id, settings_data):
    doc = mock_db.collection("users").document(user_id)
    doc.set({"settings": settings_data}, merge=True)
    return True

def delete_user_account(user_id):
    doc = mock_db.collection("users").document(user_id)
    doc.delete()
    mock_auth.delete_user(user_id)
    return {"message": "Account successfully deleted"}

def create_user_in_firebase(email, password, user_data):
    user = mock_auth.create_user(email=email, password=password)
    user_id = user.uid
    doc = mock_db.collection("users").document(user_id)
    doc.set(user_data)
    return {"message": "User created successfully", "user_id": user_id}

def verify_token():
    """Return a fake Firebase‑decoded token."""
    raw = (request.headers.get("Authorization") or "").removeprefix("Bearer ").strip()
    return {"uid": raw or "mock_user_id"}, None

def send_notification(token, title, body, data=None):
    return {"success": True, "token": token, "title": title, "body": body, "data": data}


# --- Optional: populate mock users for match testing ---

def populate_mock_users():
    mock_users = [
        {
            "uid": "user_1",
            "profile": {
                "bio": "Love coding and exploring nature!",
                "profilePictureUrl": "https://example.com/user1.jpg",
                "major": "Computer Science",
                "gradYear": 2025,
                "hobbies": ["Hiking", "Reading"],
                "orgs": ["Tech Club"],
                "careerPath": "Software Engineer",
                "interestedIndustries": ["Tech"],
                "userType": "mentor",
                "mentorshipAreas": ["Career Advice"]
            },
            "settings": {
                "firstName": "Alice",
                "lastName": "Smith",
                "email": "alice@example.com",
                "birthday": "2000-01-01",
                "ethnicity": "Asian",
                "gender": "Female",
                "pronouns": "She/Her"
            },
            "notification_token": "token_1",
            "liked_users": {"user_2": True},
            "matched_users": ["user_2"]
        },
        {
            "uid": "user_2",
            "profile": {
                "bio": "Passionate about building things!",
                "profilePictureUrl": "https://example.com/user2.jpg",
                "major": "Mechanical Engineering",
                "gradYear": 2024,
                "hobbies": ["Cycling", "Gaming"],
                "orgs": ["Robotics Club"],
                "careerPath": "Mechanical Engineer",
                "interestedIndustries": ["Automotive"],
                "userType": "mentee",
                "mentorshipAreas": []
            },
            "settings": {
                "firstName": "Bob",
                "lastName": "Johnson",
                "email": "bob@example.com",
                "birthday": "1999-05-15",
                "ethnicity": "Caucasian",
                "gender": "Male",
                "pronouns": "He/Him"
            },
            "notification_token": "token_2",
            "liked_users": {"user_1": True},
            "matched_users": ["user_1"]
        },
        {
            "uid": "user_3",
            "profile": {
                "bio": "Helping others achieve their dreams!",
                "profilePictureUrl": "https://example.com/user3.jpg",
                "major": "Business Administration",
                "gradYear": 2023,
                "hobbies": ["Cooking", "Traveling"],
                "orgs": ["Entrepreneurship Club"],
                "careerPath": "Entrepreneur",
                "interestedIndustries": ["Startups"],
                "userType": "mentor",
                "mentorshipAreas": ["Business Strategy"]
            },
            "settings": {
                "firstName": "Charlie",
                "lastName": "Brown",
                "email": "charlie@example.com",
                "birthday": "1998-07-20",
                "ethnicity": "Hispanic",
                "gender": "Non-binary",
                "pronouns": "They/Them"
            },
            "notification_token": "token_3",
            "liked_users": {},
            "matched_users": []
        }
    ]

    for user in mock_users:
        user_id = user["uid"]
        doc = mock_db.collection("users").document(user_id)
        doc.set(user)

populate_mock_users()
