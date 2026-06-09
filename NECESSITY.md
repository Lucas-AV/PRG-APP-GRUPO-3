> O que a gente tem atualmente no trabalho?

- Login + Registro
- Onboarding
- Tela de configuração de perfil
- Tela de historico de pagamentos e cartão de crédito/débito (que tá mockado no momento - Precisa implementar um backend pra valer + dados reais)
- Sistema de assinatura (Também mockado, exige melhorias visuais)

O QUE PRECISA URGENTE E É FACIL?
- Tela de SOBRE
- REFACTOR DA HOME
- Sistema de Agendamento
- Ajustar contagem de passos no onboarding
- sistema de upload de imagens para o banco de dados

BUGS:
- O que aconteceu? A conta de usuário está sendo criada logo de cara assim que o cliente clica no botão de registrar-se antes de completar o onboarding
- Quando isso deveria acontecer? Quando o cliente finalizar o processo de onboarding
- O que deveria acontecer quando ele sair do aplicativo durante o fluxo de onboarding e tentar logar novamente? Ser redirecionado para o onboarding para completar os dados da conta dele

- O que aconteceu? O cliente criou uma conta com um numero de telefone já registrado no sistema anteriormente por outro usuário
- O que deveria acontecer? Aparecer um aviso na tela de telefone indisponivel


- O que aconteceu? O nome completo da tela de registro não foi aplicado no onboarding
- O que deveria acontecer? O campo nome completo da tela de primeira etapa de onboarding deveria receber o nome completo da tela de registro

- O que aconteceu? O cliente conseguiu passar de etapa de onboarding sem preencher os dados
- O que deveria acontecer? Validação dos campos

- O que aconteceu? Na tela de historico de pagamentos o aplicativo está exibindo o teclado por cima do campo de cupom
- O que deveria acontecer? Validar cupons + evitar sobreposição no teclado

- O que aconteceu? A bottombar do aplicativo some quando trocamos de aba
- O que deve acontecer? Ela deveria ser exibida o tempo inteiro (constante) tipo estilo ifodd

- O que aconteceu? O tecladoe stá se sobrepondo aos campos de preenchimento de texto na tela de cadastro de cartão
- O que deveria acontecer? O teclado deveria ficar abaixo destes campos, fazendo com que eles fossem focados na tela
- O que potencialmente poderia resolver? uma solução parecida com o que está implemetado na tela de registro onde a tela tem um tamanho dinamico maior do que a exibição real dela

- O que aconteceu? na tela de cadastro de endereço os campos de numero e complemento não foram preenchidos automaticamente
- O que deveria acontecer? se estes campos estiverem vazios, os campos deverão ser preenchidos com "-"

- O que aconteceu? Hub visual do professional com as informações está ficando cortado nos aparelhos
- O que deveria acotnecer? As informações deveriam ser exibidas completamente.

REFACTOR:
- Feed: Refatorar para ficar parecido ou igual ao figma / Desenvolver estilo de visualização de detalhes por meio de scroll horizontal da direita para a esquerda
- Feed: Barra de pesquisa fixa no topo do feed
- Feed: Badges de filtro de clique rapido
- Profissional: Detalhamento de profissional: Primeira etapa da tela precisa ser refeita para ficar igual ao estilo do figma (Professional Detail / Discovery)
- Profissional: Refazer a parte de cima da tela que exibe a imagem do perfil em miniatura redonda para ficar igual ao estilo do figma + badge de avaliações em média + quantidade
- Modo escuro!

- Pagamentos: Fazer o cadastro de cartão funcionar de fato adicionado eles aos cartões salvos
- Desmockar o aplicativo todo
- Pagamentos: Tela de adição de saldo
- Uso de outros metodos de pagamento: Pix!


FEATURE:
- Pesquisa automatica dos ceps na hora de pesquisar por um endereço na tela de onboarding segunda etapa e cadastro de endereço
- Exibir previa do mapa de localização no telefone do endereço tbm
- Exibir plano de assinatura como terceira etapa do onboarding para visão de cliente
- Permitir cadastro de metodo de pagamento inicial no onboarding (etapa opcional do onboarding do aplicativo)
- Tela dedicada para pesquisa baseada no template do figma
- Tela de filtro baseado no template do figma
- Tela ou aba ou melhoria da tela de suporte e ajuda para exibir algo quando o cliente clicar em "Perguntas Frequentes" e também detalhar tela de ver tudo
- Controle de idioma básico no aplicativo + tela de seleção de idioma ou dialog
- Pagamento: IMPORTANTE ! >>> Implementar sistema de pagamento simulado basico utilizando integração gratis com Stripe / MercadoPago / Pagbank (1 das 3 apenas, a que for mais fácil de preferencia) e linkar o uso dela ao sistema de assinaturas para fazer pagamentos e cobranças mensais <<< !
- Pagamento: Cancelamento de assinatura tanto para cliente quanto prestador de serviço (Backend + tela)
- Exibição de mapa nas telas de cadastro de endereço, tipo um google maps simples
- Permitir o cadastro de categoria de endereço personalizada
- Criar tela de SOBRE do aplicativo com base no template, as partes de botões na tela de sobre devem ser pequenas abas expansiveis contendo um pequeno texto resumido sobre o conteudo da aba clicada
- Desenvolver toda a parte de agendamento do sistema tanto a visão de cliente quanto a visão de prestador de serviço, começar extraindo prototipo do figma e então passando para o mapemento do backend das funções relacionadas + criação do banco de dados para isso
- Adicionar redirecionamento ao clicar em botão de perfil na tela feed na appbar no canto superior direito
- Tela de Notificações + historico