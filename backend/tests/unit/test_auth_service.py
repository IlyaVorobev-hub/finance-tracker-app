from datetime import timedelta

import pytest

from app.security.jwt import create_access_token, create_refresh_token, decode_token, verify_token
from app.security.password import hash_password, verify_password


class TestPassword:
    def test_hash_password(self):
        password = "TestPassword123!"
        hashed = hash_password(password)
        assert hashed != password
        assert len(hashed) > 0

    def test_verify_password_correct(self):
        password = "TestPassword123!"
        hashed = hash_password(password)
        assert verify_password(password, hashed) is True

    def test_verify_password_incorrect(self):
        password = "TestPassword123!"
        hashed = hash_password(password)
        assert verify_password("WrongPassword", hashed) is False


class TestJWT:
    def test_create_access_token(self):
        data = {"sub": "test-user-id"}
        token = create_access_token(data)
        assert token is not None
        assert len(token) > 0

    def test_create_access_token_with_custom_expiry(self):
        data = {"sub": "test-user-id"}
        expires_delta = timedelta(minutes=30)
        token = create_access_token(data, expires_delta)
        payload = decode_token(token)
        assert payload["sub"] == "test-user-id"
        assert payload["type"] == "access"

    def test_create_refresh_token(self):
        data = {"sub": "test-user-id"}
        token = create_refresh_token(data)
        assert token is not None
        assert len(token) > 0

    def test_create_refresh_token_with_custom_expiry(self):
        data = {"sub": "test-user-id"}
        expires_delta = timedelta(days=14)
        token = create_refresh_token(data, expires_delta)
        payload = decode_token(token)
        assert payload["sub"] == "test-user-id"
        assert payload["type"] == "refresh"

    def test_verify_token_valid(self):
        data = {"sub": "test-user-id"}
        token = create_access_token(data)
        payload = verify_token(token)
        assert payload is not None
        assert payload["sub"] == "test-user-id"

    def test_verify_token_invalid(self):
        payload = verify_token("invalid-token-string")
        assert payload is None

    def test_decode_token_valid(self):
        data = {"sub": "test-user-id"}
        token = create_access_token(data)
        payload = decode_token(token)
        assert payload["sub"] == "test-user-id"
        assert payload["type"] == "access"

    def test_decode_token_invalid(self):
        with pytest.raises(ValueError):
            decode_token("invalid-token-string")
