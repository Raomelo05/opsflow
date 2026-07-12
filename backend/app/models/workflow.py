from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.models.enums import CampoCondicao, TipoAcao


class Workflow(Base):
    """Regra do Workflow Builder: 1 condição -> N ações. Ver docs/regras-de-negocio.md."""

    __tablename__ = "workflows"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(120), nullable=False)
    condicao_campo = Column(Enum(CampoCondicao), nullable=False)
    condicao_operador = Column(String(10), nullable=False, default="=")
    condicao_valor = Column(String(120), nullable=False)
    ativo = Column(Boolean, default=True)
    criado_em = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    acoes = relationship(
        "WorkflowAcao", back_populates="workflow", cascade="all, delete-orphan",
        order_by="WorkflowAcao.ordem",
    )


class WorkflowAcao(Base):
    __tablename__ = "workflow_acoes"

    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("workflows.id"), nullable=False)
    tipo_acao = Column(Enum(TipoAcao), nullable=False)
    valor = Column(String(255), nullable=False)
    ordem = Column(Integer, default=0)

    workflow = relationship("Workflow", back_populates="acoes")
