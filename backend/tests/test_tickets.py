def _criar_categoria(client, headers, nome="VPN"):
    resposta = client.post("/api/v1/categorias", json={"nome": nome}, headers=headers)
    assert resposta.status_code == 201
    return resposta.json()["id"]


def test_criar_e_listar_ticket(client, admin_token):
    categoria_id = _criar_categoria(client, admin_token)

    resposta = client.post(
        "/api/v1/tickets",
        json={
            "titulo": "VPN não conecta",
            "descricao": "Não consigo conectar na VPN.",
            "categoria_id": categoria_id,
            "pais": "Brasil",
            "plataforma": "Rede Corporativa",
            "prioridade": "alta",
        },
        headers=admin_token,
    )
    assert resposta.status_code == 201
    ticket = resposta.json()
    assert ticket["status"] == "aberto"
    assert ticket["prazo_sla"] is not None  # RN04: SLA calculado na criação

    resposta = client.get("/api/v1/tickets", headers=admin_token)
    assert resposta.status_code == 200
    assert len(resposta.json()) == 1


def test_alterar_status_e_prioridade_gera_historico(client, admin_token):
    categoria_id = _criar_categoria(client, admin_token, "Senha")
    ticket = client.post(
        "/api/v1/tickets",
        json={
            "titulo": "Esqueci minha senha", "descricao": "Preciso redefinir.",
            "categoria_id": categoria_id, "pais": "Brasil", "plataforma": "Portal",
        },
        headers=admin_token,
    ).json()

    resposta = client.patch(
        f"/api/v1/tickets/{ticket['id']}/status",
        json={"status": "em_andamento"}, headers=admin_token,
    )
    assert resposta.status_code == 200
    assert resposta.json()["status"] == "em_andamento"

    resposta = client.patch(
        f"/api/v1/tickets/{ticket['id']}/prioridade",
        json={"prioridade": "critica"}, headers=admin_token,
    )
    assert resposta.status_code == 200
    assert resposta.json()["prioridade"] == "critica"

    detalhe = client.get(f"/api/v1/tickets/{ticket['id']}", headers=admin_token).json()
    campos_alterados = {h["campo_alterado"] for h in detalhe["historico"]}
    assert "status" in campos_alterados
    assert "prioridade" in campos_alterados


def test_transicao_de_status_invalida_e_rejeitada(client, admin_token):
    """RN02: só se chega a 'resolvido' a partir de 'em_andamento' ou 'aguardando_confirmacao'."""
    categoria_id = _criar_categoria(client, admin_token, "VPN")
    ticket = client.post("/api/v1/tickets", json={
        "titulo": "VPN não conecta", "descricao": "x",
        "categoria_id": categoria_id, "pais": "Brasil", "plataforma": "Rede",
    }, headers=admin_token).json()

    # Ticket está "aberto" — pular direto para "resolvido" não é permitido.
    resposta = client.patch(
        f"/api/v1/tickets/{ticket['id']}/status",
        json={"status": "resolvido"}, headers=admin_token,
    )
    assert resposta.status_code == 422

    # O caminho válido (aberto -> em_andamento -> resolvido) funciona normalmente.
    resposta = client.patch(
        f"/api/v1/tickets/{ticket['id']}/status",
        json={"status": "em_andamento"}, headers=admin_token,
    )
    assert resposta.status_code == 200
    resposta = client.patch(
        f"/api/v1/tickets/{ticket['id']}/status",
        json={"status": "resolvido"}, headers=admin_token,
    )
    assert resposta.status_code == 200


def test_comentar_ticket(client, admin_token):
    categoria_id = _criar_categoria(client, admin_token, "Acesso")
    ticket = client.post(
        "/api/v1/tickets",
        json={
            "titulo": "Preciso de acesso", "descricao": "Novo colaborador.",
            "categoria_id": categoria_id, "pais": "Brasil", "plataforma": "Portal",
        },
        headers=admin_token,
    ).json()

    resposta = client.post(
        f"/api/v1/tickets/{ticket['id']}/comentarios",
        json={"texto": "Estamos verificando o acesso."},
        headers=admin_token,
    )
    assert resposta.status_code == 201

    detalhe = client.get(f"/api/v1/tickets/{ticket['id']}", headers=admin_token).json()
    assert len(detalhe["comentarios"]) == 1
    assert detalhe["comentarios"][0]["texto"] == "Estamos verificando o acesso."


def test_filtro_por_status_e_texto(client, admin_token):
    categoria_id = _criar_categoria(client, admin_token, "VPN")
    client.post("/api/v1/tickets", json={
        "titulo": "VPN não conecta", "descricao": "x",
        "categoria_id": categoria_id, "pais": "Brasil", "plataforma": "Rede",
    }, headers=admin_token)
    client.post("/api/v1/tickets", json={
        "titulo": "Sistema lento", "descricao": "y",
        "categoria_id": categoria_id, "pais": "Brasil", "plataforma": "Rede",
    }, headers=admin_token)

    resposta = client.get("/api/v1/tickets?texto=VPN", headers=admin_token)
    assert len(resposta.json()) == 1
    assert resposta.json()[0]["titulo"] == "VPN não conecta"


def test_editar_categoria(client, admin_token):
    categoria_id = _criar_categoria(client, admin_token, "VPN")
    resposta = client.patch(
        f"/api/v1/categorias/{categoria_id}",
        json={"descricao": "Problemas de conexão remota"},
        headers=admin_token,
    )
    assert resposta.status_code == 200
    assert resposta.json()["nome"] == "VPN"  # não alterado
    assert resposta.json()["descricao"] == "Problemas de conexão remota"


def test_editar_usuario(client, admin_token):
    resposta = client.post(
        "/api/v1/users",
        json={
            "nome": "Novo Colaborador", "email": "novo@opsflow.com",
            "senha": "senha123", "perfil": "colaborador", "pais": "Brasil",
        },
        headers=admin_token,
    )
    assert resposta.status_code == 201
    user_id = resposta.json()["id"]

    resposta = client.patch(
        f"/api/v1/users/{user_id}",
        json={"perfil": "analista"},
        headers=admin_token,
    )
    assert resposta.status_code == 200
    assert resposta.json()["perfil"] == "analista"
    assert resposta.json()["nome"] == "Novo Colaborador"  # não alterado
