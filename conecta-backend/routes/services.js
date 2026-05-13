const express = require('express');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

/**
 * @swagger
 * /services:
 *   get:
 *     summary: Lista todos os serviços do usuário autenticado
 *     tags: [Serviços]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de serviços
 *       401:
 *         description: Não autenticado
 */
router.get('/', (req, res) => {
  const services = db
    .prepare('SELECT * FROM services WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.user.id);
  return res.json(services);
});

/**
 * @swagger
 * /services:
 *   post:
 *     summary: Cria um novo serviço
 *     tags: [Serviços]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Fotografia de Casamento
 *               category:
 *                 type: string
 *                 example: Eventos e Festas
 *               price:
 *                 type: number
 *                 example: 1500.00
 *               price_type:
 *                 type: string
 *                 enum: [fixo, a_partir_de]
 *                 example: fixo
 *               duration:
 *                 type: string
 *                 example: Diária
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ativo, rascunho]
 *                 example: ativo
 *     responses:
 *       201:
 *         description: Serviço criado
 *       400:
 *         description: Nome é obrigatório
 */
router.post('/', (req, res) => {
  const { name, category, price, price_type, duration, description, status } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'O campo "name" é obrigatório' });
  }

  const validStatus = ['ativo', 'rascunho'];
  const finalStatus = validStatus.includes(status) ? status : 'rascunho';

  const stmt = db.prepare(`
    INSERT INTO services (user_id, name, category, price, price_type, duration, description, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    req.user.id,
    name,
    category || null,
    price || null,
    price_type || 'fixo',
    duration || null,
    description || null,
    finalStatus
  );

  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(result.lastInsertRowid);
  return res.status(201).json(service);
});

/**
 * @swagger
 * /services/{id}:
 *   get:
 *     summary: Retorna um serviço específico
 *     tags: [Serviços]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Serviço encontrado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Serviço não encontrado
 */
router.get('/:id', (req, res) => {
  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);

  if (!service) return res.status(404).json({ error: 'Serviço não encontrado' });
  if (service.user_id !== req.user.id) return res.status(403).json({ error: 'Acesso negado' });

  return res.json(service);
});

/**
 * @swagger
 * /services/{id}:
 *   put:
 *     summary: Atualiza um serviço existente
 *     tags: [Serviços]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               category:
 *                 type: string
 *               price:
 *                 type: number
 *               price_type:
 *                 type: string
 *               duration:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Serviço atualizado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Serviço não encontrado
 */
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);

  if (!existing) return res.status(404).json({ error: 'Serviço não encontrado' });
  if (existing.user_id !== req.user.id) return res.status(403).json({ error: 'Acesso negado' });

  const fields = ['name', 'category', 'price', 'price_type', 'duration', 'description', 'status'];
  const updates = {};
  for (const field of fields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'Nenhum campo para atualizar' });
  }

  const setClauses = Object.keys(updates).map((k) => `${k} = ?`).join(', ');
  const values = [...Object.values(updates), req.params.id];

  db.prepare(`UPDATE services SET ${setClauses} WHERE id = ?`).run(...values);

  const updated = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
  return res.json(updated);
});

/**
 * @swagger
 * /services/{id}:
 *   delete:
 *     summary: Deleta um serviço
 *     tags: [Serviços]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Serviço deletado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Serviço não encontrado
 */
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);

  if (!existing) return res.status(404).json({ error: 'Serviço não encontrado' });
  if (existing.user_id !== req.user.id) return res.status(403).json({ error: 'Acesso negado' });

  db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
  return res.json({ message: 'Serviço deletado com sucesso' });
});

module.exports = router;
