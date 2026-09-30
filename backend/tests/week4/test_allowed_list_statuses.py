import pytest
from fastapi.testclient import TestClient
from routes import app 

client = TestClient(app, raise_server_exceptions=False)
TEST_USERNAME = "Andyroid17"

def test_backend_filters_by_list_status():
    response = client.get(f"/api/fetch-planning-data/{TEST_USERNAME}")
    assert response.status_code == 200
    
    items = response.json().get("planning_anime", [])
    allowed = {"PLANNING", "PAUSED"}
    
    for anime in items:
        assert anime["list_status"] in allowed, f"Unexpected list_status: {anime['list_status']}"