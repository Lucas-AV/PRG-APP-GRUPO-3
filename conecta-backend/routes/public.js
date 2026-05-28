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
 *         description: Filtrar por categoria
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Buscar por nome ou descrição
 *     responses:
 *       200:
 *         description: Lista de serviços públicos
 */
router.get('/public', (req, res) => {
  const { category, q } = req.query;

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

  const where = conditions.join(' AND ');

  const services = db.prepare(`
    SELECT
      s.id,
      s.name,
      s.category,
      s.price,
      s.price_type,
      s.description,
      u.id   AS provider_id,
      u.name AS provider_name,
      ROUND(AVG(r.rating), 1) AS avg_rating,
      COUNT(r.id)             AS review_count
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

module.exports = router;
