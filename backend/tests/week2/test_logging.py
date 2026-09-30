import pytest
from fastapi.testclient import TestClient
from routes import app 

def test_technical_errors_are_logged(caplog):
    caplog.set_level("ERROR", logger="app_logger")
    client = TestClient(app, raise_server_exceptions=False)

    response = client.get("/api/test-error")
    assert response.status_code == 500
    print(f"\n [PASS] Response Code: {response.status_code}")
    assert len(caplog.records) > 0, "No log entries were captured for the error."
    print(f" [PASS] len of records > 0: {len(caplog.records)}")

    log_text = caplog.text
    assert "Unhandled Exception at GET /api/test-error" in log_text
    print(f" [PASS] Unhandled Exception at GET /api/test-error is in log_text")
    assert "RuntimeError: Test error to verify logging functionalities." in log_text
    print(f" [PASS] RuntimeError in log_text")
    assert "Traceback" in log_text
    print(f" [PASS] Traceback in log_text")