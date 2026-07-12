from pydantic import BaseModel


class CategoriaFrequencia(BaseModel):
    categoria: str
    ocorrencias: int
    percentual: float


class InsightsResponse(BaseModel):
    periodo: str
    total_tickets: int
    tempo_medio_resolucao_horas: float | None
    top_categorias: list[CategoriaFrequencia]
    recomendacoes: list[str]
