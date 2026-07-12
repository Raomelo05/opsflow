from sqlalchemy import Column, Integer, String

from app.core.database import Base


class Categoria(Base):
    __tablename__ = "categorias"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(80), unique=True, nullable=False)
    descricao = Column(String(255), nullable=True)
