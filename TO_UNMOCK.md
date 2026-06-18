# TO_UNMOCK.md

Registro de tudo que está mockado/hardcoded no app e precisa ser substituído por implementações reais.

---

## ✅ Implementado nesta sessão

| Item | O que foi feito |
|---|---|
| **1** | `view.tsx` — objeto `MOCK` removido; API usada diretamente; hook order bug corrigido; empty states reais |
| **2** | `card-detail.tsx` — `CARD_TRANSACTIONS` removido; fetch via `transactionsApi.list()`; navegação para `receipt` com params reais |
| **3** | `receipt.tsx` — objeto `RECEIPT` removido; todos os dados recebidos via `useLocalSearchParams` |
| **4** | `payments.tsx` — saldo `R$ 450,00` substituído por fetch de `subscriptionsApi.get()` com estado real |
| **5** | `payments.tsx` — cupom `SEVGEN20` removido; estado inicial agora é `null` |
| **6** | Todas as imagens hardcoded removidas: `provider-profile.tsx`, `service-detail.tsx`, `provider-reviews.tsx`, `search.tsx`, `filter.tsx` usam `AvatarInitials` e dados reais da API. Schema estendido (`bio`, `specialties`, `certifications`, `years_experience`, `response_time`, `included_items`). Endpoint `GET /users/provider/:id/profile` criado. Seed rico com 6 prestadores, 4 clientes, 25 agendamentos, 14 avaliações. |

---

## 1. Dados de Serviço Mockados (`app/(services)/view.tsx`) ✅

**Linhas:** 38–83  
**O que está mockado:** Objeto `MOCK` com dois serviços completos hardcoded:
- Títulos, preços, descrições
- Métricas de desempenho (receita `R$ 11.200`, `R$ 8.600`)
- Dados de atividade semanal (`weeklyData: [40, 60, 85, 50, 70, 30, 45]`)
- Avaliações com nomes, datas e textos falsos ("Carlos Mendes", "Ana Lima")

**O que já existe no backend:** `GET /services/{id}` e `GET /services/{id}/metrics`  
**O que implementar:** Remover o objeto `MOCK` e garantir que o componente use exclusivamente os dados retornados pela API. Tratar o estado de erro exibindo uma mensagem adequada ao invés de cair em dados falsos.

---

## 2. Histórico de Transações Hardcoded (`app/(account)/card-detail.tsx`) ✅

**Linhas:** 22–26  
**O que está mockado:** Array `CARD_TRANSACTIONS` com 3 transações fixas ("Encanador Profissional", "Limpeza Residencial", "Reparo Elétrico")

**O que já existe no backend:** `GET /users/{userId}/transactions`  
**O que implementar:** Substituir o array estático por uma chamada real à API de transações, filtrando pelo cartão exibido.

---

## 3. Recibo Hardcoded (`app/(account)/receipt.tsx`) ✅

**Linhas:** 16–28  
**O que está mockado:** Objeto `RECEIPT` completo com:
- Nome do serviço: `'Instalação de Carregador EV'`
- Nome do prestador: `'Jane Doe'`
- Data: `'24 Jan 2024, 14:30'`
- Valor: `'R$ 450,00'`
- Método de pagamento: `'Visa •••• 1234'`
- Código de transação: `'#SV-987654321'`

**O que já existe no backend:** `GET /users/{userId}/transactions`  
**O que implementar:** Receber o ID da transação via parâmetro de rota e buscar os dados reais via API.

---

## 4. Saldo Hardcoded (`app/(account)/payments.tsx`) ✅

**Linha:** 133  
**O que está mockado:** `<Text>R$ 450,00</Text>` fixo como saldo da carteira

**O que já existe no backend:** `GET /users/{userId}/subscription`  
**O que implementar:** Buscar o saldo/créditos reais da conta do usuário via API ao carregar a tela.

---

## 5. Cupom Hardcoded (`app/(account)/payments.tsx`) ✅ parcial

**Linhas:** 48–51  
**O que está mockado:** Estado inicial com cupom ativo `SEVGEN20` (`'20% de desconto no próximo serviço'`) — sempre presente, nunca validado

**O que implementar:** Iniciar o estado como `null` e validar o cupom inserido pelo usuário contra um endpoint de validação no backend.

---

## 6. Imagens de Usuários Hardcoded (URLs do Google)

Vários arquivos usam URLs fixas do Google como avatares de prestadores e clientes:

| Arquivo | Linhas | Uso |
|---|---|---|
| `app/(tabs)/index.tsx` | 33–37, 201 | Avatar do usuário logado e avatares do feed |
| `app/(client)/provider-profile.tsx` | 24–32 | Avatares de clientes/prestadores |
| `app/(client)/provider-reviews.tsx` | 20–28 | Avatares de avaliadores e anexos |
| `app/(client)/filter.tsx` | 323 | Avatar de prestador nos resultados |
| `app/(client)/search.tsx` | 37–51 | Avatares nos resultados de busca |
| `app/(client)/service-detail.tsx` | 127 | Avatar do prestador |

**O que implementar:** Usar a URL do avatar armazenada no perfil do usuário retornado pela API. Adotar um componente de avatar com fallback para iniciais quando a imagem não existir.

---

## 7. Pagamentos — Integração com MercadoPago

**Arquivos afetados:**
- `app/(scheduling)/book.tsx` — seleção de método de pagamento (Pix/Crédito) sem processamento real
- `app/(account)/payments.tsx` — tela de pagamentos sem gateway conectado
- `app/(account)/new-card.tsx` — cadastro de cartão sem tokenização
- `app/(account)/receipt.tsx` — recibo sem dados reais de transação
- `app/(account)/add-balance.tsx` — adição de saldo sem processamento

**O que está mockado:** O fluxo de pagamento no agendamento seleciona o método mas não processa cobrança. Os cartões salvos não são tokenizados. O recibo usa dados estáticos.

**O que implementar — MercadoPago:**
- Integrar o [SDK do MercadoPago para React Native](https://github.com/mercadopago/sdk-react-native) no frontend
- Usar o **Checkout Bricks** do MercadoPago para renderizar o formulário de cartão com tokenização segura
- No backend, criar endpoint `POST /payments/create-preference` para gerar a preferência de pagamento
- No backend, criar endpoint `POST /payments/process` para processar o pagamento com o token gerado pelo Brick
- Implementar webhook `POST /payments/webhook` para receber notificações de status de pagamento do MercadoPago
- Gerar recibo real a partir do `payment_id` retornado pelo MercadoPago
- Configurar variáveis de ambiente: `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_PUBLIC_KEY`

> **Observação:** O MercadoPago é o gateway escolhido para o projeto. Toda a implementação de pagamento deve passar por ele. Não implementar soluções alternativas.

---

## Status Geral

| Item | Prioridade | Backend pronto? | Status |
|---|---|---|---|
| Mock de serviços (`view.tsx`) | Alta | Sim | ✅ Concluído |
| Histórico de transações (`card-detail.tsx`) | Alta | Sim | ✅ Concluído |
| Recibo hardcoded (`receipt.tsx`) | Alta | Parcial | ✅ Concluído |
| Saldo hardcoded (`payments.tsx`) | Alta | Sim | ✅ Concluído |
| Cupom hardcoded (`payments.tsx`) | Média | Não | ✅ Parcial (estado null; validação aguarda endpoint) |
| Imagens de usuário hardcoded | Média | Sim (campo `avatar`) | ✅ Concluído |
| Integração MercadoPago | Alta | Não | 🔲 Pendente |
