from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class HistoricoTicket(Base):
    """Registro de auditoria: cada alteração relevante em um ticket vira uma linha aqui."""

    __tablename__ = "historico_ticket"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False)
    campo_alterado = Column(String(60), nullable=False)
    valor_anterior = Column(String(255), nullable=True)
    valor_novo = Column(String(255), nullable=True)
    alterado_por_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    alterado_em = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    ticket = relationship("Ticket", back_populates="historico")
    alterado_por = relationship("Usuario")
