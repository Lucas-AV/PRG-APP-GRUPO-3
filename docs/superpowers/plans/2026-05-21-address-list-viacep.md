# Address List + ViaCEP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar tela de listagem de endereços com edição/exclusão e integrar auto-preenchimento via ViaCEP no formulário de cadastro/edição.

**Architecture:** Nova rota `/(account)/addresses` lista os endereços do usuário; `add-address.tsx` é reutilizado para criação e edição (recebe `id` + campos via `useLocalSearchParams`); backend ganha `PUT /users/:userId/addresses/:id`.

**Tech Stack:** React Native (Expo Router), TypeScript, Express.js, better-sqlite3, ViaCEP REST API (https://viacep.com.br/ws/{cep}/json/)

---

## File Map

| Arquivo | Ação | Responsabilidade |
|---------|------|-----------------|
| `conecta-backend/routes/users.js` | Modificar | Adicionar `PUT /:userId/addresses/:id` |
| `conecta-app/services/api.ts` | Modificar | Adicionar `usersApi.updateAddress` |
| `conecta-app/app/(account)/addresses.tsx` | Criar | Tela de listagem de endereços |
| `conecta-app/app/(account)/add-address.tsx` | Modificar | Suporte a edição via params + ViaCEP |
| `conecta-app/app/(tabs)/profile.tsx` | Modificar | Redirecionar "Endereços" para `/addresses` |

---

## Task 1: Branch de feature

**Files:**
- (nenhum arquivo editado)

- [ ] **Step 1: Criar branch a partir de develop**

```bash
git checkout develop
git pull origin develop
git checkout -b feat/kan-21-listagem-enderecos-viacep
```

Expected: branch criada a partir do HEAD de develop.

- [ ] **Step 2: Verificar ponto de partida**

```bash
git log --oneline -3
```

Expected: 3 commits recentes do develop (merges de KAN-20, KAN-17, etc.)

---

## Task 2: Endpoint PUT /users/:userId/addresses/:id (backend)

**Files:**
- Modify: `conecta-backend/routes/users.js` (após o `router.delete` de addresses, ~linha 358)

- [ ] **Step 1: Adicionar endpoint PUT antes do `module.exports`**

Inserir após o bloco `router.delete('/:userId/addresses/:id', ...)` (após a linha `return res.json({ message: 'Endereço removido com sucesso' });` e `});`):

```javascript
/**
 * @swagger
 * /users/{userId}/addresses/{id}:
 *   put:
 *     summary: Atualiza um endereço do usuário autenticado
 *     tags: [Endereços]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [casa, trabalho, outro]
 *               zip_code:
 *                 type: string
 *               street:
 *                 type: string
 *               number:
 *                 type: string
 *               complement:
 *                 type: string
 *               neighborhood:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *     responses:
 *       200:
 *         description: Endereço atualizado
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Endereço não encontrado
 */
router.put('/:userId/addresses/:id', (req, res) => {
  const address = db.prepare('SELECT * FROM addresses WHERE id = ?').get(req.params.id);

  if (!address) return res.status(404).json({ error: 'Endereço não encontrado' });
  if (address.user_id !== req.user.id) return res.status(403).json({ error: 'Acesso negado' });

  const { type, zip_code, street, number, complement, neighborhood, city, state } = req.body;

  db.prepare(`
    UPDATE addresses
    SET type = ?, zip_code = ?, street = ?, number = ?, complement = ?, neighborhood = ?, city = ?, state = ?
    WHERE id = ?
  `).run(
    type ?? address.type,
    zip_code !== undefined ? zip_code : address.zip_code,
    street ?? address.street,
    number !== undefined ? number : address.number,
    complement !== undefined ? complement : address.complement,
    neighborhood !== undefined ? neighborhood : address.neighborhood,
    city ?? address.city,
    state ?? address.state,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM addresses WHERE id = ?').get(req.params.id);
  return res.json(updated);
});
```

- [ ] **Step 2: Testar o endpoint manualmente**

Com o servidor rodando (`node index.js` em `conecta-backend/`), fazer login para obter token, depois:

```bash
# Substitua TOKEN e IDs reais
curl -X PUT http://localhost:3000/users/1/addresses/1 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"street": "Rua Atualizada", "city": "São Paulo", "state": "SP"}'
```

Expected: JSON com o endereço atualizado, `street: "Rua Atualizada"`.

- [ ] **Step 3: Commit**

```bash
git add conecta-backend/routes/users.js
git commit -m "feat(kan-21): adicionar endpoint PUT /users/:userId/addresses/:id"
```

---

## Task 3: `updateAddress` em api.ts

**Files:**
- Modify: `conecta-app/services/api.ts` — bloco `usersApi`

- [ ] **Step 1: Adicionar método `updateAddress` ao `usersApi`**

Localizar o método `deleteAddress` em `usersApi` e adicionar `updateAddress` logo antes dele:

```typescript
  updateAddress: (userId: number, addressId: number, data: Partial<Omit<Address, 'id' | 'user_id' | 'created_at'>>, token: string) =>
    request<Address>(`/users/${userId}/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token),
```

O bloco completo de `usersApi` após a edição deve ficar:

```typescript
export const usersApi = {
  update: (id: number, data: { name?: string; email?: string; phone?: string }, token: string) =>
    request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token),

  changePassword: (id: number, data: { current_password: string; new_password: string }, token: string) =>
    request<{ message: string }>(`/users/${id}/password`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token),

  deleteAccount: (id: number, data: { password: string }, token: string) =>
    request<{ message: string }>(`/users/${id}`, {
      method: 'DELETE',
      body: JSON.stringify(data),
    }, token),

  listAddresses: (userId: number, token: string) =>
    request<Address[]>(`/users/${userId}/addresses`, {}, token),

  addAddress: (userId: number, data: Omit<Address, 'id' | 'user_id' | 'created_at'>, token: string) =>
    request<Address>(`/users/${userId}/addresses`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, token),

  updateAddress: (userId: number, addressId: number, data: Partial<Omit<Address, 'id' | 'user_id' | 'created_at'>>, token: string) =>
    request<Address>(`/users/${userId}/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token),

  deleteAddress: (userId: number, addressId: number, token: string) =>
    request<{ message: string }>(`/users/${userId}/addresses/${addressId}`, { method: 'DELETE' }, token),
};
```

- [ ] **Step 2: Verificar que não há erros de TypeScript**

```bash
cd conecta-app && npx tsc --noEmit 2>&1 | head -20
```

Expected: sem erros relacionados a `updateAddress`.

- [ ] **Step 3: Commit**

```bash
git add conecta-app/services/api.ts
git commit -m "feat(kan-21): adicionar updateAddress ao usersApi"
```

---

## Task 4: Tela de listagem de endereços (`addresses.tsx`)

**Files:**
- Create: `conecta-app/app/(account)/addresses.tsx`

- [ ] **Step 1: Criar o arquivo `addresses.tsx`**

```typescript
import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { TopAppBar } from '@/components/ui/top-app-bar';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { usersApi, Address } from '@/services/api';

const TYPE_ICON: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  casa: 'home',
  trabalho: 'work',
  outro: 'more-horiz',
};

const TYPE_LABEL: Record<string, string> = {
  casa: 'Casa',
  trabalho: 'Trabalho',
  outro: 'Outro',
};

export default function AddressesScreen() {
  const { user, token } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!user || !token) return;
    setLoading(true);
    usersApi.listAddresses(user.id, token)
      .then(setAddresses)
      .catch(() => Alert.alert('Erro', 'Não foi possível carregar os endereços.'))
      .finally(() => setLoading(false));
  }, [user, token]);

  useFocusEffect(load);

  const handleDelete = (id: number) => {
    if (!user || !token) return;
    Alert.alert(
      'Remover endereço',
      'Tem certeza que deseja remover este endereço?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await usersApi.deleteAddress(user.id, id, token);
              setAddresses(prev => prev.filter(a => a.id !== id));
            } catch (e: any) {
              Alert.alert('Erro', e.message ?? 'Não foi possível remover.');
            }
          },
        },
      ]
    );
  };

  const handleEdit = (address: Address) => {
    router.push({
      pathname: '/(account)/add-address' as any,
      params: {
        id: String(address.id),
        type: address.type,
        zip_code: address.zip_code ?? '',
        street: address.street,
        number: address.number ?? '',
        complement: address.complement ?? '',
        neighborhood: address.neighborhood ?? '',
        city: address.city,
        state: address.state,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar
        title="Endereços"
        rightAction={
          <Pressable
            onPress={() => router.push('/(account)/add-address' as any)}
            style={styles.addButton}
          >
            <MaterialIcons name="add" size={24} color={Colors.primary} />
          </Pressable>
        }
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : addresses.length === 0 ? (
        <View style={styles.center}>
          <MaterialIcons name="location-off" size={48} color={Colors.outlineVariant} />
          <Text style={styles.emptyTitle}>Nenhum endereço cadastrado</Text>
          <Text style={styles.emptySubtitle}>Toque em "+" para adicionar um endereço.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {addresses.map(address => (
            <View key={address.id} style={styles.card}>
              <View style={styles.cardIcon}>
                <MaterialIcons
                  name={TYPE_ICON[address.type] ?? 'location-on'}
                  size={22}
                  color={Colors.primary}
                />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardType}>{TYPE_LABEL[address.type] ?? address.type}</Text>
                <Text style={styles.cardStreet}>
                  {address.street}{address.number ? `, ${address.number}` : ''}
                </Text>
                {address.neighborhood ? (
                  <Text style={styles.cardDetail}>{address.neighborhood}</Text>
                ) : null}
                <Text style={styles.cardDetail}>{address.city} · {address.state}</Text>
              </View>
              <View style={styles.cardActions}>
                <Pressable onPress={() => handleEdit(address)} style={styles.actionBtn}>
                  <MaterialIcons name="edit" size={20} color={Colors.outline} />
                </Pressable>
                <Pressable onPress={() => handleDelete(address.id)} style={styles.actionBtn}>
                  <MaterialIcons name="delete-outline" size={20} color={Colors.error} />
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, paddingHorizontal: Spacing.xxxl },
  addButton: { padding: Spacing.sm },
  list: { padding: Spacing.xl, gap: Spacing.md, paddingBottom: Spacing.xxxl * 2 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md,
    padding: Spacing.base,
    gap: Spacing.md,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1, gap: 2 },
  cardType: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 12,
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  cardStreet: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 14,
    color: Colors.onSurface,
  },
  cardDetail: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  cardActions: { flexDirection: 'row', gap: Spacing.xs },
  actionBtn: { padding: Spacing.sm },
  emptyTitle: {
    fontFamily: FontFamily.headlineSemiBold,
    fontSize: 16,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd conecta-app && npx tsc --noEmit 2>&1 | head -20
```

Expected: nenhum erro em `addresses.tsx`.

- [ ] **Step 3: Commit**

```bash
git add conecta-app/app/\(account\)/addresses.tsx
git commit -m "feat(kan-21): criar tela de listagem de endereços"
```

> **Nota:** `TopAppBar` pode não aceitar `rightAction` como prop — veja a implementação atual em `components/ui/top-app-bar.tsx`. Se não aceitar, use um `View` com `flexDirection: 'row'` e `justifyContent: 'space-between'` como header manual (mesmo padrão de outras telas do projeto).

---

## Task 5: Verificar TopAppBar e ajustar se necessário

**Files:**
- Read: `conecta-app/components/ui/top-app-bar.tsx`

- [ ] **Step 1: Ler a implementação atual do TopAppBar**

Abrir `conecta-app/components/ui/top-app-bar.tsx` e verificar quais props ela aceita.

- [ ] **Step 2: Se não aceitar `rightAction`, ajustar `addresses.tsx`**

Se `TopAppBar` não tiver `rightAction`, substituir o `<TopAppBar ... rightAction={...} />` por um header manual:

```typescript
<View style={styles.header}>
  <Pressable onPress={() => router.back()} style={styles.backBtn}>
    <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
  </Pressable>
  <Text style={styles.headerTitle}>Endereços</Text>
  <Pressable
    onPress={() => router.push('/(account)/add-address' as any)}
    style={styles.addButton}
  >
    <MaterialIcons name="add" size={24} color={Colors.primary} />
  </Pressable>
</View>
```

E nos estilos adicionar:
```typescript
header: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: Spacing.base,
  paddingVertical: Spacing.md,
},
backBtn: { padding: Spacing.sm },
headerTitle: {
  fontFamily: FontFamily.headlineSemiBold,
  fontSize: 18,
  color: Colors.onSurface,
},
```

- [ ] **Step 3: Verificar TypeScript novamente se houve mudança**

```bash
cd conecta-app && npx tsc --noEmit 2>&1 | head -20
```

Expected: sem erros.

---

## Task 6: Atualizar `add-address.tsx` — suporte a edição + ViaCEP

**Files:**
- Modify: `conecta-app/app/(account)/add-address.tsx`

- [ ] **Step 1: Substituir o conteúdo completo de `add-address.tsx`**

```typescript
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { GradientButton } from '@/components/ui/gradient-button';
import { InputField } from '@/components/ui/input-field';
import { TopAppBar } from '@/components/ui/top-app-bar';
import { Colors, FontFamily, Spacing, Radius } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { usersApi } from '@/services/api';

type AddressType = 'casa' | 'trabalho' | 'outro';

const ADDRESS_CHIPS: { key: AddressType; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { key: 'casa', label: 'Casa', icon: 'home' },
  { key: 'trabalho', label: 'Trabalho', icon: 'work' },
  { key: 'outro', label: 'Outro', icon: 'more-horiz' },
];

function formatCep(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return digits;
}

export default function AddAddressScreen() {
  const { user, token } = useAuth();
  const params = useLocalSearchParams<{
    id?: string;
    type?: AddressType;
    zip_code?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
  }>();

  const isEdit = !!params.id;

  const [addressType, setAddressType] = useState<AddressType>(params.type ?? 'casa');
  const [cep, setCep] = useState(params.zip_code ?? '');
  const [street, setStreet] = useState(params.street ?? '');
  const [number, setNumber] = useState(params.number ?? '');
  const [complement, setComplement] = useState(params.complement ?? '');
  const [neighborhood, setNeighborhood] = useState(params.neighborhood ?? '');
  const [city, setCity] = useState(params.city ?? '');
  const [state, setState] = useState(params.state ?? '');
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

  const handleCepChange = (text: string) => {
    const formatted = formatCep(text);
    setCep(formatted);
    const digits = formatted.replace(/\D/g, '');
    if (digits.length === 8) {
      fetchViaCep(digits);
    }
  };

  const fetchViaCep = async (digits: string) => {
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (data.erro) {
        Alert.alert('CEP não encontrado', 'Verifique o CEP informado e preencha os campos manualmente.');
        return;
      }
      setStreet(data.logradouro ?? '');
      setNeighborhood(data.bairro ?? '');
      setCity(data.localidade ?? '');
      setState(data.uf ?? '');
    } catch {
      Alert.alert('Erro', 'Não foi possível consultar o CEP. Preencha os campos manualmente.');
    } finally {
      setCepLoading(false);
    }
  };

  const handleSave = async () => {
    if (!street || !city || !state) {
      return Alert.alert('Atenção', 'Rua, cidade e estado são obrigatórios.');
    }
    if (!user || !token) return;
    setLoading(true);
    try {
      const data = {
        type: addressType,
        zip_code: cep.replace(/\D/g, '') || undefined,
        street,
        number: number || undefined,
        complement: complement || undefined,
        neighborhood: neighborhood || undefined,
        city,
        state,
      };
      if (isEdit) {
        await usersApi.updateAddress(user.id, Number(params.id), data, token);
        Alert.alert('Endereço atualizado', 'As alterações foram salvas.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        await usersApi.addAddress(user.id, data, token);
        Alert.alert('Endereço salvo', 'Seu endereço foi cadastrado com sucesso.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Não foi possível salvar o endereço.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopAppBar title={isEdit ? 'Editar Endereço' : 'Cadastrar Endereço'} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Map placeholder */}
        <View style={styles.mapSection}>
          <View style={styles.mapBox}>
            <MaterialIcons name="location-on" size={40} color={Colors.primary} />
          </View>
          <View style={styles.mapNote}>
            <MaterialIcons name="my-location" size={14} color={Colors.outline} />
            <Text style={styles.mapNoteText}>Sua localização atual aproximada</Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.cepRow}>
            <View style={{ flex: 1 }}>
              <InputField
                label="CEP"
                placeholder="00000-000"
                value={cep}
                onChangeText={handleCepChange}
                keyboardType="numeric"
              />
            </View>
            {cepLoading && (
              <ActivityIndicator
                color={Colors.primary}
                style={styles.cepSpinner}
              />
            )}
          </View>

          <InputField
            label="Rua"
            placeholder="Nome da rua ou avenida"
            value={street}
            onChangeText={setStreet}
            autoCapitalize="words"
          />

          <View style={styles.row2col}>
            <View style={styles.col5}>
              <InputField
                label="Número"
                placeholder="123"
                value={number}
                onChangeText={setNumber}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.col7}>
              <InputField
                label="Complemento"
                placeholder="Apto, Bloco, etc"
                value={complement}
                onChangeText={setComplement}
              />
            </View>
          </View>

          <InputField
            label="Bairro"
            placeholder="Seu bairro"
            value={neighborhood}
            onChangeText={setNeighborhood}
            autoCapitalize="words"
          />

          <View style={styles.row2col}>
            <View style={styles.col8}>
              <InputField
                label="Cidade"
                placeholder="Sua cidade"
                value={city}
                onChangeText={setCity}
                autoCapitalize="words"
              />
            </View>
            <View style={styles.col4}>
              <InputField
                label="Estado"
                placeholder="UF"
                value={state}
                onChangeText={t => setState(t.toUpperCase())}
                autoCapitalize="characters"
                maxLength={2}
              />
            </View>
          </View>
        </View>

        {/* Chips */}
        <View style={styles.chipsSection}>
          <Text style={styles.chipsLabel}>SALVAR COMO</Text>
          <View style={styles.chips}>
            {ADDRESS_CHIPS.map(chip => {
              const active = addressType === chip.key;
              return (
                <Pressable
                  key={chip.key}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setAddressType(chip.key)}
                >
                  <MaterialIcons
                    name={chip.icon}
                    size={18}
                    color={active ? Colors.primary : Colors.outline}
                  />
                  <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                    {chip.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <GradientButton
          label={loading ? (isEdit ? 'Salvando…' : 'Salvando…') : (isEdit ? 'Salvar Alterações' : 'Salvar Endereço')}
          onPress={handleSave}
          disabled={loading || cepLoading}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  scroll: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxxl * 2,
    gap: Spacing.xxxl,
  },
  mapSection: { gap: Spacing.md },
  mapBox: {
    width: '100%',
    height: 140,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapNote: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  mapNoteText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  form: { gap: Spacing.xxl },
  cepRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  cepSpinner: { marginTop: Spacing.xl },
  row2col: { flexDirection: 'row', gap: Spacing.md },
  col4: { flex: 4 },
  col5: { flex: 5 },
  col7: { flex: 7 },
  col8: { flex: 8 },
  chipsSection: { gap: Spacing.md },
  chipsLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 10,
    color: Colors.onSurface,
    letterSpacing: 1.2,
    marginLeft: 2,
  },
  chips: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.base,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceContainerHighest,
  },
  chipActive: {
    backgroundColor: Colors.primaryContainer,
    borderWidth: 1,
    borderColor: Colors.primary + '1A',
  },
  chipLabel: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  chipLabelActive: {
    fontFamily: FontFamily.bodySemiBold,
    color: Colors.primary,
  },
});
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd conecta-app && npx tsc --noEmit 2>&1 | head -20
```

Expected: sem erros em `add-address.tsx`.

- [ ] **Step 3: Commit**

```bash
git add conecta-app/app/\(account\)/add-address.tsx
git commit -m "feat(kan-21): suporte a edição e integração ViaCEP no formulário de endereço"
```

---

## Task 7: Atualizar navegação no `profile.tsx`

**Files:**
- Modify: `conecta-app/app/(tabs)/profile.tsx`

- [ ] **Step 1: Alterar o `onPress` do botão "Endereços"**

Localizar a linha:
```typescript
<SettingsRow icon="location-on" label="Endereços" accent onPress={() => router.push('/(account)/add-address' as any)} />
```

Substituir por:
```typescript
<SettingsRow icon="location-on" label="Endereços" accent onPress={() => router.push('/(account)/addresses' as any)} />
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd conecta-app && npx tsc --noEmit 2>&1 | head -20
```

Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add conecta-app/app/\(tabs\)/profile.tsx
git commit -m "feat(kan-21): redirecionar 'Endereços' para tela de listagem"
```

---

## Task 8: Verificar link em `edit-profile.tsx`

**Files:**
- Modify: `conecta-app/app/(account)/edit-profile.tsx`

- [ ] **Step 1: Verificar se há link para `add-address` e atualizar**

Localizar em `edit-profile.tsx`:
```typescript
onPress={() => router.push('/(account)/add-address' as any)}
```

Substituir por:
```typescript
onPress={() => router.push('/(account)/addresses' as any)}
```

- [ ] **Step 2: Commit**

```bash
git add conecta-app/app/\(account\)/edit-profile.tsx
git commit -m "feat(kan-21): atualizar link de endereços em edit-profile"
```

---

## Task 9: Push e PR

- [ ] **Step 1: Push da branch**

```bash
git push -u origin feat/kan-21-listagem-enderecos-viacep
```

- [ ] **Step 2: Criar PR**

```bash
gh pr create \
  --base develop \
  --title "feat(kan-21): tela de listagem de endereços + integração ViaCEP" \
  --body "$(cat <<'EOF'
## Summary
- Nova tela `/(account)/addresses` com listagem, edição e exclusão de endereços
- `add-address.tsx` atualizado para suportar edição via params de rota
- Integração com ViaCEP: auto-preenche rua, bairro, cidade e UF ao digitar 8 dígitos do CEP
- Backend: endpoint `PUT /users/:userId/addresses/:id` adicionado
- Navegação "Endereços" no perfil atualizada para a nova listagem

## Test plan
- [ ] Abrir o app e navegar para Perfil → Endereços
- [ ] Verificar listagem (com endereços e estado vazio)
- [ ] Adicionar novo endereço, digitar CEP válido e confirmar auto-preenchimento
- [ ] Digitar CEP inválido e confirmar alerta
- [ ] Editar endereço existente e salvar alterações
- [ ] Excluir endereço com confirmação
- [ ] Testar `PUT /users/:userId/addresses/:id` via curl

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Expected: URL do PR no GitHub.
