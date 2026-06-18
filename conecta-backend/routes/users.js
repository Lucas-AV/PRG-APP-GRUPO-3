const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// Observação: o :userId existe na URL só para deixar claro o recurso.
// O usuário sempre é resolvido pelo token (req.user.id), então um usuário
// nunca consegue acessar/alterar dados de outro.

/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: Retorna os dados do usuário autenticado
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dados do usuário
 *       404:
 *         description: Usuário não encontrado
 */
router.get('/:userId', (req, res) => {
  const user = db
    .prepare('SELECT id, name, email, phone, role, avatar_url, bio, years_experience, response_time, created_at FROM users WHERE id = ?')
    .get(req.user.id);

  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  return res.json(user);
});

/**
 * @swagger
 * /users/{userId}:
 *   put:
 *     summary: Atualiza nome, e-mail e telefone do usuário autenticado
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuário atualizado
 *       400:
 *         description: Nenhum campo válido ou e-mail já em uso
 */
router.put('/:userId', (req, res) => {
  const fields = ['name', 'email', 'phone', 'bio', 'years_experience', 'response_time'];
  const updates = {};
  for (const field of fields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'Nenhum campo para atualizar' });
  }

  const setClauses = Object.keys(updates).map((k) => `${k} = ?`).join(', ');
  const values = [...Object.values(updates), req.user.id];

  try {
    db.prepare(`UPDATE users SET ${setClauses} WHERE id = ?`).run(...values);
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'E-mail já cadastrado' });
    }
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }

  const updated = db
    .prepare('SELECT id, name, email, phone, role, avatar_url, bio, years_experience, response_time, created_at FROM users WHERE id = ?')
    .get(req.user.id);
  return res.json(updated);
});

router.post('/:userId/complete-onboarding', (req, res) => {
  db.prepare('UPDATE users SET onboarding_completed = 1 WHERE id = ?').run(req.user.id);
  return res.json({ ok: true });
});

/**
 * @swagger
 * /users/{userId}/password:
 *   put:
 *     summary: Troca a senha do usuário autenticado
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [current_password, new_password]
 *             properties:
 *               current_password:
 *                 type: string
 *               new_password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Senha alterada
 *       400:
 *         description: Campos obrigatórios faltando
 *       401:
 *         description: Senha atual incorreta
 */
router.put('/:userId/password', async (req, res) => {
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res
      .status(400)
      .json({ error: 'Campos obrigatórios: current_password, new_password' });
  }

  const userRow = db.prepare('SELECT password FROM users WHERE id = ?').get(req.user.id);
  if (!userRow) return res.status(404).json({ error: 'Usuário não encontrado' });

  const valid = await bcrypt.compare(current_password, userRow.password);
  if (!valid) {
    return res.status(401).json({ error: 'Senha atual incorreta' });
  }

  const hashed = await bcrypt.hash(new_password, 10);
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashed, req.user.id);

  return res.json({ message: 'Senha alterada com sucesso' });
});

/**
 * @swagger
 * /users/{userId}:
 *   delete:
 *     summary: Exclui a conta do usuário autenticado (em cascata)
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Conta excluída
 *       400:
 *         description: Senha não informada
 *       401:
 *         description: Senha incorreta
 */
router.delete('/:userId', async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Informe a senha para confirmar a exclusão' });
  }

  const userRow = db.prepare('SELECT password FROM users WHERE id = ?').get(req.user.id);
  if (!userRow) return res.status(404).json({ error: 'Usuário não encontrado' });

  const valid = await bcrypt.compare(password, userRow.password);
  if (!valid) {
    return res.status(401).json({ error: 'Senha incorreta' });
  }

  // services não tem ON DELETE CASCADE no schema, então removemos manualmente.
  // addresses e transactions são apagados em cascata pelo FK.
  const deleteAccount = db.transaction((id) => {
    db.prepare('DELETE FROM services WHERE user_id = ?').run(id);
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
  });
  deleteAccount(req.user.id);

  return res.json({ message: 'Conta excluída com sucesso' });
});

/**
 * @swagger
 * /users/{userId}/addresses:
 *   get:
 *     summary: Lista os endereços do usuário autenticado
 *     tags: [Endereços]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de endereços
 */
router.get('/:userId/addresses', (req, res) => {
  const addresses = db
    .prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.user.id);
  return res.json(addresses);
});

/**
 * @swagger
 * /users/{userId}/addresses:
 *   post:
 *     summary: Cadastra um endereço para o usuário autenticado
 *     tags: [Endereços]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [street, city, state]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [casa, trabalho, outro]
 *                 example: casa
 *               zip_code:
 *                 type: string
 *                 example: "01310-100"
 *               street:
 *                 type: string
 *                 example: Av. Paulista
 *               number:
 *                 type: string
 *                 example: "1000"
 *               complement:
 *                 type: string
 *               neighborhood:
 *                 type: string
 *                 example: Bela Vista
 *               city:
 *                 type: string
 *                 example: São Paulo
 *               state:
 *                 type: string
 *                 example: SP
 *     responses:
 *       201:
 *         description: Endereço criado
 *       400:
 *         description: Campos obrigatórios faltando
 */
router.post('/:userId/addresses', (req, res) => {
  const { type, zip_code, street, number, complement, neighborhood, city, state } = req.body;

  if (!street || !city || !state) {
    return res.status(400).json({ error: 'Campos obrigatórios: street, city, state' });
  }

  const stmt = db.prepare(`
    INSERT INTO addresses (user_id, type, zip_code, street, number, complement, neighborhood, city, state)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    req.user.id,
    type || 'casa',
    zip_code || null,
    street,
    number || null,
    complement || null,
    neighborhood || null,
    city,
    state
  );

  const address = db.prepare('SELECT * FROM addresses WHERE id = ?').get(result.lastInsertRowid);
  return res.status(201).json(address);
});

/**
 * @swagger
 * /users/{userId}/addresses/{id}:
 *   delete:
 *     summary: Remove um endereço do usuário autenticado
 *     tags: [Endereços]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Endereço removido
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Endereço não encontrado
 */
router.delete('/:userId/addresses/:id', (req, res) => {
  const address = db.prepare('SELECT * FROM addresses WHERE id = ?').get(req.params.id);

  if (!address) return res.status(404).json({ error: 'Endereço não encontrado' });
  if (address.user_id !== req.user.id) return res.status(403).json({ error: 'Acesso negado' });

  db.prepare('DELETE FROM addresses WHERE id = ?').run(req.params.id);
  return res.json({ message: 'Endereço removido com sucesso' });
});

/**
 * @swagger
 * /users/{userId}/addresses/{id}:
 *   put:
 *     summary: Atualiza um endereço do usuário autenticado
 *     tags: [Endereços]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [casa, trabalho, outro]
 *               zip_code:
 *                 type: string
 *               street:
 *                 type: string
 *               number:
 *                 type: string
 *               complement:
 *                 type: string
 *               neighborhood:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *     responses:
 *       200:
 *         description: Endereço atualizado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Endereço não encontrado
 */
router.put('/:userId/addresses/:id', (req, res) => {
  const address = db.prepare('SELECT * FROM addresses WHERE id = ?').get(req.params.id);

  if (!address) return res.status(404).json({ error: 'Endereço não encontrado' });
  if (address.user_id !== req.user.id) return res.status(403).json({ error: 'Acesso negado' });

  const { type, zip_code, street, number, complement, neighborhood, city, state } = req.body;

  if (street !== undefined && !street) return res.status(400).json({ error: 'street não pode ser vazio' });
  if (city !== undefined && !city) return res.status(400).json({ error: 'city não pode ser vazio' });
  if (state !== undefined && !state) return res.status(400).json({ error: 'state não pode ser vazio' });

  try {
    db.prepare(`
      UPDATE addresses
      SET type = ?, zip_code = ?, street = ?, number = ?, complement = ?, neighborhood = ?, city = ?, state = ?
      WHERE id = ?
    `).run(
      type ?? address.type,
      zip_code !== undefined ? zip_code : address.zip_code,
      street ?? address.street,
      number !== undefined ? number : address.number,
      complement !== undefined ? complement : address.complement,
      neighborhood !== undefined ? neighborhood : address.neighborhood,
      city ?? address.city,
      state ?? address.state,
      req.params.id
    );
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao atualizar endereço' });
  }

  const updated = db.prepare('SELECT * FROM addresses WHERE id = ?').get(req.params.id);
  return res.json(updated);
});

/**
 * @swagger
 * /users/{userId}/transactions:
 *   get:
 *     summary: Lista o histórico de transações do usuário autenticado
 *     tags: [Transações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de transações
 */
router.get('/:userId/transactions', (req, res) => {
  const transactions = db
    .prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY paid_at DESC')
    .all(req.user.id);
  return res.json(transactions);
});

/**
 * @swagger
 * /users/{userId}/cards:
 *   get:
 *     summary: Lista os cartões salvos do usuário autenticado
 *     tags: [Cartões]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:userId/cards', (req, res) => {
  const cards = db
    .prepare('SELECT id, brand, last_four, expiry_month, expiry_year, created_at FROM cards WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.user.id);
  return res.json(cards);
});

/**
 * @swagger
 * /users/{userId}/cards:
 *   post:
 *     summary: Salva um novo cartão do usuário autenticado
 *     tags: [Cartões]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:userId/cards', (req, res) => {
  const { brand, last_four, expiry_month, expiry_year } = req.body;

  if (!brand || !last_four || !expiry_month || !expiry_year) {
    return res.status(400).json({ error: 'Campos obrigatórios: brand, last_four, expiry_month, expiry_year' });
  }

  if (!/^\d{4}$/.test(last_four)) {
    return res.status(400).json({ error: 'last_four deve ter exatamente 4 dígitos' });
  }

  const result = db
    .prepare('INSERT INTO cards (user_id, brand, last_four, expiry_month, expiry_year) VALUES (?, ?, ?, ?, ?)')
    .run(req.user.id, brand, last_four, expiry_month, expiry_year);

  const card = db.prepare('SELECT id, brand, last_four, expiry_month, expiry_year, created_at FROM cards WHERE id = ?').get(result.lastInsertRowid);
  return res.status(201).json(card);
});

/**
 * @swagger
 * /users/{userId}/cards/{cardId}:
 *   delete:
 *     summary: Remove um cartão do usuário autenticado
 *     tags: [Cartões]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:userId/cards/:cardId', (req, res) => {
  const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(req.params.cardId);

  if (!card) return res.status(404).json({ error: 'Cartão não encontrado' });
  if (card.user_id !== req.user.id) return res.status(403).json({ error: 'Acesso negado' });

  db.prepare('DELETE FROM cards WHERE id = ?').run(req.params.cardId);
  return res.json({ message: 'Cartão removido com sucesso' });
});

module.exports = router;
