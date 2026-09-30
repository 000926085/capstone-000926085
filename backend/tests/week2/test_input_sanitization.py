import pytest
from fastapi.testclient import TestClient
from routes import app 

client = TestClient(app, raise_server_exceptions=False)

@pytest.mark.parametrize("sqli_payload", [
    "' OR '1'='1",
    "'; DROP TABLE users; --",
])

def test_sql_injection(sqli_payload):
    response = client.get(f"/api/fetch-planning-data/{sqli_payload}")
    assert response.status_code in (404, 400, 500), f"SQLi payload caused unhandled response: {response.status_code}"

    json_data = response.json()
    assert "syntax error" not in response.text.lower()
    assert "postgresql" not in response.text.lower()
    assert "supabase" not in response.text.lower()