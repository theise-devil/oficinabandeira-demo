require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');

require('./db'); // inicializa banco e cria tabelas

const rotasAuth     = require('./routes/auth');
const rotasVeiculos = require('./routes/veiculos');
const rotasAnuncios = require('./routes/anuncios');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth',     rotasAuth);
app.use('/api/veiculos', rotasVeiculos);
app.use('/api/anuncios', rotasAnuncios);

app.get('/api/ping', (_, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`✅ Servidor rodando em http://localhost:${PORT}`));
