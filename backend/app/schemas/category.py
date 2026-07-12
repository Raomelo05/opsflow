from pydantic import BaseModel


class CategoriaCreate(BaseModel):
    nome: str
    descricao: str | None = None


class CategoriaOut(CategoriaCreate):
    id: int

    model_config = {"from_attributes": True}


class CategoriaUpdate(BaseModel):
    nome: str | None = None
    descricao: str | None = None
