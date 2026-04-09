-- =============================================================================
-- criar_admin.sql
-- Cria um usuário administrador na Oficina Bandeira.
--
-- ATENÇÃO: Substitua os valores abaixo antes de executar.
--   - :nome    → nome do administrador
--   - :email   → e-mail de acesso
--   - :hash    → hash bcrypt da senha desejada
--
-- Como gerar o hash bcrypt:
--   Use qualquer gerador online com salt rounds = 12, por exemplo:
--   https://bcrypt-generator.com  (rounds: 12)
--
--   Senha "Admin@123" com 12 rounds gera algo como:
--   $2a$12$examplehashaquiexamplehashaquiexamplehashaqui123456
--
-- Cole o hash gerado no lugar de <HASH_BCRYPT_AQUI> abaixo.
-- =============================================================================

-- ── 1. Insere o usuário (ignora se o e-mail já existir) ──────────────────────
INSERT INTO usuarios (nome, email, senha_hash, role, status)
VALUES (
    'Administrador',                   -- <- altere o nome
    'admin@oficinabandeira.com',       -- <- altere o e-mail
    '$2a$12$ToN863B5..7Nwu4wta.9..mmAQruKKFm874wA8q7Zy6kxVaOdzCGW', -- senha: Admin@123
    'admin',
    'ativo'
)
ON CONFLICT (email) DO NOTHING;


-- ── 2. Garante que o usuário seja admin (caso já existisse como user comum) ──
UPDATE usuarios
   SET role   = 'admin',
       status = 'ativo'
 WHERE email = 'admin@oficinabandeira.com'; -- <- mesmo e-mail acima


-- ── 3. Confirma o resultado ───────────────────────────────────────────────────
SELECT id, nome, email, role, status, criado_em
  FROM usuarios
 WHERE email = 'admin@oficinabandeira.com';
