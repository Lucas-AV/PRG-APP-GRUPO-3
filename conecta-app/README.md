# Conecta — Marketplace de Serviços sob Demanda

Aplicativo mobile de prestação de serviços sob demanda (modelo similar ao iFood para serviços). Conecta clientes com prestadores verificados na sua região.

> **Projeto acadêmico** — PRG-APP-GRUPO-3. Fase atual: frontend com dados mockados e backend básico integrado.

---

## Stack

### Frontend (`conecta-app/`)

| Camada | Tecnologia |
|---|---|
| Framework | Expo SDK 54 |
| Runtime | React Native 0.81 |
| Linguagem | TypeScript |
| Navegação | Expo Router v6 (file-based) |
| Animações | react-native-reanimated v4 |
| Gradientes | expo-linear-gradient |
| Fontes | Manrope + Inter via @expo-google-fonts |
| Ícones | @expo/vector-icons (MaterialIcons) |
| Safe Area | react-native-safe-area-context |
| Armazenamento seguro | expo-secure-store (token JWT) |

### Backend (`conecta-backend/`)

| Camada | Tecnologia |
|---|---|
| Servidor | Node.js + Express |
| Banco de dados | SQLite via better-sqlite3 |
| Autenticação | JWT (jsonwebtoken) + bcryptjs |
| Documentação da API | Swagger UI (swagger-jsdoc + swagger-ui-express) |
| Porta padrão | 3000 |

---

## Como instalar e executar

### Pré-requisitos

| Ferramenta | Versão mínima |
|---|---|
| Node.js | 18+ |
| npm | 9+ |
| Git | qualquer |

Para rodar no dispositivo físico: instale o **Expo Go** no [Android](https://play.google.com/store/apps/details?id=host.exp.exponent) ou [iOS](https://apps.apple.com/app/expo-go/id982107779).

---

### Frontend

```bash
# 1. Entrar na pasta do app
cd PRG-APP-GRUPO-3/conecta-app

# 2. Instalar dependências
npm install

# 3. Iniciar o servidor de desenvolvimento
npx expo start
```

No terminal, escaneie o QR code com o Expo Go ou use os atalhos:

| Tecla | Ação |
|---|---|
| `a` | Abre no emulador Android |
| `i` | Abre no simulador iOS (somente macOS) |
| `w` | Abre no navegador |

### Backend

```bash
# 1. Entrar na pasta do backend
cd PRG-APP-GRUPO-3/conecta-backend

# 2. Instalar dependências
npm install

# 3. Popular o banco com dados iniciais (opcional)
node db/seed.js

# 4. Iniciar o servidor
node index.js
```

O servidor sobe em `http://localhost:3000`.
A documentação Swagger fica em `http://localhost:3000/api-docs`.

> **Atenção:** o app mobile precisa apontar para o IP local da sua máquina, não `localhost`. Edite `services/api.ts` e substitua o `BASE_URL` pelo IP da sua rede (ex.: `http://192.168.x.x:3000`).

---

### Solução de problemas comuns

```bash
# Dependências corrompidas
rm -rf node_modules && npm install

# Metro bundler com cache corrompido
npx expo start --clear

# Porta 3000 ocupada (backend)
# Encerre o processo que usa a porta ou altere PORT= em index.js
```

---

## Funcionalidades implementadas

### Autenticação

| Tela | Arquivo | Descrição |
|---|---|---|
| Login | `app/(auth)/login.tsx` | E-mail + senha; acesso via Google (mock); link para cadastro; **modal de redefinição de senha** |
| Cadastro | `app/(auth)/sign-up.tsx` | Nome, e-mail, telefone, senha, confirmação, aceite de termos |

**Modal de redefinição de senha** (integrado ao login): campo de e-mail com validação, estado de carregamento e tela de sucesso após envio.

**Fluxo:** `Login` → `/(tabs)` · `Cadastro` → `Onboarding`

---

### Onboarding

Fluxo de configuração pós-cadastro. Número de etapas varia por tipo de usuário:

| Tipo | Etapas |
|---|---|
| Cliente | 3 (step1 → step2 → step4) |
| Prestador | 4 (step1 → step2 → step3 → step3b → step4) |

| Tela | Arquivo | Conteúdo |
|---|---|---|
| Seleção de perfil | `step0.tsx` | Cards "Sou Cliente" / "Sou Prestador" |
| Dados pessoais | `step1.tsx` | Foto de perfil, nome; prestador também preenche especialidade |
| Localização | `step2.tsx` | Tipo (Casa/Trabalho), CEP, endereço completo |
| Perfil do prestador | `step3.tsx` | Categorias, experiência, bio |
| Verificação de segurança | `step3b.tsx` | Upload de documento + confirmação de identidade (somente prestador) |
| Conclusão | `step4.tsx` | Animação de sucesso + CTA para o app |

---

### Navegação Principal (Abas)

| Aba | Arquivo | Conteúdo |
|---|---|---|
| Home | `(tabs)/index.tsx` | Tela inicial |
| Explorar | `(tabs)/explore.tsx` | Busca de serviços |
| Agenda | `(tabs)/schedule.tsx` | Agendamentos |
| Serviços | `(tabs)/services.tsx` | Catálogo do prestador |
| Perfil | `(tabs)/profile.tsx` | Hub de configurações da conta |

---

### Serviços (Visão do Prestador)

#### Listagem de Serviços — `(tabs)/services.tsx`
- Card CTA em gradiente "Expandir Catálogo"
- Seção de **Serviços Ativos**: cards com ícone, preço, agendamentos, nota e ações Visualizar/Editar
- Seção de **Rascunhos**: cards com link "Continuar Edição"
- FAB `+` flutuante

#### Criar Serviço — `(services)/create.tsx`
Formulário em scroll único com 4 blocos: Informações Básicas, Preços e Duração, Descrição, Fotos. Toggle "Publicar agora" + ações Publicar/Rascunho.

#### Editar Serviço — `(services)/edit.tsx`
Edição inline de todos os campos + galeria com remoção individual + ação destrutiva "Excluir Serviço" com confirmação.

#### Visualizar Serviço — `(services)/view.tsx`
Dashboard com banner hero, toggle Ativo/Inativo, grid 2×2 de métricas (Faturamento, Agendamentos, Nota, Tempo de Resposta), avaliações recentes e gráfico de barras de atividade semanal.

---

### Conta e Configurações

Hub principal em `(tabs)/profile.tsx` — 4 seções: Conta, Preferências, Segurança, Suporte & Legal.

| Tela | Arquivo | Descrição |
|---|---|---|
| Editar Perfil | `(account)/edit-profile.tsx` | Foto de perfil, nome, e-mail, telefone, data de nascimento, endereço |
| Alterar Senha | `(account)/change-password.tsx` | Senha atual + nova senha com validação em tempo real (8 chars, maiúscula, número) |
| Cadastrar Endereço | `(account)/add-address.tsx` | Mapa placeholder, formulário CEP/rua/número/bairro/cidade, chips de tipo (Casa/Trabalho/Outro) |
| Excluir Conta | `(account)/delete-account.tsx` | Aviso editorial, confirmação por senha, Alert duplo de confirmação |
| Privacidade e Segurança | `(account)/privacy-security.tsx` | Toggle biometria + 2FA, permissões do app, visibilidade do perfil, gestão de dados |
| Suporte e Ajuda | `(account)/support.tsx` | Card de status do suporte, contatos (WhatsApp/E-mail/Ligar), FAQ categorizado |
| Termos de Uso | `(account)/use-terms.tsx` | 6 artigos legais com card de destaque escuro + rodapé |
| Assinaturas | `(account)/plans.tsx` | Segmented control por role: aba Cliente (plano Free + upgrade) e aba Prestador (Básico vs Elite Pro) |

---

### Pagamentos

| Tela | Arquivo | Descrição |
|---|---|---|
| Pagamentos | `(account)/payments.tsx` | Saldo da carteira, cartões salvos, campo de cupom com cupom ativo, últimas transações |
| Histórico | `(account)/payment-history.tsx` | Chips de filtro (mês/trimestre/ano), transações agrupadas por mês com badges de status (Concluído/Pendente/Cancelado) |
| Adicionar Cartão | `(account)/new-card.tsx` | Preview interativo do cartão (atualiza em tempo real), formatação automática do número, toggle "Salvar com segurança" |
| Detalhes do Cartão | `(account)/card-detail.tsx` | Preview gradient do cartão, informações (bandeira, número mascarado, validade, tipo), toggle "Cartão padrão", uso recente, remoção com confirmação |
| Comprovante | `(account)/receipt.tsx` | Header de sucesso, card do serviço, detalhes em bento (data, valor, método, código com copiar), botões Baixar/Ajuda/Voltar |

**Fluxo de navegação:**
```
Configurações → Pagamentos → Histórico → Comprovante
                           → Adicionar Cartão
                           → Detalhes do Cartão → Comprovante
```

---

## Backend API

### Endpoints

#### Autenticação (`/auth`)

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/auth/register` | Cadastra novo usuário (name, email, password, role, phone?) |
| `POST` | `/auth/login` | Autentica e retorna token JWT |

#### Serviços (`/services`) — requer Bearer token

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/services` | Lista serviços do usuário autenticado |
| `POST` | `/services` | Cria novo serviço |
| `PUT` | `/services/:id` | Atualiza serviço existente |
| `DELETE` | `/services/:id` | Remove serviço |

### Estrutura do banco (SQLite)

```
users       → id, name, email, phone, password_hash, role, created_at
services    → id, user_id, name, category, price, duration, description, status, created_at
```

### Estrutura do backend

```
conecta-backend/
├── index.js              → Express + CORS + Swagger
├── db/
│   ├── database.js       → conexão SQLite (better-sqlite3)
│   └── seed.js           → dados iniciais
├── middleware/
│   └── auth.js           → authMiddleware JWT
└── routes/
    ├── auth.js           → register + login
    └── services.js       → CRUD de serviços
```

---

## Estrutura de rotas (frontend)

```
app/
├── index.tsx                        → redireciona para /(auth)/login
├── _layout.tsx                      → root Stack + carregamento de fontes
│
├── (auth)/
│   ├── login.tsx                    → login + modal de reset de senha
│   └── sign-up.tsx
│
├── (onboarding)/
│   ├── step0.tsx                    → seleção de perfil
│   ├── step1.tsx                    → dados pessoais
│   ├── step2.tsx                    → localização
│   ├── step3.tsx                    → perfil prestador
│   ├── step3b.tsx                   → verificação de identidade (prestador)
│   └── step4.tsx                    → conclusão
│
├── (tabs)/
│   ├── index.tsx                    → Home
│   ├── explore.tsx                  → Explorar
│   ├── schedule.tsx                 → Agenda
│   ├── services.tsx                 → Meus Serviços (prestador)
│   └── profile.tsx                  → Hub de configurações
│
├── (services)/
│   ├── create.tsx
│   ├── edit.tsx
│   └── view.tsx
│
└── (account)/
    ├── edit-profile.tsx
    ├── change-password.tsx
    ├── add-address.tsx
    ├── delete-account.tsx
    ├── privacy-security.tsx
    ├── support.tsx
    ├── use-terms.tsx
    ├── plans.tsx
    ├── payments.tsx
    ├── payment-history.tsx
    ├── new-card.tsx
    ├── card-detail.tsx
    └── receipt.tsx
```

---

## Design System

Princípios centrais:

- **Separação por superfície** — sem bordas 1px; hierarquia por camadas tonais (`surfaceContainerLow` → `surfaceContainerLowest`)
- **Tipografia** — Manrope (headlines/títulos) + Inter (body/labels)
- **CTA** — sempre `LinearGradient` `#0054d6 → #004abd` a 135°
- **Elevação** — sombra apenas em elementos flutuantes (FAB, modais, cards em destaque)
- **Margem lateral mínima** — `Spacing.xl` (20 px)

### Tokens (`constants/theme.ts`)

| Token | Valor |
|---|---|
| `Colors.primary` | `#0054d6` |
| `Colors.surface` | `#f9f9f9` |
| `Colors.surfaceContainerLowest` | `#ffffff` |
| `Colors.onSurface` | `#2d3435` |
| `Colors.error` | `#9f403d` |
| `Spacing.xl` | `20` |
| `Radius.lg` | `16` |

### Componentes reutilizáveis (`components/ui/`)

| Componente | Descrição |
|---|---|
| `GradientButton` | Botão CTA com gradiente signature, estado desabilitado e escala no press |
| `InputField` | Campo com label, ícone opcional, suporte a senha e multiline |
| `TopAppBar` | Header com safe area e botão voltar |
| `ProgressBar` | Barra de progresso do onboarding |

---

## Scripts disponíveis

### Frontend

| Comando | Descrição |
|---|---|
| `npx expo start` | Inicia servidor de desenvolvimento |
| `npm run android` | Abre no emulador Android |
| `npm run ios` | Abre no simulador iOS |
| `npm run web` | Abre no navegador |
| `npm run lint` | Executa ESLint |

### Backend

| Comando | Descrição |
|---|---|
| `node index.js` | Inicia o servidor na porta 3000 |
| `node db/seed.js` | Popula o banco com dados iniciais |

---

## Pendente / Próximas etapas

- [ ] Tela Home do cliente (busca de serviços, categorias, destaques)
- [ ] Tela de Agendamentos (cliente e prestador)
- [ ] Tela Explorar (busca com filtros)
- [ ] Endpoints de backend: perfil, endereço, troca de senha
- [ ] Notificações push
- [ ] Upload real de imagens (foto de perfil, fotos do serviço)
