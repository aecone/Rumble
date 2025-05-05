# backend/tests/conftest.py
import sys
import os
import importlib
import types
import pytest
import base64
import json



# ─── 1) Ensure FIREBASE_CREDENTIALS import-time guard never fails ─────────────────
dummy_sa = {
    "type":                        "service_account",
    "project_id":                  "dummy",
    "private_key_id":              "dummy",
    "private_key":                 "-----BEGIN PRIVATE KEY-----\nMIIF…\n-----END PRIVATE KEY-----\n",
    "client_email":                "dummy@dummy.iam.gserviceaccount.com",
    "client_id":                   "1234567890",
    "auth_uri":                    "https://accounts.google.com/o/oauth2/auth",
    "token_uri":                   "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url":        "https://www.googleapis.com/robot/v1/metadata/x509/dummy"
}
os.environ["FIREBASE_CREDENTIALS"] = base64.b64encode(json.dumps(dummy_sa).encode()).decode()

# ─── 2) Make tests/ directory importable so mock_firebase.py is visible ────────────
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

# ─── 3) Import your in-memory mocks ───────────────────────────────────────────────
import mock_firebase   # defines mock_db, mock_auth, helper functions

# ─── 4) Stub out firebase_admin BEFORE importing your app code ────────────────────
import firebase_admin

firebase_admin.firestore = types.SimpleNamespace(
    client=lambda: mock_firebase.mock_db,
    ArrayUnion=lambda x: x,
    SERVER_TIMESTAMP=object(),
)
firebase_admin.auth = mock_firebase.mock_auth
firebase_admin.credentials = types.SimpleNamespace(Certificate=lambda arg: arg)
firebase_admin._apps = []
firebase_admin.get_app = lambda name=None: (
    firebase_admin._apps[0]
    if firebase_admin._apps
    else (_ for _ in ()).throw(ValueError("no app"))
)
firebase_admin.initialize_app = lambda cred=None, **opts: firebase_admin._apps.append(cred)

# Stub FieldFilter so match_routes import can succeed
import google.cloud.firestore_v1 as _fs
_fs.FieldFilter = lambda *args, **kwargs: None

# Manually override firebase_service.db BEFORE other modules import it
import services.firebase_service as firebase_service
firebase_service.db = mock_firebase.mock_db


# ─── 5) Force fresh import of modules to bind patched Firestore client ────────────
importlib.invalidate_caches()
for mod_name in (
    "services.firebase_service",
    "routes.match_routes",
    "routes.user_routes",
    "services.auth_service",
):
    if mod_name in sys.modules:
        del sys.modules[mod_name]

firebase_service = importlib.import_module("services.firebase_service")
match_routes     = importlib.import_module("routes.match_routes")
user_routes      = importlib.import_module("routes.user_routes")
auth_service     = importlib.import_module("services.auth_service")

# ─── 6) Autouse fixture: patch helper fns, verify_token, AND module-level db ───────
@pytest.fixture(autouse=True)
def _patch_helpers(monkeypatch):
    for mod in (firebase_service, match_routes, user_routes):
        # Patch all helper functions
        for fn in (
            "get_convo_id",
            "get_user_profile",
            "update_user_profile",
            "update_user_settings",
            "delete_user_account",
            "create_user_in_firebase",
            "send_notification",
        ):
            monkeypatch.setattr(mod, fn, getattr(mock_firebase, fn), raising=False)

     

    # Patch token verification everywhere
    monkeypatch.setattr(auth_service, "verify_token", mock_firebase.verify_token)
    monkeypatch.setattr(match_routes, "verify_token", mock_firebase.verify_token, raising=False)
    monkeypatch.setattr(user_routes, "verify_token", mock_firebase.verify_token, raising=False)

# ─── 7) Expose the in-memory Firestore to tests ───────────────────────────────────
@pytest.fixture
def mock_firestore():
    return mock_firebase.mock_db

# ─── 8) Flask test client with dummy Bearer token ─────────────────────────────────
@pytest.fixture
def client():
    from app import create_app
    app = create_app(testing=True)
    with app.test_client() as c:
        c.environ_base["HTTP_AUTHORIZATION"] = "Bearer test_user"
        yield c
