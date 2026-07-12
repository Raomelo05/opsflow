def test_login_com_credenciais_corretas(client, admin_token):
    assert "Authorization" in admin_token


def test_login_com_senha_errada(client, db_session):
    from app.core.security import hash_password
    from app.models.enums import Perfil
    from app.models.user import Usuario

    usuario = Usuario(
        nome="Fulano", email="fulano@opsflow.com",
        senha_hash=hash_password("senhacerta"), perfil=Perfil.analista,
    )
    db_session.add(usuario)
    db_session.commit()

    resposta = client.post(
        "/api/v1/auth/login",
        json={"email": "fulano@opsflow.com", "senha": "senhaerrada"},
    )
    assert resposta.status_code == 401


def test_rota_protegida_sem_token_retorna_401(client):
    resposta = client.get("/api/v1/tickets")
    assert resposta.status_code == 401
