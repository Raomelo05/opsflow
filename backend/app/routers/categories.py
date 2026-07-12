from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import require_perfil
from app.models.category import Categoria
from app.schemas.category import CategoriaCreate, CategoriaOut, CategoriaUpdate

router = APIRouter(prefix="/categorias", tags=["categorias"])


@router.get("", response_model=list[CategoriaOut])
def listar_categorias(db: Session = Depends(get_db)):
    return db.query(Categoria).order_by(Categoria.nome).all()


@router.post("", response_model=CategoriaOut, status_code=201,
             dependencies=[Depends(require_perfil("administrador"))])
def criar_categoria(payload: CategoriaCreate, db: Session = Depends(get_db)):
    categoria = Categoria(**payload.model_dump())
    db.add(categoria)
    db.commit()
    db.refresh(categoria)
    return categoria


@router.patch("/{categoria_id}", response_model=CategoriaOut,
              dependencies=[Depends(require_perfil("administrador"))])
def editar_categoria(categoria_id: int, payload: CategoriaUpdate, db: Session = Depends(get_db)):
    categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    for campo, valor in payload.model_dump(exclude_unset=True).items():
        setattr(categoria, campo, valor)
    db.commit()
    db.refresh(categoria)
    return categoria
