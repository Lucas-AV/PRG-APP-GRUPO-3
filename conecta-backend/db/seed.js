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
  // Avatar de exemplo (URL pública). Quando o usuário fizer upload pela
  // rota /uploads/avatar, este valor é sobrescrito com a URL local.
  db.prepare('UPDATE users SET avatar_url = ? WHERE id = ?').run(
    'https://i.pravatar.cc/200?img=12',
    joao.lastInsertRowid
  );

  const maria = insertUser.run(
    'Maria Souza',
    'maria@example.com',
    '(11) 99999-0002',
    senhaHash,
    'cliente'
  );
  db.prepare('UPDATE users SET avatar_url = ? WHERE id = ?').run(
    'https://i.pravatar.cc/200?img=47',
    maria.lastInsertRowid
  );

  const insertService = db.prepare(`
    INSERT INTO services (user_id, name, category, price, price_type, duration, description, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const casamento = insertService.run(
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

  const insertAddress = db.prepare(`
    INSERT INTO addresses (user_id, type, zip_code, street, number, complement, neighborhood, city, state)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertAddress.run(
    joao.lastInsertRowid,
    'casa',
    '01310-100',
    'Av. Paulista',
    '1000',
    'Apto 52',
    'Bela Vista',
    'São Paulo',
    'SP'
  );

  insertAddress.run(
    joao.lastInsertRowid,
    'trabalho',
    '04538-133',
    'Av. Brigadeiro Faria Lima',
    '3477',
    '12º andar',
    'Itaim Bibi',
    'São Paulo',
    'SP'
  );

  insertAddress.run(
    maria.lastInsertRowid,
    'casa',
    '20040-002',
    'Rua da Assembleia',
    '10',
    null,
    'Centro',
    'Rio de Janeiro',
    'RJ'
  );

  // Imagens de exemplo para o serviço de casamento (URLs públicas, ilustrativas)
  const insertImage = db.prepare(
    'INSERT INTO service_images (service_id, url) VALUES (?, ?)'
  );
  insertImage.run(
    casamento.lastInsertRowid,
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=800'
  );
  insertImage.run(
    casamento.lastInsertRowid,
    'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800'
  );

  const insertTransaction = db.prepare(`
    INSERT INTO transactions
      (user_id, service_name, provider_name, amount, status,
       mercadopago_payment_id, external_reference, payment_method)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertTransaction.run(
    maria.lastInsertRowid,
    'Ensaio Fotográfico',
    'João Silva',
    400.0,
    'concluido',
    '1234567890',
    'tx-seed-1',
    'cartao'
  );

  insertTransaction.run(
    maria.lastInsertRowid,
    'Fotografia de Casamento Premium',
    'João Silva',
    2500.0,
    'pendente',
    null,
    'tx-seed-2',
    'pix'
  );

  insertTransaction.run(
    maria.lastInsertRowid,
    'Edição de Vídeo',
    'João Silva',
    300.0,
    'cancelado',
    '9876543210',
    'tx-seed-3',
    'cartao'
  );

  insertTransaction.run(
    joao.lastInsertRowid,
    'Mentoria de Fotografia',
    'Estúdio Lente Viva',
    150.0,
    'concluido',
    null,
    'tx-seed-4',
    null
  );

  console.log('Seed concluído!');
  console.log('');
  console.log('Usuários criados:');
  console.log('  joao@example.com  | senha: senha123 | role: prestador');
  console.log('  maria@example.com | senha: senha123 | role: cliente');
  console.log('');
  console.log('3 serviços vinculados ao João (1 com 2 imagens).');
  console.log('3 endereços (2 do João, 1 da Maria).');
  console.log('4 transações (3 da Maria, 1 do João) com campos do MercadoPago.');
  console.log('Avatares de exemplo para João e Maria.');
}

seed();
