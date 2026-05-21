const express = require('express');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

/**
 * @swagger
 * /users/{userId}/subscription:
 *   get:
 *     summary: Retorna a assinatura atual do usuário autenticado
 *     tags: [Assinaturas]
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
 *         description: Dados da assinatura atual (ou plano Free como padrão)
 */
router.get('/:userId/subscription', (req, res) => {
  const sub = db
    .prepare(`
      SELECT s.id, s.status, s.started_at, s.expires_at,
             p.id as plan_id, p.name as plan_name, p.role as plan_role,
             p.price as plan_price, p.billing_cycle, p.features
      FROM subscriptions s
      JOIN plans p ON p.id = s.plan_id
      WHERE s.user_id = ?
    `)
    .get(req.user.id);

  if (!sub) {
    const freePlan = db
      .prepare("SELECT * FROM plans WHERE LOWER(name) = 'free' AND role = ? LIMIT 1")
      .get(req.user.role === 'prestador' ? 'prestador' : 'cliente');

    return res.json({
      plan_name: freePlan ? freePlan.name : 'Free',
      plan_price: 0,
      status: 'free',
      features: freePlan ? JSON.parse(freePlan.features) : [],
      is_subscribed: false,
    });
  }

  return res.json({
    ...sub,
    features: JSON.parse(sub.features),
    is_subscribed: true,
  });
});

/**
 * @swagger
 * /users/{userId}/subscription:
 *   post:
 *     summary: Contrata ou muda de plano
 *     tags: [Assinaturas]
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
 *             required: [plan_id]
 *             properties:
 *               plan_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Assinatura criada ou atualizada
 *       400:
 *         description: plan_id obrigatório
 *       404:
 *         description: Plano não encontrado
 */
router.post('/:userId/subscription', (req, res) => {
  const { plan_id } = req.body;

  if (!plan_id) {
    return res.status(400).json({ error: 'plan_id é obrigatório' });
  }

  const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(plan_id);
  if (!plan) return res.status(404).json({ error: 'Plano não encontrado' });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  db.prepare(`
    INSERT INTO subscriptions (user_id, plan_id, status, started_at, expires_at)
    VALUES (?, ?, 'ativa', CURRENT_TIMESTAMP, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      plan_id = excluded.plan_id,
      status = 'ativa',
      started_at = CURRENT_TIMESTAMP,
      expires_at = excluded.expires_at
  `).run(req.user.id, plan_id, expiresAt.toISOString());

  const sub = db
    .prepare(`
      SELECT s.id, s.status, s.started_at, s.expires_at,
             p.id as plan_id, p.name as plan_name, p.role as plan_role,
             p.price as plan_price, p.billing_cycle, p.features
      FROM subscriptions s
      JOIN plans p ON p.id = s.plan_id
      WHERE s.user_id = ?
    `)
    .get(req.user.id);

  return res.status(201).json({
    ...sub,
    features: JSON.parse(sub.features),
    is_subscribed: true,
  });
});

module.exports = router;
