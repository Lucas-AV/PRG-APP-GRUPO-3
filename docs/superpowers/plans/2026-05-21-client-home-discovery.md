# Client Home Discovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar a visão inicial do cliente — tabs dinâmicos por role e tela de descoberta de serviços com busca, categorias e listagem de profissionais.

**Architecture:** Tab layout lê `user.role` via `useAuth()` e aplica `href: null` condicional para mostrar/ocultar tabs por role. Um novo endpoint público `GET /services/public` (sem auth) retorna serviços ativos com dados do prestador e rating calculado. A tela Home usa esse endpoint com debounce de busca e toggle de categoria.

**Tech Stack:** React Native (Expo Router), TypeScript, Express.js, better-sqlite3

---

## File Map

| Arquivo | Ação | Responsabilidade |
|---------|------|-----------------|
| `conecta-backend/routes/public.js` | Criar | Endpoint `GET /services/public` sem autenticação |
| `conecta-backend/index.js` | Modificar | Registrar `publicRoutes` antes dos demais |
| `conecta-app/services/api.ts` | Modificar | Adicionar `PublicService` + `publicServicesApi` |
| `conecta-app/app/(client)/_layout.tsx` | Criar | Stack navigator para grupo de rotas do cliente |
| `conecta-app/app/(client)/provider-profile.tsx` | Criar | Placeholder de perfil do prestador |
| `conecta-app/app/(tabs)/messages.tsx` | Criar | Placeholder de mensagens (clientes) |
| `conecta-app/app/(tabs)/_layout.tsx` | Modificar | Tabs dinâmicos por role via `useAuth()` |
| `conecta-app/app/(tabs)/index.tsx` | Modificar | Tela Home completa com busca + categorias + lista |

---

## Task 1: Feature branch

**Files:** nenhum

- [ ] **Step 1: Criar branch a partir de develop**

```bash
git checkout develop
git pull origin develop
git checkout -b feat/kan-22-client-home-discovery
```

Expected: nova branch criada a partir do HEAD de develop.

- [ ] **Step 2: Verificar ponto de partida**

```bash
git log --oneline -3
```

Expected: commits recentes incluindo o PR #28 (KAN-21).

---

## Task 2: Endpoint `GET /services/public` (backend)

**Files:**
- Create: `conecta-backend/routes/public.js`
- Modify: `conecta-backend/index.js`

- [ ] **Step 1: Criar `conecta-backend/routes/public.js`**

```javascript
const express = require('express');
const db = require('../db/database');

const router = express.Router();

/**
 * @swagger
 * /services/public:
 *   get:
 *     summary: Lista serviços ativos com dados do prestador (público, sem autenticação)
 *     tags: [Serviços Públicos]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoria
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Buscar por nome ou descrição
 *     responses:
 *       200:
 *         description: Lista de serviços públicos
 */
router.get('/', (req, res) => {
  const { category, q } = req.query;

  const conditions = ["s.status = 'ativo'"];
  const params = [];

  if (category) {
    conditions.push('s.category = ?');
    params.push(category);
  }

  if (q) {
    conditions.push('(s.name LIKE ? OR s.description LIKE ?)');
    params.push(`%${q}%`, `%${q}%`);
  }

  const where = conditions.join(' AND ');

  const services = db.prepare(`
    SELECT
      s.id,
      s.name,
      s.category,
      s.price,
      s.price_type,
      s.description,
      u.id   AS provider_id,
      u.name AS provider_name,
      ROUND(AVG(r.rating), 1) AS avg_rating,
      COUNT(r.id)             AS review_count
    FROM services s
    JOIN users u ON s.user_id = u.id
    LEFT JOIN reviews r ON r.service_id = s.id
    WHERE ${where}
    GROUP BY s.id
    ORDER BY avg_rating DESC, s.created_at DESC
    LIMIT 20
  `).all(...params);

  return res.json(services);
});

module.exports = router;
```

- [ ] **Step 2: Registrar a rota pública em `conecta-backend/index.js`**

Adicionar o require e o `app.use` ANTES das rotas autenticadas. O arquivo atual começa com os requires e depois os `app.use`. Adicionar após os demais requires:

```javascript
const publicRoutes = require('./routes/public');
```

E após `app.use(express.json())` e ANTES de `app.use('/services', servicesRoutes)`:

```javascript
app.use('/services', publicRoutes);
```

O bloco de requires completo ficará:
```javascript
const authRoutes = require('./routes/auth');
const servicesRoutes = require('./routes/services');
const usersRoutes = require('./routes/users');
const metricsRoutes = require('./routes/metrics');
const reviewsRoutes = require('./routes/reviews');
const plansRoutes = require('./routes/plans');
const subscriptionsRoutes = require('./routes/subscriptions');
const publicRoutes = require('./routes/public');
```

E o bloco de `app.use` ficará:
```javascript
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/services', publicRoutes);   // público — sem auth — ANTES dos autenticados
app.use('/auth', authRoutes);
app.use('/services', servicesRoutes);
app.use('/services', metricsRoutes);
app.use('/services/:id/reviews', reviewsRoutes);
app.use('/users', usersRoutes);
app.use('/plans', plansRoutes);
app.use('/users', subscriptionsRoutes);
```

- [ ] **Step 3: Verificar sintaxe**

```bash
node --check conecta-backend/routes/public.js
node --check conecta-backend/index.js
```

Expected: sem erros de sintaxe.

- [ ] **Step 4: Testar endpoint manualmente**

Com o servidor rodando (`node index.js` em `conecta-backend/`):

```bash
curl http://localhost:3000/services/public
```

Expected: array JSON (vazio `[]` ou com serviços se houver dados seed).

```bash
curl "http://localhost:3000/services/public?category=Elétrica"
curl "http://localhost:3000/services/public?q=instalação"
```

Expected: arrays filtrados corretamente.

- [ ] **Step 5: Commit**

```bash
git add conecta-backend/routes/public.js conecta-backend/index.js
git commit -m "feat(kan-22): adicionar endpoint público GET /services/public"
```

---

## Task 3: `PublicService` + `publicServicesApi` em `api.ts`

**Files:**
- Modify: `conecta-app/services/api.ts`

- [ ] **Step 1: Adicionar interface `PublicService` e objeto `publicServicesApi` ao final do arquivo (antes de `// ── Transactions`)**

Localizar a linha `// ── Transactions` em `api.ts` e inserir ANTES dela:

```typescript
// ── Public Services ───────────────────────────────────────────────────────────

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

- [ ] **Step 2: Verificar TypeScript**

```bash
cd conecta-app && npx tsc --noEmit 2>&1 | head -20
```

Expected: nenhum erro novo relacionado a `PublicService` ou `publicServicesApi`.

- [ ] **Step 3: Commit**

```bash
git add conecta-app/services/api.ts
git commit -m "feat(kan-22): adicionar PublicService e publicServicesApi"
```

---

## Task 4: Grupo `(client)` — layout + placeholder de perfil do prestador

**Files:**
- Create: `conecta-app/app/(client)/_layout.tsx`
- Create: `conecta-app/app/(client)/provider-profile.tsx`

- [ ] **Step 1: Criar `conecta-app/app/(client)/_layout.tsx`**

```typescript
import { Stack } from 'expo-router';
import { Colors } from '@/constants/theme';

export default function ClientLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: Colors.surface },
      }}
    />
  );
}
```

- [ ] **Step 2: Criar `conecta-app/app/(client)/provider-profile.tsx`**

```typescript
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { TopAppBar } from '@/components/ui/top-app-bar';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';

export default function ProviderProfileScreen() {
  const { name } = useLocalSearchParams<{ id?: string; name?: string }>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar title={name ?? 'Perfil do Prestador'} />
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <MaterialIcons name="person" size={48} color={Colors.primary} />
        </View>
        <Text style={styles.title}>Perfil do Prestador</Text>
        <Text style={styles.subtitle}>Em breve você poderá ver o perfil completo, serviços e avaliações.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.base,
    paddingHorizontal: Spacing.xxxl,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 20,
    color: Colors.onSurface,
    letterSpacing: -0.4,
    marginTop: Spacing.base,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
});
```

- [ ] **Step 3: Verificar TypeScript**

```bash
cd conecta-app && npx tsc --noEmit 2>&1 | head -20
```

Expected: sem novos erros.

- [ ] **Step 4: Registrar `(client)` no root layout**

Em `conecta-app/app/_layout.tsx`, adicionar dentro do `<Stack>` (após `<Stack.Screen name="(services)" />`):

```typescript
<Stack.Screen name="(client)" />
```

- [ ] **Step 5: Verificar TypeScript**

```bash
cd conecta-app && npx tsc --noEmit 2>&1 | head -20
```

Expected: sem novos erros.

- [ ] **Step 6: Commit**

```bash
git add "conecta-app/app/(client)/_layout.tsx" "conecta-app/app/(client)/provider-profile.tsx" "conecta-app/app/_layout.tsx"
git commit -m "feat(kan-22): criar grupo (client) com placeholder de perfil do prestador"
```

---

## Task 5: Placeholder de Mensagens (`messages.tsx`)

**Files:**
- Create: `conecta-app/app/(tabs)/messages.tsx`

- [ ] **Step 1: Criar `conecta-app/app/(tabs)/messages.tsx`**

```typescript
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';

export default function MessagesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <MaterialIcons name="chat-bubble-outline" size={48} color={Colors.primary} />
        </View>
        <Text style={styles.title}>Mensagens</Text>
        <Text style={styles.subtitle}>Em breve você poderá conversar com prestadores de serviço.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.base,
    paddingHorizontal: Spacing.xxxl,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: FontFamily.headlineBold,
    fontSize: 20,
    color: Colors.onSurface,
    letterSpacing: -0.4,
    marginTop: Spacing.base,
  },
  subtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add "conecta-app/app/(tabs)/messages.tsx"
git commit -m "feat(kan-22): criar placeholder de mensagens para clientes"
```

---

## Task 6: Tab layout dinâmico por role (`_layout.tsx`)

**Files:**
- Modify: `conecta-app/app/(tabs)/_layout.tsx`

- [ ] **Step 1: Substituir o conteúdo completo de `conecta-app/app/(tabs)/_layout.tsx`**

```typescript
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontFamily } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

const TAB_BAR_STYLE = {
  backgroundColor: Colors.surfaceContainerLowest,
  borderTopWidth: 0,
  elevation: 8,
  shadowColor: Colors.onSurface,
  shadowOffset: { width: 0, height: -4 },
  shadowOpacity: 0.06,
  shadowRadius: 16,
  height: 60,
} as const;

const TAB_LABEL_STYLE = {
  fontFamily: FontFamily.bodySemiBold,
  fontSize: 10,
  letterSpacing: 0.4,
} as const;

export default function TabLayout() {
  const { user } = useAuth();
  const isClient = user?.role === 'cliente';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.onSurfaceVariant,
        headerShown: false,
        tabBarStyle: TAB_BAR_STYLE,
        tabBarLabelStyle: TAB_LABEL_STYLE,
        tabBarItemStyle: { paddingVertical: 6 },
      }}
    >
      {/* Início — visível para todos */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />

      {/* Agenda (prestador) / Reservas (cliente) — visível para todos, título muda */}
      <Tabs.Screen
        name="schedule"
        options={{
          title: isClient ? 'Reservas' : 'Agenda',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="calendar-today" size={size} color={color} />
          ),
        }}
      />

      {/* Serviços — apenas prestador */}
      <Tabs.Screen
        name="services"
        options={{
          title: 'Serviços',
          href: isClient ? null : undefined,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="handyman" size={size} color={color} />
          ),
        }}
      />

      {/* Mensagens — apenas cliente */}
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Mensagens',
          href: isClient ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="chat-bubble-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Conta — visível para todos */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Conta',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Explore — sempre oculto */}
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd conecta-app && npx tsc --noEmit 2>&1 | head -20
```

Expected: sem novos erros.

- [ ] **Step 3: Commit**

```bash
git add "conecta-app/app/(tabs)/_layout.tsx"
git commit -m "feat(kan-22): tabs dinâmicos por role (cliente/prestador)"
```

---

## Task 7: Tela Home — cliente (`app/(tabs)/index.tsx`)

**Files:**
- Modify: `conecta-app/app/(tabs)/index.tsx`

- [ ] **Step 1: Substituir o conteúdo completo de `conecta-app/app/(tabs)/index.tsx`**

```typescript
import { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { publicServicesApi, PublicService } from '@/services/api';

// ── Categorias ────────────────────────────────────────────────────────────────

type Category = {
  key: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
};

const CATEGORIES: Category[] = [
  { key: 'Limpeza',      label: 'Limpeza',      icon: 'cleaning-services',   color: '#dae1ff' },
  { key: 'Elétrica',     label: 'Elétrica',     icon: 'electrical-services', color: '#e1d8fa' },
  { key: 'Encanamento',  label: 'Encanamento',  icon: 'plumbing',            color: '#c8f0e8' },
  { key: 'Pintura',      label: 'Pintura',      icon: 'format-paint',        color: '#fde8c8' },
  { key: 'Reformas',     label: 'Reformas',     icon: 'construction',        color: '#fde0d0' },
  { key: 'Jardinagem',   label: 'Jardinagem',   icon: 'yard',                color: '#d0f0d8' },
  { key: 'Climatização', label: 'Climatização', icon: 'ac-unit',             color: '#c8e8fd' },
  { key: 'Mais',         label: 'Mais',         icon: 'apps',                color: '#e4e2e6' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

function formatPrice(service: PublicService): string {
  if (!service.price) return 'Sob consulta';
  const prefix = service.price_type === 'a_partir_de' ? 'A partir de ' : '';
  return `${prefix}R$ ${service.price.toFixed(2).replace('.', ',')}`;
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { user } = useAuth();
  const isClient = user?.role === 'cliente';

  const [services, setServices] = useState<PublicService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchServices = (category?: string, q?: string) => {
    setLoading(true);
    publicServicesApi
      .list({ category: category || undefined, q: q || undefined })
      .then(setServices)
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  };

  // Carregamento inicial
  useEffect(() => {
    fetchServices();
  }, []);

  // Debounce da busca
  const handleSearchChange = (text: string) => {
    setSearchText(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchServices(selectedCategory ?? undefined, text);
    }, 400);
  };

  // Mudança de categoria
  const handleCategoryPress = (key: string) => {
    if (key === 'Mais') return;
    const next = selectedCategory === key ? null : key;
    setSelectedCategory(next);
    fetchServices(next ?? undefined, searchText);
  };

  // Top 5 prestadores únicos por rating
  const featuredProviders = useMemo(() => {
    const seen = new Set<number>();
    return services.filter(s => {
      if (seen.has(s.provider_id)) return false;
      seen.add(s.provider_id);
      return true;
    }).slice(0, 5);
  }, [services]);

  const goToProvider = (service: PublicService) => {
    router.push({
      pathname: '/(client)/provider-profile' as any,
      params: { id: String(service.provider_id), name: service.provider_name },
    });
  };

  // Tela não-cliente: placeholder simples
  if (!isClient) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.placeholderContent}>
          <View style={styles.placeholderIcon}>
            <MaterialIcons name="home" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.placeholderTitle}>Bem-vindo ao Conecta</Text>
          <Text style={styles.placeholderSubtitle}>
            A visão inicial do prestador estará disponível em breve.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Olá, {user?.name?.split(' ')[0] ?? 'usuário'} 👋
            </Text>
            <Text style={styles.greetingSubtitle}>O que você precisa hoje?</Text>
          </View>
          <Pressable style={styles.notifBtn}>
            <MaterialIcons name="notifications-none" size={24} color={Colors.onSurface} />
          </Pressable>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color={Colors.outline} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar serviços: limpeza, elétrica..."
            placeholderTextColor={Colors.outline}
            value={searchText}
            onChangeText={handleSearchChange}
            returnKeyType="search"
          />
          <Pressable style={styles.filterBtn}>
            <MaterialIcons name="tune" size={20} color={Colors.primary} />
          </Pressable>
        </View>

        {/* Categorias */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categorias</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map(cat => {
              const active = selectedCategory === cat.key;
              return (
                <Pressable
                  key={cat.key}
                  style={styles.categoryItem}
                  onPress={() => handleCategoryPress(cat.key)}
                >
                  <View style={[
                    styles.categoryIcon,
                    { backgroundColor: active ? Colors.primaryContainer : cat.color },
                    active && styles.categoryIconActive,
                  ]}>
                    <MaterialIcons
                      name={cat.icon}
                      size={22}
                      color={active ? Colors.primary : Colors.onSurfaceVariant}
                    />
                  </View>
                  <Text style={[
                    styles.categoryLabel,
                    active && styles.categoryLabelActive,
                  ]}>
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={Colors.primary} />
          </View>
        ) : services.length === 0 ? (
          <View style={styles.emptyWrap}>
            <MaterialIcons name="search-off" size={40} color={Colors.outlineVariant} />
            <Text style={styles.emptyText}>Nenhum serviço encontrado.</Text>
          </View>
        ) : (
          <>
            {/* Profissionais em Destaque */}
            {featuredProviders.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Profissionais em Destaque</Text>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={featuredProviders}
                  keyExtractor={item => String(item.provider_id)}
                  contentContainerStyle={styles.carouselContent}
                  renderItem={({ item }) => (
                    <Pressable
                      style={({ pressed }) => [styles.providerCard, pressed && { opacity: 0.88 }]}
                      onPress={() => goToProvider(item)}
                    >
                      <View style={styles.providerAvatar}>
                        <Text style={styles.providerInitials}>
                          {getInitials(item.provider_name)}
                        </Text>
                      </View>
                      <Text style={styles.providerName} numberOfLines={1}>
                        {item.provider_name}
                      </Text>
                      <Text style={styles.providerService} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <View style={styles.providerMeta}>
                        {item.avg_rating !== null ? (
                          <>
                            <MaterialIcons name="star" size={12} color="#fbbf24" />
                            <Text style={styles.providerRating}>
                              {item.avg_rating.toFixed(1)}
                            </Text>
                          </>
                        ) : (
                          <Text style={styles.providerRating}>Novo</Text>
                        )}
                        <Text style={styles.providerPrice}> · {formatPrice(item)}</Text>
                      </View>
                    </Pressable>
                  )}
                />
              </View>
            )}

            {/* Serviços Disponíveis */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Serviços Disponíveis</Text>
              <View style={styles.serviceList}>
                {services.map(service => {
                  const cat = CATEGORIES.find(c => c.key === service.category);
                  return (
                    <Pressable
                      key={service.id}
                      style={({ pressed }) => [styles.serviceCard, pressed && { opacity: 0.88 }]}
                      onPress={() => goToProvider(service)}
                    >
                      <View style={[
                        styles.serviceIcon,
                        { backgroundColor: cat?.color ?? Colors.surfaceContainerHighest },
                      ]}>
                        <MaterialIcons
                          name={cat?.icon ?? 'home-repair-service'}
                          size={22}
                          color={Colors.onSurfaceVariant}
                        />
                      </View>
                      <View style={styles.serviceBody}>
                        <Text style={styles.serviceName} numberOfLines={1}>
                          {service.name}
                        </Text>
                        <Text style={styles.serviceProvider} numberOfLines={1}>
                          {service.provider_name}
                        </Text>
                        <View style={styles.serviceMeta}>
                          {service.avg_rating !== null ? (
                            <>
                              <MaterialIcons name="star" size={11} color="#fbbf24" />
                              <Text style={styles.serviceRating}>
                                {service.avg_rating.toFixed(1)}
                              </Text>
                              <Text style={styles.serviceReviews}>
                                ({service.review_count})
                              </Text>
                            </>
                          ) : (
                            <Text style={styles.serviceRating}>Novo</Text>
                          )}
                        </View>
                      </View>
                      <View style={styles.serviceRight}>
                        <Text style={styles.servicePrice}>{formatPrice(service)}</Text>
                        <View style={styles.verBtn}>
                          <Text style={styles.verBtnText}>Ver</Text>
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  scroll: { paddingBottom: Spacing.xxxl * 2 },

  // Placeholder (prestador)
  placeholderContent: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: Spacing.base, paddingHorizontal: Spacing.xxxl,
  },
  placeholderIcon: {
    width: 80, height: 80, borderRadius: Radius.full,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center', justifyContent: 'center',
  },
  placeholderTitle: {
    fontFamily: FontFamily.headlineBold, fontSize: 20,
    color: Colors.onSurface, letterSpacing: -0.4,
    marginTop: Spacing.base, textAlign: 'center',
  },
  placeholderSubtitle: {
    fontFamily: FontFamily.bodyRegular, fontSize: 14,
    color: Colors.onSurfaceVariant, textAlign: 'center',
    lineHeight: 20, maxWidth: 280,
  },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  greeting: {
    fontFamily: FontFamily.headlineBold, fontSize: 22,
    color: Colors.onSurface, letterSpacing: -0.5,
  },
  greetingSubtitle: {
    fontFamily: FontFamily.bodyRegular, fontSize: 13,
    color: Colors.onSurfaceVariant, marginTop: 2,
  },
  notifBtn: { padding: Spacing.sm },

  // Search
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.xl,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm + 2,
    gap: Spacing.sm,
    elevation: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4,
  },
  searchInput: {
    flex: 1, fontFamily: FontFamily.bodyRegular, fontSize: 14,
    color: Colors.onSurface,
  },
  filterBtn: { padding: Spacing.xs },

  // Section
  section: { marginTop: Spacing.xl },
  sectionTitle: {
    fontFamily: FontFamily.headlineSemiBold, fontSize: 16,
    color: Colors.onSurface, letterSpacing: -0.3,
    paddingHorizontal: Spacing.xl, marginBottom: Spacing.md,
  },

  // Categories
  categoryGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: Spacing.xl, gap: Spacing.md,
  },
  categoryItem: {
    width: '21%', alignItems: 'center', gap: Spacing.xs,
  },
  categoryIcon: {
    width: 52, height: 52, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  categoryIconActive: {
    borderWidth: 1.5, borderColor: Colors.primary + '40',
  },
  categoryLabel: {
    fontFamily: FontFamily.bodyMedium, fontSize: 10,
    color: Colors.onSurfaceVariant, textAlign: 'center',
  },
  categoryLabelActive: {
    fontFamily: FontFamily.bodySemiBold, color: Colors.primary,
  },

  // Loading / Empty
  loadingWrap: { paddingVertical: Spacing.xxxl * 2, alignItems: 'center' },
  emptyWrap: {
    paddingVertical: Spacing.xxxl * 2, alignItems: 'center',
    gap: Spacing.md,
  },
  emptyText: {
    fontFamily: FontFamily.bodyRegular, fontSize: 14,
    color: Colors.onSurfaceVariant,
  },

  // Carousel
  carouselContent: { paddingHorizontal: Spacing.xl, gap: Spacing.md },
  providerCard: {
    width: 160, backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.lg, padding: Spacing.base,
    gap: Spacing.xs, elevation: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4,
  },
  providerAvatar: {
    width: 48, height: 48, borderRadius: Radius.full,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  providerInitials: {
    fontFamily: FontFamily.headlineBold, fontSize: 16, color: Colors.primary,
  },
  providerName: {
    fontFamily: FontFamily.bodySemiBold, fontSize: 13, color: Colors.onSurface,
  },
  providerService: {
    fontFamily: FontFamily.bodyRegular, fontSize: 11, color: Colors.onSurfaceVariant,
  },
  providerMeta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  providerRating: {
    fontFamily: FontFamily.bodyMedium, fontSize: 11, color: Colors.onSurfaceVariant,
    marginLeft: 2,
  },
  providerPrice: {
    fontFamily: FontFamily.bodyMedium, fontSize: 11, color: Colors.primary,
  },

  // Service List
  serviceList: { paddingHorizontal: Spacing.xl, gap: Spacing.md },
  serviceCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md, padding: Spacing.base,
    gap: Spacing.md, elevation: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4,
  },
  serviceIcon: {
    width: 44, height: 44, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  serviceBody: { flex: 1, gap: 2 },
  serviceName: {
    fontFamily: FontFamily.bodySemiBold, fontSize: 13, color: Colors.onSurface,
  },
  serviceProvider: {
    fontFamily: FontFamily.bodyRegular, fontSize: 11, color: Colors.onSurfaceVariant,
  },
  serviceMeta: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  serviceRating: {
    fontFamily: FontFamily.bodyMedium, fontSize: 11, color: Colors.onSurfaceVariant,
    marginLeft: 1,
  },
  serviceReviews: {
    fontFamily: FontFamily.bodyRegular, fontSize: 11, color: Colors.outlineVariant,
  },
  serviceRight: { alignItems: 'flex-end', gap: Spacing.xs },
  servicePrice: {
    fontFamily: FontFamily.bodySemiBold, fontSize: 12, color: Colors.primary,
  },
  verBtn: {
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  verBtnText: {
    fontFamily: FontFamily.bodySemiBold, fontSize: 11, color: Colors.primary,
  },
});
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd conecta-app && npx tsc --noEmit 2>&1 | head -20
```

Expected: sem novos erros em `index.tsx`.

- [ ] **Step 3: Commit**

```bash
git add "conecta-app/app/(tabs)/index.tsx"
git commit -m "feat(kan-22): implementar tela Home de descoberta para clientes"
```

---

## Task 8: Push, PR e tickets JIRA

**Files:** nenhum

- [ ] **Step 1: Push da branch**

```bash
git push -u origin feat/kan-22-client-home-discovery
```

- [ ] **Step 2: Criar PR no GitHub**

```bash
gh pr create \
  --base develop \
  --title "feat(kan-22): visão do cliente — Home + Descoberta de Serviços" \
  --body "$(cat <<'EOF'
## Summary
- Tabs dinâmicos por role: clientes veem (Início, Reservas, Mensagens, Conta), prestadores veem (Início, Agenda, Serviços, Conta)
- Novo endpoint público \`GET /services/public\` (sem auth) com busca e filtro por categoria
- Tela Home completa para clientes: saudação, busca com debounce 400ms, grid de 8 categorias com toggle, carrossel de profissionais em destaque, lista de serviços
- Novo grupo \`(client)/\` com placeholder de perfil do prestador
- Integração com API real via \`publicServicesApi\`

## Test plan
- [ ] Login como cliente → tabs: Início, Reservas, Mensagens, Conta
- [ ] Login como prestador → tabs: Início, Agenda, Serviços, Conta
- [ ] Home carrega serviços reais do backend
- [ ] Digitar na busca filtra serviços após 400ms
- [ ] Tocar categoria filtra lista; tocar novamente deseleciona
- [ ] Tocar card navega para placeholder de perfil do prestador
- [ ] Estado vazio exibido quando não há resultados
- [ ] \`GET /services/public?category=Elétrica\` retorna apenas serviços dessa categoria
- [ ] \`GET /services/public?q=instalação\` retorna serviços com nome/descrição matching

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 3: Criar Epic e tarefas no JIRA via API REST**

Usando as credenciais do `.mcp.json`:

```bash
# Epic: Visão do Cliente
EPIC=$(curl -s -u "lucasvilela2014@gmail.com:REDACTED" \
  -H "Content-Type: application/json" \
  -X POST "https://conecta-app.atlassian.net/rest/api/3/issue" \
  -d '{"fields":{"project":{"key":"KAN"},"issuetype":{"id":"10001"},"summary":"[Epic] Visão do Cliente"}}')
echo $EPIC

# Task KAN-22
curl -s -u "lucasvilela2014@gmail.com:REDACTED" \
  -H "Content-Type: application/json" \
  -X POST "https://conecta-app.atlassian.net/rest/api/3/issue" \
  -d '{"fields":{"project":{"key":"KAN"},"issuetype":{"id":"10003"},"summary":"feat(kan-22): Home de descoberta + tabs dinâmicos por role"}}'
```

Expected: IDs e chaves dos tickets criados (ex: `KAN-22`, `KAN-23`).
