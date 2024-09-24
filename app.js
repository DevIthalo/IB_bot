const { Client, LegacySessionAuth, LocalAuth,  Buttons,  List } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const express = require('express');
const app = express();
const unidecode = require('unidecode');
const request = require('request');
app.use(express.static('public'));

///// CONFIGURAÇÃO DA SESSÃO /////
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: 'IBbot'
    }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

///// CONFIGURAÇÃO DO QRCODE /////
client.on('qr', (qr) => {
    console.log('QR Code gerado!');
    qrcode.toDataURL(qr, (err, src) => {
        if (err) {
            console.error(err); return;
        }
        const qrImg = `<img src=${src} alt=QR Code />`;
        io.emit('qr', qrImg);
    });
});

/// CONFIGURANDO MENSAGEM DE ERRO CASO DÊ ERRADO A AUTENTICAÇÃO
client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessful
    const erro = 'Erro na autenticação'
    io.emit('erro', erro)
    console.error('\n\nFALHA NA AUTENTICAÇÃO: ', msg);
    client.getChats().then(chats => {
        console.log(chats[0]);
    });
});

///// CONFIGURAÇÃO DO INICIO DA SESSÃO, ESTADO DE PRONTO PARA LER AS MENSAGENS /////
client.on('ready', () => {
    console.log('Cliente pronto!');
    io.emit('ready', 'Cliente pronto!');

});


// FUNÇÃO PARA SAUDAÇÃO
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
  
  // FUNÇÃO PARA VERIFICAR O DIA DA SEMANA
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
}
    // ... outros produtos


// Definição do estado e saudacao fora da função start
let state = {};
let saudacao = {};
let stateProductOrder = {};
let nameClient = {};
let emailClient = {};
let phoneClient = {};
let cityClient = {};
let paymentMethodClient = {};
let productOrder = {};

///// CONFIGURA A FORMA DE LEITURA DAS MENSAGENS /////
client.on('message', async (message) => {
    const chatId = message.from;
    console.log('Chat ID recebido:', chatId);

    if (message.isGroupMsg) {
        console.log('Mensagem recebida de um grupo. Ignorando...');
        return;  // Ignora mensagens de grupos
      }

      const mensagem = message.body.toLowerCase();
      console.log(message._data.notifyName)

      if (mensagem.includes('ssd m.2') && mensagem.includes('pedido') && chatId === '558994210520@c.us') {
          const produto = 'SSD M.2 de 256GB';
          // const buttons = produtos[produto].menu.map(opcao => ({ body: opcao }));
          await client.sendText(chatId, 'Ótima escolha! O SSD M.2 de 256GB é perfeito para quem busca mais desempenho e agilidade. Ele oferece velocidades de leitura e escrita impressionantes, além de ser super compacto, isso tudo saindo por apenas *R$222,82* à vista ou em até 3x no cartão sem juros! ');
          state[chatId] = 'INFO_PRODUCT';
          console.log(state[chatId]);
      } 
      else {
        console.log(message._data.notifyName)
        const contactName = ('Mensagem recebida de:', message._data.notifyName || 'Contato Desconhecido');
        // await showMainMenu(client, chatId, message, contactName, state, saudacao, contactName);
        // state[chatId] = 'AWAITING_CHOICE';
      }


      if(chatId === '558994210520@c.us'){

        const contactName = ('Mensagem recebida de:', message._data.notifyName || 'Contato Desconhecido');
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
        else  if(state[chatId].includes('COLLECTING_')){
          handleDataCollection(client, message, state, chatId)
        }
    }

}); 

// FUNÇÃO PARA MOSTRAR O MENU PRINCIPAL
async function showMainMenu(client, chatId, message, contactName, state, saudacao) {
    try {
        const chat = await client.getChatById(chatId);

        // Agora, você pode chamar sendStateTyping no chat
        await chat.sendStateTyping();
      if (!saudacao[chatId]) {
        await chat.sendStateTyping();
        const greetingMessage = getGreetingMessage();
  
        const saudacaoFrases = [
          `*Alerta!* Um novo aventureiro se aproximou! ⚔️\nOlá, ${contactName}, ${greetingMessage}! Sou o seu guia virtual na IB Informática. Prepare-se para uma jornada épica nas compras de tecnologia! `,
          `*Aviso!* Alarme de cliente detectado!😄 Prepare-se para uma missão épica em busca do produto perfeito!`,
          `Abra ala! Um novo explorador chegou à nossa ilha do tesouro tecnológico🏝️💻, ola ${contactName}, ${greetingMessage}. Vamos juntos encontrar os melhores produtos?`,
          `Bem-vindo(a), ${contactName}! Estou à sua disposição para auxiliá-lo(a) em suas compras. Como posso ajudar hoje?`, 
        ]
  
        const randomIndex = Math.floor(Math.random() * saudacaoFrases.length);
        console.log(saudacaoFrases[randomIndex])
  
        await message.reply(`${saudacaoFrases[randomIndex]}`); 
        // await chat.sendStatePaused();     
        saudacao[chatId] = 'True'; 
        
      }
  
      await chat.sendStateTyping();
      await client.sendMessage(chatId, '*Escolha uma opção:* \n1. Ver Produtos em destaque\n2. Formas de pagamento\n3. Suporte\n0. Sair');
    } catch (error) {
      console.error('Erro ao mostrar o menu principal:', error);
    }
  }


// FUNÇÃO PARA LIDAR COM A ESCOLHA DO MENU PRINCIPAL
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
        await new Promise(resolve => setTimeout(resolve, 1500)); // Espera 1.5 segundos antes de mostrar o menu
        await client.startTyping(chatId);
        await client.sendText(chatId, '_*Assistente Virtual*_ \nAqui, você pode escolher sua arma para vencer a batalha das compras:\nDinheiro: A espada lendária, forte e confiável\n\n - Cartão de débito: O escudo poderoso, que te protege contra imprevistos.\n\n - Cartão de crédito: A varinha mágica, que divide suas compras em até 6x sem juros! ✨\n\n - Pix: A teleporte, que finaliza sua compra em um piscar de olhos.\n\n - Quer saber os poderes de cada arma? Consulte a tabela de parcelamento e escolha a sua! ⚔️️')
        await new Promise(resolve => setTimeout(resolve, 2500)); // Espera 1.5 segundos antes de mostrar o menu
        await client.startTyping(chatId);
        await client.sendText(chatId, 'Na IB Informática, você encontra diversas formas de pagamento para facilitar sua vida, consulte a tabela de parcelamento abaixo: \n\n- Até R$150: Até 2x sen juros\n- De R$151 a R$300: Até 3x sem juros\n- De R$301 a R$500: Até 5x sem juros\n- Acima de R$500: Até 6x sem juros')
        await new Promise(resolve => setTimeout(resolve, 2500)); // Espera 1.5 segundos antes de mostrar o menu
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
        await client.startTyping(chatId);
        await client.sendText(chatId, '_*Assistente Virtual*_ \nOps, parece que você escolheu uma opção inválida, tente novamente😥');
        showMainMenu(client, chatId, message, contactName, state, saudacao); // Mostra o menu novamente
        console.log('aqui');
      }
    } catch (error) {
      console.error('Erro ao lidar com a escolha do menu:', error);
    }
  }

// FUNÇÃO PARA EXIBIR O MENU DE PRODUTOS
async function showProductMenu(client, chatId, state, saudacao, contactName) {
    await client.startTyping(chatId);
    client.sendText(chatId, '_*Assistente Virtual*_ \nAqui estão os nossos produtos em destaque:\n1. SSD 240GB SATA ADATA\n2. FONE DE OUVIDO BLUETOOTH TWS AIRDOTS\n3. HEADSET BLUETOOTH 5.0 ON-FN628\n0. Voltar ao menu principal');
    // state[chatId] = 'AWAITING_PRODUCT_CHOICE';
  }

//--------------------------------------------------------------------------------------------------
client.initialize();

const server = app.listen(process.env.PORT || 3000, () => {
    console.log('Servidor iniciado no endereço http://localhost:' + (process.env.PORT || 3000));
  });
  

const io = require('socket.io')(server);
io.on('connection', (socket) => {
    console.log('Verificando conexão...');
    if (client.ready) {
        io.emit('ready', 'Cliente pronto!');
    }
});
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});