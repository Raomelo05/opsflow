from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.enums import Prioridade, StatusTicket


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(200), nullable=False)
    descricao = Column(Text, nullable=False)

    categoria_id = Column(Integer, ForeignKey("categorias.id"), nullable=False)
    prioridade = Column(Enum(Prioridade), nullable=False, default=Prioridade.media)
    status = Column(Enum(StatusTicket), nullable=False, default=StatusTicket.aberto)

    solicitante_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    responsavel_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)

    pais = Column(String(60), nullable=False)
    plataforma = Column(String(120), nullable=False)

    criado_em = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    atualizado_em = Column(
        DateTime, default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    resolvido_em = Column(DateTime, nullable=True)
    prazo_sla = Column(DateTime, nullable=True)

    categoria = relationship("Categoria")
    solicitante = relationship("Usuario", back_populates="tickets_solicitados", foreign_keys=[solicitante_id])
    responsavel = relationship("Usuario", back_populates="tickets_atribuidos", foreign_keys=[responsavel_id])
    comentarios = relationship("Comentario", back_populates="ticket", cascade="all, delete-orphan")
    historico = relationship("HistoricoTicket", back_populates="ticket", cascade="all, delete-orphan")
