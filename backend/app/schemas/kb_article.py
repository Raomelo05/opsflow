from datetime import datetime

from pydantic import ConfigDict, BaseModel


class ArtigoKBCreate(BaseModel):
    problema: str
    categoria_id: int | None = None
    solucao: str
    palavras_chave: str | None = None


class ArtigoKBOut(ArtigoKBCreate):
    id: int
    criado_em: datetime
    atualizado_em: datetime

    model_config = ConfigDict(from_attributes=True)


class ArtigoKBResultadoBusca(BaseModel):
    id: int
    problema: str
    relevancia: float
