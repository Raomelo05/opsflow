from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.comment import Comentario
from app.models.history import HistoricoTicket
from app.models.ticket import Ticket
from app.models.user import Usuario
from app.schemas.ticket import (
    ComentarioCreate,
    ComentarioOut,
    TicketCreate,
    TicketDetailOut,
    TicketOut,
    TicketPrioridadeUpdate,
    TicketStatusUpdate,
)
from app.services.workflow_engine import aplicar_workflows

router = APIRouter(prefix="/tickets", tags=["tickets"])

# Prazos de resolução por prioridade, em horas (ver docs/regras-de-negocio.md)
SLA_HORAS = {"critica": 2, "alta": 4, "media": 8, "baixa": 24}

# Transições de status permitidas (RN01-RN03 em docs/regras-de-negocio.md).
# "resolvido" só é alcançável a partir de em_andamento/aguardando_confirmacao (RN02).
TRANSICOES_VALIDAS: dict[str, set[str]] = {
    "aberto": {"em_andamento", "fechado", "aguardando_confirmacao"},
    "em_andamento": {"aguardando_confirmacao", "resolvido", "aberto"},
    "aguardando_confirmacao": {"resolvido", "em_andamento"},
    "resolvido": {"fechado", "reaberto"},
    "fechado": {"reaberto"},
    "reaberto": {"em_andamento"},
}


def _calcular_prazo_sla(prioridade: str) -> datetime:
    horas = SLA_HORAS.get(prioridade, 8)
    return datetime.now(timezone.utc) + timedelta(hours=horas)


@router.get("", response_model=list[TicketOut])
def listar_tickets(
    status_filtro: str | None = None,
    prioridade_filtro: str | None = None,
    categoria_id: int | None = None,
    pais: str | None = None,
    plataforma: str | None = None,
    texto: str | None = None,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    query = db.query(Ticket)
    if status_filtro:
        query = query.filter(Ticket.status == status_filtro)
    if prioridade_filtro:
        query = query.filter(Ticket.prioridade == prioridade_filtro)
    if categoria_id:
        query = query.filter(Ticket.categoria_id == categoria_id)
    if pais:
        query = query.filter(Ticket.pais == pais)
    if plataforma:
        query = query.filter(Ticket.plataforma == plataforma)
    if texto:
        termo = f"%{texto}%"
        query = query.filter(Ticket.titulo.ilike(termo) | Ticket.descricao.ilike(termo))

    return query.order_by(Ticket.criado_em.desc()).all()


@router.post("", response_model=TicketOut, status_code=status.HTTP_201_CREATED)
def criar_ticket(
    payload: TicketCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    ticket = Ticket(
        titulo=payload.titulo,
        descricao=payload.descricao,
        categoria_id=payload.categoria_id,
        prioridade=payload.prioridade,
        pais=payload.pais,
        plataforma=payload.plataforma,
        solicitante_id=usuario.id,
        prazo_sla=_calcular_prazo_sla(payload.prioridade.value),
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)

    aplicar_workflows(db, ticket)

    return ticket


@router.get("/{ticket_id}", response_model=TicketDetailOut)
def detalhar_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket não encontrado")
    return ticket


@router.patch("/{ticket_id}/status", response_model=TicketOut)
def alterar_status(
    ticket_id: int,
    payload: TicketStatusUpdate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket não encontrado")

    valor_anterior = ticket.status.value
    if payload.status.value != valor_anterior:
        transicoes_permitidas = TRANSICOES_VALIDAS.get(valor_anterior, set())
        if payload.status.value not in transicoes_permitidas:
            raise HTTPException(
                status_code=422,
                detail=(
                    f"Transição de status inválida: '{valor_anterior}' → '{payload.status.value}'. "
                    f"Transições permitidas a partir de '{valor_anterior}': {sorted(transicoes_permitidas) or 'nenhuma'}."
                ),
            )

    ticket.status = payload.status
    if payload.status.value == "resolvido":
        ticket.resolvido_em = datetime.now(timezone.utc)

    db.add(HistoricoTicket(
        ticket_id=ticket.id,
        campo_alterado="status",
        valor_anterior=valor_anterior,
        valor_novo=payload.status.value,
        alterado_por_id=usuario.id,
    ))
    db.commit()
    db.refresh(ticket)
    return ticket


@router.patch("/{ticket_id}/prioridade", response_model=TicketOut)
def alterar_prioridade(
    ticket_id: int,
    payload: TicketPrioridadeUpdate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket não encontrado")

    valor_anterior = ticket.prioridade.value
    ticket.prioridade = payload.prioridade
    ticket.prazo_sla = _calcular_prazo_sla(payload.prioridade.value)

    db.add(HistoricoTicket(
        ticket_id=ticket.id,
        campo_alterado="prioridade",
        valor_anterior=valor_anterior,
        valor_novo=payload.prioridade.value,
        alterado_por_id=usuario.id,
    ))
    db.commit()
    db.refresh(ticket)
    return ticket


@router.post("/{ticket_id}/comentarios", response_model=ComentarioOut, status_code=status.HTTP_201_CREATED)
def comentar_ticket(
    ticket_id: int,
    payload: ComentarioCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket não encontrado")

    comentario = Comentario(ticket_id=ticket_id, autor_id=usuario.id, texto=payload.texto)
    db.add(comentario)
    db.commit()
    db.refresh(comentario)
    return comentario
