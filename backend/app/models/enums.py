"""
Enums compartilhados entre modelos, schemas e regras de negócio.
Ver docs/regras-de-negocio.md para a definição de cada valor.
"""
import enum


class Perfil(str, enum.Enum):
    colaborador = "colaborador"
    analista = "analista"
    gestor = "gestor"
    administrador = "administrador"


class Prioridade(str, enum.Enum):
    baixa = "baixa"
    media = "media"
    alta = "alta"
    critica = "critica"


class StatusTicket(str, enum.Enum):
    aberto = "aberto"
    em_andamento = "em_andamento"
    aguardando_confirmacao = "aguardando_confirmacao"
    resolvido = "resolvido"
    fechado = "fechado"
    reaberto = "reaberto"


class CampoCondicao(str, enum.Enum):
    categoria = "categoria"
    prioridade = "prioridade"
    pais = "pais"
    plataforma = "plataforma"


class TipoAcao(str, enum.Enum):
    atribuir_equipe = "atribuir_equipe"
    definir_prazo_horas = "definir_prazo_horas"
    enviar_artigo_kb = "enviar_artigo_kb"
    alterar_status = "alterar_status"
