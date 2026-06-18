# TO_IMPLEMENT.md

Funcionalidades que ainda não foram implementadas e precisam ser construídas do zero (ou estão como stub de UI sem lógica real).

---

## ✅ Implementado nesta sessão

| Item | O que foi feito |
|---|---|
| **C1** | `components/ui/empty-state.tsx` criado com props `icon`, `title`, `subtitle`, `actionLabel`, `onAction` |
| **C2** | `components/ui/avatar-initials.tsx` criado com suporte a `size`, `imageUri`, `showEditBadge` |
| **C3** | `hooks/useComingSoonAlert.ts` criado e substituído em `about.tsx`, `receipt.tsx`, `payments.tsx`, `privacy-security.tsx` |
| **C10** | `components/ui/bottom-sheet.tsx` criado — `visible`, `onClose`, `title?`, `children`, `scrollable?`; backdrop fecha ao tocar fora |
| **3 (parcial)** | `edit-profile.tsx` e `step1.tsx` — botão de câmera abre `expo-image-picker` (galeria), foto exibida localmente no avatar; upload ao servidor pendente |
| **9** | `about.tsx` — links sociais Instagram, LinkedIn e E-mail wired via `Linking.openURL()` |
| **10** | `receipt.tsx` — "Baixar Comprovante" gera PDF real via `expo-print` + `expo-sharing`; "Preciso de Ajuda" abre WhatsApp |
| **13** | `profile.tsx` — toggle "Notificações" persiste em `expo-secure-store` (chave `notifications_enabled`); biometrics também persiste |
| **C4** | `components/ui/icon-wrapper.tsx` criado — pronto para uso |
| **C5** | `components/ui/section-header.tsx` criado — pronto para uso |
| **C6** | `components/ui/list-item.tsx` criado com props `icon`, `title`, `subtitle`, `rightElement`, `showChevron`, `danger` |
| **C7** | `components/ui/status-badge.tsx` criado com props `label`, `color`, `backgroundColor` |
| **C8** | `components/ui/transaction-list-item.tsx` criado com props `icon`, `title`, `subtitle`, `amount`, `statusLabel` |
| **C9** | `components/ui/rating-pill.tsx` criado com props `rating`, `count`, `size` |
| **C11** | `constants/Shadows.ts` criado com 4 níveis (`sm`, `md`, `lg`, `xl`) |
| **C12** | `hooks/useAsyncData.ts` criado com suporte a `reload()` e cancelamento de race condition |
| **5** | `step3.tsx` — botões "Salvar" e "Continuar" agora persistem serviços selecionados como rascunhos via `servicesApi.create()` |
| **13** | `about.tsx` — versão do app agora lida dinamicamente via `expo-constants` |

---

## 1. Sistema de Mensagens

**Arquivo:** `app/(tabs)/messages.tsx`  
**Status atual:** Tela inteiramente placeholder — exibe apenas "Em breve você poderá conversar com prestadores de serviço"

**O que implementar:**
- Backend: tabela `messages` e `conversations` no banco; endpoints `GET /conversations`, `POST /conversations/{id}/messages`, `GET /conversations/{id}/messages`
- Frontend: lista de conversas, tela de chat com histórico de mensagens, campo de digitação
- Considerar WebSockets (ex.: Socket.io) para mensagens em tempo real, ou polling como alternativa mais simples

---

## ✅ 2. Dashboard do Prestador (Home)

**Arquivo:** `app/(tabs)/index.tsx`  
**Status:** Implementado — `ProviderHomeScreen` component substitui o placeholder.

**O que foi feito:**
- Header com saudação + sino de notificações (navega para `/notifications`) + avatar com iniciais
- Cards de stats: agendamentos de hoje, serviços ativos, receita total de serviços concluídos
- Ações rápidas: Meus Serviços, Disponibilidade, Desempenho, Avaliações
- Lista de próximos agendamentos (status `confirmado`, ordem cronológica, máx 5)
- Grade de serviços ativos (máx 4 chips)
- Estado vazio com ícone para ambas as seções
- Dados via `appointmentsApi.list()` + `servicesApi.list()` — ambos filtram automaticamente pelo usuário logado

---

## 3. Upload de Foto de Perfil ✅ parcial

**Arquivo:** `app/(account)/edit-profile.tsx`, `app/(onboarding)/step1.tsx`  
**Status:** Seleção local implementada — upload ao servidor pendente.

**O que foi feito:**
- `expo-image-picker` instalado (`npx expo install expo-image-picker`)
- Botão de câmera em `edit-profile.tsx` solicita permissão de galeria e abre `launchImageLibraryAsync({ allowsEditing: true, aspect: [1,1], quality: 0.85 })`; foto selecionada exibida no avatar via `Image`
- Mesmo fluxo em `step1.tsx`; label muda para "FOTO SELECIONADA" quando foto escolhida

**Ainda pendente (requer backend):**
- Backend: endpoint `PUT /users/{userId}/avatar` com `multipart/form-data` + campo `avatar` na tabela `users`
- Frontend: enviar `photoUri` ao backend após seleção e atualizar `user.avatar` via `updateUser()`

---

## ✅ 4. Sistema de Notificações (frontend derivado de agendamentos)

**Arquivos:**
- `app/(account)/notifications.tsx` — tela criada
- `app/(tabs)/index.tsx` — sino agora navega para a tela

**Status:** Implementado com dados derivados de agendamentos (sem backend dedicado).

**O que foi feito:**
- Nova tela `/(account)/notifications` com lista de notificações agrupadas por "Hoje / Esta semana / Anteriores"
- Notificações derivadas de `appointmentsApi.list()` — cada agendamento gera um item com ícone e texto contextual por status (`confirmado`, `cancelado`, `concluido`) e papel do usuário (cliente vs. prestador)
- Tempo relativo formatado ("Agora mesmo", "3h atrás", "2d atrás", data)
- Toque navega para `/(scheduling)/appointment-detail`
- Sino no header do cliente e do prestador ambos navegam para a tela
- Badge no sino do prestador acende se houver agendamentos hoje

**Ainda pendente (requer backend):**
- Tabela `notifications` real com leitura/não-lida
- Push notifications via `expo-notifications`
- Badge de não lidas no sino da tab de forma persistente

---

## 5. ✅ Onboarding — Persistência (step3 implementado)

**Arquivos:** `app/(onboarding)/step2.tsx`, `step3.tsx`, `step3b.tsx`, `step4.tsx`  
**Status atual:** `step3.tsx` implementado — botões "Salvar" e "Continuar" agora persistem categorias de serviço selecionadas como `status: 'rascunho'` via `servicesApi.create()`. Bio é salva como `description` de cada serviço. `step4.tsx` chama `markOnboardingComplete()` corretamente.

**Ainda pendente:**
- `step3b.tsx` — upload de documentos (RG, comprovante de residência, antecedentes): sem endpoint no backend ainda
- Bio/experiências profissionais: o schema do banco não tem coluna `bio` em `users`; requer migração ou nova tabela `provider_profiles`

---

## 6. Validação de Cupom

**Arquivo:** `app/(account)/payments.tsx`  
**Status atual:** Campo de cupom existe na UI mas não há lógica de validação

**O que implementar:**
- Backend: tabela `coupons` com código, desconto, validade e limite de uso; endpoint `POST /coupons/validate`
- Frontend: ao submeter o código, chamar o endpoint e exibir o desconto aplicado ou mensagem de erro

---

## ✅ 7. Funcionalidades de Segurança e Privacidade

**Arquivo:** `app/(account)/privacy-security.tsx`  
**Status:** Implementado — funcionalidades disponíveis com o backend atual, mais 2FA informativo.

**O que foi feito:**
- "Alterar senha" → já navegava para `change-password.tsx` (funciona via `usersApi.changePassword`)
- "Autenticação biométrica" → toggle persiste preferência no `expo-secure-store` (chave `biometrics_enabled`)
- "Autenticação de dois fatores" → `Alert` informativo explicando o que é 2FA e que chegará em breve (SMS + TOTP), em vez do genérico "em desenvolvimento"
- "Permissões do App" → `Linking.openSettings()` abre as configurações reais do app no dispositivo
- "Baixar cópia dos meus dados" → `Share.share()` exporta nome, email, telefone, perfil do usuário formatados; conforme LGPD
- "Solicitar exclusão de conta" → já navegava para `delete-account.tsx`

**Ainda pendente (requer backend):**
- 2FA real (TOTP/SMS) — sem tabela `user_mfa` no banco
- Dispositivos conectados — sem tabela `sessions` no banco

---

## ✅ 8. Central de Suporte

**Arquivo:** `app/(account)/support.tsx`  
**Status:** Implementado — tela completamente reformulada com FAQ interativo e contatos reais.

**O que foi feito:**
- Card de status "Suporte Online" com botão "Iniciar Chat" que abre o WhatsApp
- Grid "Fale Conosco" com 3 ações reais: WhatsApp (`wa.me/5511999999999`), E-mail (`mailto:suporte@conectaapp.com.br`), Ligar (`tel:+5511999999999`) via `Linking.openURL()`
- Seção FAQ com 4 `FaqPanel` expansion panels (Pagamentos, Agendamentos, Segurança, Como usar o Conecta) com conteúdo completo
- Botão "VER TUDO / RECOLHER" que expande/colapsa todos os painéis simultaneamente
- Painéis individuais também são clicáveis para expandir/colapsar

---

## ✅ 9. Tela Sobre o App — Links Sociais

**Arquivo:** `app/(account)/about.tsx`  
**Status:** Implementado — links sociais wired.

**O que foi feito:**
- Helper `openURL(url)` com `Linking.openURL()` + fallback `Alert` em caso de erro
- Instagram → `https://instagram.com/conectaapp`
- LinkedIn → `https://linkedin.com/company/conectaapp`
- E-mail → `mailto:contato@conectaapp.com.br`
- Versão do app dinâmica via `expo-constants` (item anterior desta sessão)

**Ainda pendente:**
- URL real de blog/site quando existir; formulário de report de bug

---

## ✅ 10. Download de Recibo (PDF)

**Arquivo:** `app/(account)/receipt.tsx`  
**Status:** Implementado — PDF gerado e compartilhado nativamente.

**O que foi feito:**
- `expo-print` + `expo-sharing` instalados
- "Baixar Comprovante": gera HTML completo → `Print.printToFileAsync()` → `Sharing.shareAsync()` com `mimeType: 'application/pdf'`; botão mostra `ActivityIndicator` + "Gerando PDF…" durante o processo
- "Preciso de Ajuda": abre WhatsApp (`wa.me/5511999999999`) com texto pré-preenchido; fallback para email de suporte
- Verificação de `Sharing.isAvailableAsync()` antes de compartilhar

---

## 11. Portfólio do Prestador

**Arquivo:** `app/(client)/provider-profile.tsx` linha 342  
**Status atual:** Botão "Ver portfólio completo" mostra alert

**O que implementar:**
- Backend: tabela `portfolio_items` com imagens e descrições vinculadas ao prestador
- Endpoints: `GET /users/{providerId}/portfolio`, `POST /users/{providerId}/portfolio`, `DELETE /users/{providerId}/portfolio/{id}`
- Frontend: galeria de fotos na tela de perfil do prestador; tela de gerenciamento de portfólio para o prestador

---

## 12. Denúncia de Prestador

**Arquivo:** `app/(client)/provider-profile.tsx` linha 514  
**Status atual:** Botão "Denunciar" exibe uma mensagem de sucesso mas não envia nada ao backend

**O que implementar:**
- Backend: tabela `reports`; endpoint `POST /users/{userId}/reports`
- Frontend: formulário com motivo da denúncia antes de confirmar

---

## ✅ 13. Notificações no Perfil

**Arquivo:** `app/(tabs)/profile.tsx`  
**Status:** Implementado — toggle persiste preferência localmente.

**O que foi feito:**
- Toggle "Notificações" alterado de `SettingsRow` com `onPress` para `SettingsRowToggle` com `value` + `onValueChange`
- Estado `notifications` inicializado como `false`; carregado de `expo-secure-store` (chave `notifications_enabled`) no mount via `useEffect`
- `handleNotifications(value)` → `setNotifications(value)` + `SecureStore.setItemAsync('notifications_enabled', String(value))`
- Biometrics (`biometrics_enabled`) também unificado para usar o mesmo padrão de persistência

**Ainda pendente:**
- Sincronizar preferência com backend quando endpoint existir
- Integrar com `expo-notifications` para push notifications reais

---

## Resumo por Prioridade

| # | Funcionalidade | Prioridade | Esforço |
|---|---|---|---|
| 1 | Integração MercadoPago (ver TO_UNMOCK) | Crítica | Alto |
| 2 ✅ | Dashboard do Prestador | Alta | Médio |
| 3 ✅ parcial | Upload de Foto de Perfil (seleção local ✅, upload ao server pendente) | Alta | Baixo |
| 4 ✅ | Sistema de Notificações (frontend) | Alta | Alto |
| 5 ✅ | Onboarding — Persistência (step3 wired) | Alta | Baixo |
| 6 | Sistema de Mensagens | Média | Alto |
| 7 | Validação de Cupom | Média | Médio |
| 8 ✅ | Download de Recibo (PDF) | Média | Baixo |
| 9 | Portfólio do Prestador | Média | Médio |
| 10 | Denúncia de Prestador | Baixa | Baixo |
| 11 ✅ | Segurança e Privacidade | Baixa | Alto |
| 12 ✅ | Central de Suporte | Baixa | Médio |
| 13 ✅ | Tela Sobre o App (links sociais ✅, versão dinâmica ✅) | Baixa | Baixo |

---

## Componentização — Trechos Repetidos

Padrões de código duplicados que devem ser extraídos para componentes ou hooks compartilhados em `components/ui/`.

---

### ✅ C1. `EmptyStateView` — Estado vazio (ícone + título + subtítulo) **[IMPLEMENTADO]**

**Arquivos:**
- `app/(account)/addresses.tsx` linhas 141–154
- `app/(client)/provider-profile.tsx` linhas 237–238

**Props sugeridas:**
```typescript
icon: string        // nome do MaterialIcon
title: string
subtitle?: string
actionLabel?: string
onAction?: () => void
```

---

### ✅ C2. `AvatarInitials` — Avatar circular com iniciais **[IMPLEMENTADO]**

**Arquivos:**
- `app/(tabs)/profile.tsx` linhas 173–196
- `app/(account)/edit-profile.tsx` linhas 30–72
- `app/(client)/provider-profile.tsx` linhas 162–188

**Props sugeridas:**
```typescript
initials: string
size?: 'sm' | 'md' | 'lg'
imageUri?: string
showEditBadge?: boolean
onPress?: () => void
```

---

### ✅ C3. `useComingSoonAlert` — Hook para alerta "Em breve" **[IMPLEMENTADO]**

**Arquivos (5+ ocorrências):**
- `app/(account)/about.tsx` linha 73
- `app/(tabs)/profile.tsx` linha 152
- `app/(account)/payments.tsx` linha 88
- `app/(account)/support.tsx` linha 29
- `app/(client)/provider-profile.tsx` linhas 342, 453
- `app/(account)/privacy-security.tsx` múltiplas linhas
- `app/(account)/receipt.tsx` múltiplas linhas

**Implementação sugerida:**
```typescript
// hooks/useComingSoonAlert.ts
export const useComingSoonAlert = () =>
  () => Alert.alert('Em breve', 'Esta funcionalidade estará disponível em breve.', [{ text: 'OK' }]);
```

---

### ✅ C4. `IconWrapper` — Ícone em círculo/quadrado colorido **[IMPLEMENTADO]**

**Arquivos:**
- `app/(account)/addresses.tsx` linhas 274–281
- `app/(tabs)/profile.tsx` linhas 118–124
- `app/(account)/edit-profile.tsx` linhas 214–221
- `app/(account)/payments.tsx` linhas 382–389
- `app/(account)/support.tsx` linhas 172–179

**Props sugeridas:**
```typescript
icon: string
size?: number        // padrão: 40
color?: string
backgroundColor?: string
borderRadius?: 'full' | 'md' | 'sm'
```

---

### ✅ C5. `SectionHeader` — Título de seção com ação opcional **[IMPLEMENTADO]**

**Arquivos:**
- `app/(tabs)/profile.tsx` linhas 208–227
- `app/(account)/payments.tsx` linhas 223–227
- `app/(account)/support.tsx` linhas 58–59, 78–81
- `app/(account)/payment-history.tsx` linhas 114–117

**Props sugeridas:**
```typescript
title: string
actionLabel?: string
onAction?: () => void
```

---

### ✅ C6. `ListItem` — Linha de lista com ícone, texto e chevron **[IMPLEMENTADO]**

**Arquivos:**
- `app/(account)/addresses.tsx` linhas 160–221
- `app/(account)/payments.tsx` linhas 145–172
- `app/(account)/payment-history.tsx` linhas 119–159
- `app/(account)/support.tsx` linhas 85–94
- `app/(tabs)/profile.tsx` linhas 62–104

**Props sugeridas:**
```typescript
icon?: string
title: string
subtitle?: string
onPress?: () => void
rightElement?: ReactNode  // chevron, badge, switch, etc.
```

---

### ✅ C7. `StatusBadge` — Pílula colorida de status **[IMPLEMENTADO]**

**Arquivos:**
- `app/(account)/payments.tsx` linhas 22–32, 151–154
- `app/(account)/payment-history.tsx` linhas 33–37, 151–155
- `app/(scheduling)/appointment-detail.tsx` linhas 35–39

**Props sugeridas:**
```typescript
status: string
color: string
backgroundColor: string
```

> Nota: existe `components/ui/role-badge.tsx` no projeto (não rastreado no git). Verificar se pode ser unificado com este padrão.

---

### ✅ C8. `TransactionListItem` — Item de transação (caixa de ícone + info + valor) **[IMPLEMENTADO]**

**Arquivos:**
- `app/(account)/payments.tsx` linhas 235–251
- `app/(account)/payment-history.tsx` linhas 142–157
- `app/(account)/card-detail.tsx` linhas 22–26 (dados mockados — ver TO_UNMOCK #2)

**Props sugeridas:**
```typescript
icon: string
title: string
subtitle: string
amount: string
status?: string
```

---

### ✅ C9. `RatingPill` — Estrela + nota + contagem **[IMPLEMENTADO]**

**Arquivos:**
- `app/(client)/provider-profile.tsx` linhas 181–187, 378–383

**Props sugeridas:**
```typescript
rating: number
count: number
size?: 'sm' | 'md'
```

---

### ✅ C10. `BottomSheet` — Modal de folha inferior **[IMPLEMENTADO]**

**Arquivo:** `components/ui/bottom-sheet.tsx`

**O que foi feito:**
- Props: `visible`, `onClose`, `title?`, `children`, `scrollable?` (default `false`)
- Backdrop semitransparente com `animationType="slide"` e `onRequestClose`
- Handle pill (barra cinza) no topo; header com título + botão X (apenas quando `title` fornecido)
- Fechar ao tocar no backdrop via `Pressable` externo; toque no sheet não propaga
- Suporte a modo scroll via `ScrollView` interno
- Padding inferior com `useSafeAreaInsets` para respeitar home indicator

**Arquivos que podem migrar para usar este componente:**
- `app/(tabs)/profile.tsx` linhas 272–317
- `app/(client)/provider-profile.tsx` linhas 468–529

---

### ✅ C11. Shadow utilities — Estilos de sombra duplicados **[IMPLEMENTADO]**

`shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`, `elevation` são redefinidos em praticamente todos os arquivos. Extrair para constantes no design system:

**Destino sugerido:** `constants/Shadows.ts`

```typescript
export const Shadows = {
  sm:  { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2,  elevation: 1 },
  md:  { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4,  elevation: 3 },
  lg:  { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 8,  elevation: 5 },
};
```

---

### ✅ C12. `useAsyncData` — Hook de busca com loading/error **[IMPLEMENTADO]**

Padrão `useState(true)` + `useEffect(() => { fetch().finally(() => setLoading(false)) })` repetido em:

- `app/(account)/addresses.tsx` linhas 35–66
- `app/(tabs)/schedule.tsx` linhas 62–101
- `app/(account)/payments.tsx` linhas 72–86
- `app/(account)/payment-history.tsx` linhas 45–64
- `app/(account)/plans.tsx` linhas 30–44
- `app/(client)/provider-profile.tsx` linhas 109–121

**Implementação sugerida:**
```typescript
// hooks/useAsyncData.ts
export function useAsyncData<T>(fetcher: () => Promise<T>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setLoading(true);
    fetcher().then(setData).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, deps);
  return { data, loading, error };
}
```

---

### Resumo de Componentização

| # | Componente/Hook | Arquivos afetados | Ganho |
|---|---|---|---|
| ✅ C1 | `EmptyStateView` | 2 | Consistência visual |
| ✅ C2 | `AvatarInitials` | 3 | Evita 3 implementações paralelas |
| ✅ C3 | `useComingSoonAlert` | 7+ | Elimina string duplicada em 10+ lugares |
| ✅ C4 | `IconWrapper` | 5 | Padroniza tamanhos/cores |
| ✅ C5 | `SectionHeader` | 4 | Consistência tipográfica |
| ✅ C6 | `ListItem` | 5 | Unifica padrão principal de navegação |
| ✅ C7 | `StatusBadge` | 3 | Centraliza mapeamento de cores por status |
| ✅ C8 | `TransactionListItem` | 3 | Elimina duplicação + facilita unmocking |
| ✅ C9 | `RatingPill` | 1 | Pequeno, mas reutilizável |
| ✅ C10 | `BottomSheet` | 2 | Elimina 80+ linhas duplicadas de modal |
| ✅ C11 | `Shadows` constants | todos os arquivos | Remove redefinição em cada StyleSheet |
| ✅ C12 | `useAsyncData` | 6 | Centraliza tratamento de loading/error |
