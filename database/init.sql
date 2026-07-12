-- =============================================================================
-- OpsFlow — schema inicial + dados de exemplo (seed)
-- Executado automaticamente pelo container do PostgreSQL na primeira subida
-- (montado em /docker-entrypoint-initdb.d via docker/docker-compose.yml).
--
-- Este arquivo é a referência "fonte única" do schema em SQL puro. As tabelas
-- também são conhecidas pelo SQLAlchemy (backend/app/models); como o backend
-- só cria tabelas que ainda não existem (Base.metadata.create_all com
-- checkfirst=True), este script roda primeiro e os dados de exemplo abaixo
-- permanecem intactos quando o backend sobe.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Schema
-- ---------------------------------------------------------------------------

CREATE TABLE usuarios (
    id            SERIAL PRIMARY KEY,
    nome          VARCHAR(120) NOT NULL,
    email         VARCHAR(160) NOT NULL UNIQUE,
    senha_hash    VARCHAR(255) NOT NULL,
    perfil        VARCHAR(20) NOT NULL CHECK (perfil IN ('colaborador', 'analista', 'gestor', 'administrador')),
    pais          VARCHAR(60),
    criado_em     TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE categorias (
    id          SERIAL PRIMARY KEY,
    nome        VARCHAR(80) NOT NULL UNIQUE,
    descricao   VARCHAR(255)
);

CREATE TABLE tickets (
    id              SERIAL PRIMARY KEY,
    titulo          VARCHAR(200) NOT NULL,
    descricao       TEXT NOT NULL,
    categoria_id    INTEGER NOT NULL REFERENCES categorias(id),
    prioridade      VARCHAR(10) NOT NULL DEFAULT 'media'
                    CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica')),
    status          VARCHAR(30) NOT NULL DEFAULT 'aberto'
                    CHECK (status IN ('aberto', 'em_andamento', 'aguardando_confirmacao', 'resolvido', 'fechado', 'reaberto')),
    solicitante_id  INTEGER NOT NULL REFERENCES usuarios(id),
    responsavel_id  INTEGER REFERENCES usuarios(id),
    pais            VARCHAR(60) NOT NULL,
    plataforma      VARCHAR(120) NOT NULL,
    criado_em       TIMESTAMP NOT NULL DEFAULT now(),
    atualizado_em   TIMESTAMP NOT NULL DEFAULT now(),
    resolvido_em    TIMESTAMP,
    prazo_sla       TIMESTAMP
);

CREATE INDEX ix_tickets_status ON tickets(status);
CREATE INDEX ix_tickets_categoria ON tickets(categoria_id);
CREATE INDEX ix_tickets_criado_em ON tickets(criado_em);

CREATE TABLE comentarios (
    id          SERIAL PRIMARY KEY,
    ticket_id   INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    autor_id    INTEGER NOT NULL REFERENCES usuarios(id),
    texto       TEXT NOT NULL,
    criado_em   TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE historico_ticket (
    id                  SERIAL PRIMARY KEY,
    ticket_id           INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    campo_alterado      VARCHAR(60) NOT NULL,
    valor_anterior      VARCHAR(255),
    valor_novo          VARCHAR(255),
    alterado_por_id     INTEGER NOT NULL REFERENCES usuarios(id),
    alterado_em         TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE kb_artigos (
    id              SERIAL PRIMARY KEY,
    problema        VARCHAR(200) NOT NULL,
    categoria_id    INTEGER REFERENCES categorias(id),
    solucao         TEXT NOT NULL,
    palavras_chave  VARCHAR(255),
    criado_em       TIMESTAMP NOT NULL DEFAULT now(),
    atualizado_em   TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE workflows (
    id                  SERIAL PRIMARY KEY,
    nome                VARCHAR(120) NOT NULL,
    condicao_campo      VARCHAR(20) NOT NULL CHECK (condicao_campo IN ('categoria', 'prioridade', 'pais', 'plataforma')),
    condicao_operador   VARCHAR(10) NOT NULL DEFAULT '=',
    condicao_valor      VARCHAR(120) NOT NULL,
    ativo               BOOLEAN NOT NULL DEFAULT true,
    criado_em           TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE workflow_acoes (
    id              SERIAL PRIMARY KEY,
    workflow_id     INTEGER NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    tipo_acao       VARCHAR(30) NOT NULL
                    CHECK (tipo_acao IN ('atribuir_equipe', 'definir_prazo_horas', 'enviar_artigo_kb', 'alterar_status')),
    valor           VARCHAR(255) NOT NULL,
    ordem           INTEGER NOT NULL DEFAULT 0
);

-- ---------------------------------------------------------------------------
-- Seed: usuários de exemplo
-- Senha para todos os usuários abaixo: OpsFlow123!
-- ---------------------------------------------------------------------------

INSERT INTO usuarios (nome, email, senha_hash, perfil, pais) VALUES
    ('Ana Colaboradora',  'colaborador@opsflow.com', '$2b$12$f9WurV/F7aWzTM5kEXAxkuAEBlney4ZZvTnGbcZiPWepqBBGbOjOa', 'colaborador',   'Brasil'),
    ('Bruno Analista',    'analista@opsflow.com',    '$2b$12$f9WurV/F7aWzTM5kEXAxkuAEBlney4ZZvTnGbcZiPWepqBBGbOjOa', 'analista',      'Brasil'),
    ('Carla Gestora',     'gestor@opsflow.com',      '$2b$12$f9WurV/F7aWzTM5kEXAxkuAEBlney4ZZvTnGbcZiPWepqBBGbOjOa', 'gestor',        'Portugal'),
    ('Diego Administrador','admin@opsflow.com',      '$2b$12$f9WurV/F7aWzTM5kEXAxkuAEBlney4ZZvTnGbcZiPWepqBBGbOjOa', 'administrador', 'Brasil');

-- ---------------------------------------------------------------------------
-- Seed: categorias
-- ---------------------------------------------------------------------------

INSERT INTO categorias (nome, descricao) VALUES
    ('VPN',                'Problemas de conexão com a VPN corporativa'),
    ('Senha',               'Redefinição e desbloqueio de senha de acesso'),
    ('Acesso',              'Solicitação e liberação de permissões de acesso'),
    ('Sistema Financeiro',  'Falhas e lentidão no sistema financeiro interno'),
    ('Performance',         'Lentidão geral em sistemas e plataformas internas');

-- ---------------------------------------------------------------------------
-- Seed: artigos da Base de Conhecimento
-- ---------------------------------------------------------------------------

INSERT INTO kb_artigos (problema, categoria_id, solucao, palavras_chave) VALUES
    ('VPN não conecta',
     (SELECT id FROM categorias WHERE nome = 'VPN'),
     '1. Verifique sua conexão de internet local.
2. Reinicie o cliente da VPN.
3. Confirme se o certificado de acesso não expirou.
4. Caso o problema persista, abra um chamado para o time de Infraestrutura.',
     'vpn, conexao, acesso remoto, rede'),

    ('Esqueci minha senha',
     (SELECT id FROM categorias WHERE nome = 'Senha'),
     '1. Acesse a página de redefinição de senha corporativa.
2. Informe seu e-mail corporativo.
3. Siga o link enviado para criar uma nova senha.
4. Caso não receba o e-mail em 10 minutos, verifique a caixa de spam antes de abrir um chamado.',
     'senha, redefinicao, login, acesso'),

    ('Sistema financeiro lento',
     (SELECT id FROM categorias WHERE nome = 'Sistema Financeiro'),
     '1. Limpe o cache do navegador.
2. Verifique se há relatórios muito grandes sendo processados em segundo plano.
3. Tente acessar em horário fora do fechamento contábil.
4. Persistindo, registre o horário exato da lentidão no chamado.',
     'financeiro, lentidao, performance, relatorio');

-- ---------------------------------------------------------------------------
-- Seed: regras do Workflow Builder (exemplos citados nos requisitos)
-- ---------------------------------------------------------------------------

INSERT INTO workflows (nome, condicao_campo, condicao_valor) VALUES
    ('Prioridade alta vai para Infraestrutura', 'prioridade', 'alta'),
    ('Chamados de senha recebem artigo da KB', 'categoria', (SELECT id::text FROM categorias WHERE nome = 'Senha'));

INSERT INTO workflow_acoes (workflow_id, tipo_acao, valor, ordem) VALUES
    ((SELECT id FROM workflows WHERE nome = 'Prioridade alta vai para Infraestrutura'), 'atribuir_equipe', 'Infraestrutura', 0),
    ((SELECT id FROM workflows WHERE nome = 'Prioridade alta vai para Infraestrutura'), 'definir_prazo_horas', '4', 1),
    ((SELECT id FROM workflows WHERE nome = 'Chamados de senha recebem artigo da KB'), 'enviar_artigo_kb', 'Esqueci minha senha', 0),
    ((SELECT id FROM workflows WHERE nome = 'Chamados de senha recebem artigo da KB'), 'alterar_status', 'aguardando_confirmacao', 1);

-- ---------------------------------------------------------------------------
-- Seed: tickets de exemplo — volume sintético para os dashboards de indicadores
-- e melhorias terem dados desde o primeiro acesso.
-- ---------------------------------------------------------------------------

-- VPN — 31 ocorrências
INSERT INTO tickets (titulo, descricao, categoria_id, prioridade, status, solicitante_id, responsavel_id, pais, plataforma, criado_em, atualizado_em, resolvido_em, prazo_sla)
SELECT
    'VPN não conecta',
    'Colaborador relata dificuldade de conexão com a VPN corporativa desde a manhã.',
    (SELECT id FROM categorias WHERE nome = 'VPN'),
    (ARRAY['media', 'alta', 'alta', 'critica'])[1 + floor(random() * 4)::int],
    (s.status),
    (SELECT id FROM usuarios WHERE perfil = 'colaborador' ORDER BY random() LIMIT 1),
    (SELECT id FROM usuarios WHERE perfil = 'analista' ORDER BY random() LIMIT 1),
    (ARRAY['Brasil', 'Portugal', 'México', 'Estados Unidos'])[1 + floor(random() * 4)::int],
    'Rede Corporativa',
    s.criado_em,
    s.criado_em + interval '2 hours',
    CASE WHEN s.status IN ('resolvido', 'fechado') THEN s.criado_em + interval '3 hours' ELSE NULL END,
    s.criado_em + interval '4 hours'
FROM (
    SELECT
        now() - (random() * interval '30 days') AS criado_em,
        (ARRAY['resolvido', 'fechado', 'resolvido', 'em_andamento', 'aberto'])[1 + floor(random() * 5)::int] AS status
    FROM generate_series(1, 31)
) s;

-- Senha — 42 ocorrências
INSERT INTO tickets (titulo, descricao, categoria_id, prioridade, status, solicitante_id, responsavel_id, pais, plataforma, criado_em, atualizado_em, resolvido_em, prazo_sla)
SELECT
    'Esqueci minha senha',
    'Colaborador não consegue mais acessar o sistema por ter esquecido a senha.',
    (SELECT id FROM categorias WHERE nome = 'Senha'),
    (ARRAY['baixa', 'media', 'media', 'alta'])[1 + floor(random() * 4)::int],
    (s.status),
    (SELECT id FROM usuarios WHERE perfil = 'colaborador' ORDER BY random() LIMIT 1),
    (SELECT id FROM usuarios WHERE perfil = 'analista' ORDER BY random() LIMIT 1),
    (ARRAY['Brasil', 'Portugal', 'México', 'Estados Unidos'])[1 + floor(random() * 4)::int],
    'Portal Corporativo',
    s.criado_em,
    s.criado_em + interval '1 hours',
    CASE WHEN s.status IN ('resolvido', 'fechado') THEN s.criado_em + interval '2 hours' ELSE NULL END,
    s.criado_em + interval '8 hours'
FROM (
    SELECT
        now() - (random() * interval '30 days') AS criado_em,
        (ARRAY['resolvido', 'fechado', 'resolvido', 'fechado', 'em_andamento'])[1 + floor(random() * 5)::int] AS status
    FROM generate_series(1, 42)
) s;

-- Sistema Financeiro — 25 ocorrências
INSERT INTO tickets (titulo, descricao, categoria_id, prioridade, status, solicitante_id, responsavel_id, pais, plataforma, criado_em, atualizado_em, resolvido_em, prazo_sla)
SELECT
    'Sistema financeiro lento',
    'Relatórios do sistema financeiro estão demorando muito para carregar.',
    (SELECT id FROM categorias WHERE nome = 'Sistema Financeiro'),
    (ARRAY['media', 'alta'])[1 + floor(random() * 2)::int],
    (s.status),
    (SELECT id FROM usuarios WHERE perfil = 'colaborador' ORDER BY random() LIMIT 1),
    (SELECT id FROM usuarios WHERE perfil = 'analista' ORDER BY random() LIMIT 1),
    (ARRAY['Brasil', 'Portugal'])[1 + floor(random() * 2)::int],
    'Sistema Financeiro',
    s.criado_em,
    s.criado_em + interval '3 hours',
    CASE WHEN s.status IN ('resolvido', 'fechado') THEN s.criado_em + interval '5 hours' ELSE NULL END,
    s.criado_em + interval '4 hours'
FROM (
    SELECT
        now() - (random() * interval '30 days') AS criado_em,
        (ARRAY['resolvido', 'em_andamento', 'aberto', 'fechado'])[1 + floor(random() * 4)::int] AS status
    FROM generate_series(1, 25)
) s;

-- Acesso — 15 ocorrências
INSERT INTO tickets (titulo, descricao, categoria_id, prioridade, status, solicitante_id, responsavel_id, pais, plataforma, criado_em, atualizado_em, resolvido_em, prazo_sla)
SELECT
    'Preciso de permissão de acesso',
    'Colaborador novo precisa de acesso ao sistema interno da área.',
    (SELECT id FROM categorias WHERE nome = 'Acesso'),
    (ARRAY['baixa', 'media'])[1 + floor(random() * 2)::int],
    (s.status),
    (SELECT id FROM usuarios WHERE perfil = 'colaborador' ORDER BY random() LIMIT 1),
    (SELECT id FROM usuarios WHERE perfil = 'analista' ORDER BY random() LIMIT 1),
    (ARRAY['Brasil', 'México'])[1 + floor(random() * 2)::int],
    'Portal Corporativo',
    s.criado_em,
    s.criado_em + interval '4 hours',
    CASE WHEN s.status IN ('resolvido', 'fechado') THEN s.criado_em + interval '6 hours' ELSE NULL END,
    s.criado_em + interval '8 hours'
FROM (
    SELECT
        now() - (random() * interval '30 days') AS criado_em,
        (ARRAY['resolvido', 'fechado', 'aberto'])[1 + floor(random() * 3)::int] AS status
    FROM generate_series(1, 15)
) s;

-- Performance — 10 ocorrências
INSERT INTO tickets (titulo, descricao, categoria_id, prioridade, status, solicitante_id, responsavel_id, pais, plataforma, criado_em, atualizado_em, resolvido_em, prazo_sla)
SELECT
    'Sistema está lento',
    'Colaborador relata lentidão generalizada ao usar o sistema interno.',
    (SELECT id FROM categorias WHERE nome = 'Performance'),
    (ARRAY['baixa', 'media'])[1 + floor(random() * 2)::int],
    (s.status),
    (SELECT id FROM usuarios WHERE perfil = 'colaborador' ORDER BY random() LIMIT 1),
    (SELECT id FROM usuarios WHERE perfil = 'analista' ORDER BY random() LIMIT 1),
    (ARRAY['Brasil', 'Portugal', 'Estados Unidos'])[1 + floor(random() * 3)::int],
    'Portal Corporativo',
    s.criado_em,
    s.criado_em + interval '2 hours',
    CASE WHEN s.status IN ('resolvido', 'fechado') THEN s.criado_em + interval '3 hours' ELSE NULL END,
    s.criado_em + interval '24 hours'
FROM (
    SELECT
        now() - (random() * interval '30 days') AS criado_em,
        (ARRAY['resolvido', 'aberto'])[1 + floor(random() * 2)::int] AS status
    FROM generate_series(1, 10)
) s;

-- ---------------------------------------------------------------------------
-- Seed: um ticket "vitrine" com histórico e comentários completos,
-- útil para explorar a Tela 3 (Detalhes) logo no primeiro acesso.
-- ---------------------------------------------------------------------------

INSERT INTO tickets (id, titulo, descricao, categoria_id, prioridade, status, solicitante_id, responsavel_id, pais, plataforma, criado_em, atualizado_em, resolvido_em, prazo_sla)
OVERRIDING SYSTEM VALUE
VALUES (
    9000,
    'VPN não conecta desde a atualização de ontem',
    'Depois da atualização do cliente de VPN ontem à noite, não consigo mais conectar na rede corporativa. Já reiniciei o notebook duas vezes.',
    (SELECT id FROM categorias WHERE nome = 'VPN'),
    'alta',
    'em_andamento',
    (SELECT id FROM usuarios WHERE email = 'colaborador@opsflow.com'),
    (SELECT id FROM usuarios WHERE email = 'analista@opsflow.com'),
    'Brasil',
    'Rede Corporativa',
    now() - interval '5 hours',
    now() - interval '1 hours',
    NULL,
    now() + interval '4 hours'
);

SELECT setval('tickets_id_seq', GREATEST((SELECT max(id) FROM tickets), 9000));

INSERT INTO comentarios (ticket_id, autor_id, texto, criado_em) VALUES
    (9000, (SELECT id FROM usuarios WHERE email = 'analista@opsflow.com'),
     'Olá! Poderia confirmar a versão do cliente de VPN instalada?', now() - interval '4 hours'),
    (9000, (SELECT id FROM usuarios WHERE email = 'colaborador@opsflow.com'),
     'Claro, é a versão 5.2.1, atualizada automaticamente ontem à noite.', now() - interval '3 hours'),
    (9000, (SELECT id FROM usuarios WHERE email = 'analista@opsflow.com'),
     'Identificamos uma instabilidade conhecida nessa versão. Vamos aplicar o certificado atualizado remotamente.', now() - interval '1 hours');

INSERT INTO historico_ticket (ticket_id, campo_alterado, valor_anterior, valor_novo, alterado_por_id, alterado_em) VALUES
    (9000, 'status', 'aberto', 'em_andamento', (SELECT id FROM usuarios WHERE email = 'analista@opsflow.com'), now() - interval '4 hours'),
    (9000, 'equipe_atribuida', NULL, 'Infraestrutura', (SELECT id FROM usuarios WHERE email = 'colaborador@opsflow.com'), now() - interval '5 hours');
