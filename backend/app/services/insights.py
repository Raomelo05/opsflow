"""Serviço de análise de tickets ("Insights da semana").

Identifica categorias/palavras mais frequentes, tempo médio de resolução
e gera recomendações simples baseadas em regras de limiar (threshold).
Propositalmente NÃO usa machine learning no MVP — contagem de frequência
já demonstra o valor de automação aplicada ao negócio (RF17-RF18).
"""

from collections import Counter
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models.category import Categoria
from app.models.ticket import Ticket

JANELA_DIAS = 30
LIMIAR_RECOMENDACAO = 0.20  # categorias com 20%+ do volume geram recomendação


def gerar_insights(db: Session) -> dict:
    desde = datetime.now(timezone.utc) - timedelta(days=JANELA_DIAS)
    tickets = db.query(Ticket).filter(Ticket.criado_em >= desde).all()

    total = len(tickets)
    if total == 0:
        return {
            "periodo": f"últimos {JANELA_DIAS} dias",
            "total_tickets": 0,
            "top_categorias": [],
            "tempo_medio_resolucao_horas": None,
            "recomendacoes": ["Sem tickets suficientes no período para gerar recomendações."],
        }

    contagem_categoria = Counter(t.categoria_id for t in tickets)
    categorias = {c.id: c.nome for c in db.query(Categoria).all()}

    top_categorias = []
    recomendacoes = []
    for categoria_id, ocorrencias in contagem_categoria.most_common(5):
        proporcao = ocorrencias / total
        nome = categorias.get(categoria_id, f"Categoria {categoria_id}")
        top_categorias.append({
            "categoria": nome,
            "percentual": round(proporcao * 100, 1),
            "ocorrencias": ocorrencias,
        })
        if proporcao >= LIMIAR_RECOMENDACAO:
            recomendacoes.append(
                f"'{nome}' representa {round(proporcao * 100, 1)}% dos chamados — "
                f"recomenda-se criar ou revisar documentação de autoatendimento para essa categoria."
            )

    resolvidos = [t for t in tickets if t.resolvido_em is not None]
    if resolvidos:
        tempos_horas = [(t.resolvido_em - t.criado_em).total_seconds() / 3600 for t in resolvidos]
        tempo_medio = round(sum(tempos_horas) / len(tempos_horas), 1)
    else:
        tempo_medio = None

    if not recomendacoes:
        recomendacoes.append("Nenhuma categoria ultrapassou o limiar de concentração no período.")

    return {
        "periodo": f"últimos {JANELA_DIAS} dias",
        "total_tickets": total,
        "top_categorias": top_categorias,
        "tempo_medio_resolucao_horas": tempo_medio,
        "recomendacoes": recomendacoes,
    }
