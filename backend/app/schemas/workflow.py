from pydantic import ConfigDict, BaseModel

from app.models.enums import CampoCondicao, TipoAcao


class WorkflowAcaoCreate(BaseModel):
    tipo_acao: TipoAcao
    valor: str
    ordem: int = 0


class WorkflowCreate(BaseModel):
    nome: str
    condicao_campo: CampoCondicao
    condicao_operador: str = "="
    condicao_valor: str
    ativo: bool = True
    acoes: list[WorkflowAcaoCreate]


class WorkflowAcaoOut(WorkflowAcaoCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)


class WorkflowOut(BaseModel):
    id: int
    nome: str
    condicao_campo: CampoCondicao
    condicao_operador: str
    condicao_valor: str
    ativo: bool
    acoes: list[WorkflowAcaoOut]

    model_config = ConfigDict(from_attributes=True)
