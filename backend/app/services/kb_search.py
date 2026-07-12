"""
Busca de artigos da Base de Conhecimento por correspondência de palavras-chave.

MVP: comparação simples (case-insensitive, sem acentos, ignorando stopwords),
sem machine learning — ver docs/regras-de-negocio.md, RN07-RN09.
"""
import unicodedata

from app.models.kb_article import ArtigoKB
from app.schemas.kb_article import ArtigoKBResultadoBusca

STOPWORDS = {"de", "da", "do", "das", "dos", "e", "a", "o", "no", "na", "para", "com", "em"}


def _normalizar(texto: str) -> set[str]:
    texto = unicodedata.normalize("NFKD", texto.lower()).encode("ascii", "ignore").decode()
    palavras = {p.strip(".,!?") for p in texto.split()}
    return {p for p in palavras if p and p not in STOPWORDS}


def buscar_artigos(termo: str, artigos: list[ArtigoKB], limite: int = 3) -> list[ArtigoKBResultadoBusca]:
    termos_busca = _normalizar(termo)
    if not termos_busca:
        return []

    resultados = []
    for artigo in artigos:
        campo_indexado = f"{artigo.problema} {artigo.palavras_chave or ''}"
        termos_artigo = _normalizar(campo_indexado)
        interseccao = termos_busca & termos_artigo
        if not interseccao:
            continue
        relevancia = len(interseccao) / len(termos_busca)
        resultados.append(
            ArtigoKBResultadoBusca(id=artigo.id, problema=artigo.problema, relevancia=round(relevancia, 2))
        )

    resultados.sort(key=lambda r: r.relevancia, reverse=True)
    return resultados[:limite]
