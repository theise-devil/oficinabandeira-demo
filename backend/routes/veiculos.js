const express  = require('express');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const { body, validationResult } = require('express-validator');
const sanitize = require('sanitize-html');

const db             = require('../db');
const { autenticar } = require('../middleware/auth');

const router = express.Router();

// ── UPLOAD (até 10 fotos, 5MB cada) ──────────────────────────────────────────
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadsDir),
  filename:    (_, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `veiculo_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const permitidos = ['.jpg', '.jpeg', '.png', '.webp'];
    cb(null, permitidos.includes(path.extname(file.originalname).toLowerCase()));
  },
});

// ── HELPERS ───────────────────────────────────────────────────────────────────
const limpar = (str) => sanitize(String(str || ''), { allowedTags: [], allowedAttributes: {} }).trim();

const validacaoVeiculo = [
  body('marca').trim().notEmpty().withMessage('Marca obrigatória.').isLength({ max: 50 }),
  body('modelo').trim().notEmpty().withMessage('Modelo obrigatório.').isLength({ max: 100 }),
  body('ano').trim().notEmpty().withMessage('Ano obrigatório.').isLength({ max: 20 }),
  body('cor').trim().notEmpty().withMessage('Cor obrigatória.').isLength({ max: 30 }),
  body('quilometragem').trim().notEmpty().withMessage('Quilometragem obrigatória.').isLength({ max: 30 }),
  body('descricao').optional().trim().isLength({ max: 500 }),
];

// ── MARCAS E MODELOS (público) ────────────────────────────────────────────────
const MARCAS = {
  "Chevrolet":  ["Onix","Onix Plus","Cruze","Tracker","S10","Spin","Equinox","Montana","Cobalt","Prisma","Agile","Celta","Classic","Corsa","Vectra","Zafira","Captiva","Trailblazer","Blazer","Camaro"],
  "Fiat":       ["Argo","Cronos","Pulse","Fastback","Strada","Toro","Mobi","Uno","Palio","Siena","Bravo","Linea","500","Doblo","Ducato","Fiorino","Grand Siena","Idea","Punto","Tipo"],
  "Ford":       ["Ka","Ka Sedan","EcoSport","Territory","Ranger","Bronco Sport","Maverick","Fusion","Edge","Mustang","F-150","Transit","Fiesta","Focus","Mondeo"],
  "Volkswagen": ["Gol","Polo","Virtus","T-Cross","Taos","Nivus","Saveiro","Amarok","Tiguan","Jetta","Passat","Fox","Golf","Up","Voyage","SpaceFox","CrossFox"],
  "Toyota":     ["Corolla","Corolla Cross","Yaris","Hilux","SW4","RAV4","Camry","Prius","Land Cruiser","Etios","Fielder"],
  "Honda":      ["Civic","City","City Hatch","HR-V","CR-V","WR-V","Fit","Accord","Pilot","Ridgeline"],
  "Hyundai":    ["HB20","HB20S","Creta","Tucson","Santa Fe","Elantra","Azera","i30","ix35","Veloster"],
  "Renault":    ["Kwid","Sandero","Logan","Duster","Captur","Oroch","Zoe","Clio","Megane","Fluence","Koleos"],
  "Jeep":       ["Renegade","Compass","Commander","Wrangler","Grand Cherokee","Cherokee"],
  "Nissan":     ["Kicks","Versa","Sentra","Frontier","March","Leaf","Murano","Pathfinder"],
  "Peugeot":    ["208","2008","3008","5008","408","308","Partner","Expert","Boxer"],
  "Citroën":    ["C3","C4 Cactus","C4 Lounge","Aircross","Berlingo","Jumper","C5"],
  "Mitsubishi": ["Outlander","Eclipse Cross","ASX","L200 Triton","Pajero","Pajero Sport","Lancer"],
  "Kia":        ["Sportage","Stinger","Sorento","Carnival","Cerato","Picanto","Soul","Telluride"],
  "BMW":        ["Série 1","Série 2","Série 3","Série 4","Série 5","X1","X2","X3","X4","X5","X6","Z4","M3","M5"],
  "Mercedes":   ["Classe A","Classe B","Classe C","Classe E","Classe S","GLA","GLB","GLC","GLE","GLS","AMG GT"],
  "Audi":       ["A1","A3","A4","A5","A6","A7","A8","Q2","Q3","Q5","Q7","Q8","TT","R8"],
  "Volvo":      ["XC40","XC60","XC90","S60","S90","V60","V90","C40"],
  "Subaru":     ["Impreza","Legacy","Outback","Forester","XV","BRZ","WRX"],
  "Land Rover": ["Defender","Discovery","Discovery Sport","Range Rover","Range Rover Sport","Range Rover Evoque","Range Rover Velar"],
  "Porsche":    ["911","Cayenne","Macan","Panamera","Taycan","718"],
  "Caoa Chery": ["Tiggo 2","Tiggo 3X","Tiggo 5X","Tiggo 7","Tiggo 8","Arrizo 6"],
  "BYD":        ["Dolphin","Seal","Han","Tang","Song Plus","Atto 3"],
  "GWM":        ["Haval H6","Haval H2","Ora 03","Poer","Wingle"],
};

router.get('/marcas', (req, res) => res.json(MARCAS));

// ── LISTAR VEÍCULOS DO USUÁRIO ────────────────────────────────────────────────
router.get('/', autenticar, (req, res) => {
  const veiculos = db
    .prepare('SELECT * FROM veiculos WHERE usuario_id = ? ORDER BY criado_em DESC')
    .all(req.usuario.id)
    .map(v => ({ ...v, fotos: JSON.parse(v.fotos || '[]') }));
  res.json(veiculos);
});

// ── CADASTRAR VEÍCULO ─────────────────────────────────────────────────────────
router.post('/', autenticar, upload.array('fotos', 10), ...validacaoVeiculo, async (req, res) => {
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    (req.files || []).forEach(f => fs.existsSync(f.path) && fs.unlinkSync(f.path));
    return res.status(400).json({ erros: erros.array().map(e => e.msg) });
  }

  const { marca, modelo, ano, cor, quilometragem, descricao } = req.body;
  const fotos = (req.files || []).map(f => `/uploads/${f.filename}`);

  const { lastInsertRowid } = db.prepare(`
    INSERT INTO veiculos (usuario_id, marca, modelo, ano, cor, quilometragem, descricao, fotos)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.usuario.id,
    limpar(marca), limpar(modelo), limpar(ano),
    limpar(cor), limpar(quilometragem),
    limpar(descricao || ''), JSON.stringify(fotos)
  );

  const veiculo = db.prepare('SELECT * FROM veiculos WHERE id = ?').get(lastInsertRowid);
  res.status(201).json({ ...veiculo, fotos: JSON.parse(veiculo.fotos) });
});

// ── DELETAR VEÍCULO ───────────────────────────────────────────────────────────
router.delete('/:id', autenticar, (req, res) => {
  const veiculo = db
    .prepare('SELECT * FROM veiculos WHERE id = ? AND usuario_id = ?')
    .get(req.params.id, req.usuario.id);

  if (!veiculo) return res.status(404).json({ erro: 'Veículo não encontrado.' });

  // Remove todas as fotos do disco
  const fotos = JSON.parse(veiculo.fotos || '[]');
  fotos.forEach(f => {
    const p = path.join(__dirname, '..', f);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  });

  db.prepare('DELETE FROM veiculos WHERE id = ?').run(veiculo.id);
  res.json({ mensagem: 'Veículo removido.' });
});

module.exports = router;
