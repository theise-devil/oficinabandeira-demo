const express = require('express');
const { body, validationResult } = require('express-validator');
const sanitize = require('sanitize-html');

const db             = require('../db');
const { autenticar } = require('../middleware/auth');

const router = express.Router();

const limpar = (str) => sanitize(String(str || ''), { allowedTags: [], allowedAttributes: {} }).trim();
const parseFotos = (a) => ({ ...a, fotos: JSON.parse(a.fotos || '[]') });

// ── LISTAR ANÚNCIOS PÚBLICOS ──────────────────────────────────────────────────
router.get('/', (req, res) => {
  const anuncios = db.prepare(`
    SELECT a.id, a.preco, a.descricao, a.criado_em,
           v.marca, v.modelo, v.ano, v.cor, v.quilometragem, v.fotos
    FROM anuncios a
    JOIN veiculos v ON v.id = a.veiculo_id
    WHERE a.ativo = 1
    ORDER BY a.criado_em DESC
  `).all();
  res.json(anuncios.map(parseFotos));
});

// ── CRIAR ANÚNCIO (protegido) ─────────────────────────────────────────────────
router.post('/',
  autenticar,
  [
    body('veiculo_id').isInt({ min: 1 }),
    body('preco').isFloat({ min: 0 }),
    body('descricao').optional().trim().isLength({ max: 1000 }),
  ],
  (req, res) => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) return res.status(400).json({ erros: erros.array().map(e => e.msg) });

    const { veiculo_id, preco, descricao } = req.body;

    const veiculo = db
      .prepare('SELECT id FROM veiculos WHERE id = ? AND usuario_id = ?')
      .get(veiculo_id, req.usuario.id);
    if (!veiculo) return res.status(403).json({ erro: 'Veículo não encontrado ou não pertence a você.' });

    const jaAnunciado = db
      .prepare('SELECT id FROM anuncios WHERE veiculo_id = ? AND ativo = 1')
      .get(veiculo_id);
    if (jaAnunciado) return res.status(409).json({ erro: 'Este veículo já possui um anúncio ativo.' });

    const { lastInsertRowid } = db.prepare(`
      INSERT INTO anuncios (usuario_id, veiculo_id, preco, descricao)
      VALUES (?, ?, ?, ?)
    `).run(req.usuario.id, veiculo_id, preco, limpar(descricao || ''));

    const anuncio = db.prepare('SELECT * FROM anuncios WHERE id = ?').get(lastInsertRowid);
    res.status(201).json(anuncio);
  }
);

// ── LISTAR ANÚNCIOS DO USUÁRIO LOGADO ────────────────────────────────────────
router.get('/meus', autenticar, (req, res) => {
  const anuncios = db.prepare(`
    SELECT a.id, a.preco, a.descricao, a.ativo, a.criado_em,
           v.marca, v.modelo, v.ano, v.cor, v.quilometragem, v.fotos
    FROM anuncios a
    JOIN veiculos v ON v.id = a.veiculo_id
    WHERE a.usuario_id = ?
    ORDER BY a.criado_em DESC
  `).all(req.usuario.id);
  res.json(anuncios.map(parseFotos));
});

// ── DESATIVAR ANÚNCIO ─────────────────────────────────────────────────────────
router.delete('/:id', autenticar, (req, res) => {
  const anuncio = db
    .prepare('SELECT * FROM anuncios WHERE id = ? AND usuario_id = ?')
    .get(req.params.id, req.usuario.id);
  if (!anuncio) return res.status(404).json({ erro: 'Anúncio não encontrado.' });
  db.prepare('UPDATE anuncios SET ativo = 0 WHERE id = ?').run(anuncio.id);
  res.json({ mensagem: 'Anúncio removido.' });
});

module.exports = router;
