from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import create_access_token, verify_password
from app.models.user import Usuario
from app.schemas.user import LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.email == payload.email).first()
    if not user or not verify_password(payload.senha, user.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha inválidos.",
        )
    token = create_access_token(subject=str(user.id), perfil=user.perfil.value)
    return TokenResponse(access_token=token, perfil=user.perfil)
