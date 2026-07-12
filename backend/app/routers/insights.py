from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import Usuario
from app.schemas.insights import InsightsResponse
from app.services.insights import gerar_insights

router = APIRouter(prefix="/insights", tags=["insights"])


@router.get("/weekly", response_model=InsightsResponse)
def insights_semanais(db: Session = Depends(get_db), usuario: Usuario = Depends(get_current_user)):
    """Alimenta a Tela 6 (Dashboard de melhorias) e o card de 'Insights da semana'."""
    return gerar_insights(db)
