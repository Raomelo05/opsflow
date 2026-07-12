from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import Usuario
from app.models.workflow import Workflow, WorkflowAcao
from app.schemas.workflow import WorkflowCreate, WorkflowOut

router = APIRouter(prefix="/workflows", tags=["workflows"])


def _exigir_admin(usuario: Usuario) -> None:
    if usuario.perfil.value != "administrador":
        raise HTTPException(status_code=403, detail="Apenas administradores podem gerenciar workflows")


@router.get("", response_model=list[WorkflowOut])
def listar_workflows(db: Session = Depends(get_db), usuario: Usuario = Depends(get_current_user)):
    return db.query(Workflow).all()


@router.post("", response_model=WorkflowOut, status_code=status.HTTP_201_CREATED)
def criar_workflow(
    payload: WorkflowCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    _exigir_admin(usuario)

    workflow = Workflow(
        nome=payload.nome,
        condicao_campo=payload.condicao_campo,
        condicao_valor=payload.condicao_valor,
    )
    workflow.acoes = [
        WorkflowAcao(tipo_acao=a.tipo_acao, valor=a.valor, ordem=a.ordem) for a in payload.acoes
    ]
    db.add(workflow)
    db.commit()
    db.refresh(workflow)
    return workflow


@router.patch("/{workflow_id}", response_model=WorkflowOut)
def editar_workflow(
    workflow_id: int,
    payload: WorkflowCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    _exigir_admin(usuario)

    workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow não encontrado")

    workflow.nome = payload.nome
    workflow.condicao_campo = payload.condicao_campo
    workflow.condicao_valor = payload.condicao_valor
    workflow.acoes = [
        WorkflowAcao(tipo_acao=a.tipo_acao, valor=a.valor, ordem=a.ordem) for a in payload.acoes
    ]
    db.commit()
    db.refresh(workflow)
    return workflow


@router.delete("/{workflow_id}", status_code=status.HTTP_204_NO_CONTENT)
def remover_workflow(
    workflow_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user),
):
    _exigir_admin(usuario)

    workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow não encontrado")

    db.delete(workflow)
    db.commit()
