const express = require('express');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Configuração do MercadoPago.
// Sem o token o módulo carrega, mas qualquer chamada à API retorna 503.
const MP_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
const mpClient = MP_TOKEN ? new MercadoPagoConfig({ accessToken: MP_TOKEN }) : null;

function mpUnavailable(res) {
  return res
    .status(503)
    .json({ error: 'MERCADOPAGO_ACCESS_TOKEN não configurado no servidor' });
}

/**
 * @swagger
 * /payments/preference:
 *   post:
 *     summary: Cria uma preference de pagamento no MercadoPago para um serviço
 *     description: |
 *       Gera uma preference no MP e cria uma transação pendente no banco com o
 *       external_reference vinculado à preference. O cliente abre o init_point retornado
 *       e, quando o pagamento muda de status, o webhook atualiza a transação.
 *     tags: [Pagamentos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [service_id]
 *             properties:
 *               service_id:
 *                 type: integer
 *               payment_method:
 *                 type: string
 *                 enum: [pix, cartao]
 *                 example: pix
 *     responses:
 *       201:
 *         description: Preference criada
 *       404:
 *         description: Serviço não encontrado
 *       503:
 *         description: MercadoPago não configurado
 */
router.post('/preference', authMiddleware, async (req, res) => {
  if (!mpClient) return mpUnavailable(res);

  const { service_id, payment_method } = req.body;
  if (!service_id) return res.status(400).json({ error: 'service_id é obrigatório' });

  const service = db
    .prepare(
      `SELECT s.*, u.name AS provider_name
         FROM services s
         JOIN users u ON u.id = s.user_id
         WHERE s.id = ?`
    )
    .get(service_id);
  if (!service) return res.status(404).json({ error: 'Serviço não encontrado' });
  if (!service.price || service.price <= 0) {
    return res.status(400).json({ error: 'Serviço sem preço definido' });
  }

  const externalReference = `tx-${req.user.id}-${service.id}-${Date.now()}`;

  // Cria a transação pendente já com a referência. Quando o webhook chega
  // localizamos a transação pelo external_reference.
  const result = db
    .prepare(
      `INSERT INTO transactions
         (user_id, service_name, provider_name, amount, status, external_reference, payment_method)
       VALUES (?, ?, ?, ?, 'pendente', ?, ?)`
    )
    .run(
      req.user.id,
      service.name,
      service.provider_name,
      service.price,
      externalReference,
      payment_method || null
    );

  const preferenceBody = {
    items: [
      {
        id: String(service.id),
        title: service.name,
        quantity: 1,
        unit_price: Number(service.price),
        currency_id: 'BRL',
      },
    ],
    external_reference: externalReference,
    metadata: { transaction_id: result.lastInsertRowid, user_id: req.user.id },
  };

  // Filtra métodos quando o cliente escolheu Pix explicitamente.
  if (payment_method === 'pix') {
    preferenceBody.payment_methods = {
      excluded_payment_types: [
        { id: 'credit_card' },
        { id: 'debit_card' },
        { id: 'ticket' },
      ],
    };
  } else if (payment_method === 'cartao') {
    preferenceBody.payment_methods = {
      excluded_payment_types: [{ id: 'ticket' }, { id: 'bank_transfer' }],
    };
  }

  try {
    const preference = await new Preference(mpClient).create({ body: preferenceBody });
    return res.status(201).json({
      transaction_id: result.lastInsertRowid,
      preference_id: preference.id,
      init_point: preference.init_point,
      sandbox_init_point: preference.sandbox_init_point,
      external_reference: externalReference,
    });
  } catch (err) {
    // Reverte a transação pendente — a preference não foi criada
    db.prepare('DELETE FROM transactions WHERE id = ?').run(result.lastInsertRowid);
    console.error('[MP] Erro ao criar preference:', err?.message);
    return res.status(502).json({ error: 'Falha ao criar preference no MercadoPago' });
  }
});

/**
 * @swagger
 * /payments/webhook:
 *   post:
 *     summary: Webhook do MercadoPago (notificação de pagamento)
 *     description: |
 *       Endpoint chamado pelo MercadoPago quando o status de um pagamento muda.
 *       Não exige token JWT — o MP autentica via assinatura, que pode ser
 *       configurada nas variáveis do servidor.
 *     tags: [Pagamentos]
 *     responses:
 *       200:
 *         description: Notificação processada
 */
router.post('/webhook', async (req, res) => {
  // Sempre responde 200 rápido, mesmo se houver problema interno —
  // o MP reenvia em caso de erro, e queremos evitar timeouts.
  res.status(200).json({ received: true });

  if (!mpClient) {
    console.warn('[MP webhook] ignorado: MERCADOPAGO_ACCESS_TOKEN ausente');
    return;
  }

  const topic = req.body?.type || req.query?.type || req.query?.topic;
  const paymentId = req.body?.data?.id || req.query?.id || req.query?.['data.id'];

  if (topic !== 'payment' || !paymentId) return;

  try {
    const payment = await new Payment(mpClient).get({ id: paymentId });
    const ref = payment.external_reference;
    if (!ref) return;

    const status = mpStatusToInternal(payment.status);

    db.prepare(
      `UPDATE transactions
          SET status = ?,
              mercadopago_payment_id = ?,
              payment_method = COALESCE(payment_method, ?),
              paid_at = CASE WHEN ? = 'concluido' THEN CURRENT_TIMESTAMP ELSE paid_at END
        WHERE external_reference = ?`
    ).run(
      status,
      String(payment.id),
      mpPaymentTypeToInternal(payment.payment_type_id),
      status,
      ref
    );
  } catch (err) {
    console.error('[MP webhook] falhou ao consultar payment', paymentId, err?.message);
  }
});

function mpStatusToInternal(mpStatus) {
  switch (mpStatus) {
    case 'approved':
      return 'concluido';
    case 'pending':
    case 'in_process':
    case 'authorized':
      return 'pendente';
    case 'rejected':
    case 'cancelled':
    case 'refunded':
    case 'charged_back':
      return 'cancelado';
    default:
      return 'pendente';
  }
}

function mpPaymentTypeToInternal(type) {
  if (!type) return null;
  if (type === 'credit_card' || type === 'debit_card') return 'cartao';
  if (type === 'bank_transfer') return 'pix';
  return type;
}

/**
 * @swagger
 * /payments/coupons/validate:
 *   post:
 *     summary: Valida um cupom de desconto
 *     tags: [Pagamentos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code:
 *                 type: string
 *                 example: SEVGEN20
 *     responses:
 *       200:
 *         description: Cupom válido
 *       400:
 *         description: Cupom inválido, expirado ou inativo
 */
router.post('/coupons/validate', authMiddleware, (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Código do cupom é obrigatório' });

  const coupon = db.prepare('SELECT * FROM coupons WHERE code = ?').get(code.trim().toUpperCase());
  if (!coupon) {
    return res.status(400).json({ error: 'Cupom inválido ou não encontrado' });
  }

  if (coupon.is_active === 0) {
    return res.status(400).json({ error: 'Este cupom não está mais ativo' });
  }

  if (coupon.expiration_date) {
    const expDate = new Date(coupon.expiration_date);
    if (expDate < new Date()) {
      return res.status(400).json({ error: 'Este cupom já expirou' });
    }
  }

  return res.json({
    id: coupon.id,
    code: coupon.code,
    discount_percent: coupon.discount_percent,
    discount_value: coupon.discount_value,
    description: coupon.description,
  });
});

module.exports = router;
