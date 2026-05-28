# Design: Visão do Cliente — Parte B (Perfil, Detalhes, Avaliações)

**Data:** 2026-05-21  
**Status:** Aprovado  
**Tickets:** KAN-23, KAN-24, KAN-25

---

## Contexto

A Parte A entregou a tela Home com descoberta de serviços e navegação por role. Ao tocar num card de prestador/serviço, o app navega para `/(client)/provider-profile` (atualmente placeholder). Esta spec define a implementação completa das 3 telas restantes da visão do cliente.

---

## Escopo

- **KAN-23:** Perfil completo do prestador com 3 abas (Serviços, Sobre, Avaliações)
- **KAN-24:** Tela de detalhes do serviço — visão do cliente
- **KAN-25:** Tela de avaliações completa com distribuição de estrelas
- Backend: 3 novos endpoints/filtros públicos
- API client: extensões de `publicServicesApi` + novo `providerApi`

**Fora do escopo:** agendamento real, pagamento, chat, edição de perfil do prestador.

---

## Arquitetura

### Rotas

```
app/(client)/
├── _layout.tsx              (existente)
├── provider-profile.tsx     (substituir placeholder — KAN-23)
├── service-detail.tsx       (nova — KAN-24)
└── provider-reviews.tsx     (nova — KAN-25)
```

### Fluxo de Navegação

```
Home
└── provider-profile?id={provider_id}&name={provider_name}
      ├── [card serviço "Ver"] → service-detail?serviceId={id}&providerName={name}
      │     └── [CTA "Agendar agora"] → Alert placeholder
      ├── [aba Avaliações] → reviews inline → [btn "Ver todas"]
      │     └── provider-reviews?userId={id}&name={name}
      └── [CTA "Agendar uma Consulta"] → Alert placeholder
```

---

## Backend

### 1. Filtro `provider_id` em `GET /services/public`

**Arquivo:** `conecta-backend/routes/public.js`

Adicionar ao bloco de query params existente:

```javascript
if (provider_id) {
  conditions.push('s.user_id = ?');
  params.push(provider_id);
}
```

Rota continua: `GET /services/public?provider_id=5`

---

### 2. `GET /services/public/:id` — detalhes públicos de um serviço

**Arquivo:** `conecta-backend/routes/public.js`

```javascript
router.get('/:id', (req, res) => {
  const service = db.prepare(`
    SELECT
      s.id, s.name, s.category, s.price, s.price_type,
      s.description, s.duration, s.status,
      u.id AS provider_id, u.name AS provider_name,
      ROUND(AVG(r.rating), 1) AS avg_rating,
      COUNT(r.id) AS review_count
    FROM services s
    JOIN users u ON s.user_id = u.id
    LEFT JOIN reviews r ON r.service_id = s.id
    WHERE s.id = ? AND s.status = 'ativo'
    GROUP BY s.id
  `).get(req.params.id);

  if (!service) return res.status(404).json({ error: 'Serviço não encontrado' });
  return res.json(service);
});
```

---

### 3. `GET /users/:userId/reviews` — avaliações agregadas do prestador

**Arquivo:** `conecta-backend/routes/public.js`

```javascript
router.get('/provider/:userId/reviews', (req, res) => {
  const reviews = db.prepare(`
    SELECT
      r.id, r.rating, r.comment, r.created_at,
      u.name AS reviewer_name,
      s.name AS service_name
    FROM reviews r
    JOIN services s ON r.service_id = s.id
    JOIN users reviewer ON r.user_id = reviewer.id
    LEFT JOIN users u ON r.user_id = u.id
    WHERE s.user_id = ?
    ORDER BY r.created_at DESC
  `).all(req.params.userId);

  const total = reviews.length;
  const avg = total > 0
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / total) * 10) / 10
    : null;

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => { distribution[r.rating] = (distribution[r.rating] || 0) + 1; });

  return res.json({ avg_rating: avg, total_count: total, distribution, reviews });
});
```

**Registrar em `index.js`:** adicionar `app.use('/users', publicRoutes)` ANTES de `app.use('/users', usersRoutes)` para evitar que `usersRoutes` intercepte `/users/provider/:userId/reviews` tratando "provider" como um `userId` dinâmico.

```javascript
app.use('/services', publicRoutes);  // já existe — cobre /services/public e /services/public/:id
app.use('/users', publicRoutes);     // novo — cobre /users/provider/:userId/reviews
// ... demais rotas (usersRoutes, etc.) DEPOIS
```

> **Nota:** O arquivo `public.js` serve rotas em DOIS prefixos diferentes (`/services` e `/users`). `index.js` registra `publicRoutes` nos dois prefixos, ambos ANTES das rotas autenticadas correspondentes.

---

## API Client (`services/api.ts`)

### Extensões

```typescript
// Extensão de publicServicesApi.list para suportar provider_id
// Adicionar ao bloco de params em publicServicesApi.list:
if (params?.provider_id) parts.push(`provider_id=${params.provider_id}`);

// Interface atualizada:
export const publicServicesApi = {
  list: (params?: { category?: string; q?: string; provider_id?: number }) => { ... },
  getById: (id: number) =>
    request<PublicService>(`/services/public/${id}`),
};

// Novo:
export interface ProviderReview {
  id: number;
  rating: number;
  comment?: string;
  created_at: string;
  reviewer_name: string;
  service_name: string;
}

export interface ProviderReviews {
  avg_rating: number | null;
  total_count: number;
  distribution: Record<string, number>;
  reviews: ProviderReview[];
}

export const providerApi = {
  reviews: (userId: number) =>
    request<ProviderReviews>(`/users/provider/${userId}/reviews`),
};
```

---

## Telas

### KAN-23: `provider-profile.tsx`

**Params recebidos:** `id` (provider_id), `name` (provider_name)

**Estado:**
```typescript
const [activeTab, setActiveTab] = useState<'servicos' | 'sobre' | 'avaliacoes'>('servicos');
const [services, setServices] = useState<PublicService[]>([]);
const [reviewData, setReviewData] = useState<ProviderReviews | null>(null);
const [loadingServices, setLoadingServices] = useState(true);
const [loadingReviews, setLoadingReviews] = useState(false);
```

**Carregamento lazy:** serviços carregam no mount; reviews carregam somente quando a aba "Avaliações" é ativada pela primeira vez (flag `reviewsLoaded`).

**Header (fora do scroll):**
- `TopAppBar` com título = `name`
- Card de perfil: avatar 80px com iniciais + fundo `primaryContainer`, nome, badge `verified`, rating do `reviewData.avg_rating` (ou `--` se ainda não carregou)
- Chips de stats mockados horizontais: `{ icon: 'work-history', label: '12 anos exp.' }`, `{ icon: 'check-circle', label: '850+ serviços' }`, `{ icon: 'schedule', label: '< 15 min resp.' }`

**Tabs:**
```typescript
const TABS = [
  { key: 'servicos', label: 'Serviços' },
  { key: 'sobre', label: 'Sobre' },
  { key: 'avaliacoes', label: 'Avaliações' },
];
```
Row de chips toggleáveis com estilo ativo = fundo `primaryContainer` + texto `primary`.

**Tab Serviços:**
- `ActivityIndicator` durante loading
- Cards: ícone de categoria + nome + preço + descrição (1 linha) + botão "Ver"
- Toque em "Ver" → `router.push({ pathname: '/(client)/service-detail', params: { serviceId: String(service.id), providerName: name } })`
- Estado vazio: "Nenhum serviço cadastrado."

**Tab Sobre (mock estático):**
```typescript
const MOCK_BIO = 'Profissional experiente com mais de 12 anos de atuação no mercado. Comprometido com qualidade, pontualidade e satisfação total do cliente.';
const MOCK_SPECIALTIES = [
  { icon: 'bolt', label: 'Instalações Elétricas' },
  { icon: 'settings', label: 'Manutenção Preventiva' },
  { icon: 'home', label: 'Reformas Residenciais' },
  { icon: 'engineering', label: 'Projetos Técnicos' },
];
const MOCK_CERTS = [
  { icon: 'verified-user', title: 'NR-10', subtitle: 'Segurança em Instalações Elétricas' },
  { icon: 'verified-user', title: 'CREA Registrado', subtitle: 'Conselho Regional de Engenharia' },
  { icon: 'verified-user', title: 'ISO 9001', subtitle: 'Gestão da Qualidade' },
];
```
Layout: parágrafo de bio → grid 2×2 de especialidades → lista de certificações.

**Tab Avaliações:**
- Carrega `providerApi.reviews(userId)` na primeira ativação
- Mostra: rating grande + estrelas + total + últimas 5 reviews (card simples)
- Botão "Ver todas as avaliações" → `router.push({ pathname: '/(client)/provider-reviews', params: { userId: id, name } })`

**CTA fixo na base:**
```typescript
<GradientButton
  label="Agendar uma Consulta"
  onPress={() => Alert.alert('Em breve', 'A funcionalidade de agendamento estará disponível em breve.')}
/>
```

---

### KAN-24: `service-detail.tsx`

**Params:** `serviceId`, `providerName`

**Estado:** `service: PublicService | null`, `reviews: ServiceReview[]`, `loading`

**Carregamento:** `publicServicesApi.getById(serviceId)` + `reviewsApi.list(serviceId)` em paralelo (Promise.all)

**Layout:**
1. `TopAppBar` com título = nome do serviço (ou "Detalhes" durante loading)
2. **Hero colorido** (140px): `View` com cor de fundo da categoria — extrair o array `CATEGORIES` de `app/(tabs)/index.tsx` para um arquivo compartilhado `constants/categories.ts` para reutilização em `service-detail.tsx` + ícone da categoria (40px)
3. **Card flutuante sobre o hero** (margin-top negativo): badge categoria, nome (headline), rating + count, preço formatado
4. **Corpo em layout flex:**
   - Coluna principal: "Sobre o serviço" (campo `description`) + "O que está incluso" (3 itens mockados com `check-circle` verde)
   - Coluna lateral: "Avaliações" preview (primeiras 2 reviews — avatar iniciais + rating + comentário 2 linhas)
5. **CTA fixo:** "Agendar agora" → Alert placeholder

**Itens mockados de "O que está incluso":**
```typescript
const INCLUDED_ITEMS = [
  'Mão de obra qualificada',
  'Garantia de 90 dias',
  'Materiais básicos inclusos',
];
```

---

### KAN-25: `provider-reviews.tsx`

**Params:** `userId`, `name`

**Estado:** `data: ProviderReviews | null`, `loading`

**Carregamento:** `providerApi.reviews(userId)` no mount

**Layout:**
1. `TopAppBar` com título = `"Avaliações de ${name}"`
2. **Card de resumo** (fundo `surfaceContainerLow`):
   - Rating grande (fontSize 48, headlineExtraBold)
   - 5 estrelas coloridas
   - Subtexto: `"{total_count} avaliações"`
   - **Barras de distribuição** (5→1 estrelas):
     ```
     ★5  ████████████████████  92%
     ★4  ████                   6%
     ★3  ░                      1%
     ★2  ░                     0.5%
     ★1  ░                     0.5%
     ```
     Largura calculada: `(count / total_count) * 100 + '%'`
3. **Lista de reviews:**
   - Cabeçalho "Avaliações Recentes"
   - Card por review: nome do reviewer + chip do serviço + data formatada + estrelas + comentário em itálico
   - `ScrollView` sem paginação

**Estados:** `ActivityIndicator` + empty state ("Nenhuma avaliação ainda.")

---

## Critérios de Aceite

- [ ] Tocar card na Home → perfil do prestador com header, stats e 3 abas
- [ ] Aba Serviços: lista serviços do prestador via API real
- [ ] Aba Sobre: exibe bio, especialidades e certificações (mock)
- [ ] Aba Avaliações: rating agregado + últimas 5 reviews + botão "Ver todas"
- [ ] Tocar "Ver" num serviço → tela de detalhes com hero, descrição, checklist e preview de reviews
- [ ] Tocar "Ver todas" → tela de avaliações com distribuição de estrelas e lista completa
- [ ] Todos os CTAs "Agendar" abrem Alert "Em breve"
- [ ] Loading e empty states em todas as telas
- [ ] `GET /services/public?provider_id=X` filtra serviços do prestador
- [ ] `GET /services/public/:id` retorna detalhes públicos do serviço
- [ ] `GET /users/provider/:userId/reviews` retorna reviews agregadas com distribuição

---

## O que NÃO está no escopo

- Agendamento real
- Upload de foto de perfil
- Edição de dados do prestador
- Paginação de reviews
- Dados reais no tab "Sobre" (bio, especialidades, certificações)
