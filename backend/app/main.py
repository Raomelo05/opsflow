"""
Ponto de entrada da API do OpsFlow.

Cria as tabelas (se não existirem) e registra os routers sob o prefixo /api/v1.
Em produção, a criação de schema deve ser substituída por migrations (Alembic);
no MVP, database/init.sql cobre o schema inicial e os dados de exemplo.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine
from app.models import *  # noqa: F401,F403 — garante que todas as tabelas sejam conhecidas
from app.routers import auth, categories, insights, kb, tickets, users, workflows

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.app_name,
    description="API do OpsFlow — gestão de chamados internos, base de conhecimento e automação de processos.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(categories.router, prefix="/api/v1")
app.include_router(tickets.router, prefix="/api/v1")
app.include_router(kb.router, prefix="/api/v1")
app.include_router(workflows.router, prefix="/api/v1")
app.include_router(insights.router, prefix="/api/v1")


@app.get("/api/v1/health", tags=["health"])
def health_check():
    return {"status": "ok", "app": settings.app_name, "environment": settings.environment}
