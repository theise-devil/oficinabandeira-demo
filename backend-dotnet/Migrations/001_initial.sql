-- Alterações mínimas em relação ao schema SQLite original:
--   AUTOINCREMENT  → SERIAL
--   TEXT DEFAULT (datetime('now')) → TIMESTAMPTZ DEFAULT NOW()
--   REAL           → NUMERIC
--   Foreign keys já são padrão no PostgreSQL (sem PRAGMA)

CREATE TABLE IF NOT EXISTS usuarios (
    id         SERIAL      PRIMARY KEY,
    nome       TEXT        NOT NULL,
    email      TEXT        NOT NULL UNIQUE,
    senha_hash TEXT        NOT NULL,
    criado_em  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS veiculos (
    id            SERIAL      PRIMARY KEY,
    usuario_id    INTEGER     NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    marca         TEXT        NOT NULL,
    modelo        TEXT        NOT NULL,
    ano           TEXT        NOT NULL,
    cor           TEXT        NOT NULL,
    quilometragem TEXT        NOT NULL,
    descricao     TEXT,
    fotos         TEXT        NOT NULL DEFAULT '[]',
    criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS anuncios (
    id         SERIAL      PRIMARY KEY,
    usuario_id INTEGER     NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    veiculo_id INTEGER     NOT NULL REFERENCES veiculos(id) ON DELETE CASCADE,
    preco      NUMERIC     NOT NULL,
    descricao  TEXT,
    ativo      SMALLINT    NOT NULL DEFAULT 1,
    criado_em  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
