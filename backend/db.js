const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'oficina.db'));

// Habilita WAL para melhor performance e integridade
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── CRIAÇÃO DAS TABELAS ──────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    nome       TEXT    NOT NULL,
    email      TEXT    NOT NULL UNIQUE,
    senha_hash TEXT    NOT NULL,
    criado_em  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS veiculos (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id    INTEGER NOT NULL,
    marca         TEXT    NOT NULL,
    modelo        TEXT    NOT NULL,
    ano           TEXT    NOT NULL,
    cor           TEXT    NOT NULL,
    quilometragem TEXT    NOT NULL,
    descricao     TEXT,
    fotos         TEXT    NOT NULL DEFAULT '[]',
    criado_em     TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  );

  -- migração: renomeia coluna foto -> fotos se ainda existir
  -- (só tem efeito se o banco foi criado antes desta versão)

  CREATE TABLE IF NOT EXISTS anuncios (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id  INTEGER NOT NULL,
    veiculo_id  INTEGER NOT NULL,
    preco       REAL    NOT NULL,
    descricao   TEXT,
    ativo       INTEGER NOT NULL DEFAULT 1,
    criado_em   TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (usuario_id)  REFERENCES usuarios(id)  ON DELETE CASCADE,
    FOREIGN KEY (veiculo_id)  REFERENCES veiculos(id)  ON DELETE CASCADE
  );
`);

// migração automática: adiciona coluna fotos se só existir foto
try {
  const cols = db.prepare("PRAGMA table_info(veiculos)").all().map(c => c.name);
  if (cols.includes('foto') && !cols.includes('fotos')) {
    db.exec(`ALTER TABLE veiculos ADD COLUMN fotos TEXT NOT NULL DEFAULT '[]'`);
    // copia valor antigo para o novo formato JSON
    const rows = db.prepare('SELECT id, foto FROM veiculos WHERE foto IS NOT NULL').all();
    const upd  = db.prepare("UPDATE veiculos SET fotos = ? WHERE id = ?");
    rows.forEach(r => upd.run(JSON.stringify([r.foto]), r.id));
  }
} catch (_) {}

module.exports = db;
