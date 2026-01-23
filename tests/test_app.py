import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Soccer Team" in data
    assert "participants" in data["Soccer Team"]

def test_signup_for_activity_success():
    activity = "Soccer Team"
    email = "newstudent@mergington.edu"
    # Ensure not already signed up
    client.get("/activities")
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 200
    assert f"Signed up {email} for {activity}" in response.json()["message"]
    # Clean up for idempotency
    data = client.get("/activities").json()
    if email in data[activity]["participants"]:
        data[activity]["participants"].remove(email)

def test_signup_for_activity_already_signed_up():
    activity = "Soccer Team"
    email = "alex@mergington.edu"
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 400
    assert "already signed up" in response.json()["detail"]

def test_signup_for_activity_not_found():
    activity = "Nonexistent Club"
    email = "student@mergington.edu"
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 404
    assert "Activity not found" in response.json()["detail"]
