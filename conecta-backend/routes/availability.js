const express = require('express');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseDurationMinutes(duration) {
  if (!duration) return 60;
  const h = duration.match(/(\d+)h/);
  const m = duration.match(/(\d+)min/);
  const hours = h ? parseInt(h[1]) : 0;
  const mins = m ? parseInt(m[1]) : 0;
  const total = hours * 60 + mins;
  return total > 0 ? total : 60;
}

function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes) {
  const h = String(Math.floor(minutes / 60)).padStart(2, '0');
  const m = String(minutes % 60).padStart(2, '0');
  return `${h}:${m}`;
}

// ── GET /users/:providerId/availability — público ─────────────────────────────

router.get('/:providerId/availability', (req, res) => {
  const providerId = parseInt(req.params.providerId);
  const rows = db.prepare(
    'SELECT day_of_week, start_time, end_time, is_active FROM availability WHERE provider_id = ?'
  ).all(providerId);

  const result = Array.from({ length: 7 }, (_, i) => {
    const row = rows.find(r => r.day_of_week === i);
    return row
      ? { day_of_week: i, start_time: row.start_time, end_time: row.end_time, is_active: !!row.is_active }
      : { day_of_week: i, start_time: null, end_time: null, is_active: false };
  });

  res.json(result);
});

// ── GET /users/:providerId/slots?date=YYYY-MM-DD&serviceId=X — público ────────

router.get('/:providerId/slots', (req, res) => {
  const providerId = parseInt(req.params.providerId);
  const { date, serviceId } = req.query;

  if (!date || !serviceId) {
    return res.status(400).json({ error: 'date e serviceId são obrigatórios' });
  }

  const dateObj = new Date(date + 'T12:00:00');
  const dayOfWeek = dateObj.getDay();

  const avail = db.prepare(
    'SELECT * FROM availability WHERE provider_id = ? AND day_of_week = ? AND is_active = 1'
  ).get(providerId, dayOfWeek);

  if (!avail) return res.json({ date, slots: [] });

  const service = db.prepare('SELECT duration FROM services WHERE id = ?').get(parseInt(serviceId));
  const durationMin = parseDurationMinutes(service ? service.duration : null);

  const startMin = timeToMinutes(avail.start_time);
  const endMin = timeToMinutes(avail.end_time);

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const occupied = db.prepare(
    "SELECT scheduled_time FROM appointments WHERE provider_id = ? AND scheduled_date = ? AND status = 'confirmado'"
  ).all(providerId, date);
  const occupiedTimes = new Set(occupied.map(r => r.scheduled_time));

  const slots = [];
  for (let t = startMin; t + durationMin <= endMin; t += durationMin) {
    const time = minutesToTime(t);
    const isPast = date === todayStr ? t <= nowMin : date < todayStr;
    slots.push({
      time,
      is_occupied: occupiedTimes.has(time),
      is_past: isPast,
    });
  }

  res.json({ date, slots });
});

// ── PUT /users/:providerId/availability — autenticado, próprio prestador ──────

router.put('/:providerId/availability', authMiddleware, (req, res) => {
  const providerId = parseInt(req.params.providerId);

  if (req.user.id !== providerId) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const days = req.body;
  if (!Array.isArray(days) || days.length !== 7) {
    return res.status(400).json({ error: 'Envie um array com exatamente 7 dias' });
  }

  const upsert = db.prepare(`
    INSERT INTO availability (provider_id, day_of_week, start_time, end_time, is_active)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(provider_id, day_of_week) DO UPDATE SET
      start_time = excluded.start_time,
      end_time = excluded.end_time,
      is_active = excluded.is_active
  `);

  const transaction = db.transaction(() => {
    for (const day of days) {
      const { day_of_week, start_time, end_time, is_active } = day;
      upsert.run(
        providerId,
        day_of_week,
        is_active ? (start_time || '08:00') : '08:00',
        is_active ? (end_time || '18:00') : '18:00',
        is_active ? 1 : 0
      );
    }
  });

  transaction();
  res.json({ message: 'Disponibilidade atualizada com sucesso' });
});

module.exports = router;
