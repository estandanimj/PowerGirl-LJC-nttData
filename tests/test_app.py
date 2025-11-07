import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert len(data) > 0
    for activity in data.values():
        assert "description" in activity
        assert "participants" in activity
        assert isinstance(activity["participants"], list)

def test_signup_and_unregister():
    # Usar una actividad y email de prueba
    activity = list(client.get("/activities").json().keys())[0]
    email = "testuser@example.com"

    # Asegurarse de que el usuario no está registrado
    client.delete(f"/activities/{activity}/unregister?email={email}")

    # Registrar usuario
    resp_signup = client.post(f"/activities/{activity}/signup?email={email}")
    assert resp_signup.status_code == 200
    assert f"Signed up {email}" in resp_signup.json()["message"]

    # Intentar registrar de nuevo (debe fallar)
    resp_signup2 = client.post(f"/activities/{activity}/signup?email={email}")
    assert resp_signup2.status_code == 400

    # Eliminar usuario
    resp_del = client.delete(f"/activities/{activity}/unregister?email={email}")
    assert resp_del.status_code == 200
    assert f"removed from {activity}" in resp_del.json()["message"]

    # Eliminar de nuevo (debe fallar)
    resp_del2 = client.delete(f"/activities/{activity}/unregister?email={email}")
    assert resp_del2.status_code == 404
