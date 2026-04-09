-- Adiciona role e status à tabela de usuários (idempotente)

ALTER TABLE usuarios
    ADD COLUMN IF NOT EXISTS role   TEXT     NOT NULL DEFAULT 'user',
    ADD COLUMN IF NOT EXISTS status TEXT     NOT NULL DEFAULT 'ativo';

-- Valores aceitos em role:   'user' | 'admin'
-- Valores aceitos em status: 'ativo' | 'inativo' | 'suspenso'
