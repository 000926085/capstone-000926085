import pytest
from fastapi.testclient import TestClient
from routes import app

client = TestClient(app, raise_server_exceptions=False)

def test_hidden_from_client_response():
    response = client.get("/api/test-error")

    assert response.status_code == 500
    json_data = response.json()
    assert json_data == {"detail": "An internal server error occurred."}

    response_text = response.text.lower()
    assert "traceback" not in response_text
    assert "file " not in response_text
    assert "line " not in response_text
    assert "runtimeerror" not in response_text