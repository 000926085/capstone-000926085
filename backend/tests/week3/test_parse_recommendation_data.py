import pytest
from fastapi.testclient import TestClient
from routes import app 

client = TestClient(app)
TEST_USERNAME = "Andyroid17"
ALLOWED_RELEASE_STATUSES = {"RELEASING", "FINISHED"}
ALLOWED_LIST_STATUSES = {"PLANNING", "PAUSED"}

def test_check_releasing_and_finished():
    response = client.get(f"/api/fetch-planning-data/{TEST_USERNAME}")
    assert response.status_code == 200
    print(" [PASS] Endpoint returned 200 OK")

    data = response.json()
    assert "planning_anime" in data
    
    planning_anime = data["planning_anime"]
    assert len(planning_anime) > 0, "Expected planning_anime list to contain entries."
    print(f" [PASS] Fetched {len(planning_anime)} anime records")

    for i, item in enumerate(planning_anime, start=1):
        user_list_status = item.get("list_status")
        assert user_list_status in ALLOWED_LIST_STATUSES, (
            f"Item '{item.get('title')}' has invalid user list status: {user_list_status}"
        )

        release_status = item.get("status")
        assert release_status in ALLOWED_RELEASE_STATUSES, (
            f"Item '{item.get('title')}' has invalid release status: {release_status}"
        )

        print(f"  [{i}] '{item.get('title')}' -> List: {user_list_status} | Release: {release_status} [VALID]")

    print(" [PASS] All anime verified to match release and list status filters.")