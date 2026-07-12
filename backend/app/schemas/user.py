from datetime import datetime

from pydantic import ConfigDict, BaseModel, EmailStr

from app.models.enums import Perfil


class UsuarioBase(BaseModel):
    nome: str
    email: EmailStr
    perfil: Perfil
    pais: str | None = None


class UsuarioCreate(UsuarioBase):
    senha: str


class UsuarioUpdate(BaseModel):
    nome: str | None = None
    perfil: Perfil | None = None
    pais: str | None = None


class UsuarioOut(UsuarioBase):
    id: int
    criado_em: datetime

    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):
    email: EmailStr
    senha: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    perfil: Perfil
