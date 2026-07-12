from datetime import datetime, timezone

from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class Comentario(Base):
    __tablename__ = "comentarios"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False)
    autor_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    texto = Column(Text, nullable=False)
    criado_em = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    ticket = relationship("Ticket", back_populates="comentarios")
    autor = relationship("Usuario")
