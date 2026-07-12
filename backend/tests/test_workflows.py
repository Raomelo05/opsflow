def test_workflow_atribui_equipe_e_prazo_ao_criar_ticket(client, admin_token):
    categoria_id = client.post(
        "/api/v1/categorias", json={"nome": "VPN"}, headers=admin_token
    ).json()["id"]

    resposta = client.post(
        "/api/v1/workflows",
        json={
            "nome": "Prioridade alta vai para Infraestrutura",
            "condicao_campo": "prioridade",
            "condicao_valor": "alta",
            "acoes": [
                {"tipo_acao": "atribuir_equipe", "valor": "Infraestrutura", "ordem": 0},
                {"tipo_acao": "definir_prazo_horas", "valor": "4", "ordem": 1},
            ],
        },
        headers=admin_token,
    )
    assert resposta.status_code == 201

    ticket = client.post(
        "/api/v1/tickets",
        json={
            "titulo": "VPN não conecta", "descricao": "x",
            "categoria_id": categoria_id, "pais": "Brasil", "plataforma": "Rede",
            "prioridade": "alta",
        },
        headers=admin_token,
    ).json()

    detalhe = client.get(f"/api/v1/tickets/{ticket['id']}", headers=admin_token).json()
    equipe_registrada = [
        h for h in detalhe["historico"] if h["campo_alterado"] == "equipe_atribuida"
    ]
    assert len(equipe_registrada) == 1
    assert equipe_registrada[0]["valor_novo"] == "Infraestrutura"


def test_workflow_nao_dispara_quando_condicao_nao_bate(client, admin_token):
    categoria_id = client.post(
        "/api/v1/categorias", json={"nome": "Senha"}, headers=admin_token
    ).json()["id"]

    client.post(
        "/api/v1/workflows",
        json={
            "nome": "Regra só para prioridade crítica",
            "condicao_campo": "prioridade",
            "condicao_valor": "critica",
            "acoes": [{"tipo_acao": "atribuir_equipe", "valor": "Infraestrutura", "ordem": 0}],
        },
        headers=admin_token,
    )

    ticket = client.post(
        "/api/v1/tickets",
        json={
            "titulo": "Esqueci minha senha", "descricao": "x",
            "categoria_id": categoria_id, "pais": "Brasil", "plataforma": "Portal",
            "prioridade": "baixa",
        },
        headers=admin_token,
    ).json()

    detalhe = client.get(f"/api/v1/tickets/{ticket['id']}", headers=admin_token).json()
    assert detalhe["historico"] == []


def test_workflow_com_acao_alterar_status(client, admin_token):
    """Reproduz a regra semeada em database/init.sql: categoria=Senha -> envia
    artigo da KB -> muda status para 'aguardando_confirmacao' direto do 'aberto'
    (RN02-a). Esse caminho nunca tinha sido exercitado nos testes manuais."""
    categoria_id = client.post(
        "/api/v1/categorias", json={"nome": "Senha"}, headers=admin_token
    ).json()["id"]

    client.post(
        "/api/v1/workflows",
        json={
            "nome": "Chamados de senha recebem artigo da KB",
            "condicao_campo": "categoria",
            "condicao_valor": str(categoria_id),
            "acoes": [
                {"tipo_acao": "enviar_artigo_kb", "valor": "Esqueci minha senha", "ordem": 0},
                {"tipo_acao": "alterar_status", "valor": "aguardando_confirmacao", "ordem": 1},
            ],
        },
        headers=admin_token,
    )

    ticket = client.post(
        "/api/v1/tickets",
        json={
            "titulo": "Esqueci minha senha", "descricao": "x",
            "categoria_id": categoria_id, "pais": "Brasil", "plataforma": "Portal",
        },
        headers=admin_token,
    ).json()

    # O status já deve vir alterado na própria resposta da criação.
    assert ticket["status"] == "aguardando_confirmacao"

    detalhe = client.get(f"/api/v1/tickets/{ticket['id']}", headers=admin_token).json()
    artigo_enviado = [h for h in detalhe["historico"] if h["campo_alterado"] == "artigo_kb_enviado"]
    assert len(artigo_enviado) == 1
