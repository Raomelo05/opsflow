from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.kb_article import ArtigoKB
from app.models.user import Usuario
from app.schemas.kb_article import ArtigoKBCreate, ArtigoKBOut, ArtigoKBResultadoBusca
from app.services.kb_search import buscar_artigos

router = APIRouter(prefix="/kb", tags=["knowledge-base"])


@router.get("", response_model=list[ArtigoKBOut])
def listar_artigos(db: Session = Depends(get_db), usuario: Usuario = Depends(get_current_user)):
    return db.query(ArtigoKB).order_by(ArtigoKB.problema).all()


@router.get("/search", response_model=list[ArtigoKBResultadoBusca])
def buscar(q: str, db: Session = Depends(get_db), usuario: Usuario = Depends(get_current_user)):
    """Usada pela Tela 5 (sugestão automática) enquanto o ticket é digitado."""
    artigos = db.query(ArtigoKB).all()
    return buscar_artigos(q, artigos)


@router.post("", response_model=ArtigoKBOut, status_code=status.HTTP_201_CREATED)
def criar_artigo(
    payload: ArtigoKBCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    artigo = ArtigoKB(**payload.model_dump())
    db.add(artigo)
    db.commit()
    db.refresh(artigo)
    return artigo


@router.patch("/{artigo_id}", response_model=ArtigoKBOut)
def editar_artigo(
    artigo_id: int,
    payload: ArtigoKBCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    artigo = db.query(ArtigoKB).filter(ArtigoKB.id == artigo_id).first()
    if not artigo:
        raise HTTPException(status_code=404, detail="Artigo não encontrado")
    for campo, valor in payload.model_dump().items():
        setattr(artigo, campo, valor)
    db.commit()
    db.refresh(artigo)
    return artigo
