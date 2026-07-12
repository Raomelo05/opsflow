from datetime import datetime

from pydantic import ConfigDict, BaseModel

from app.models.enums import Prioridade, StatusTicket


class TicketCreate(BaseModel):
    titulo: str
    descricao: str
    categoria_id: int
    pais: str
    plataforma: str
    prioridade: Prioridade = Prioridade.media


class TicketStatusUpdate(BaseModel):
    status: StatusTicket


class TicketPrioridadeUpdate(BaseModel):
    prioridade: Prioridade


class ComentarioCreate(BaseModel):
    texto: str


class ComentarioOut(BaseModel):
    id: int
    autor_id: int
    texto: str
    criado_em: datetime

    model_config = ConfigDict(from_attributes=True)


class HistoricoOut(BaseModel):
    id: int
    campo_alterado: str
    valor_anterior: str | None
    valor_novo: str | None
    alterado_por_id: int
    alterado_em: datetime

    model_config = ConfigDict(from_attributes=True)


class TicketOut(BaseModel):
    id: int
    titulo: str
    descricao: str
    categoria_id: int
    prioridade: Prioridade
    status: StatusTicket
    solicitante_id: int
    responsavel_id: int | None
    pais: str
    plataforma: str
    criado_em: datetime
    atualizado_em: datetime
    resolvido_em: datetime | None
    prazo_sla: datetime | None

    model_config = ConfigDict(from_attributes=True)


class TicketDetailOut(TicketOut):
    comentarios: list[ComentarioOut] = []
    historico: list[HistoricoOut] = []
