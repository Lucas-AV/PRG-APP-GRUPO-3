# TO_IMPLEMENT.md

Funcionalidades que ainda não foram implementadas e precisam ser construídas do zero (ou estão como stub de UI sem lógica real).

---

## ✅ Implementado nesta sessão

| Item | O que foi feito |
|---|---|
| **C3** | `hooks/useComingSoonAlert.ts` criado e substituído em `about.tsx`, `receipt.tsx`, `payments.tsx`, `privacy-security.tsx` |
| **C4** | `components/ui/icon-wrapper.tsx` criado — pronto para uso |
| **C5** | `components/ui/section-header.tsx` criado — pronto para uso |
| **C11** | `constants/Shadows.ts` criado com 4 níveis (`sm`, `md`, `lg`, `xl`) |
| **C12** | `hooks/useAsyncData.ts` criado com suporte a `reload()` e cancelamento de race condition |
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

## 2. Dashboard do Prestador (Home)

**Arquivo:** `app/(tabs)/index.tsx` linhas 149–163  
**Status atual:** Bloco `if (!isClient)` retorna tela placeholder com texto "A visão inicial do prestador estará disponível em breve"

**O que implementar:**
- Visão de resumo para o prestador: total de agendamentos do dia, próximos compromissos, receita recente
- Atalhos para gerenciar serviços, disponibilidade e ver avaliações
- Reutilizar os endpoints já existentes: `GET /appointments`, `GET /services`, `GET /services/{id}/metrics`

---

## 3. Upload de Foto de Perfil

**Arquivo:** `app/(account)/edit-profile.tsx` linha 65  
**Status atual:** Botão de câmera exibe alert "Alteração de foto estará disponível em breve"

**O que implementar:**
- Frontend: usar `expo-image-picker` para selecionar/tirar foto; fazer upload para o servidor ou serviço de storage (ex.: S3, Cloudinary, ou storage local no backend)
- Backend: endpoint `PUT /users/{userId}/avatar` que recebe `multipart/form-data` e salva a URL da imagem no campo `avatar` do usuário
- Também aplicar na etapa de onboarding `step1.tsx` onde o círculo de foto existe mas não funciona

---

## 4. Sistema de Notificações

**Arquivos:**
- `app/(tabs)/index.tsx` linha 189–194 — sino com ponto indicador, `onPress` vazio
- `app/(tabs)/profile.tsx` linha 231 — toggle "Notificações" mostra alert

**Status atual:** UI presente, nenhuma lógica implementada, nenhum endpoint no backend

**O que implementar:**
- Backend: tabela `notifications`; endpoints `GET /users/{userId}/notifications`, `PATCH /notifications/{id}/read`
- Push notifications com `expo-notifications` + serviço de envio (ex.: Expo Push Notification Service ou FCM)
- Enviar notificações para: novo agendamento, confirmação, cancelamento, nova avaliação
- Frontend: tela de listagem de notificações, badge no sino com contagem de não lidas

---

## 5. Onboarding — Persistência Incompleta

**Arquivos:** `app/(onboarding)/step2.tsx`, `step3.tsx`, `step3b.tsx`, `step4.tsx`  
**Status atual:** Etapas existem na UI mas a persistência de dados nos passos intermediários não está totalmente conectada à API

**O que implementar:**
- Garantir que cada etapa salva seus dados no backend antes de avançar (usando `usersApi.update()`)
- `step3.tsx` (endereço): verificar se `addressesApi.create()` é chamado corretamente ao confirmar
- `step3b.tsx` (detalhes do prestador — especialidade, descrição): verificar persistência
- Ao completar o onboarding, verificar se `markOnboardingComplete()` e o fluxo de redirecionamento estão funcionando corretamente para não exibir o onboarding novamente

---

## 6. Validação de Cupom

**Arquivo:** `app/(account)/payments.tsx`  
**Status atual:** Campo de cupom existe na UI mas não há lógica de validação

**O que implementar:**
- Backend: tabela `coupons` com código, desconto, validade e limite de uso; endpoint `POST /coupons/validate`
- Frontend: ao submeter o código, chamar o endpoint e exibir o desconto aplicado ou mensagem de erro

---

## 7. Funcionalidades de Segurança e Privacidade

**Arquivo:** `app/(account)/privacy-security.tsx`  
**Status atual:** Todos os botões chamam `comingSoon()` — nenhuma funcionalidade implementada

**O que implementar:**
- "Autenticação de dois fatores" — backend: geração de TOTP (ex.: `speakeasy`); frontend: tela de configuração com QR code
- "Dispositivos conectados" — backend: registrar sessions/tokens com device info; frontend: listar e revogar
- "Baixar meus dados" — backend: gerar export dos dados do usuário (LGPD); frontend: botão que dispara o processo e notifica por email

---

## 8. Central de Suporte

**Arquivo:** `app/(account)/support.tsx`  
**Status atual:** Todos os botões chamam `comingSoon()` (chat de suporte, FAQs, ligar)

**O que implementar:**
- Integrar uma ferramenta de suporte (ex.: Intercom, Zendesk, ou simplesmente abrir o WhatsApp/email da equipe)
- Seção de FAQ com perguntas frequentes em markdown ou via CMS simples
- Botão "Reportar problema" que envia um ticket por email ou para um endpoint de suporte

---

## 9. Tela Sobre o App ✅ parcial

**Arquivo:** `app/(account)/about.tsx`  
**Status atual:** Links para FAQ, Blog, Fale Conosco e Reportar Problema todos chamam `comingSoon()`

**O que implementar:**
- Links reais: URL do blog/site, email de contato, formulário de report
- Versão do app dinâmica (usar `expo-constants`)

---

## 10. Download de Recibo

**Arquivo:** `app/(account)/receipt.tsx`  
**Status atual:** Botão "Baixar recibo" chama `comingSoon()`

**O que implementar:**
- Gerar PDF do recibo com `expo-print` ou `react-native-pdf-lib`
- Compartilhar via `expo-sharing`

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

## 13. Notificações no Perfil

**Arquivo:** `app/(tabs)/profile.tsx` linha 231  
**Status atual:** Toggle "Notificações" exibe alert (depende do item 4 acima)

**O que implementar:** Conectar ao sistema de notificações descrito no item 4; salvar preferência do usuário no backend.

---

## Resumo por Prioridade

| # | Funcionalidade | Prioridade | Esforço |
|---|---|---|---|
| 1 | Integração MercadoPago (ver TO_UNMOCK) | Crítica | Alto |
| 2 | Dashboard do Prestador | Alta | Médio |
| 3 | Upload de Foto de Perfil | Alta | Baixo |
| 4 | Sistema de Notificações | Alta | Alto |
| 5 | Onboarding — Persistência | Alta | Baixo |
| 6 | Sistema de Mensagens | Média | Alto |
| 7 | Validação de Cupom | Média | Médio |
| 8 | Download de Recibo (PDF) | Média | Baixo |
| 9 | Portfólio do Prestador | Média | Médio |
| 10 | Denúncia de Prestador | Baixa | Baixo |
| 11 | Segurança e Privacidade | Baixa | Alto |
| 12 | Central de Suporte | Baixa | Médio |
| 13 | Tela Sobre o App (versão dinâmica ✅) | Baixa | Baixo |

---

## Componentização — Trechos Repetidos

Padrões de código duplicados que devem ser extraídos para componentes ou hooks compartilhados em `components/ui/`.

---

### C1. `EmptyStateView` — Estado vazio (ícone + título + subtítulo)

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

### C2. `AvatarInitials` — Avatar circular com iniciais

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

### C6. `ListItem` — Linha de lista com ícone, texto e chevron

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

### C7. `StatusBadge` — Pílula colorida de status

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

### C8. `TransactionListItem` — Item de transação (caixa de ícone + info + valor)

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

### C9. `RatingPill` — Estrela + nota + contagem

**Arquivos:**
- `app/(client)/provider-profile.tsx` linhas 181–187, 378–383

**Props sugeridas:**
```typescript
rating: number
count: number
size?: 'sm' | 'md'
```

---

### C10. `BottomSheet` — Modal de folha inferior

**Arquivos:**
- `app/(tabs)/profile.tsx` linhas 272–317
- `app/(client)/provider-profile.tsx` linhas 468–529

**Props sugeridas:**
```typescript
visible: boolean
onClose: () => void
children: ReactNode
title?: string
```

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
| C1 | `EmptyStateView` | 2 | Consistência visual |
| C2 | `AvatarInitials` | 3 | Evita 3 implementações paralelas |
| C3 | `useComingSoonAlert` | 7+ | Elimina string duplicada em 10+ lugares |
| C4 | `IconWrapper` | 5 | Padroniza tamanhos/cores |
| C5 | `SectionHeader` | 4 | Consistência tipográfica |
| C6 | `ListItem` | 5 | Unifica padrão principal de navegação |
| C7 | `StatusBadge` | 3 | Centraliza mapeamento de cores por status |
| C8 | `TransactionListItem` | 3 | Elimina duplicação + facilita unmocking |
| C9 | `RatingPill` | 1 | Pequeno, mas reutilizável |
| C10 | `BottomSheet` | 2 | Elimina 80+ linhas duplicadas de modal |
| C11 | `Shadows` constants | todos os arquivos | Remove redefinição em cada StyleSheet |
| C12 | `useAsyncData` | 6 | Centraliza tratamento de loading/error |
