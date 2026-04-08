const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'oficina_bandeira_secret_troque_em_producao';


// Middleware: valida o token JWT enviado no header Authorization: Bearer <token>
function autenticar(req, res, next) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token não fornecido.' });
  }

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.usuario = { id: payload.id, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}

module.exports = { autenticar, JWT_SECRET };
