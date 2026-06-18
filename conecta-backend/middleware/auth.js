const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'conecta_secret_dev';

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('[authMiddleware] Token não fornecido. Header:', authHeader);
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  let token = authHeader.slice(7);
  if (token) {
    token = token.trim();
    if (token.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1);
    }
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    console.log('[authMiddleware] Erro ao verificar token:', err.message, 'Token:', token);
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

module.exports = { authMiddleware, JWT_SECRET };
