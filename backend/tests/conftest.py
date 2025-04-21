import sys, os, importlib, types, pytest
import tests.mock_firebase as mock_firebase

# Make sure the parent directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import tests.mock_firebase as mock_firebase
import firebase_admin

# ---- install global stubs *before* importing real modules ----
firebase_admin.firestore = types.SimpleNamespace(
    client=lambda: mock_firebase.mock_db,
    ArrayUnion=lambda x: x,
    SERVER_TIMESTAMP=object()
)
firebase_admin.auth = mock_firebase.mock_auth

# Optional: patch FieldFilter
import google.cloud.firestore_v1 as _fs
_fs.FieldFilter = lambda *args, **kwargs: None

# Now import route and service modules
firebase_service = importlib.import_module("services.firebase_service")
match_routes = importlib.import_module("routes.match_routes")
user_routes = importlib.import_module("routes.user_routes")
auth_service = importlib.import_module("services.auth_service")

@pytest.fixture
def mock_firestore():
    """
    Provides the shared MockFirestoreClient instance
    so tests can inspect and assert on its state.
    """
    return mock_firebase.mock_db

@pytest.fixture(scope="function", autouse=True)
def _patch_firebase(monkeypatch):
    """Patches Firestore/Auth and related helpers for all tests."""

    # Patch Firestore db references in all modules
    for m in (firebase_service, match_routes, user_routes):
        monkeypatch.setattr(m, "db", mock_firebase.mock_db, raising=False)
        for fn in [
            "get_convo_id", "get_user_profile", "update_user_profile",
            "update_user_settings", "delete_user_account",
            "create_user_in_firebase", "send_notification"
        ]:
            monkeypatch.setattr(m, fn, getattr(mock_firebase, fn), raising=False)

    # Patch the verify_token function
    monkeypatch.setattr(auth_service, "verify_token", mock_firebase.verify_token)
    monkeypatch.setattr(match_routes, "verify_token", mock_firebase.verify_token, raising=False)
    monkeypatch.setattr(user_routes, "verify_token", mock_firebase.verify_token, raising=False)

@pytest.fixture
def client():
    """Flask test client with default Authorization header."""
    from app import create_app
    app = create_app(testing=True)
    with app.test_client() as client:
        client.environ_base["HTTP_AUTHORIZATION"] = "Bearer test_user"
        yield client
