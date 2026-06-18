const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'conecta.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'cliente',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    category TEXT,
    price REAL,
    price_type TEXT DEFAULT 'fixo',
    duration TEXT,
    description TEXT,
    status TEXT DEFAULT 'rascunho',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS addresses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'casa',
    zip_code TEXT,
    street TEXT NOT NULL,
    number TEXT,
    complement TEXT,
    neighborhood TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    provider_name TEXT,
    amount REAL NOT NULL,
    status TEXT DEFAULT 'concluido',
    paid_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    brand TEXT NOT NULL,
    last_four TEXT NOT NULL,
    expiry_month TEXT NOT NULL,
    expiry_year TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    price REAL NOT NULL DEFAULT 0,
    billing_cycle TEXT NOT NULL DEFAULT 'mensal',
    features TEXT NOT NULL DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL REFERENCES plans(id),
    status TEXT NOT NULL DEFAULT 'ativa',
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    UNIQUE(user_id)
  );

  CREATE TABLE IF NOT EXISTS availability (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 0 AND 6),
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    UNIQUE(provider_id, day_of_week)
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    scheduled_date TEXT NOT NULL,
    scheduled_time TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmado' CHECK(status IN ('confirmado','cancelado','concluido')),
    payment_method TEXT NOT NULL CHECK(payment_method IN ('pix','cartao')),
    card_id INTEGER REFERENCES cards(id) ON DELETE SET NULL,
    total_price REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS service_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS coupons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    discount_percent REAL,
    discount_value REAL,
    expiration_date TEXT,
    description TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS provider_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, type)
  );
`);

const plansCount = db.prepare('SELECT COUNT(*) as n FROM plans').get();
if (plansCount.n === 0) {
  const insertPlan = db.prepare(
    'INSERT INTO plans (name, role, price, billing_cycle, features) VALUES (?, ?, ?, ?, ?)'
  );
  const seedPlans = db.transaction(() => {
    insertPlan.run('Free', 'cliente', 0, 'mensal', JSON.stringify([
      'Até 5 agendamentos por mês',
      'Acesso ao catálogo de serviços',
      'Suporte por e-mail',
    ]));
    insertPlan.run('Conecta Plus', 'cliente', 19.90, 'mensal', JSON.stringify([
      'Agendamentos ilimitados',
      'Prioridade no atendimento',
      'Suporte prioritário 24/7',
      'Descontos exclusivos',
    ]));
    insertPlan.run('Básico', 'prestador', 0, 'mensal', JSON.stringify([
      'Cadastro de até 3 serviços',
      'Taxa de intermediação de 20%',
      'Perfil padrão na busca',
      'Dashboard básico',
    ]));
    insertPlan.run('Elite Pro', 'prestador', 49.90, 'mensal', JSON.stringify([
      'Serviços ilimitados',
      'Taxa de intermediação de 12%',
      'Prioridade nas buscas',
      'Dashboard completo com exportação',
      'Selo de verificado',
    ]));
  });
  seedPlans();
}

const couponsCount = db.prepare('SELECT COUNT(*) as n FROM coupons').get();
if (couponsCount.n === 0) {
  const insertCoupon = db.prepare(
    'INSERT INTO coupons (code, discount_percent, discount_value, description, is_active) VALUES (?, ?, ?, ?, ?)'
  );
  const seedCoupons = db.transaction(() => {
    insertCoupon.run('SEVGEN20', 20, null, '20% de desconto no próximo serviço', 1);
    insertCoupon.run('CONECTA50', 50, null, '50% de desconto no primeiro mês', 1);
    insertCoupon.run('BOASVINDAS10', null, 10, 'R$ 10,00 de desconto de boas-vindas', 1);
  });
  seedCoupons();
}

// ── Schema Migrations ─────────────────────────────────────────────────────────
// Idempotentes: SQLite lança erro se a coluna já existe; ignoramos silenciosamente.
const schemaMigrations = [
  'ALTER TABLE users ADD COLUMN avatar TEXT',
  'ALTER TABLE users ADD COLUMN bio TEXT',
  'ALTER TABLE users ADD COLUMN years_experience INTEGER',
  'ALTER TABLE users ADD COLUMN response_time TEXT',
  'ALTER TABLE users ADD COLUMN specialties TEXT',
  'ALTER TABLE users ADD COLUMN certifications TEXT',
  'ALTER TABLE services ADD COLUMN included_items TEXT',
];

for (const sql of schemaMigrations) {
  try { db.exec(sql); } catch (_) { /* coluna já existe */ }
}
// Migrations idempotentes para colunas adicionadas em entregas posteriores
function addColumnIfMissing(table, column, definition) {
  const cols = db.pragma(`table_info(${table})`).map((c) => c.name);
  if (!cols.includes(column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

// users.google_id (login com Google)
addColumnIfMissing('users', 'google_id', 'TEXT');
// users.avatar_url (upload de foto de perfil)
addColumnIfMissing('users', 'avatar_url', 'TEXT');
// users.onboarding_completed (status do onboarding)
addColumnIfMissing('users', 'onboarding_completed', 'INTEGER DEFAULT 0');
// transactions.* (integração com MercadoPago)
addColumnIfMissing('transactions', 'mercadopago_payment_id', 'TEXT');
addColumnIfMissing('transactions', 'external_reference', 'TEXT');
addColumnIfMissing('transactions', 'payment_method', 'TEXT');

module.exports = db;
