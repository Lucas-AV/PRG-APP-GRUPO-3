const express = require('express');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /services/{id}/metrics:
 *   get:
 *     summary: Retorna métricas de desempenho de um serviço
 *     tags: [Métricas]
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
 *         description: Métricas do serviço
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Serviço não encontrado
 */
router.get('/:id/metrics', authMiddleware, (req, res) => {
  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);

  if (!service) return res.status(404).json({ error: 'Serviço não encontrado' });
  if (service.user_id !== req.user.id) return res.status(403).json({ error: 'Acesso negado' });

  // Total revenue: sum of transactions where service_name matches this service
  const revenueRow = db
    .prepare("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE service_name = ?")
    .get(service.name);
  const totalRevenue = revenueRow?.total ?? 0;

  // Total bookings: count of matching transactions
  const bookingsRow = db
    .prepare("SELECT COUNT(*) as total FROM transactions WHERE service_name = ?")
    .get(service.name);
  const totalBookings = bookingsRow?.total ?? 0;

  // Average rating from reviews table (may not exist yet — handle gracefully)
  let avgRating = 0;
  try {
    const ratingRow = db
      .prepare("SELECT ROUND(AVG(rating), 1) as avg FROM reviews WHERE service_id = ?")
      .get(req.params.id);
    avgRating = ratingRow?.avg ?? 0;
  } catch {
    // reviews table doesn't exist yet
    avgRating = 0;
  }

  // Weekly data: count transactions per day of week (last 7 days), as percentages 0-100
  const weeklyData = [0, 0, 0, 0, 0, 0, 0]; // Mon-Sun placeholder
  try {
    const weekRows = db
      .prepare(`
        SELECT strftime('%w', paid_at) as dow, COUNT(*) as cnt
        FROM transactions
        WHERE service_name = ?
          AND paid_at >= date('now', '-7 days')
        GROUP BY dow
      `)
      .all(service.name);
    const maxCnt = Math.max(1, ...weekRows.map(r => r.cnt));
    // SQLite %w: 0=Sunday, 1=Monday, ..., 6=Saturday → remap to Mon-Sun (index 0-6)
    for (const row of weekRows) {
      const sqliteDow = parseInt(row.dow, 10); // 0=Sun
      const idx = sqliteDow === 0 ? 6 : sqliteDow - 1; // Convert to Mon=0, ..., Sun=6
      weeklyData[idx] = Math.round((row.cnt / maxCnt) * 100);
    }
  } catch {
    // Keep zeros
  }

  return res.json({
    total_revenue: totalRevenue,
    total_bookings: totalBookings,
    avg_rating: avgRating,
    weekly_data: weeklyData,
  });
});

module.exports = router;
