"""
Motor de execução do Workflow Builder.

Avalia as regras cadastradas (condição -> ações) contra um ticket recém-criado
ou atualizado, na ordem em que foram criadas, e aplica a primeira que casar.
Ver docs/regras-de-negocio.md, seção 5.
"""
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models.history import HistoricoTicket
from app.models.ticket import Ticket
from app.models.workflow import Workflow


def _valor_condicao(ticket: Ticket, campo: str) -> str:
    if campo == "categoria":
        return str(ticket.categoria_id)
    if campo == "prioridade":
        return ticket.prioridade.value
    if campo == "pais":
        return ticket.pais
    if campo == "plataforma":
        return ticket.plataforma
    return ""


def _condicao_satisfeita(ticket: Ticket, workflow: Workflow) -> bool:
    valor_atual = _valor_condicao(ticket, workflow.condicao_campo.value)
    if workflow.condicao_operador == "=":
        return str(valor_atual).lower() == str(workflow.condicao_valor).lower()
    return False


def aplicar_workflows(db: Session, ticket: Ticket) -> None:
    """Aplica a primeira regra ativa cuja condição case com o ticket."""
    workflows = (
        db.query(Workflow)
        .filter(Workflow.ativo.is_(True))
        .order_by(Workflow.id)
        .all()
    )

    for workflow in workflows:
        if not _condicao_satisfeita(ticket, workflow):
            continue

        for acao in workflow.acoes:
            _executar_acao(db, ticket, acao.tipo_acao.value, acao.valor)

        db.add(HistoricoTicket(
            ticket_id=ticket.id,
            campo_alterado="workflow",
            valor_anterior=None,
            valor_novo=workflow.nome,
            alterado_por_id=ticket.solicitante_id,
        ))
        db.commit()
        db.refresh(ticket)
        break  # MVP: apenas a primeira regra que casar é aplicada


def _executar_acao(db: Session, ticket: Ticket, tipo_acao: str, valor: str) -> None:
    if tipo_acao == "atribuir_equipe":
        # No MVP o time é registrado como anotação no histórico; a atribuição
        # a um usuário específico pode ser adicionada quando houver cadastro de equipes.
        db.add(HistoricoTicket(
            ticket_id=ticket.id,
            campo_alterado="equipe_atribuida",
            valor_anterior=None,
            valor_novo=valor,
            alterado_por_id=ticket.solicitante_id,
        ))
    elif tipo_acao == "definir_prazo_horas":
        ticket.prazo_sla = datetime.now(timezone.utc) + timedelta(hours=float(valor))
    elif tipo_acao == "alterar_status":
        ticket.status = valor
    elif tipo_acao == "enviar_artigo_kb":
        db.add(HistoricoTicket(
            ticket_id=ticket.id,
            campo_alterado="artigo_kb_enviado",
            valor_anterior=None,
            valor_novo=valor,
            alterado_por_id=ticket.solicitante_id,
        ))
    db.add(ticket)
