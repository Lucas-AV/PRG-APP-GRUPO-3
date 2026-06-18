const bcrypt = require('bcryptjs');
const db = require('./database');

function dateOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function seed() {
  const existing = db.prepare("SELECT id FROM users WHERE email = 'carlos@example.com'").get();
  if (existing) {
    console.log('Banco já populado. Delete db/conecta.db e execute novamente para re-seed.');
    return;
  }

  const senha = bcrypt.hashSync('senha123', 10);

  const insertUser = db.prepare(
    'INSERT INTO users (name, email, phone, password, role, bio, years_experience, response_time, specialties, certifications) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );

  const carlos = insertUser.run(
    'Carlos Mendes', 'carlos@example.com', '(11) 98765-0001', senha, 'prestador',
    'Eletricista certificado com 10 anos de experiência em residências e comércios. Especializado em instalações de alta complexidade e sistemas de automação. Comprometido com segurança, precisão e transparência em cada serviço.',
    10, '< 1h',
    JSON.stringify([
      { icon: 'bolt', label: 'Instalações Elétricas Residenciais', wide: false },
      { icon: 'settings', label: 'Automação e Smart Home', wide: false },
      { icon: 'electrical-services', label: 'Projetos Elétricos de Alta Complexidade', wide: true },
    ]),
    JSON.stringify([
      { icon: 'workspace-premium', title: 'NR-10', subtitle: 'Segurança em Instalações e Serviços em Eletricidade' },
      { icon: 'electric-bolt', title: 'Técnico em Eletrotécnica', subtitle: 'SENAI — Formação Técnica em Instalações Elétricas' },
    ])
  );

  const ana = insertUser.run(
    'Ana Ferreira', 'ana@example.com', '(21) 98765-0002', senha, 'prestador',
    'Profissional de limpeza com 6 anos no mercado, especializada em limpeza residencial, pós-obra e organização. Utilizo produtos profissionais de alta qualidade e me dedico a entregar ambientes impecáveis. Pontualidade e discrição são meus diferenciais.',
    6, '< 30 min',
    JSON.stringify([
      { icon: 'cleaning-services', label: 'Limpeza Profunda Residencial', wide: false },
      { icon: 'home', label: 'Organização de Ambientes', wide: false },
      { icon: 'recycling', label: 'Limpeza Pós-Obra e Reformas', wide: true },
    ]),
    JSON.stringify([
      { icon: 'workspace-premium', title: 'Especialista em Limpeza Industrial', subtitle: 'Curso Profissionalizante — SENAC' },
      { icon: 'eco', title: 'Agente de Higiene Ambiental', subtitle: 'Certificação em Produtos Biodegradáveis e Sustentabilidade' },
    ])
  );

  const roberto = insertUser.run(
    'Roberto Alves', 'roberto@example.com', '(31) 98765-0003', senha, 'prestador',
    'Encanador com 14 anos de experiência em reparos, instalações e diagnósticos hidráulicos. Atendo emergências com agilidade e trabalho com garantia em todos os serviços. Meu objetivo é resolver seu problema de forma eficiente e duradoura.',
    14, '< 2h',
    JSON.stringify([
      { icon: 'water', label: 'Reparos Hidráulicos Emergenciais', wide: false },
      { icon: 'plumbing', label: 'Instalações Sanitárias', wide: false },
      { icon: 'build', label: 'Manutenção Preventiva Hidráulica', wide: true },
    ]),
    JSON.stringify([
      { icon: 'workspace-premium', title: 'Técnico em Hidráulica', subtitle: 'SENAI — Instalações Hidrossanitárias' },
      { icon: 'plumbing', title: 'ABNT NBR 5626', subtitle: 'Norma Técnica para Instalações Prediais de Água Fria' },
    ])
  );

  const juliana = insertUser.run(
    'Juliana Costa', 'juliana@example.com', '(41) 98765-0004', senha, 'prestador',
    'Professora particular com 8 anos de experiência em matemática, inglês e português. Abordagem personalizada para cada aluno, do fundamental ao preparatório para concursos. Já ajudei mais de 200 alunos a alcançar seus objetivos acadêmicos.',
    8, '< 15 min',
    JSON.stringify([
      { icon: 'calculate', label: 'Matemática e Ciências Exatas', wide: false },
      { icon: 'language', label: 'Inglês Conversacional', wide: false },
      { icon: 'menu-book', label: 'Preparatório para Concursos e ENEM', wide: true },
    ]),
    JSON.stringify([
      { icon: 'school', title: 'Licenciatura em Matemática', subtitle: 'Universidade Estadual — Formação de Professores' },
      { icon: 'language', title: 'Cambridge English B2', subtitle: 'Upper-Intermediate — Certificado pela Cambridge Assessment' },
    ])
  );

  const marcos = insertUser.run(
    'Marcos Peixoto', 'marcos@example.com', '(11) 98765-0005', senha, 'prestador',
    'Fotógrafo profissional com 5 anos de experiência em ensaios, eventos e fotografia de produto. Possuo equipamento de ponta e um olhar criativo para capturar os momentos mais especiais. Entrego fotos editadas com qualidade e agilidade.',
    5, '< 1h',
    JSON.stringify([
      { icon: 'photo-camera', label: 'Ensaios Fotográficos', wide: false },
      { icon: 'celebration', label: 'Fotografia de Eventos', wide: false },
      { icon: 'edit', label: 'Edição e Tratamento de Imagens', wide: true },
    ]),
    JSON.stringify([
      { icon: 'photo-camera', title: 'Técnico em Fotografia', subtitle: 'Escola de Artes Visuais — Iluminação e Composição' },
      { icon: 'workspace-premium', title: 'Adobe Certified Professional', subtitle: 'Lightroom e Photoshop para Fotografia Profissional' },
    ])
  );

  const fernanda = insertUser.run(
    'Fernanda Lima', 'fernanda@example.com', '(11) 98765-0006', senha, 'prestador',
    'Cabeleireira e maquiadora com 9 anos de experiência. Especializada em coloração, cortes femininos e maquiagem para eventos. Trabalho com produtos de marcas renomadas e estou sempre atualizada com as tendências do mercado.',
    9, '< 20 min',
    JSON.stringify([
      { icon: 'face', label: 'Coloração e Tratamentos Capilares', wide: false },
      { icon: 'brush', label: 'Maquiagem para Eventos', wide: false },
      { icon: 'spa', label: 'Nail Design e Estética', wide: true },
    ]),
    JSON.stringify([
      { icon: 'workspace-premium', title: 'Técnica em Cabeleireiro', subtitle: 'SENAC — Colorimetria e Técnicas de Corte' },
      { icon: 'brush', title: 'Maquiadora Profissional Certificada', subtitle: 'Instituto Brasileiro de Beleza — Maquiagem Artística e Social' },
    ])
  );

  const insertClient = db.prepare(
    'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)'
  );

  const beatriz = insertClient.run('Beatriz Oliveira', 'beatriz@example.com', '(11) 97777-0001', senha, 'cliente');
  const pedro   = insertClient.run('Pedro Santos',    'pedro@example.com',   '(21) 97777-0002', senha, 'cliente');
  const larissa = insertClient.run('Larissa Nunes',   'larissa@example.com', '(31) 97777-0003', senha, 'cliente');
  const diego   = insertClient.run('Diego Carvalho',  'diego@example.com',   '(41) 97777-0004', senha, 'cliente');

  const cId = (r) => r.lastInsertRowid;

  const insertAddr = db.prepare(
    'INSERT INTO addresses (user_id, type, zip_code, street, number, neighborhood, city, state) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );

  insertAddr.run(cId(carlos),   'casa', '01310-100', 'Av. Ipiranga',               '1500', 'República',       'São Paulo',      'SP');
  insertAddr.run(cId(ana),      'casa', '22290-040', 'Rua Voluntários da Pátria',  '340',  'Botafogo',        'Rio de Janeiro', 'RJ');
  insertAddr.run(cId(roberto),  'casa', '30120-010', 'Av. dos Andradas',           '700',  'Centro',          'Belo Horizonte', 'MG');
  insertAddr.run(cId(juliana),  'casa', '80420-070', 'Rua Marechal Deodoro',       '250',  'Batel',           'Curitiba',       'PR');
  insertAddr.run(cId(marcos),   'casa', '05422-010', 'Rua Jerônimo de Albuquerque','90',   'Pinheiros',       'São Paulo',      'SP');
  insertAddr.run(cId(fernanda), 'casa', '01310-200', 'Av. Paulista',               '2000', 'Bela Vista',      'São Paulo',      'SP');
  insertAddr.run(cId(beatriz),  'casa', '01454-001', 'Rua das Flores',             '123',  'Jardim Paulista', 'São Paulo',      'SP');
  insertAddr.run(cId(pedro),    'casa', '22010-001', 'Av. Atlântica',              '500',  'Copacabana',      'Rio de Janeiro', 'RJ');
  insertAddr.run(cId(larissa),  'casa', '30112-010', 'Rua Bahia',                  '220',  'Savassi',         'Belo Horizonte', 'MG');
  insertAddr.run(cId(diego),    'casa', '80020-010', 'Rua XV de Novembro',         '88',   'Centro',          'Curitiba',       'PR');

  const insertCard = db.prepare(
    'INSERT INTO cards (user_id, brand, last_four, expiry_month, expiry_year) VALUES (?, ?, ?, ?, ?)'
  );

  insertCard.run(cId(beatriz), 'Visa',       '4242', '12', '2029');
  insertCard.run(cId(pedro),   'Mastercard', '5555', '08', '2028');
  insertCard.run(cId(larissa), 'Visa',       '1234', '03', '2027');
  insertCard.run(cId(diego),   'Elo',        '9876', '11', '2026');

  const insertSvc = db.prepare(
    'INSERT INTO services (user_id, name, category, price, price_type, duration, description, status, included_items) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );

  const ELEC = JSON.stringify(['Materiais de fiação certificados inclusos','Execução por profissional com certificação NR-10','Teste de funcionamento ao final do serviço','Relatório técnico da instalação']);
  const CLEAN = JSON.stringify(['Produtos de limpeza profissionais inclusos','Aspiração e limpeza de todos os cômodos','Higienização completa de banheiros e cozinha','Descarte correto de resíduos']);
  const PLUMB = JSON.stringify(['Diagnóstico gratuito incluído','Materiais básicos de encanamento inclusos','Garantia de 3 meses no serviço','Teste de pressão ao finalizar']);
  const EDU = JSON.stringify(['Material didático digital enviado por e-mail','Exercícios personalizados por nível','Acompanhamento via WhatsApp entre aulas','Relatório de progresso mensal']);
  const PHOTO = JSON.stringify(['Edição profissional das fotos selecionadas','Entrega em alta resolução via Google Drive','Álbum digital com até 50 fotos','Uso autorizado para redes sociais pessoais']);
  const BEAUTY = JSON.stringify(['Produtos profissionais de marcas renomadas inclusos','Higienização completa dos equipamentos','Dicas personalizadas de manutenção','Sugestão de looks e estilos']);

  const sCarlos1 = insertSvc.run(cId(carlos), 'Instalação Elétrica Residencial',      'Eletricidade', 180,  'fixo',        '2h',        'Instalação completa de pontos elétricos, tomadas, interruptores e quadro de distribuição em residências e apartamentos.', 'ativo', ELEC);
  const sCarlos2 = insertSvc.run(cId(carlos), 'Troca de Disjuntores e Quadro',        'Eletricidade', 120,  'fixo',        '1h',        'Substituição de disjuntores danificados, atualização de quadro elétrico e verificação de aterramento.', 'ativo', ELEC);
  const sCarlos3 = insertSvc.run(cId(carlos), 'Instalação de Tomadas e Interruptores','Eletricidade', 80,   'fixo',        '1h',        'Instalação ou troca de tomadas, interruptores, espelhos e pontos de iluminação.', 'ativo', ELEC);
  const sCarlos4 = insertSvc.run(cId(carlos), 'Projeto Elétrico Residencial',         'Eletricidade', 350,  'a_partir_de', 'A combinar','Elaboração de projeto elétrico completo, dimensionamento de cargas e aprovação em concessionária.', 'ativo', ELEC);
  const sCarlos5 = insertSvc.run(cId(carlos), 'Manutenção Preventiva Elétrica',       'Eletricidade', 200,  'fixo',        '3h',        'Vistoria completa da instalação elétrica, identificação de falhas e adequação às normas da ABNT NBR 5410.', 'ativo', ELEC);

  const sAna1 = insertSvc.run(cId(ana), 'Limpeza Residencial Completa', 'Limpeza', 180, 'fixo',        '4h', 'Limpeza completa da casa ou apartamento, incluindo todos os cômodos, banheiros, cozinha e áreas comuns.', 'ativo', CLEAN);
  const sAna2 = insertSvc.run(cId(ana), 'Limpeza Pós-Obra',             'Limpeza', 350, 'a_partir_de', '6h', 'Limpeza especializada após reformas ou obras, incluindo remoção de resíduos, poeira de gesso e limpeza de vidros.', 'ativo', CLEAN);
  const sAna3 = insertSvc.run(cId(ana), 'Organização de Guarda-Roupas', 'Limpeza', 120, 'fixo',        '2h', 'Organização profissional de guarda-roupas, armários e closets com método KonMari adaptado.', 'ativo', CLEAN);
  const sAna4 = insertSvc.run(cId(ana), 'Limpeza de Estofados e Sofás', 'Limpeza', 150, 'fixo',        '2h', 'Higienização e limpeza de sofás, poltronas, colchões e cadeiras com equipamentos profissionais.', 'ativo', CLEAN);

  const sRoberto1 = insertSvc.run(cId(roberto), 'Desentupimento de Ralo e Vaso',    'Encanamento', 90,  'fixo',        '1h',       'Desentupimento de ralos, vasos sanitários, pias e ralos de chão com equipamento profissional.', 'ativo', PLUMB);
  const sRoberto2 = insertSvc.run(cId(roberto), 'Instalação de Chuveiro Elétrico',  'Encanamento', 150, 'fixo',        '2h',       'Instalação ou troca de chuveiro elétrico, incluindo verificação do circuito e teste de funcionamento.', 'ativo', PLUMB);
  const sRoberto3 = insertSvc.run(cId(roberto), 'Reparo de Vazamentos',             'Encanamento', 120, 'a_partir_de', '1h30min',  'Localização e reparo de vazamentos em tubulações, registros, metais e conexões hidráulicas.', 'ativo', PLUMB);
  const sRoberto4 = insertSvc.run(cId(roberto), 'Instalação de Torneiras e Metais', 'Encanamento', 100, 'fixo',        '1h',       'Instalação ou troca de torneiras, misturadores, sifões e demais metais sanitários.', 'ativo', PLUMB);
  const sRoberto5 = insertSvc.run(cId(roberto), "Instalação de Caixa d'Água",       'Encanamento', 280, 'a_partir_de', 'A combinar',"Instalação ou substituição de caixa d'água, incluindo boia, tampa e conexões de entrada e saída.", 'ativo', PLUMB);

  const sJuliana1 = insertSvc.run(cId(juliana), 'Aula de Matemática',          'Educação', 70, 'fixo',        '1h',      'Aulas de matemática do fundamental ao ensino médio, com foco em resolução de problemas e preparação para provas.', 'ativo', EDU);
  const sJuliana2 = insertSvc.run(cId(juliana), 'Aula de Inglês',              'Educação', 80, 'fixo',        '1h',      'Aulas de inglês para todos os níveis: conversação, gramática, listening e preparação para exames internacionais.', 'ativo', EDU);
  const sJuliana3 = insertSvc.run(cId(juliana), 'Aula de Português e Redação', 'Educação', 65, 'fixo',        '1h',      'Aulas de português e redação com foco em gramática, interpretação de texto e produção de dissertações.', 'ativo', EDU);
  const sJuliana4 = insertSvc.run(cId(juliana), 'Preparatório para Concursos', 'Educação', 90, 'a_partir_de', '1h30min', 'Preparação intensiva para concursos públicos, com foco nas disciplinas mais cobradas e resolução de questões anteriores.', 'ativo', EDU);

  const sMarcos1 = insertSvc.run(cId(marcos), 'Ensaio Fotográfico Individual', 'Fotografia', 350, 'fixo',        '2h',       'Ensaio fotográfico individual ou em casal em locação externa ou estúdio, com 30 fotos editadas.', 'ativo', PHOTO);
  const sMarcos2 = insertSvc.run(cId(marcos), 'Fotografia de Eventos',         'Fotografia', 800, 'a_partir_de', 'Diária',   'Cobertura fotográfica completa de eventos como aniversários, casamentos e formaturas.', 'ativo', PHOTO);
  const sMarcos3 = insertSvc.run(cId(marcos), 'Fotografia de Produto',         'Fotografia', 250, 'fixo',        '2h',       'Fotografia profissional de produtos para e-commerce, redes sociais e catálogos, com fundo adequado ao produto.', 'ativo', PHOTO);
  const sMarcos4 = insertSvc.run(cId(marcos), 'Edição de Fotos',               'Fotografia', 150, 'a_partir_de', 'A combinar','Edição e tratamento profissional de fotos: color grading, retoque, corte e padronização de estilo.', 'ativo', PHOTO);

  const sFernanda1 = insertSvc.run(cId(fernanda), 'Corte Feminino',         'Beleza', 80,  'fixo',        '1h',      'Corte feminino personalizado conforme o formato do rosto e preferência da cliente, com escova inclusa.', 'ativo', BEAUTY);
  const sFernanda2 = insertSvc.run(cId(fernanda), 'Coloração Completa',     'Beleza', 180, 'a_partir_de', '2h',      'Coloração completa com tinturas profissionais, incluindo lavagem, hidratação e finalização.', 'ativo', BEAUTY);
  const sFernanda3 = insertSvc.run(cId(fernanda), 'Manicure e Pedicure',    'Beleza', 70,  'fixo',        '1h30min', 'Manicure e pedicure completos com esmaltação em gel ou tradicional à escolha da cliente.', 'ativo', BEAUTY);
  const sFernanda4 = insertSvc.run(cId(fernanda), 'Maquiagem para Eventos', 'Beleza', 150, 'fixo',        '1h30min', 'Maquiagem profissional para festas, formaturas e eventos sociais, com produtos de longa duração.', 'ativo', BEAUTY);

  const insertAvail = db.prepare(
    'INSERT INTO availability (provider_id, day_of_week, start_time, end_time, is_active) VALUES (?, ?, ?, ?, ?)'
  );

  function setAvailability(providerId, schedule) {
    for (let day = 0; day <= 6; day++) {
      const s = schedule[day];
      if (s) insertAvail.run(providerId, day, s.start, s.end, 1);
      else   insertAvail.run(providerId, day, '08:00', '18:00', 0);
    }
  }

  setAvailability(cId(carlos),  { 1:{start:'08:00',end:'18:00'}, 2:{start:'08:00',end:'18:00'}, 3:{start:'08:00',end:'18:00'}, 4:{start:'08:00',end:'18:00'}, 5:{start:'08:00',end:'18:00'} });
  setAvailability(cId(ana),     { 1:{start:'09:00',end:'17:00'}, 2:{start:'09:00',end:'17:00'}, 3:{start:'09:00',end:'17:00'}, 4:{start:'09:00',end:'17:00'}, 5:{start:'09:00',end:'17:00'}, 6:{start:'09:00',end:'17:00'} });
  setAvailability(cId(roberto), { 1:{start:'07:00',end:'17:00'}, 2:{start:'07:00',end:'17:00'}, 3:{start:'07:00',end:'17:00'}, 4:{start:'07:00',end:'17:00'}, 5:{start:'07:00',end:'17:00'} });
  setAvailability(cId(juliana), { 1:{start:'14:00',end:'20:00'}, 2:{start:'14:00',end:'20:00'}, 3:{start:'14:00',end:'20:00'}, 4:{start:'14:00',end:'20:00'}, 5:{start:'14:00',end:'20:00'}, 6:{start:'09:00',end:'14:00'} });
  setAvailability(cId(marcos),  { 2:{start:'09:00',end:'19:00'}, 3:{start:'09:00',end:'19:00'}, 4:{start:'09:00',end:'19:00'}, 5:{start:'09:00',end:'19:00'}, 6:{start:'09:00',end:'19:00'} });
  setAvailability(cId(fernanda),{ 1:{start:'09:00',end:'18:00'}, 2:{start:'09:00',end:'18:00'}, 3:{start:'09:00',end:'18:00'}, 4:{start:'09:00',end:'18:00'}, 5:{start:'09:00',end:'18:00'}, 6:{start:'09:00',end:'18:00'} });

  const insertSub = db.prepare(
    "INSERT INTO subscriptions (user_id, plan_id, status, started_at, expires_at) VALUES (?, ?, 'ativa', datetime('now', ?), datetime('now', ?))"
  );

  const planBasico = db.prepare("SELECT id FROM plans WHERE name = 'Básico'").get();
  const planElite  = db.prepare("SELECT id FROM plans WHERE name = 'Elite Pro'").get();

  insertSub.run(cId(carlos),   planElite.id,  '-60 days', '+305 days');
  insertSub.run(cId(ana),      planBasico.id, '-30 days', '+335 days');
  insertSub.run(cId(roberto),  planElite.id,  '-90 days', '+275 days');
  insertSub.run(cId(juliana),  planBasico.id, '-15 days', '+350 days');
  insertSub.run(cId(marcos),   planElite.id,  '-45 days', '+320 days');
  insertSub.run(cId(fernanda), planBasico.id, '-20 days', '+345 days');

  const insertAppt = db.prepare(`
    INSERT INTO appointments
      (client_id, provider_id, service_id, scheduled_date, scheduled_time, duration_minutes, status, payment_method, card_id, total_price)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertAppt.run(cId(beatriz), cId(carlos),   cId(sCarlos1),  dateOffset(-60), '09:00', 120, 'concluido', 'pix', null, 180);
  insertAppt.run(cId(beatriz), cId(carlos),   cId(sCarlos2),  dateOffset(-30), '10:00', 60,  'concluido', 'pix', null, 120);
  insertAppt.run(cId(beatriz), cId(ana),      cId(sAna1),     dateOffset(-45), '09:00', 240, 'concluido', 'pix', null, 180);
  insertAppt.run(cId(pedro),   cId(roberto),  cId(sRoberto1), dateOffset(-50), '14:00', 60,  'concluido', 'pix', null, 90);
  insertAppt.run(cId(pedro),   cId(roberto),  cId(sRoberto3), dateOffset(-20), '09:00', 90,  'concluido', 'pix', null, 120);
  insertAppt.run(cId(pedro),   cId(marcos),   cId(sMarcos1),  dateOffset(-35), '10:00', 120, 'concluido', 'pix', null, 350);
  insertAppt.run(cId(larissa), cId(juliana),  cId(sJuliana1), dateOffset(-70), '15:00', 60,  'concluido', 'pix', null, 70);
  insertAppt.run(cId(larissa), cId(juliana),  cId(sJuliana1), dateOffset(-40), '15:00', 60,  'concluido', 'pix', null, 70);
  insertAppt.run(cId(larissa), cId(juliana),  cId(sJuliana1), dateOffset(-10), '15:00', 60,  'concluido', 'pix', null, 70);
  insertAppt.run(cId(larissa), cId(fernanda), cId(sFernanda1),dateOffset(-25), '11:00', 60,  'concluido', 'pix', null, 80);
  insertAppt.run(cId(diego),   cId(carlos),   cId(sCarlos1),  dateOffset(-15), '14:00', 120, 'concluido', 'pix', null, 180);
  insertAppt.run(cId(diego),   cId(roberto),  cId(sRoberto2), dateOffset(-55), '09:00', 120, 'concluido', 'pix', null, 150);
  insertAppt.run(cId(beatriz), cId(fernanda), cId(sFernanda2),dateOffset(-80), '10:00', 120, 'concluido', 'pix', null, 180);
  insertAppt.run(cId(pedro),   cId(ana),      cId(sAna1),     dateOffset(-65), '09:00', 240, 'concluido', 'pix', null, 180);

  insertAppt.run(cId(beatriz), cId(marcos),   cId(sMarcos1),  dateOffset(-5),  '14:00', 120, 'cancelado', 'pix', null, 350);
  insertAppt.run(cId(pedro),   cId(fernanda), cId(sFernanda1),dateOffset(-8),  '11:00', 60,  'cancelado', 'pix', null, 80);
  insertAppt.run(cId(larissa), cId(carlos),   cId(sCarlos3),  dateOffset(-12), '09:00', 60,  'cancelado', 'pix', null, 80);

  insertAppt.run(cId(beatriz), cId(carlos),   cId(sCarlos5),  dateOffset(7),   '09:00', 180, 'confirmado', 'pix', null, 200);
  insertAppt.run(cId(beatriz), cId(ana),      cId(sAna2),     dateOffset(14),  '10:00', 360, 'confirmado', 'pix', null, 350);
  insertAppt.run(cId(pedro),   cId(roberto),  cId(sRoberto5), dateOffset(5),   '14:00', 60,  'confirmado', 'pix', null, 280);
  insertAppt.run(cId(pedro),   cId(marcos),   cId(sMarcos2),  dateOffset(21),  '09:00', 480, 'confirmado', 'pix', null, 800);
  insertAppt.run(cId(larissa), cId(juliana),  cId(sJuliana2), dateOffset(3),   '15:00', 60,  'confirmado', 'pix', null, 80);
  insertAppt.run(cId(larissa), cId(fernanda), cId(sFernanda3),dateOffset(10),  '11:00', 90,  'confirmado', 'pix', null, 70);
  insertAppt.run(cId(diego),   cId(carlos),   cId(sCarlos4),  dateOffset(12),  '14:00', 60,  'confirmado', 'pix', null, 350);
  insertAppt.run(cId(diego),   cId(ana),      cId(sAna3),     dateOffset(18),  '09:00', 120, 'confirmado', 'pix', null, 120);

  const insertReview = db.prepare(
    'INSERT INTO reviews (service_id, user_id, rating, comment) VALUES (?, ?, ?, ?)'
  );

  insertReview.run(cId(sCarlos1),  cId(beatriz), 5, 'Profissional excelente! Chegou no horário e resolveu tudo com rapidez. Serviço impecável, super recomendo.');
  insertReview.run(cId(sCarlos2),  cId(beatriz), 5, 'Mais uma vez ótimo serviço. O Carlos é muito caprichoso e deixa tudo funcionando perfeitamente.');
  insertReview.run(cId(sAna1),     cId(beatriz), 5, 'Serviço incrível! A Ana é muito atenciosa e caprichosa. A casa ficou linda, melhor limpeza que já tive!');
  insertReview.run(cId(sRoberto1), cId(pedro),   4, 'Bom serviço, resolveu o desentupimento rápido. Só demorou um pouco para confirmar o horário, mas o trabalho foi bem feito.');
  insertReview.run(cId(sRoberto3), cId(pedro),   5, 'Excelente! O Roberto localizou o vazamento rapidamente e fez o reparo com perfeição. Com certeza vou chamar de novo.');
  insertReview.run(cId(sMarcos1),  cId(pedro),   5, 'Fotos maravilhosas! O Marcos tem um olhar incrível e soube capturar os melhores momentos. Resultado acima do esperado.');
  insertReview.run(cId(sJuliana1), cId(larissa), 5, 'Professora incrível! Muito didática e paciente. Já melhorei muito em matemática desde que comecei as aulas.');
  insertReview.run(cId(sJuliana1), cId(larissa), 5, 'Continuando as aulas e cada vez mais satisfeita. A Juliana adapta o conteúdo perfeitamente ao meu ritmo.');
  insertReview.run(cId(sJuliana1), cId(larissa), 5, 'Em poucos meses consegui um resultado que não tinha alcançado em anos de estudo sozinha. Professora excepcional!');
  insertReview.run(cId(sFernanda1),cId(larissa), 4, 'Gostei muito do corte! A Fernanda entende bem o que o cliente quer. Só o agendamento inicial foi um pouco confuso.');
  insertReview.run(cId(sCarlos1),  cId(diego),   5, 'Ótimo trabalho! O Carlos foi pontual e muito profissional. A instalação ficou perfeita e dentro do prazo.');
  insertReview.run(cId(sRoberto2), cId(diego),   5, 'Serviço excelente! Roberto instalou o chuveiro com agilidade e qualidade. Sem nenhuma goteira ou problema. Super indicado!');
  insertReview.run(cId(sFernanda2),cId(beatriz), 5, 'A coloração ficou espetacular! A Fernanda tem muito talento e usa produtos de ótima qualidade. Saí amando o resultado.');
  insertReview.run(cId(sAna1),     cId(pedro),   4, 'Limpeza bem feita, só chegou um pouco depois do horário combinado. O resultado final foi muito bom, casa impecável.');

  const insertTx = db.prepare(
    "INSERT INTO transactions (user_id, service_name, provider_name, amount, status, paid_at) VALUES (?, ?, ?, ?, 'concluido', ?)"
  );

  insertTx.run(cId(beatriz), 'Instalação Elétrica Residencial', 'Carlos Mendes',  180, dateOffset(-60));
  insertTx.run(cId(beatriz), 'Troca de Disjuntores e Quadro',   'Carlos Mendes',  120, dateOffset(-30));
  insertTx.run(cId(beatriz), 'Limpeza Residencial Completa',    'Ana Ferreira',   180, dateOffset(-45));
  insertTx.run(cId(pedro),   'Desentupimento de Ralo e Vaso',   'Roberto Alves',  90,  dateOffset(-50));
  insertTx.run(cId(pedro),   'Reparo de Vazamentos',            'Roberto Alves',  120, dateOffset(-20));
  insertTx.run(cId(pedro),   'Ensaio Fotográfico Individual',   'Marcos Peixoto', 350, dateOffset(-35));
  insertTx.run(cId(larissa), 'Aula de Matemática',              'Juliana Costa',  70,  dateOffset(-70));
  insertTx.run(cId(larissa), 'Aula de Matemática',              'Juliana Costa',  70,  dateOffset(-40));
  insertTx.run(cId(larissa), 'Aula de Matemática',              'Juliana Costa',  70,  dateOffset(-10));
  insertTx.run(cId(larissa), 'Corte Feminino',                  'Fernanda Lima',  80,  dateOffset(-25));
  insertTx.run(cId(diego),   'Instalação Elétrica Residencial', 'Carlos Mendes',  180, dateOffset(-15));
  insertTx.run(cId(diego),   'Instalação de Chuveiro Elétrico', 'Roberto Alves',  150, dateOffset(-55));
  insertTx.run(cId(beatriz), 'Coloração Completa',              'Fernanda Lima',  180, dateOffset(-80));
  insertTx.run(cId(pedro),   'Limpeza Residencial Completa',    'Ana Ferreira',   180, dateOffset(-65));

  db.prepare('UPDATE users SET onboarding_completed = 1').run();

  console.log('\n✅ Seed concluído com sucesso!\n');
  console.log('PRESTADORES (senha: senha123)');
  console.log('  carlos@example.com | ana@example.com | roberto@example.com');
  console.log('  juliana@example.com | marcos@example.com | fernanda@example.com');
  console.log('CLIENTES (senha: senha123)');
  console.log('  beatriz@example.com | pedro@example.com | larissa@example.com | diego@example.com');
}

seed();
