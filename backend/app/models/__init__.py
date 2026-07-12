"""
Importa todos os modelos em um único ponto, garantindo que o SQLAlchemy
conheça todas as tabelas antes de criar/inspecionar o schema (Base.metadata).
"""
from app.models.user import Usuario
from app.models.category import Categoria
from app.models.ticket import Ticket
from app.models.comment import Comentario
from app.models.history import HistoricoTicket
from app.models.kb_article import ArtigoKB
from app.models.workflow import Workflow, WorkflowAcao

__all__ = [
    "Usuario",
    "Categoria",
    "Ticket",
    "Comentario",
    "HistoricoTicket",
    "ArtigoKB",
    "Workflow",
    "WorkflowAcao",
]
