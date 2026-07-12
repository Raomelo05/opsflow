"""
Dependências reutilizáveis de autenticação/autorização entre rotas.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import Usuario

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Usuario:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_error
    except JWTError:
        raise credentials_error

    user = db.query(Usuario).filter(Usuario.id == int(user_id)).first()
    if user is None:
        raise credentials_error
    return user


def require_perfil(*perfis_permitidos: str):
    """Factory de dependência: garante que o usuário logado tenha um dos perfis informados."""

    def checker(current_user: Usuario = Depends(get_current_user)) -> Usuario:
        if current_user.perfil not in perfis_permitidos:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Perfil sem permissão para esta ação.",
            )
        return current_user

    return checker
