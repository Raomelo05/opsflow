def test_busca_por_palavra_chave_encontra_artigo(client, admin_token):
    client.post(
        "/api/v1/kb",
        json={
            "problema": "VPN não conecta",
            "solucao": "1. Reinicie o cliente de VPN.",
            "palavras_chave": "vpn, conexao, rede",
        },
        headers=admin_token,
    )
    client.post(
        "/api/v1/kb",
        json={
            "problema": "Esqueci minha senha",
            "solucao": "1. Acesse a página de redefinição.",
            "palavras_chave": "senha, login",
        },
        headers=admin_token,
    )

    resposta = client.get("/api/v1/kb/search?q=Minha VPN não conecta hoje", headers=admin_token)
    assert resposta.status_code == 200
    resultados = resposta.json()
    assert len(resultados) >= 1
    assert resultados[0]["problema"] == "VPN não conecta"


def test_busca_sem_correspondencia_retorna_vazio(client, admin_token):
    client.post(
        "/api/v1/kb",
        json={"problema": "Impressora sem tinta", "solucao": "Troque o cartucho."},
        headers=admin_token,
    )
    resposta = client.get("/api/v1/kb/search?q=zzz termo inexistente zzz", headers=admin_token)
    assert resposta.json() == []
