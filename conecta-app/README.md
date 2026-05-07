# Conecta — Marketplace de Serviços sob Demanda

Aplicativo mobile de prestação de serviços sob demanda (modelo similar ao iFood para serviços). Conecta clientes com prestadores verificados na sua região.

> **Projeto acadêmico** — PRG-APP-GRUPO-3. Fase atual: frontend mockado.

---

## Stack

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

---

## Como instalar e executar

### Pré-requisitos

Certifique-se de ter instalado:

| Ferramenta | Versão mínima | Link |
|---|---|---|
| Node.js | 18+ | https://nodejs.org |
| npm | 9+ (vem com o Node) | — |
| Git | qualquer | https://git-scm.com |
| Expo CLI | instalado via npx | — |

Para rodar no dispositivo físico:
- **Expo Go** — instale no [Android](https://play.google.com/store/apps/details?id=host.exp.exponent) ou [iOS](https://apps.apple.com/app/expo-go/id982107779)

Para rodar em emulador/simulador (opcional):
- **Android** — Android Studio com um AVD configurado
- **iOS** — Xcode com simulador (somente macOS)

---

### 1. Clonar o repositório

```bash
git clone https://github.com/Lucas-AV/PRG-APP-GRUPO-3.git
cd PRG-APP-GRUPO-3/conecta-app
```

### 2. Instalar as dependências

```bash
npm install
```

Isso instala todas as dependências listadas no `package.json`, incluindo Expo SDK, React Native, fontes e demais bibliotecas.

### 3. Iniciar o servidor de desenvolvimento

```bash
npx expo start
```

O terminal exibirá um **QR code**. Escolha como abrir:

| Opção | Como usar |
|---|---|
| Expo Go (celular) | Escaneie o QR code com o app Expo Go |
| Android Emulator | Pressione `a` no terminal (requer Android Studio) |
| iOS Simulator | Pressione `i` no terminal (requer Xcode, somente macOS) |
| Navegador (Web) | Pressione `w` no terminal |

Ou use os atalhos diretos:

```bash
npm run android   # abre no emulador Android
npm run ios       # abre no simulador iOS (macOS)
npm run web       # abre no navegador
```

### 4. (Opcional) Verificar o código

```bash
npm run lint
```

---

### Solução de problemas comuns

**Erro ao instalar dependências**
```bash
# Limpe o cache e reinstale
rm -rf node_modules
npm install
```

**Metro bundler travado ou com cache corrompido**
```bash
npx expo start --clear
```

**Fontes não carregando**
Verifique se `@expo-google-fonts/manrope` e `@expo-google-fonts/inter` foram instalados corretamente. Rode `npm install` novamente se necessário.

---

## Funcionalidades implementadas

### Login & Registro

Telas de autenticação com design "Precision Minimalist".

| Tela | Arquivo | Descrição |
|---|---|---|
| Login | `app/(auth)/login.tsx` | Email + senha, acesso via Google (mock), link para cadastro |
| Cadastro | `app/(auth)/sign-up.tsx` | Nome, e-mail, telefone, senha, confirmação, aceite de termos |

**Fluxo:** `Login` → `/(tabs)` · `Cadastro` → `Onboarding`

---

### Onboarding

Fluxo de configuração de perfil pós-cadastro. O número de passos varia por tipo de usuário:

| Tipo | Passos |
|---|---|
| Cliente | 3 passos (step1 → step2 → step4) |
| Prestador | 4 passos (step1 → step2 → step3 → step4) |

O tipo de usuário é selecionado no **step0** e propagado por todos os passos via parâmetro de rota `role`.

| Tela | Arquivo | Conteúdo |
|---|---|---|
| Seleção de perfil | `app/(onboarding)/step0.tsx` | Cards "Sou Cliente" / "Sou Prestador" com radio |
| Dados pessoais | `app/(onboarding)/step1.tsx` | Foto de perfil, nome completo; prestador também preenche especialidade |
| Localização | `app/(onboarding)/step2.tsx` | Tipo (Casa/Trabalho), CEP, endereço completo, estado |
| Perfil do prestador | `app/(onboarding)/step3.tsx` | Categorias de serviço, experiência profissional, bio, verificação de documentos |
| Conclusão | `app/(onboarding)/step4.tsx` | Animação de sucesso, próximos passos, CTA para o app |

---

### Visão do Prestador de Serviço

Área exclusiva do prestador para gerenciar o catálogo de serviços. Acessível pela aba **Serviços** na barra de navegação inferior.

#### Listagem de Serviços

**Arquivo:** `app/(tabs)/services.tsx`

- Header com menu e atalhos de busca/notificações
- Card CTA em gradiente "Expandir Catálogo" → navega para Criar Serviço
- Seção **Serviços Ativos**: cards com ícone, preço, estatísticas (agendamentos + nota) e ações de Visualizar/Editar
- Seção **Rascunhos**: cards com status de rascunho e link "Continuar Edição"
- FAB `+` flutuante → navega para Criar Serviço

#### Criar Serviço

**Arquivo:** `app/(services)/create.tsx`

Formulário em 4 passos dentro de um único scroll:

1. **Informações Básicas** — nome e categoria (dropdown)
2. **Preços e Duração** — modelo de preço (Fixo / A partir de), valor, duração (dropdown)
3. **O que está incluso** — descrição livre em textarea
4. **Fotos do Serviço** — grid de upload com placeholders

Toggle "Publicar agora" + ações "Salvar e Publicar" / "Salvar como Rascunho".

#### Editar Serviço

**Arquivo:** `app/(services)/edit.tsx`

- Edição inline do nome do serviço (input grande estilo editorial)
- Categoria, modelo de preço, valor e duração editáveis
- Textarea de descrição
- Galeria de fotos com opção de remoção individual
- Ação destrutiva "Excluir Serviço Permanentemente" (com confirmação via Alert)
- Barra de ações: "Descartar" + "Salvar Alterações"

#### Visualizar Serviço (Insights)

**Arquivo:** `app/(services)/view.tsx`

Dashboard de métricas do serviço:

- Banner hero com gradiente e ícone da categoria
- Card de status com toggle Ativo/Inativo, preço base, duração e barra de Pontuação de Visibilidade
- Grid 2×2 de métricas: Faturamento, Agendamentos, Nota Média, Tempo de Resposta
- Seção de avaliações recentes com estrelas e texto do cliente
- Gráfico de atividade semanal (barras puras em RN) com destaque do dia de pico

---

## Estrutura de rotas

```
app/
├── index.tsx                   → redireciona para /(auth)/login
├── _layout.tsx                 → root Stack + carregamento de fontes
│
├── (auth)/
│   ├── _layout.tsx             → Stack com animação fade
│   ├── login.tsx
│   └── sign-up.tsx
│
├── (onboarding)/
│   ├── _layout.tsx             → Stack slide_from_right, sem gesto de voltar
│   ├── step0.tsx               → seleção de perfil
│   ├── step1.tsx               → dados pessoais
│   ├── step2.tsx               → localização
│   ├── step3.tsx               → perfil prestador (somente role=prestador)
│   └── step4.tsx               → conclusão
│
├── (tabs)/
│   ├── _layout.tsx             → TabNavigator com 4 abas
│   ├── index.tsx               → Home (placeholder)
│   ├── schedule.tsx            → Agenda (placeholder)
│   ├── services.tsx            → Meus Serviços (prestador)
│   └── profile.tsx             → Perfil (placeholder)
│
└── (services)/
    ├── _layout.tsx             → Stack slide_from_right
    ├── create.tsx              → criar serviço
    ├── edit.tsx                → editar serviço
    └── view.tsx                → visualizar insights do serviço
```

---

## Design System

Especificação completa em `template/DESIGN.md`. Princípios principais:

- **Sem bordas 1px** — separação por mudança de superfície (`surfaceContainerLow` → `surfaceContainerLowest`)
- **Tipografia** — Manrope (headlines) + Inter (body/labels)
- **Botões CTA** — sempre com LinearGradient `#0054d6 → #004abd` a 135°
- **Elevação** — camadas tonais, sombra apenas em elementos flutuantes (FAB, modais)
- **Espaçamento mínimo de margem lateral** — `Spacing.xl` (20 px)

### Tokens (`constants/theme.ts`)

| Token | Valor |
|---|---|
| `Colors.primary` | `#0054d6` |
| `Colors.background` | `#f9f9f9` |
| `Colors.surfaceContainerLowest` | `#ffffff` |
| `Colors.onSurface` | `#2d3435` |
| `Spacing.xl` | `20` |
| `Radius.xl` | `24` |

### Componentes UI reutilizáveis (`components/ui/`)

| Componente | Descrição |
|---|---|
| `GradientButton` | Botão CTA com gradiente signature, estado desabilitado, escala no press |
| `InputField` | Campo com label flutuante, ícone opcional, suporte a senha e multiline |
| `TopAppBar` | Header com safe area, botão voltar e badge de passo |
| `ProgressBar` | Barra de progresso do onboarding com label e percentual |

---

## Próximas implementações previstas

- [ ] Visão do Cliente (home, busca de serviços, contratação)
- [ ] Tela de Agendamentos (prestador e cliente)
- [ ] Tela de Perfil
- [ ] Integração com backend / API real
- [ ] Notificações push

---

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npx expo start` | Inicia servidor de desenvolvimento |
| `npm run android` | Abre direto no emulador Android |
| `npm run ios` | Abre direto no simulador iOS |
| `npm run web` | Abre no navegador |
| `npm run lint` | Executa ESLint |
| `npm run reset-project` | Reseta para projeto em branco (move `app/` para `app-example/`) |
