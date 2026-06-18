# Visual Premium Design — Conecta App

**Data:** 2026-06-12  
**Abordagem:** Surface Elevation (Confiança Profissional)  
**Escopo:** Design system + todos os componentes compartilhados + todas as telas principais  
**Restrições:** Sem alteração de lógica de negócio, navegação ou chamadas de API. Sem novas dependências pesadas.

---

## 1. Design System (`constants/theme.ts`)

### Paleta de cores

| Token | Valor | Uso |
|---|---|---|
| `brand` | `#0054d6` | CTAs, links, elementos ativos |
| `brandDeep` | `#003fa3` | Gradiente final, pressed states |
| `ink` | `#0f172a` | Textos principais (substitui onSurface) |
| `inkMuted` | `#64748b` | Textos secundários (substitui onSurfaceVariant) |
| `surface` | `#f8fafc` | Background geral |
| `card` | `#ffffff` | Cards, modais, inputs |
| `border` | `rgba(15,23,42,0.08)` | Divisores, bordas de input, chips inativos |

Tokens M3 existentes (`primaryContainer`, `secondaryContainer`, etc.) são mantidos — usados nos stats cards do provider home com nova linguagem (border esquerda colorida em vez de fundo colorido inteiro).

**Gradiente principal** (`GradientColors`): `['#0054d6', '#003fa3']` — 15% mais escuro no fim para criar direção real.

**`shadowColor`** em todo o app: troca de `'#000'` para `Colors.ink` (`#0f172a`) — sombras com cor base têm mais naturalidade visual.

### Escala tipográfica (`Typography`)

Novo objeto `Typography` exportado de `theme.ts`:

| Role | Font | Size | Weight | LetterSpacing | LineHeight |
|---|---|---|---|---|---|
| `display` | Manrope-ExtraBold | 32 | 800 | -1.2 | 38 |
| `headline` | Manrope-Bold | 22 | 700 | -0.6 | 28 |
| `title` | Manrope-SemiBold | 17 | 600 | -0.3 | 24 |
| `body` | Inter-Regular | 14 | 400 | 0 | 20 |
| `bodyMedium` | Inter-Medium | 14 | 500 | 0 | 20 |
| `label` | Inter-SemiBold | 12 | 600 | 0.1 | 16 |
| `caption` | Inter-Regular | 11 | 400 | 0.2 | 15 |
| `overline` | Inter-SemiBold | 10 | 600 | 1.4 | 14 |

### Elevation (`constants/Elevation.ts`)

Novo arquivo que substitui todos os inline shadows:

```ts
export const Elevation = {
  0: { shadowColor: 'transparent', shadowOpacity: 0, shadowRadius: 0, elevation: 0 },
  1: { shadowColor: '#0f172a', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  2: { shadowColor: '#0f172a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  3: { shadowColor: '#0f172a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 16, elevation: 6 },
  4: { shadowColor: '#0f172a', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.14, shadowRadius: 32, elevation: 10 },
}
```

### Border Radius

Sem mudança nos tokens (`sm:8, md:12, lg:16, xl:24, full:9999`). Mudança de uso:
- `GradientButton`: `Radius.sm → Radius.lg`
- Card principal de login/signup: `Radius.sm → Radius.xl`
- Todos os cards de conteúdo: `Radius.lg` (16) como padrão

---

## 2. Componentes Compartilhados

### `GradientButton` (`components/ui/gradient-button.tsx`)

- `borderRadius`: `Radius.sm → Radius.lg`
- Gradiente: `GradientColors` → `['#0054d6', '#003fa3']` (via token atualizado)
- `shadowColor`: `Colors.brand`, `shadowOpacity: 0.28`
- Press: `Haptics.impactAsync(ImpactFeedbackStyle.Medium)` + spring Reanimated (`scale: 0.97`)
- Estado `loading`: prop `loading?: boolean` — substitui label por `ActivityIndicator` branco
- Disabled: `opacity: 0.45` (era 0.5)

### `InputField` (`components/ui/input-field.tsx`)

- Background: `surfaceContainerHighest → Colors.card` com `borderWidth: 1.5`, `borderColor: Colors.border`
- Estado focado: borda anima para `Colors.brand` com `withTiming(200ms)` via Reanimated
- Label flutua (shrink + translateY) quando campo está focado ou tem valor — `withTiming(150ms)`. **Condição:** somente quando a prop `label` não está vazia; quando `label=""` o comportamento atual (sem label) é preservado integralmente.
- Ícone: muda `outline → brand` ao focar (mesma animação)
- Estado de erro: borda vermelha + micro shake (`withSequence` de translateX ±4px)
- Sem mudança na interface de props — 100% retrocompatível

### `TopAppBar` (`components/ui/top-app-bar.tsx`)

- Título: role `title` (17px Manrope SemiBold, letterSpacing -0.3)
- Botão voltar: pressed spring scale 0.92 via Reanimated
- `backgroundColor: Colors.card`, `borderBottomWidth: 1`, `borderBottomColor: Colors.border`
- Elevation 1 apenas quando `scrolled` (prop opcional via scroll offset)

### `BottomSheet` (`components/ui/bottom-sheet.tsx`)

- Handle pill: `width: 40, height: 4` (era menor), `backgroundColor: Colors.border`
- Backdrop opacity: `0.45 → 0.55`
- Entrada animada com Reanimated `withSpring` em vez de `animationType="slide"` nativo
- Elevation 3

### `AvatarInitials` (`components/ui/avatar-initials.tsx`)

- Tamanhos padronizados: `sm: 36, md: 48, lg: 72` (revisão do que existe)
- Pressed: scale 0.94 com spring Reanimated
- Sem mudança nas props

### `StatusBadge` (`components/ui/status-badge.tsx`)

- `borderRadius: Radius.full`
- `paddingHorizontal: 10, paddingVertical: 4`
- Texto: role `label` (Inter 12 SemiBold, letterSpacing 0.1)

### `ListItem` (`components/ui/list-item.tsx`)

- Ícone wrap: 36×36, `borderRadius: Radius.sm`, `backgroundColor: Colors.border + '60'`
- Pressed state: `backgroundColor: surfaceContainerLow` com `withTiming(100ms)`
- Divider: `Colors.border` em vez de `outlineVariant + '33'`
- Chevron: `Colors.inkMuted` em vez de `outlineVariant`

### Tab Bar (`app/(tabs)/_layout.tsx`)

- `height: 60 → 68`, `paddingBottom: 8`
- Pill de fundo no item ativo: `backgroundColor: brand + '15'`, `borderRadius: Radius.lg`, animado com Reanimated Layout
- Ícone ativo: `size: 24 → 26` via `withSpring`
- Label ativo: `fontSize: 10 → 11`
- `tabBarItemStyle`: `paddingVertical: 6 → 8`

---

## 3. Telas de Auth

### `login.tsx`

- Container: `LinearGradient(['#e8f0fe', '#f8fafc'])` no lugar do fundo flat e blobs invisíveis
- Logo: `fontSize: 38 → 42`, `letterSpacing: -2.0`
- Título: role `display` (32px ExtraBold)
- Card do formulário: `backgroundColor: Colors.card`, `borderRadius: Radius.xl (24)`, elevation 2
- Botão Google: `borderRadius: Radius.lg`, `borderColor: Colors.border` (mais visível)
- Modal de reset: card `borderRadius: Radius.xl`, ícone wrap `backgroundColor: brand + '15'`

### `sign-up.tsx`

- Mesma linguagem do login: gradiente de fundo, card `Radius.xl`, campos com novo InputField

---

## 4. Telas Principais (Tabs)

### Home — Cliente (`index.tsx`)

- Header: `shadowColor: Colors.ink`
- Logo: `fontSize: 26`, `letterSpacing: -1.0`
- Barra de pesquisa: `backgroundColor: Colors.card`, `borderWidth: 1.5`, `borderColor: Colors.border`
- Hero banner gradiente: `['#e8f0fe', '#f0f5ff', '#f8fafc']`
- `heroHeadline`: role `display` (32px)
- `heroStatValue`: `fontSize: 20`
- Category tiles: ícone wrap 48×48, ícone 28px, label `fontSize: 10`
- Provider cards: `width: 220`, elevation 2 com `shadowColor: Colors.ink`
- Placeholder initials: `opacity: 0.25`
- Service cards: `borderRadius: Radius.lg`, `servicePrice` role `title`, `bookBtn` com `Haptics.selectionAsync`

### Home — Prestador (`home-provider.tsx`)

- Stats cards: `backgroundColor: Colors.card` + `borderLeftWidth: 3` na cor do container respectivo (brand, secondary, tertiary)
- `statValue`: role `headline` (22px Bold)
- `statLabel`: role `caption` (11px)
- Quick action icon wrap: `backgroundColor: brand + '12'`
- Quick action label: role `caption`
- Cards de agendamento: elevation 1, `apptIconBox borderRadius: Radius.md`

### Profile (`profile.tsx`)

- Avatar: `AvatarInitials` lg (72px), elevation 1
- Nome: role `headline`
- `SettingsSection` title: role `overline`
- `SettingsRow`: usa `ListItem` refatorado
- Divisores: `Colors.border`

### Schedule, Services, Messages

- Headers de seção: role `overline`
- Status badges: `StatusBadge` refatorado
- Cards: elevation 1
- Estados vazios: `EmptyState` componente existente (sem mudança)

---

## 5. Telas de Account

### Padrão geral

- `TopAppBar` refatorada em todas
- Background: `Colors.surface`
- Seções agrupadas em cards `Colors.card`, elevation 1, `borderRadius: Radius.lg`
- Dividers internos: `Colors.border`

### Destaques específicos

- `payments.tsx` / `card-detail.tsx`: card de saldo com `LinearGradient(brand → brandDeep)`, texto branco, elevation 3
- `notifications.tsx`: dot `brand` 8px nos não lidos + `backgroundColor: brand + '08'` no item
- `receipt.tsx`: card de total com elevation 2, `borderRadius: Radius.xl`, preço `headline`
- `plans.tsx`: plano ativo `borderWidth: 2, borderColor: brand`; inativos elevation 1
- Formulários (`add-address`, `new-card`, `change-password`): herdam novo `InputField`
- `privacy-security`, `support`, `about`: herdam `ListItem` + `SettingsSection` refatorados

---

## 6. Onboarding

- `step0`: fundo `LinearGradient(['#e8f0fe', '#f8fafc'])`, headline role `display`
- `step1–step3`: `ProgressBar` cor `brand`, 4px altura, `borderRadius: Radius.full`; botão voltar ghost (`borderWidth: 1.5, borderColor: border`), avançar `GradientButton`
- `step4`: ícone de sucesso 80×80, `backgroundColor: brand + '12'`, ícone 44px; headline role `display`; CTA com spring na entrada

---

## 7. Scheduling

- `book.tsx`: slots de horário — chips `borderRadius: Radius.md`, ativo `backgroundColor: brand`, pressed spring
- `appointment-detail.tsx`: header de status com `LinearGradient` sutil por status (azul=confirmado, verde=concluído, cinza=cancelado)
- `provider-availability.tsx`: mesma linguagem de chips

---

## 8. Restrições e Limites

- **Sem alteração de lógica de negócio** — nenhum arquivo de API, contexto ou hook de dados é tocado
- **Sem nova navegação** — estrutura de rotas inalterada
- **Retrocompatibilidade de props** — todos os componentes mantêm interface pública idêntica
- **Sem novas dependências** — Reanimated (já instalado v4.1.1), LinearGradient (já instalado), Haptics (já instalado via Expo)
- **Expo SDK compatível** — nenhuma API fora do Expo SDK atual

---

## 9. Arquivos a Modificar

| Arquivo | Tipo de mudança |
|---|---|
| `constants/theme.ts` | Adicionar `Typography`, `ink`, `inkMuted`, `card`, `border`, `brandDeep`; atualizar `GradientColors` |
| `constants/Elevation.ts` | Novo arquivo |
| `components/ui/gradient-button.tsx` | Radius, gradiente, Haptics, Reanimated, loading state |
| `components/ui/input-field.tsx` | Fundo card + borda, foco animado, label flutuante, shake de erro |
| `components/ui/top-app-bar.tsx` | Tipografia, border bottom, pressed spring |
| `components/ui/bottom-sheet.tsx` | Handle, backdrop, Reanimated |
| `components/ui/avatar-initials.tsx` | Tamanhos, pressed spring |
| `components/ui/status-badge.tsx` | Padding, radius, tipografia |
| `components/ui/list-item.tsx` | Icon wrap, pressed animado, divider |
| `app/(tabs)/_layout.tsx` | Tab bar: altura, pill animado, ícone spring |
| `app/(auth)/login.tsx` | Gradiente de fundo, card Radius.xl, tipografia |
| `app/(auth)/sign-up.tsx` | Mesma linguagem do login |
| `app/(tabs)/index.tsx` | Hero, search bar, category tiles, cards |
| `app/(tabs)/home-provider.tsx` | Stats cards, quick actions, appointment cards |
| `app/(tabs)/profile.tsx` | Avatar, seções, rows |
| `app/(tabs)/schedule.tsx` | Seções, status badges |
| `app/(tabs)/services.tsx` | Cards, seções |
| `app/(tabs)/messages.tsx` | Layout básico |
| `app/(account)/*.tsx` | TopAppBar, cards, ListItem — todos herdam |
| `app/(onboarding)/step*.tsx` | Gradiente, ProgressBar, botões |
| `app/(scheduling)/*.tsx` | Chips, status header |
