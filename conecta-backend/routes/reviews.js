const express = require('express');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * /services/{id}/reviews:
 *   get:
 *     summary: Lista as avaliações de um serviço
 *     tags: [Avaliações]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de avaliações
 */
router.get('/', (req, res) => {
  const reviews = db
    .prepare(`
      SELECT r.id, r.rating, r.comment, r.created_at,
             u.name as reviewer_name
      FROM reviews r
      JOIN users u ON u.id = r.user_id
      WHERE r.service_id = ?
      ORDER BY r.created_at DESC
    `)
    .all(req.params.id);

  return res.json(reviews);
});

/**
 * @swagger
 * /services/{id}/reviews:
 *   post:
 *     summary: Cria uma avaliação para um serviço
 *     tags: [Avaliações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *             required: [rating]
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Avaliação criada
 */
router.post('/', authMiddleware, (req, res) => {
  const { rating, comment } = req.body;
  const serviceId = req.params.id;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating deve ser um número entre 1 e 5' });
  }

  const service = db.prepare('SELECT id FROM services WHERE id = ?').get(serviceId);
  if (!service) return res.status(404).json({ error: 'Serviço não encontrado' });

  const existing = db
    .prepare('SELECT id FROM reviews WHERE service_id = ? AND user_id = ?')
    .get(serviceId, req.user.id);
  if (existing) {
    return res.status(409).json({ error: 'Você já avaliou este serviço' });
  }

  const result = db
    .prepare('INSERT INTO reviews (service_id, user_id, rating, comment) VALUES (?, ?, ?, ?)')
    .run(serviceId, req.user.id, rating, comment || null);

  const review = db
    .prepare(`
      SELECT r.id, r.rating, r.comment, r.created_at, u.name as reviewer_name
      FROM reviews r JOIN users u ON u.id = r.user_id WHERE r.id = ?
    `)
    .get(result.lastInsertRowid);

  return res.status(201).json(review);
});

module.exports = router;
