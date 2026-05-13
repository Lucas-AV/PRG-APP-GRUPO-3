const bcrypt = require('bcryptjs');
const db = require('./database');

function seed() {
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get('joao@example.com');
  if (existingUser) {
    console.log('Banco já populado. Nada a fazer.');
    return;
  }

  const senhaHash = bcrypt.hashSync('senha123', 10);

  const insertUser = db.prepare(
    'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)'
  );

  const joao = insertUser.run(
    'João Silva',
    'joao@example.com',
    '(11) 99999-0001',
    senhaHash,
    'prestador'
  );

  insertUser.run(
    'Maria Souza',
    'maria@example.com',
    '(11) 99999-0002',
    senhaHash,
    'cliente'
  );

  const insertService = db.prepare(`
    INSERT INTO services (user_id, name, category, price, price_type, duration, description, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertService.run(
    joao.lastInsertRowid,
    'Fotografia de Casamento Premium',
    'Eventos e Festas',
    2500.0,
    'a_partir_de',
    'Diária',
    'Cobertura completa do evento com edição profissional e entrega de álbum digital.',
    'ativo'
  );

  insertService.run(
    joao.lastInsertRowid,
    'Ensaio Fotográfico',
    'Eventos e Festas',
    400.0,
    'fixo',
    '2h',
    'Ensaio individual ou em casal em locação externa com 30 fotos editadas.',
    'ativo'
  );

  insertService.run(
    joao.lastInsertRowid,
    'Edição de Vídeo',
    'Tecnologia e Design',
    300.0,
    'a_partir_de',
    'A combinar',
    'Edição de vídeos com trilha sonora, cortes e color grading profissional.',
    'rascunho'
  );

  console.log('Seed concluído!');
  console.log('');
  console.log('Usuários criados:');
  console.log('  joao@example.com  | senha: senha123 | role: prestador');
  console.log('  maria@example.com | senha: senha123 | role: cliente');
  console.log('');
  console.log('3 serviços vinculados ao João.');
}

seed();
