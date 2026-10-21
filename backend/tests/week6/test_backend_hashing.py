import pytest
from fastapi.testclient import TestClient
import bcrypt
from routes import app 

client = TestClient(app, raise_server_exceptions=False)

def test_backend_hashing():
    raw_input_password = "mypassword"
    password_hash = bcrypt.hashpw("mypassword".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    assert raw_input_password != password_hash