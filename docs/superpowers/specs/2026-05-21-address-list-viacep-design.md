# Design: Listagem de Endereços + Integração ViaCEP

**Data:** 2026-05-21  
**Status:** Aprovado

---

## Contexto

Hoje o botão "Endereços" no perfil do usuário navega diretamente para a tela de cadastro (`add-address.tsx`). Não há tela de listagem — o usuário não consegue ver, editar ou excluir endereços já cadastrados. Além disso, o campo CEP no formulário é apenas texto livre, sem auto-preenchimento.

---

## Objetivo

1. Criar tela de listagem de endereços (`addresses.tsx`) como ponto de entrada.
2. Atualizar `add-address.tsx` para suportar edição (via params de rota) e auto-preenchimento de CEP via ViaCEP.
3. Adicionar endpoint `PUT /users/:userId/addresses/:addressId` no backend.

---

## Fluxo

```
Perfil → /(account)/addresses   (lista)
              ├── FAB "+"  →  /(account)/add-address            (criação)
              └── botão editar  →  /(account)/add-address?id=X&... (edição)
```

---

## Backend

### Novo endpoint
`PUT /users/:userId/addresses/:addressId`

- Autenticado via `authMiddleware`
- Body aceita qualquer subconjunto de: `type`, `zip_code`, `street`, `number`, `complement`, `neighborhood`, `city`, `state`
- Retorna o endereço atualizado

### Atualização em `api.ts`
Adicionar `updateAddress` ao `usersApi`:
```typescript
updateAddress: (userId, addressId, data, token) =>
  request<Address>(`/users/${userId}/addresses/${addressId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }, token)
```

---

## Frontend

### 1. `app/(account)/addresses.tsx` (nova tela)

- Busca endereços via `usersApi.listAddresses(user.id, token)` no `useEffect`
- Exibe `ActivityIndicator` durante carregamento
- Estado vazio: ilustração com texto "Nenhum endereço cadastrado"
- Cada card mostra: ícone de tipo (casa/trabalho/outro), rua + número, cidade/UF, bairro
- Ações por card: botão editar (navega para `add-address` com params) e botão deletar (com `Alert.alert` de confirmação)
- FAB ou botão no header "+" navega para `/(account)/add-address`
- Segue o visual do restante do `(account)`: fundo `Colors.surface`, cards com `borderRadius Radius.md`, estilo dos outros screens

### 2. `app/(account)/add-address.tsx` (atualização)

**Suporte a edição:**
- Lê params opcionais via `useLocalSearchParams`: `id`, `type`, `zip_code`, `street`, `number`, `complement`, `neighborhood`, `city`, `state`
- Se `id` presente: chama `usersApi.updateAddress` (PUT), título muda para "Editar Endereço"
- Se sem `id`: comportamento atual (POST), título "Cadastrar Endereço"

**Integração ViaCEP:**
- Ao detectar que `cep` atingiu 8 dígitos numéricos (strip de máscara), faz `fetch('https://viacep.com.br/ws/{cep}/json/')`
- Se resposta válida (sem campo `erro`): preenche automaticamente `street` (logradouro), `neighborhood` (bairro), `city` (localidade), `state` (uf)
- Se CEP inválido/não encontrado: mostra `Alert.alert('CEP não encontrado', '...')`
- Campo CEP aplica máscara `#####-###` enquanto o usuário digita
- Campos auto-preenchidos ficam editáveis (usuário pode corrigir)

### 3. `app/(tabs)/profile.tsx` (atualização)

- "Endereços" passa a navegar para `/(account)/addresses`

---

## Tratamento de Erros

- Falha ao listar: `Alert.alert` + estado de erro com botão de retry
- Falha ao deletar: `Alert.alert` com mensagem da API
- CEP inválido: alerta sem bloquear o formulário
- Falha ao salvar/atualizar: `Alert.alert` com mensagem da API

---

## O que NÃO está no escopo

- Edição inline na lista
- Mapa/geolocalização real
- Ordenação ou filtragem de endereços
- Marcação de endereço padrão
