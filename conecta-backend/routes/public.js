const express = require('express');
const db = require('../db/database');

const router = express.Router();

/**
 * @swagger
 * /services/public:
 *   get:
 *     summary: Lista serviços ativos com dados do prestador (público, sem autenticação)
 *     tags: [Serviços Públicos]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: provider_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de serviços públicos
 */
router.get('/public', (req, res) => {
  const { category, q, provider_id } = req.query;

  const conditions = ["s.status = 'ativo'"];
  const params = [];

  if (category) {
    conditions.push('s.category = ?');
    params.push(category);
  }
  if (q) {
    conditions.push('(s.name LIKE ? OR s.description LIKE ?)');
    params.push(`%${q}%`, `%${q}%`);
  }
  if (provider_id && !isNaN(Number(provider_id))) {
    conditions.push('s.user_id = ?');
    params.push(Number(provider_id));
  }

  const where = conditions.join(' AND ');

  const services = db.prepare(`
    SELECT
      s.id, s.name, s.category, s.price, s.price_type, s.description, s.included_items,
      u.id AS provider_id, u.name AS provider_name,
      ROUND(AVG(r.rating), 1) AS avg_rating,
      COUNT(r.id) AS review_count
    FROM services s
    JOIN users u ON s.user_id = u.id
    LEFT JOIN reviews r ON r.service_id = s.id
    WHERE ${where}
    GROUP BY s.id
    ORDER BY avg_rating DESC, s.created_at DESC
    LIMIT 20
  `).all(...params);

  return res.json(services);
});

/**
 * @swagger
 * /services/public/{id}:
 *   get:
 *     summary: Retorna detalhes públicos de um serviço ativo
 *     tags: [Serviços Públicos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalhes do serviço
 *       404:
 *         description: Serviço não encontrado
 */
router.get('/public/:id', (req, res) => {
  const service = db.prepare(`
    SELECT
      s.id, s.name, s.category, s.price, s.price_type,
      s.description, s.included_items, s.duration, s.status,
      u.id AS provider_id, u.name AS provider_name,
      ROUND(AVG(r.rating), 1) AS avg_rating,
      COUNT(r.id) AS review_count
    FROM services s
    JOIN users u ON s.user_id = u.id
    LEFT JOIN reviews r ON r.service_id = s.id
    WHERE s.id = ? AND s.status = 'ativo'
    GROUP BY s.id
  `).get(Number(req.params.id));

  if (!service) return res.status(404).json({ error: 'Serviço não encontrado' });
  return res.json(service);
});

/**
 * @swagger
 * /users/provider/{userId}/reviews:
 *   get:
 *     summary: Retorna avaliações agregadas de um prestador (público)
 *     tags: [Avaliações Públicas]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Avaliações do prestador com distribuição
 */
router.get('/provider/:userId/reviews', (req, res) => {
  const reviews = db.prepare(`
    SELECT
      r.id, r.rating, r.comment, r.created_at,
      u.name AS reviewer_name,
      s.name AS service_name
    FROM reviews r
    JOIN services s ON r.service_id = s.id
    JOIN users u ON r.user_id = u.id
    WHERE s.user_id = ?
    ORDER BY r.created_at DESC
  `).all(Number(req.params.userId));

  const total = reviews.length;
  const avg = total > 0
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / total) * 10) / 10
    : null;

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    const key = r.rating;
    if (key >= 1 && key <= 5) distribution[key]++;
  });

  return res.json({ avg_rating: avg, total_count: total, distribution, reviews });
});

router.get('/provider/:userId/profile', (req, res) => {
  const userId = Number(req.params.userId);
  if (isNaN(userId)) return res.status(400).json({ error: 'userId inválido' });

  const user = db.prepare(`
    SELECT id, name, bio, years_experience, response_time, specialties, certifications
    FROM users WHERE id = ? AND role = 'prestador'
  `).get(userId);

  if (!user) return res.status(404).json({ error: 'Prestador não encontrado' });

  const row = db.prepare(
    "SELECT COUNT(*) as count FROM appointments WHERE provider_id = ? AND status = 'concluido'"
  ).get(userId);

  return res.json({
    ...user,
    specialties: user.specialties ? JSON.parse(user.specialties) : [],
    certifications: user.certifications ? JSON.parse(user.certifications) : [],
    completed_count: row ? row.count : 0,
  });
});

module.exports = router;
