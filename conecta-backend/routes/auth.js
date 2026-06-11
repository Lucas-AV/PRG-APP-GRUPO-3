const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Cadastra um novo usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name:
 *                 type: string
 *                 example: João Silva
 *               email:
 *                 type: string
 *                 example: joao@example.com
 *               phone:
 *                 type: string
 *                 example: "(11) 99999-9999"
 *               password:
 *                 type: string
 *                 example: senha123
 *               role:
 *                 type: string
 *                 enum: [cliente, prestador]
 *                 example: prestador
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Campos obrigatórios faltando ou e-mail já cadastrado
 */
router.post('/register', async (req, res) => {
  const { name, email, phone, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Campos obrigatórios: name, email, password, role' });
  }
  if (!['cliente', 'prestador'].includes(role)) {
    return res.status(400).json({ error: 'role deve ser "cliente" ou "prestador"' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const stmt = db.prepare(
      'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)'
    );
    const result = stmt.run(name, email, phone || null, hashedPassword, role);

    const user = { id: result.lastInsertRowid, name, email, phone: phone || null, role };
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.status(201).json({ user, token });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'E-mail já cadastrado' });
    }
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Autentica um usuário e retorna token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: joao@example.com
 *               password:
 *                 type: string
 *                 example: senha123
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Credenciais inválidas
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
  }

  const userRow = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!userRow) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  const valid = await bcrypt.compare(password, userRow.password);
  if (!valid) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  const user = { id: userRow.id, name: userRow.name, email: userRow.email, role: userRow.role };
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: '7d',
  });

  return res.json({ user, token });
});

/**
 * @swagger
 * /auth/google:
 *   post:
 *     summary: Autentica via Google OAuth
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [access_token]
 *             properties:
 *               access_token:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [cliente, prestador]
 *     responses:
 *       200:
 *         description: Login realizado ou usuário novo detectado
 *       201:
 *         description: Conta criada via Google
 *       401:
 *         description: Token Google inválido
 */
router.post('/google', async (req, res) => {
  const { access_token, role } = req.body;

  if (!access_token) {
    return res.status(400).json({ error: 'access_token é obrigatório' });
  }

  // Verifica token com Google
  let googleUser;
  try {
    const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    if (!googleRes.ok) {
      return res.status(401).json({ error: 'Token Google inválido' });
    }
    googleUser = await googleRes.json();
  } catch {
    return res.status(401).json({ error: 'Falha ao verificar token Google' });
  }

  const { sub, email, name } = googleUser;

  if (!email) {
    return res.status(401).json({ error: 'Não foi possível obter o e-mail do Google' });
  }

  // Busca usuário existente por email
  const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  if (existingUser) {
    // Vincula google_id se ainda não vinculado
    if (!existingUser.google_id) {
      db.prepare('UPDATE users SET google_id = ? WHERE id = ?').run(sub, existingUser.id);
    }
    const user = {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      role: existingUser.role,
    };
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    return res.json({ user, token });
  }

  // Usuário novo — precisa de role
  if (!role) {
    return res.json({ isNewUser: true, googleName: name, googleEmail: email });
  }

  if (!['cliente', 'prestador'].includes(role)) {
    return res.status(400).json({ error: 'role deve ser "cliente" ou "prestador"' });
  }

  try {
    const stmt = db.prepare(
      'INSERT INTO users (name, email, password, role, google_id) VALUES (?, ?, ?, ?, ?)'
    );
    const result = stmt.run(name, email, `google:${sub}`, role, sub);
    const user = { id: Number(result.lastInsertRowid), name, email, role };
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    return res.status(201).json({ user, token });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'E-mail já cadastrado' });
    }
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
