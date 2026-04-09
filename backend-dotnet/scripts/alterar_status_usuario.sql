-- =============================================================================
-- alterar_status_usuario.sql
-- Altera role e/ou status de um usuário existente.
--
-- Valores aceitos:
--   role   → 'user' | 'admin'
--   status → 'ativo' | 'inativo' | 'suspenso'
--
-- Descomente APENAS o bloco que deseja executar,
-- troque o e-mail (ou id) e cole no pgAdmin 4.
-- =============================================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- [0] CONSULTAR todos os usuários antes de alterar
-- ─────────────────────────────────────────────────────────────────────────────
SELECT id, nome, email, role, status, criado_em
  FROM usuarios
 ORDER BY id;


-- ─────────────────────────────────────────────────────────────────────────────
-- [A] Promover para ADMIN
-- ─────────────────────────────────────────────────────────────────────────────
-- UPDATE usuarios
--    SET role = 'admin'
--  WHERE email = 'usuario@exemplo.com';


-- ─────────────────────────────────────────────────────────────────────────────
-- [B] Rebaixar para USER comum
-- ─────────────────────────────────────────────────────────────────────────────
-- UPDATE usuarios
--    SET role = 'user'
--  WHERE email = 'usuario@exemplo.com';


-- ─────────────────────────────────────────────────────────────────────────────
-- [C] DESABILITAR (inativar) um usuário
-- ─────────────────────────────────────────────────────────────────────────────
-- UPDATE usuarios
--    SET status = 'inativo'
--  WHERE email = 'usuario@exemplo.com';


-- ─────────────────────────────────────────────────────────────────────────────
-- [D] SUSPENDER um usuário
-- ─────────────────────────────────────────────────────────────────────────────
-- UPDATE usuarios
--    SET status = 'suspenso'
--  WHERE email = 'usuario@exemplo.com';


-- ─────────────────────────────────────────────────────────────────────────────
-- [E] REATIVAR um usuário
-- ─────────────────────────────────────────────────────────────────────────────
-- UPDATE usuarios
--    SET status = 'ativo'
--  WHERE email = 'usuario@exemplo.com';


-- ─────────────────────────────────────────────────────────────────────────────
-- [F] Alterar role E status ao mesmo tempo
-- ─────────────────────────────────────────────────────────────────────────────
-- UPDATE usuarios
--    SET role   = 'admin',    -- 'user' | 'admin'
--        status = 'ativo'     -- 'ativo' | 'inativo' | 'suspenso'
--  WHERE email = 'usuario@exemplo.com';


-- ─────────────────────────────────────────────────────────────────────────────
-- [G] Alterar por ID (quando não souber o e-mail)
-- ─────────────────────────────────────────────────────────────────────────────
-- UPDATE usuarios
--    SET status = 'inativo'
--  WHERE id = 1;
