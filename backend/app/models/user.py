from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.enums import Perfil


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(120), nullable=False)
    email = Column(String(160), unique=True, nullable=False, index=True)
    senha_hash = Column(String(255), nullable=False)
    perfil = Column(Enum(Perfil), nullable=False, default=Perfil.colaborador)
    pais = Column(String(60), nullable=True)
    criado_em = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    tickets_solicitados = relationship(
        "Ticket", back_populates="solicitante", foreign_keys="Ticket.solicitante_id"
    )
    tickets_atribuidos = relationship(
        "Ticket", back_populates="responsavel", foreign_keys="Ticket.responsavel_id"
    )
