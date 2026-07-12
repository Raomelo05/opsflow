def test_insights_calcula_percentuais_por_categoria(client, admin_token):
    categoria_vpn = client.post("/api/v1/categorias", json={"nome": "VPN"}, headers=admin_token).json()["id"]
    categoria_senha = client.post("/api/v1/categorias", json={"nome": "Senha"}, headers=admin_token).json()["id"]

    for _ in range(3):
        client.post("/api/v1/tickets", json={
            "titulo": "VPN não conecta", "descricao": "x",
            "categoria_id": categoria_vpn, "pais": "Brasil", "plataforma": "Rede",
        }, headers=admin_token)

    client.post("/api/v1/tickets", json={
        "titulo": "Esqueci minha senha", "descricao": "x",
        "categoria_id": categoria_senha, "pais": "Brasil", "plataforma": "Portal",
    }, headers=admin_token)

    resposta = client.get("/api/v1/insights/weekly", headers=admin_token)
    assert resposta.status_code == 200
    dados = resposta.json()
    assert dados["total_tickets"] == 4

    categoria_top = dados["top_categorias"][0]
    assert categoria_top["categoria"] == "VPN"
    assert categoria_top["ocorrencias"] == 3
    assert categoria_top["percentual"] == 75.0
