from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class ArtigoKB(Base):
    """Artigo da Base de Conhecimento: problema -> solução (passo a passo)."""

    __tablename__ = "kb_artigos"

    id = Column(Integer, primary_key=True, index=True)
    problema = Column(String(200), nullable=False)
    categoria_id = Column(Integer, ForeignKey("categorias.id"), nullable=True)
    solucao = Column(Text, nullable=False)  # passos em markdown/lista
    palavras_chave = Column(String(255), nullable=True)  # lista separada por vírgula
    criado_em = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    atualizado_em = Column(
        DateTime, default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    categoria = relationship("Categoria")
