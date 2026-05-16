from datetime import datetime, timedelta, timezone


def setup_users_and_token(client):
    """Helper: create patient + doctor and return doctor token and patient id."""
    client.post("/users/", json={
        "full_name": "Patient João",
        "email": "patient@test.com",
        "password": "secret123",
        "role": "patient",
    })

    client.post("/users/", json={
        "full_name": "Dr. Ana Silva",
        "email": "doctor@test.com",
        "password": "secret123",
        "role": "doctor",
    })

    doctor_token = _get_token(client, "doctor@test.com")
    patient_token = _get_token(client, "patient@test.com")

    users = client.get("/users/", headers={"Authorization": f"Bearer {doctor_token}"}).json()
    patient_id = next(u["id"] for u in users if u["role"] == "patient")

    return doctor_token, patient_token, patient_id


def _get_token(client, email, password="secret123"):
    return client.post("/auth/login", data={"username": email, "password": password}).json()["access_token"]


class TestAppointments:
    def test_create_appointment(self, client):
        doctor_token, patient_token, patient_id = setup_users_and_token(client)
        scheduled = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
        response = client.post(
            "/appointments/",
            json={"patient_id": patient_id, "scheduled_at": scheduled, "notes": "First visit"},
            headers={"Authorization": f"Bearer {doctor_token}"},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "scheduled"
        assert data["notes"] == "First visit"

    def test_list_my_appointments(self, client):
        doctor_token, patient_token, patient_id = setup_users_and_token(client)
        scheduled = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
        client.post(
            "/appointments/",
            json={"patient_id": patient_id, "scheduled_at": scheduled},
            headers={"Authorization": f"Bearer {doctor_token}"},
        )
        response = client.get("/appointments/my", headers={"Authorization": f"Bearer {patient_token}"})
        assert response.status_code == 200
        assert len(response.json()) == 1

    def test_cancel_appointment(self, client):
        doctor_token, patient_token, patient_id = setup_users_and_token(client)
        scheduled = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
        appt = client.post(
            "/appointments/",
            json={"patient_id": patient_id, "scheduled_at": scheduled},
            headers={"Authorization": f"Bearer {doctor_token}"},
        ).json()

        response = client.delete(
            f"/appointments/{appt['id']}/cancel",
            headers={"Authorization": f"Bearer {doctor_token}"},
        )
        assert response.status_code == 200
        assert response.json()["status"] == "cancelled"

    def test_create_appointment_requires_auth(self, client):
        response = client.post("/appointments/", json={"patient_id": 1, "scheduled_at": "2027-01-01T10:00:00"})
        assert response.status_code == 401