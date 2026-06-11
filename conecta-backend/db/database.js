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

// Migration: adiciona google_id se ainda não existir
const userCols = db.pragma('table_info(users)').map(c => c.name);
if (!userCols.includes('google_id')) {
  db.exec('ALTER TABLE users ADD COLUMN google_id TEXT');
}

module.exports = db;
