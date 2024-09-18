const venom = require('venom-bot');

// Função para determinar a saudação com base na hora
function getGreetingMessage() {
  const now = new Date();
  const hour = now.getHours();

  if (hour >= 5 && hour < 12) {
    return 'bom dia';
  } else if (hour >= 12 && hour < 18) {
    return 'boa tarde';
  } else if (hour >= 18 && hour < 23) {
    return 'boa noite';
  } else {
    return 'boa madrugada';
  }
}

// Função para verificar o dia da semana
function verificarDiaDaSemana() {
  const diasDaSemana = [
    'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
    'Quinta-feira', 'Sexta-feira', 'Sábado'
  ];

  const hoje = new Date();
  const dia = hoje.getDay(); // Retorna um número de 0 a 6 (0 = Domingo, 6 = Sábado)

  return diasDaSemana[dia]; // Retorna o nome do dia da semana
}

const produtos = {
  "SSD M.2 de 256GB": {
      menu: [
          "Forma de pagamento",
          "Garantia",
          "Especificações técnicas",
          "Apresentar menu do bot"
      ]
  },
  "SSD SATA 240GB": {
      menu: [
          "Forma de pagamento",
          "Garantia",
          "Especificações técnicas",
          "Apresentar menu do bot"
      ]
  }
  // ... outros produtos
};

venom
  .create(
    'sessionName',
    undefined,
    (statusSession, session) => {
      console.log('Status da sessão: ', statusSession);
    },
    {
      folderNameToken: 'tokens',
      mkdirFolderToken: '',
    }
  )
  .then((client) => {
    start(client);
    console.log('Venom Bot iniciado!');
  })
  .catch((erro) => {
    console.error('Erro ao iniciar o Venom Bot: ', erro);
  });

// Definição do estado e saudacao fora da função start
let state = {};
let saudacao = {};

function start(client) {
  client.onMessage(async (message) => {
    const chatId = message.from;
    console.log('Chat ID recebido:', chatId);


    if (message.isGroupMsg) {
      console.log('Mensagem recebida de um grupo. Ignorando...');
      return;  // Ignora mensagens de grupos
    }

    // Inicializa o estado do usuário

    const mensagem = message.body.toLowerCase();

    if (mensagem.includes('ssd m.2') && mensagem.includes('pedido')) {
        const produto = 'SSD M.2 de 256GB';
        // const buttons = produtos[produto].menu.map(opcao => ({ body: opcao }));
        await client.sendText(chatId, 'Ótima escolha! O SSD M.2 de 256GB é perfeito para quem busca mais desempenho e agilidade. Ele oferece velocidades de leitura e escrita impressionantes, além de ser super compacto, isso tudo saindo por apenas *R$222,82* à vista ou em até 3x no cartão sem juros! ');
        state[chatId] = 'INFO_PRODUCT';
        console.log(state[chatId]);
    } 
    else {
      const contactName = ('Mensagem recebida de:', message.sender.pushname || 'Contato Desconhecido');
      // await showMainMenu(client, chatId, message, contactName, state, saudacao, contactName);
      // state[chatId] = 'AWAITING_CHOICE';
    }

    
    if(chatId === '558994210520@c.us'){

      const contactName = ('Mensagem recebida de:', message.sender.pushname || 'Contato Desconhecido');
      if (!state[chatId]) {
        if(state[chatId] == null){
          state[chatId] = 'MENU';
          console.log(state[chatId]);
        }
      }

      // Verifica o estado atual do usuário e age de acordo
      if (state[chatId] === 'MENU') {
        await showMainMenu(client, chatId, message, contactName, state, saudacao, contactName);
        state[chatId] = 'AWAITING_CHOICE';
      }
       else if (state[chatId] === 'AWAITING_CHOICE') {
        await handleMenuChoice(client, chatId, message, state, saudacao, contactName);
      } 
      else if (state[chatId] === 'SHOWING_PRODUCTS') {
        await handleProductMenu(client, chatId, message, state, saudacao, contactName);
      } 
      else if (state[chatId] === 'SUPPORT') {
        await handleSupport(client, chatId, message, state, saudacao, contactName);
      }
      else if(state[chatId] === 'INFO_PRODUCT') {
        // await client.sendText(chatId, 'Escolha um produto: \n1. SSD M.2 de 256GB\n2. SSD SATA 240GB');
        await handleInfoProduct(client, chatId, message, state, saudacao, contactName);
      }
      else if(state[chatId] === 'AWAITING_PRODUCT_CHOICE') {
        await handleProductMenu(client, chatId, message, state, saudacao, contactName)
      }
      else if(state[chatId] === 'AWAITING_ORDER_MENU'){
        await ShowOrderMenu(client, message, chatId, state, saudacao, contactName);
      }
      else if (state[chatId] === 'AWAITING_ORDER_CONFIRMATION') {
        await AwaitingChoiceOrder(client, message, state, contactName, chatId);
        return; // Retorna aqui para evitar que o fluxo continue
      }

  }
  });
}

// Função para mostrar o menu principal
async function showMainMenu(client, chatId, message, contactName, state, saudacao) {
  try {
    await client.startTyping(chatId);
    if (!saudacao[chatId]) {
      const greetingMessage = getGreetingMessage();
      await client.reply(chatId, `*Alerta!* Um novo aventureiro se aproximou! ⚔️\nOlá, ${contactName}, ${greetingMessage}! Sou o seu guia virtual na IB Informática. Prepare-se para uma jornada épica nas compras de tecnologia! `, message.id.toString());      
      saudacao[chatId] = 'True';
      
    }
    await client.sendText(chatId, '*Escolha uma opção:* \n1. Ver Produtos em destaque\n2. Formas de pagamento\n3. Suporte\n0. Sair');
  } catch (error) {
    console.error('Erro ao mostrar o menu principal:', error);
  }
}

// Função para lidar com a escolha do menu principal
async function handleMenuChoice(client, chatId, message, state, saudacao, contactName) {
  try {
    const contactName = message.sender.pushname || 'Contato Desconhecido';
    console.log(message.body)
    console.log(message.body === '1')
    if (message.body === '1') {
      // await client.sendText(chatId, 'Você escolheu Ver Produtos.');
      showProductMenu(client, chatId, state, saudacao); // Chama o menu de produtos
      state[chatId] = 'SHOWING_PRODUCTS';
    } 
    else if (message.body === '2') {
      await client.sendText(chatId, '_*Assistente Virtual*_ \nAqui, você pode escolher sua arma para vencer a batalha das compras:\nDinheiro: A espada lendária, forte e confiável\n\n - Cartão de débito: O escudo poderoso, que te protege contra imprevistos.\n\n - Cartão de crédito: A varinha mágica, que divide suas compras em até 6x sem juros! ✨\n\n - Pix: A teleporte, que finaliza sua compra em um piscar de olhos.\n\n - Quer saber os poderes de cada arma? Consulte a tabela de parcelamento e escolha a sua! ⚔️️')
      await client.sendText(chatId, 'Na IB Informática, você encontra diversas formas de pagamento para facilitar sua vida, consulte a tabela de parcelamento abaixo: \n\n- Até R$150: Até 2x sen juros\n- De R$151 a R$300: Até 3x sem juros\n- De R$301 a R$500: Até 5x sem juros\n- Acima de R$500: Até 6x sem juros')
      showMainMenu(client, chatId, message, contactName, state, saudacao);
      state[chatId] = 'AWAITING_CHOICE';
    } 
    else if (message.body === '3') {
      const diaAtual = verificarDiaDaSemana();
      const now = new Date();
      const hour = now.getHours();

      if(diaAtual != 'Domingo' && hour > 8 && hour < 12 && hour > 14 && hour < 18){
        await client.startTyping(chatId);
        showSupportMenu(client, chatId, state, saudacao); // Chama o menu de suporte
        state[chatId] = 'SUPPORT';
      }

      else if(diaAtual == 'Domingo'){
        await client.startTyping(chatId);
        await client.sendText(chatId, '_*Assistente Virtual*_ \nLamento mas nosso serviço de suporte funciona apenas de segunda à sexta-feira de 08h às 12h e de 14h às 18h e aos sabádos de 08h às 12h.');
        showMainMenu(client, chatId, message, contactName, state, saudacao);
        state[chatId] = 'AWAITING_CHOICE';
        await client.markUnseenMessage(chatId);
      }
    } 
    else if (message.body === '0') {
      await client.startTyping(chatId);
      await client.sendText(chatId, '_*Assistente Virtual*_ \nAgradecemos o seu contato, volte logo, e não se esqueça, _somos o seu parceiro de confiança em tecnologia!_ 😙');
      delete state[chatId]; // Reseta o estado para finalizar a conversa
      delete saudacao[chatId];
    } 
    else {
      await client.sendText(chatId, '_*Assistente Virtual*_ \nOps, parece que você escolheu uma opção inválida, tente novamente😥');
      showMainMenu(client, chatId, message, contactName, state, saudacao); // Mostra o menu novamente
      console.log('aqui');
    }
  } catch (error) {
    console.error('Erro ao lidar com a escolha do menu:', error);
  }
}

// Função para exibir o menu de produtos
async function showProductMenu(client, chatId, state, saudacao, contactName) {
  await client.startTyping(chatId);
  client.sendText(chatId, '_*Assistente Virtual*_ \nAqui estão os nossos produtos em destaque:\n1. SSD 240GB SATA ADATA\n2. FONE DE OUVIDO BLUETOOTH TWS AIRDOTS\n3. HEADSET BLUETOOTH 5.0 ON-FN628\n0. Voltar ao menu principal');
  // state[chatId] = 'AWAITING_PRODUCT_CHOICE';
}

async function ShowOrderMenu(client, message, state, contactName, chatId){
  await client.startTyping(chatId);
  client.sendText(chatId, '_*Assistente Virtual*_ \nVocê deseja realizar o pedido do SSD ADATA 240GB?\n\n1. Sim\n2. Não');
  // await AwaitingChoiceOrder(client, message, state, contactName, chatId)
}

async function AwaitingChoiceOrder(client, message, state, contactName, chatId) {
  await client.startTyping(chatId);
  if (message.body === '1') {
    await client.sendText(chatId, 'Pedido realizado com sucesso! Agradecemos pela compra.');
    // Aqui você pode resetar o estado ou direcionar para outro menu
    state[chatId] = 'ORDER_COMPLETED';
  } else if (message.body === '2') {
    await client.sendText(chatId, 'Pedido cancelado. Se precisar de algo mais, estou à disposição!');
    // Retorna ao menu principal ou ao menu de produtos
    await showProductMenu(client, chatId, state, saudacao);
  }
}


// Função para lidar com o menu de produtos
async function handleProductMenu(client, chatId, message, state, saudacao, contactName) {
  try {
    if (message.body === '1') {
      await client.startTyping(chatId);
      await client.sendText(chatId, '_*Assistente Virtual*_\nShow de bola! O SSD ADATA 240GB por R$ 191,50 é um excelente investimento para turbinar seu PC. Com ele, seus jogos e programas vão carregar em um piscar de olhos!\n\nSe quiser saber informações técnicas envie: \n"informações técnicas SSD 240GB ADATA" ou se quiser realizar a compra envie "realizar pedido SSD 240GB ADATA"');
      state[chatId] = 'AWAITING_ORDER_CONFIRMATION';  
      await ShowOrderMenu(client, message, state, contactName, chatId);
    }
    else if (message.body === '2') {
      await client.startTyping(chatId);
      await client.sendText(chatId, 'Ótima escolha! Os Airdots por apenas R$ 60,00 oferecem um som incrível e muita liberdade para você curtir sua música favorita. Quer saber mais sobre a bateria e as funcionalidades ou já quer realizar o pedido?');
    } 
    else if (message.body === '0') {
      showMainMenu(client, chatId, message, contactName, state, saudacao);
      state[chatId] = 'AWAITING_CHOICE';
    } 
    else {
      await client.startTyping(chatId);
      await client.sendText(chatId, '_*Assistente Virtual*_ \nOps, parece que você escolheu uma opção inválida, tente novamente😥');
      await new Promise(resolve => setTimeout(resolve, 1500)); // Espera 1.5 segundos antes de mostrar o menu
      await showProductMenu(client, chatId, state, saudacao);
    }
  } catch (error) {
    console.error('Erro ao lidar com o menu de produtos:', error);
  }
}

// Função para exibir o menu de suporte
async function showSupportMenu(client, chatId, state, saudacao, contactName) {
  await client.startTyping(chatId);
  client.sendText(chatId, '*Menu de suporte* \n1. Falar com um atendente\n2. Voltar ao menu principal');
}

// Função para lidar com o suporte
async function handleSupport(client, chatId, message, state, saudacao, contactName) {
  try {
    if (message.body === '1') {
      const greetingMessage = getGreetingMessage();
      const diaAtual = verificarDiaDaSemana();
      const now = new Date();
      const hour = now.getHours();

      if(greetingMessage == 'boa madrugada'){
        await client.startTyping(chatId);
        await client.sendText(chatId, '_*Assistente Virtual*_ \nLamento, mas devido o horário não será possível falar com um atendente no momento, o suporte retornará amanhã 08h. Agradeço a compreensão e tenha uma boa madrugada😴');
      }
      else if(diaAtual != 'Domingo' && hour > 8 && hour < 12 && hour > 14 && hour < 18){
        await client.startTyping(chatId);
        await client.sendText(chatId, '_*Assistente Virtual*_ \nCerto, você está sendo encaminhado para um atendente, as mensagens são respondidas por ordem de envio, as mais antigas primeiro, agradeço a compreesâo...');
        await client.markUnseenMessage(chatId);
      }
      else if(diaAtual == 'Domingo'){
        await client.startTyping(chatId);
        await client.sendText(chatId, '_*Assistente Virtual*_ \nLamento mas nosso serviço de suporte funciona apenas de segunda à sexta-feira de 08h - 12h e de 14h - 18h e aos sabádos de 08h - 12h.');
        await client.markUnseenMessage(chatId);
      }
      // Aqui você pode adicionar a lógica para conectar com um atendente
    } 
    else if (message.body === '2') {
      showMainMenu(client, chatId, message, contactName, state, saudacao); // Volta ao menu principal
      state[chatId] = 'AWAITING_CHOICE';
    }
    
    else {
      await client.startTyping(chatId);
      await client.sendText(chatId, '_*Assistente Virtual*_ \nOps, parece que você escolheu uma opção inválida, tente novamente😥');
      showSupportMenu(client, chatId, state, saudacao); // Mostra o menu de suporte novamente
    }
  } catch (error) {
    console.error('Erro ao lidar com o suporte:', error);
  }
}

async function showProductInfoMenu(client, chatId, state, saudacao, contactName) {
  await client.startTyping(chatId);
  client.sendText(chatId, '*Deseja finalizar o seu pedido?*\n1. Sim\n2. Não\n0. Voltar ao menu principal');
}

async function handleInfoProduct(client, chatId, message, state, saudacao, contactName) {
  try {
    if (message.body === '1') {
      sendText(chatId, 'Informações técnicas')
      // Aqui você pode adicionar a lógica para conectar com um atendente
    } else if (message.body === '2') {
      // showMainMenu(client, chatId, message, contactName, state, saudacao); // Volta ao menu principal
      state[chatId] = 'AWAITING_CHOICE';
    }
     else if (message.body === '0') {
      saudacao[chatId] = 'True'; // ver
      showMainMenu(client, chatId, message, contactName, state, saudacao); // Volta ao menu principal
      state[chatId] = 'AWAITING_CHOICE';
    }
    else {
      await client.startTyping(chatId);
      // await client.sendText(chatId, '_*Assistente Virtual*_ \nOps, parece que você escolheu uma opção inválida, tente novamente😥');
      showProductInfoMenu(client, chatId, state, saudacao); // Mostra o menu de suporte novamente
    }
  } catch (error) {
    console.error('Erro ao lidar com a opção selecionada:', error);
  }
}
