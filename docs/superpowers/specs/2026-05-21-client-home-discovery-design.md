# Design: Visão do Cliente — Parte A (Home + Descoberta)

**Data:** 2026-05-21  
**Status:** Aprovado

---

## Contexto

O app tem dois roles: `cliente` e `prestador`. Atualmente todas as telas são voltadas ao prestador (gerenciar serviços, editar perfil, etc.) e a aba Home é um placeholder. Esta spec define a **Parte A** da visão do cliente: navegação por tabs dinâmica por role e tela de descoberta de serviços.

---

## Escopo desta Spec

- Tab navigation dinâmica por role (`app/(tabs)/_layout.tsx`)
- Home de descoberta para clientes (`app/(tabs)/index.tsx`)
- Grupo de rotas do cliente (`app/(client)/`)
- Placeholder de perfil do prestador (`app/(client)/provider-profile.tsx`)
- Backend endpoint público de serviços (`GET /services/public`)
- Extensão do API client (`publicServicesApi`)

**Fora do escopo:** perfil completo do prestador, detalhes do serviço, avaliações, reservas, mensagens — todos Parte B.

---

## Arquitetura

### 1. Tab Navigation Dinâmica (`app/(tabs)/_layout.tsx`)

Lê `user.role` via `useAuth()` e aplica `href: null` condicionalmente para esconder tabs irrelevantes por role. Segue o padrão já usado pela aba "Explore" (que usa `href: null` fixo).

**Tabs por role:**

| Tab | Ícone | Cliente | Prestador |
|-----|-------|---------|-----------|
| Início (`index`) | `home` | ✅ | ✅ (placeholder) |
| Reservas/Agenda (`schedule`) | `calendar-today` | ✅ "Reservas" (placeholder) | ✅ "Agenda" (existente) |
| Mensagens (`messages`) | `chat-bubble-outline` | ✅ (placeholder) | ❌ oculto |
| Serviços (`services`) | `handyman` | ❌ oculto | ✅ |
| Conta (`profile`) | `person-outline` | ✅ | ✅ |

> **Nota:** A aba `schedule` existente serve os dois roles: para clientes exibe título "Reservas", para prestadores exibe "Agenda". Uma nova aba `messages` é adicionada para clientes como placeholder e ocultada para prestadores.

> **Nota 2:** O Home para prestadores mantém o estado atual de placeholder — não é escopo desta Parte A.

### 2. Novas Rotas

**`app/(client)/`** — grupo com stack próprio (mesmo padrão de `(services)` e `(account)`):
- `_layout.tsx` — Stack navigator com `slide_from_right`
- `provider-profile.tsx` — placeholder até a Parte B

**`app/(tabs)/messages.tsx`** — placeholder de mensagens (clientes)

### 3. Endpoint Backend: `GET /services/public`

Adicionado em `conecta-backend/routes/services.js` (ou novo arquivo). **Não requer autenticação.**

**Query params:**
- `category` (string, opcional) — filtro exato por categoria
- `q` (string, opcional) — busca por `name` ou `description` com LIKE

**SQL:**
```sql
SELECT 
  s.id, s.name, s.category, s.price, s.price_type, s.description,
  u.id as provider_id, u.name as provider_name,
  ROUND(AVG(r.rating), 1) as avg_rating,
  COUNT(r.id) as review_count
FROM services s
JOIN users u ON s.user_id = u.id
LEFT JOIN reviews r ON r.service_id = s.id
WHERE s.status = 'ativo'
  [AND s.category = :category]
  [AND (s.name LIKE :q OR s.description LIKE :q)]
GROUP BY s.id
ORDER BY avg_rating DESC NULLS LAST, s.created_at DESC
LIMIT 20
```

**Response:** array de objetos com campos acima. `avg_rating` e `review_count` são `null` quando não há avaliações.

### 4. API Client (`services/api.ts`)

Novo objeto `publicServicesApi`:

```typescript
export interface PublicService {
  id: number;
  name: string;
  category?: string;
  price?: number;
  price_type: 'fixo' | 'a_partir_de';
  description?: string;
  provider_id: number;
  provider_name: string;
  avg_rating: number | null;
  review_count: number;
}

export const publicServicesApi = {
  list: (params?: { category?: string; q?: string }) => {
    const parts: string[] = [];
    if (params?.category) parts.push(`category=${encodeURIComponent(params.category)}`);
    if (params?.q) parts.push(`q=${encodeURIComponent(params.q)}`);
    const qs = parts.length ? `?${parts.join('&')}` : '';
    return request<PublicService[]>(`/services/public${qs}`);
  },
};
```

---

## Tela Home — Cliente (`app/(tabs)/index.tsx`)

### Componentes (de cima para baixo)

#### Header
- Saudação: `"Olá, {user.name.split(' ')[0]} 👋"` (primeiro nome)
- Ícone de notificação (decorativo, sem ação)
- Estilo: `Manrope-Bold`, 22px, `Colors.onSurface`

#### Search Bar
- `TextInput` com ícone `search` à esquerda e botão `tune` à direita
- Placeholder: `"Buscar serviços: limpeza, elétrica..."`
- Debounce de 400ms antes de atualizar o filtro `q`
- Fundo: `Colors.surfaceContainerLowest`, bordas arredondadas `Radius.xl`

#### Categorias (grid 4 colunas)
8 categorias fixas com toggle de seleção ativa:

```typescript
const CATEGORIES = [
  { key: 'Limpeza',      icon: 'cleaning-services' },
  { key: 'Elétrica',     icon: 'electrical-services' },
  { key: 'Encanamento',  icon: 'plumbing' },
  { key: 'Pintura',      icon: 'format-paint' },
  { key: 'Reformas',     icon: 'construction' },
  { key: 'Jardinagem',   icon: 'yard' },
  { key: 'Climatização', icon: 'ac-unit' },
  { key: 'Mais',         icon: 'apps' },
];
```

- Toque → seleciona/deseleciona (toggle). Selecionada: fundo `Colors.primaryContainer`, ícone `Colors.primary`
- Toque em "Mais" → sem ação (decorativo)
- Estado ativo reflete no filtro de serviços abaixo

#### Profissionais em Destaque (scroll horizontal)
- Título: `"Profissionais em Destaque"`
- Lista horizontal (`FlatList` horizontal) derivada dos serviços agrupados por `provider_id` (top 5 únicos por rating)
- Card (280px): avatar com iniciais (`provider_name`), nome, serviço principal, rating com estrela, preço
- Avatar: círculo 48px com fundo `Colors.primaryContainer`, iniciais em `Colors.primary`
- Toque → `router.push({ pathname: '/(client)/provider-profile', params: { id: provider_id, name: provider_name } })`

#### Serviços Disponíveis (lista vertical)
- Título: `"Serviços Disponíveis"`
- Filtrado pelos estados: `q` (busca) + `selectedCategory`
- Card: ícone colorido por categoria, nome do serviço, nome do prestador, rating/count, preço, botão "Ver"
- Botão "Ver" → `router.push({ pathname: '/(client)/provider-profile', params: { id: provider_id, name: provider_name } })`

### Estados
- **Loading:** `ActivityIndicator` centralizado (apenas no carregamento inicial)
- **Vazio:** ícone `search-off` + texto `"Nenhum serviço encontrado."`
- **Erro:** alerta silencioso (não bloqueia a UI, mantém lista vazia)

### Data Flow
```
mount → publicServicesApi.list() → setServices()
selectedCategory / debouncedQ change → publicServicesApi.list({ category, q }) → setServices()
```

---

## Tela Placeholder — Perfil do Prestador (`app/(client)/provider-profile.tsx`)

Exibe:
- TopAppBar com o nome do prestador (vindo do param `name`)
- Ícone centralizado `person` + texto `"Perfil do prestador — em breve"`
- Botão "Voltar"

---

## Tela Placeholder — Mensagens (`app/(tabs)/messages.tsx`)

Exibe:
- Header fixo "Mensagens"
- Ícone `chat-bubble-outline` + texto `"Mensagens — em breve"`

---

## Critérios de Aceite

- [ ] Clientes veem tabs: Início, Reservas, Mensagens, Conta
- [ ] Prestadores veem tabs: Início, Agenda, Serviços, Conta
- [ ] Home carrega serviços reais do backend
- [ ] Busca com debounce filtra por nome/descrição
- [ ] Categoria selecionada filtra a lista; toque novamente deseleciona
- [ ] "Profissionais em Destaque" lista os top 5 prestadores únicos por rating
- [ ] Toque num card navega para o placeholder de perfil do prestador
- [ ] Estado vazio e loading funcionam corretamente
- [ ] `GET /services/public` retorna até 20 serviços ativos com dados do prestador e rating calculado

---

## O que NÃO está no escopo

- Perfil completo do prestador (Parte B)
- Tela de detalhes do serviço (Parte B)
- Avaliações (Parte B)
- Funcionalidade real de Reservas e Mensagens (futura)
- Home do prestador com conteúdo (futura)
- Notificações reais
