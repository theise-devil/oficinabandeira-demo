const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const sanitize = require('sanitize-html');

const db                    = require('../db');
const { autenticar, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// ── HELPERS ──────────────────────────────────────────────────────────────────

const limpar = (str) => sanitize(str, { allowedTags: [], allowedAttributes: {} }).trim();

const validacaoCadastro = [
  body('nome').trim().isLength({ min: 2, max: 100 }).withMessage('Nome inválido.'),
  body('email').isEmail().normalizeEmail().withMessage('E-mail inválido.'),
  body('senha').isLength({ min: 8 }).withMessage('Senha deve ter no mínimo 8 caracteres.')
               .matches(/[A-Z]/).withMessage('Senha deve conter ao menos uma letra maiúscula.')
               .matches(/[0-9]/).withMessage('Senha deve conter ao menos um número.'),
];

const validacaoLogin = [
  body('email').isEmail().normalizeEmail(),
  body('senha').notEmpty(),
];

// ── CADASTRO ─────────────────────────────────────────────────────────────────

router.post('/cadastro', validacaoCadastro, async (req, res) => {
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    return res.status(400).json({ erros: erros.array().map(e => e.msg) });
  }

  const nome  = limpar(req.body.nome);
  const email = req.body.email.toLowerCase().trim();

  // Verifica duplicidade
  const existe = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(email);
  if (existe) {
    return res.status(409).json({ erro: 'E-mail já cadastrado.' });
  }

  const senhaHash = await bcrypt.hash(req.body.senha, 12);

  const { lastInsertRowid } = db
    .prepare('INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)')
    .run(nome, email, senhaHash);

  const token = jwt.sign({ id: lastInsertRowid, email }, JWT_SECRET, { expiresIn: '7d' });

  res.status(201).json({ token, usuario: { id: lastInsertRowid, nome, email } });
});

// ── LOGIN ─────────────────────────────────────────────────────────────────────

router.post('/login', validacaoLogin, async (req, res) => {
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    return res.status(400).json({ erro: 'Dados inválidos.' });
  }

  const email = req.body.email.toLowerCase().trim();
  const usuario = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);

  // Mensagem genérica para não revelar se o e-mail existe
  const ERRO_CREDENCIAIS = 'E-mail ou senha incorretos.';

  if (!usuario) {
    await bcrypt.hash('dummy_para_timing_attack', 12); // evita timing attack
    return res.status(401).json({ erro: ERRO_CREDENCIAIS });
  }

  const senhaOk = await bcrypt.compare(req.body.senha, usuario.senha_hash);
  if (!senhaOk) return res.status(401).json({ erro: ERRO_CREDENCIAIS });

  const token = jwt.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, { expiresIn: '7d' });

  res.json({ token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email } });
});

// ── PERFIL (rota protegida) ───────────────────────────────────────────────────

router.get('/perfil', autenticar, (req, res) => {
  const usuario = db
    .prepare('SELECT id, nome, email, criado_em FROM usuarios WHERE id = ?')
    .get(req.usuario.id);

  if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });
  res.json(usuario);
});

module.exports = router;
