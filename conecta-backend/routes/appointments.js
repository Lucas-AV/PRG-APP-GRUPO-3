const express = require('express');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

const APPOINTMENT_SELECT = `
  SELECT
    a.id, a.client_id, a.provider_id, a.service_id,
    a.scheduled_date, a.scheduled_time, a.duration_minutes,
    a.status, a.payment_method, a.card_id, a.total_price, a.created_at,
    s.name  AS service_name,
    s.duration AS service_duration,
    uc.name AS client_name,
    up.name AS provider_name,
    c.brand AS card_brand,
    c.last_four AS card_last_four,
    addr.street     AS client_address_street,
    addr.number     AS client_address_number,
    addr.neighborhood AS client_address_neighborhood,
    addr.city       AS client_address_city,
    addr.state      AS client_address_state,
    addr.zip_code   AS client_address_zip
  FROM appointments a
  JOIN services s  ON s.id  = a.service_id
  JOIN users uc    ON uc.id = a.client_id
  JOIN users up    ON up.id = a.provider_id
  LEFT JOIN cards c ON c.id = a.card_id
  LEFT JOIN (
    SELECT * FROM addresses
    WHERE id IN (SELECT MIN(id) FROM addresses GROUP BY user_id)
  ) addr ON addr.user_id = a.client_id
`;

function parseDurationMinutes(duration) {
  if (!duration) return 60;
  const h = duration.match(/(\d+)h/);
  const m = duration.match(/(\d+)min/);
  const total = (h ? parseInt(h[1]) : 0) * 60 + (m ? parseInt(m[1]) : 0);
  return total > 0 ? total : 60;
}

// ── POST /appointments ────────────────────────────────────────────────────────

router.post('/', (req, res) => {
  if (req.user.role !== 'cliente') {
    return res.status(403).json({ error: 'Apenas clientes podem criar agendamentos' });
  }

  const { service_id, provider_id, scheduled_date, scheduled_time, payment_method, card_id } = req.body;

  if (!service_id || !provider_id || !scheduled_date || !scheduled_time || !payment_method) {
    return res.status(400).json({ error: 'service_id, provider_id, scheduled_date, scheduled_time e payment_method são obrigatórios' });
  }

  if (!['pix', 'cartao'].includes(payment_method)) {
    return res.status(400).json({ error: 'payment_method deve ser pix ou cartao' });
  }

  if (payment_method === 'cartao') {
    if (!card_id) return res.status(400).json({ error: 'card_id é obrigatório quando payment_method é cartao' });
    const card = db.prepare('SELECT id FROM cards WHERE id = ? AND user_id = ?').get(card_id, req.user.id);
    if (!card) return res.status(400).json({ error: 'Cartão não encontrado ou não pertence ao usuário' });
  }

  const service = db.prepare('SELECT * FROM services WHERE id = ? AND user_id = ?').get(service_id, provider_id);
  if (!service) return res.status(404).json({ error: 'Serviço não encontrado' });

  const conflict = db.prepare(
    "SELECT id FROM appointments WHERE provider_id = ? AND scheduled_date = ? AND scheduled_time = ? AND status = 'confirmado'"
  ).get(provider_id, scheduled_date, scheduled_time);
  if (conflict) return res.status(409).json({ error: 'Este horário já foi reservado. Escolha outro.' });

  const durationMinutes = parseDurationMinutes(service.duration);
  const totalPrice = service.price || 0;

  const result = db.prepare(`
    INSERT INTO appointments
      (client_id, provider_id, service_id, scheduled_date, scheduled_time, duration_minutes, payment_method, card_id, total_price)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(req.user.id, provider_id, service_id, scheduled_date, scheduled_time, durationMinutes, payment_method, card_id || null, totalPrice);

  const appt = db.prepare(APPOINTMENT_SELECT + ' WHERE a.id = ?').get(result.lastInsertRowid);
  res.status(201).json(appt);
});

// ── GET /appointments ─────────────────────────────────────────────────────────

router.get('/', (req, res) => {
  const field = req.user.role === 'prestador' ? 'a.provider_id' : 'a.client_id';
  const rows = db.prepare(
    APPOINTMENT_SELECT + ` WHERE ${field} = ? ORDER BY a.scheduled_date DESC, a.scheduled_time DESC`
  ).all(req.user.id);
  res.json(rows);
});

// ── GET /appointments/:id ─────────────────────────────────────────────────────

router.get('/:id', (req, res) => {
  const appt = db.prepare(APPOINTMENT_SELECT + ' WHERE a.id = ?').get(parseInt(req.params.id));
  if (!appt) return res.status(404).json({ error: 'Agendamento não encontrado' });

  if (appt.client_id !== req.user.id && appt.provider_id !== req.user.id) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  res.json(appt);
});

// ── PATCH /appointments/:id/cancel ────────────────────────────────────────────

router.patch('/:id/cancel', (req, res) => {
  const appt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(parseInt(req.params.id));
  if (!appt) return res.status(404).json({ error: 'Agendamento não encontrado' });

  if (appt.client_id !== req.user.id && appt.provider_id !== req.user.id) {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  if (appt.status !== 'confirmado') {
    return res.status(400).json({ error: 'Apenas agendamentos confirmados podem ser cancelados' });
  }

  db.prepare("UPDATE appointments SET status = 'cancelado' WHERE id = ?").run(appt.id);
  res.json({ message: 'Agendamento cancelado com sucesso' });
});

module.exports = router;
