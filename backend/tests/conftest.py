"""
Fixtures compartilhadas dos testes.

Cada teste roda contra um banco SQLite isolado em memória, sobrescrevendo a
dependência get_db do FastAPI — não depende de um PostgreSQL rodando.
"""
import os

# Precisa ser definido ANTES de importar app.main: o módulo cria as tabelas
# (Base.metadata.create_all) assim que é importado, usando settings.database_url.
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("JWT_SECRET_KEY", "test-secret-key")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.core.security import hash_password
from app.main import app
from app.models.enums import Perfil
from app.models.user import Usuario

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"


@pytest.fixture()
def db_session():
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = scoped_session(sessionmaker(bind=engine))
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture()
def admin_token(client, db_session):
    """Cria um usuário administrador e retorna o header de autenticação pronto."""
    usuario = Usuario(
        nome="Admin Teste",
        email="admin.teste@opsflow.com",
        senha_hash=hash_password("senha123"),
        perfil=Perfil.administrador,
        pais="Brasil",
    )
    db_session.add(usuario)
    db_session.commit()

    resposta = client.post(
        "/api/v1/auth/login",
        json={"email": "admin.teste@opsflow.com", "senha": "senha123"},
    )
    assert resposta.status_code == 200
    token = resposta.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
