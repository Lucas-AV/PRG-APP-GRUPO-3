# CHRONICLE — Mini Portal de Notícias

Aplicativo mobile de portal de notícias desenvolvido com React Native + Expo. O projeto está organizado em três frentes de desenvolvimento: **Superadmin**, **Autor** e **Leitor**. Atualmente a frente do Superadmin está completa.

---

## Estado atual

### Concluído

- **Splash + Onboarding** — tela de boas-vindas com slides
- **Autenticação simulada** — sign-in, sign-up e reset de senha (sem backend; Clerk adiado)
- **Painel Superadmin** — completo:
  - Dashboard com métricas (usuários, notícias publicadas, comentários reportados)
  - Gerenciar Usuários — lista com busca, troca de role (RBAC)
  - CRUD de Tags — com validação de duplicata e seletor de cor
  - CRUD de Cidades — com seletor de estado vinculado
  - CRUD de UFs — com sigla de 2 caracteres auto-uppercase
  - Gerenciar Notícias — publicar, mover para lixeira, restaurar
  - Moderação de Comentários — tabs Todos / Reportados, excluir por moderador

### Em desenvolvimento

- **Frente Leitor** — visualização de notícias publicadas e comentários
- **Frente Autor** — criação e edição de notícias, visualização de revisões

---

## Arquitetura de dados

Todos os dados vivem em um único store Zustand global (`store/chronicleStore.ts`) persistido via AsyncStorage. Isso garante que:

- Mudanças feitas pelo Superadmin (status de notícias, exclusão de comentários) são refletidas imediatamente nas frentes de Leitor e Autor
- Comentários excluídos via moderação ficam com `status: 'deleted_by_moderator'` no store — as telas de Leitor e Autor devem filtrar `status !== 'deleted_by_moderator'` ao exibir comentários

### Pendência para as próximas frentes

- **Comentários:** o vinculo com o store já está pronto (`comments`, `updateCommentStatus`), mas as telas de Leitor (exibir comentários numa notícia) e Autor (ver comentários nos próprios artigos) ainda precisam ser construídas consumindo esse mesmo store. O mesmo padrão usado para notícias (`news`, `updateNewsStatus`) e usuários (`users`, `updateUserRole`) deve ser replicado para comentários.

---

## Como testar

### Pré-requisitos

```bash
npm install
npx expo start --clear
```

Abra no Expo Go (Android/iOS) ou em um emulador.

### Sessão Superadmin

Na tela de login, use:

| Campo | Valor |
|-------|-------|
| E-mail | `admin@chronicle.com` |
| Senha | qualquer texto (não validada nesta fase) |

O app redireciona automaticamente para o painel admin com base no role do e-mail informado.

### Outros usuários de teste

| E-mail | Role |
|--------|------|
| `joao.silva@email.com` | Leitor |
| `ana.leitor@email.com` | Leitor |
| `maria.santos@email.com` | Autor |
| `pedro.editor@email.com` | Editor |

> Usuários não-superadmin são redirecionados para `/(tabs)` — tela ainda em desenvolvimento.

### O que testar no painel admin

1. **Dashboard** — métricas refletem o estado atual do store
2. **Usuários** — busca por nome/email, troca de role (não é possível alterar o próprio role)
3. **Tags** — criar, editar (tenta duplicar o nome para ver o erro), excluir
4. **Cidades / UFs** — CRUD completo com relação entre as entidades
5. **Notícias** — publicar notícias em revisão, mover para lixeira, restaurar
6. **Moderação** — aba "Reportados" mostra os 2 comentários com denúncias; excluir um e confirmar que some da lista

---

## Stack

- React Native + Expo SDK 54
- Expo Router v4
- NativeWind v4 (TailwindCSS)
- Zustand v5 + AsyncStorage (persist)
- TypeScript strict mode
- @expo/vector-icons (Feather)
