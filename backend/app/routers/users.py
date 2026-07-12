from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_perfil
from app.core.security import hash_password
from app.models.user import Usuario
from app.schemas.user import UsuarioCreate, UsuarioOut, UsuarioUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UsuarioOut],
            dependencies=[Depends(require_perfil("administrador"))])
def listar_usuarios(db: Session = Depends(get_db)):
    return db.query(Usuario).order_by(Usuario.nome).all()


@router.post("", response_model=UsuarioOut, status_code=201,
             dependencies=[Depends(require_perfil("administrador"))])
def criar_usuario(payload: UsuarioCreate, db: Session = Depends(get_db)):
    usuario = Usuario(
        nome=payload.nome,
        email=payload.email,
        senha_hash=hash_password(payload.senha),
        perfil=payload.perfil,
        pais=payload.pais,
    )
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario


@router.patch("/{user_id}", response_model=UsuarioOut,
              dependencies=[Depends(require_perfil("administrador"))])
def editar_usuario(user_id: int, payload: UsuarioUpdate, db: Session = Depends(get_db)):
    """Edita nome, perfil e/ou país. E-mail e senha não são alterados por esta rota
    (senha exige um fluxo próprio de redefinição, fora do escopo do MVP)."""
    usuario = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    for campo, valor in payload.model_dump(exclude_unset=True).items():
        setattr(usuario, campo, valor)
    db.commit()
    db.refresh(usuario)
    return usuario
