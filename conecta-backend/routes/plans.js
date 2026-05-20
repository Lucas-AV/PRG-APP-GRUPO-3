const express = require('express');
const db = require('../db/database');

const router = express.Router();

/**
 * @swagger
 * /plans:
 *   get:
 *     summary: Lista os planos disponíveis
 *     tags: [Planos]
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [cliente, prestador]
 *         description: Filtrar planos por tipo de usuário
 *     responses:
 *       200:
 *         description: Lista de planos
 */
router.get('/', (req, res) => {
  const { role } = req.query;

  let plans;
  if (role === 'cliente' || role === 'prestador') {
    plans = db.prepare('SELECT * FROM plans WHERE role = ? ORDER BY price ASC').all(role);
  } else {
    plans = db.prepare('SELECT * FROM plans ORDER BY role, price ASC').all();
  }

  // Parse features JSON for each plan
  const result = plans.map(p => ({
    ...p,
    features: JSON.parse(p.features),
  }));

  return res.json(result);
});

module.exports = router;
