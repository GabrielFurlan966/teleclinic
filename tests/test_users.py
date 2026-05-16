import pytest
from fastapi.testclient import TestClient


def create_test_user(client, email="patient@test.com", role="patient"):
    return client.post("/users/", json={
        "full_name": "Test User",
        "email": email,
        "password": "secret123",
        "role": role,
    })


def get_token(client, email="patient@test.com", password="secret123"):
    response = client.post("/auth/login", data={"username": email, "password": password})
    return response.json()["access_token"]


class TestUserCRUD:
    def test_create_user_success(self, client):
        response = create_test_user(client)
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "patient@test.com"
        assert data["role"] == "patient"
        assert "id" in data
        assert "hashed_password" not in data  # never expose password

    def test_create_user_duplicate_email(self, client):
        create_test_user(client)
        response = create_test_user(client)  # same email
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"]

    def test_login_success(self, client):
        create_test_user(client)
        response = client.post("/auth/login", data={
            "username": "patient@test.com",
            "password": "secret123",
        })
        assert response.status_code == 200
        assert "access_token" in response.json()
        assert response.json()["token_type"] == "bearer"

    def test_login_wrong_password(self, client):
        create_test_user(client)
        response = client.post("/auth/login", data={
            "username": "patient@test.com",
            "password": "wrongpassword",
        })
        assert response.status_code == 401

    def test_get_me(self, client):
        create_test_user(client)
        token = get_token(client)
        response = client.get("/users/me", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        assert response.json()["email"] == "patient@test.com"

    def test_get_users_requires_auth(self, client):
        response = client.get("/users/")
        assert response.status_code == 401

    def test_list_users_authenticated(self, client):
        create_test_user(client)
        token = get_token(client)
        response = client.get("/users/", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_update_user(self, client):
        resp = create_test_user(client)
        user_id = resp.json()["id"]
        token = get_token(client)
        response = client.patch(
            f"/users/{user_id}",
            json={"full_name": "Updated Name"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        assert response.json()["full_name"] == "Updated Name"

    def test_delete_user(self, client):
        resp = create_test_user(client)
        user_id = resp.json()["id"]
        token = get_token(client)
        response = client.delete(
            f"/users/{user_id}",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
