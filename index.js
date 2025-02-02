const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Variáveis de ambiente
const TOKEN = process.env.WHATSAPP_TOKEN; // Token da API do WhatsApp
const VERIFY_TOKEN = process.env.VERIFY_TOKEN; // Token de verificação do webhook
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID; // ID do número de telefone

// Endpoint para receber mensagens do WhatsApp
app.post('/webhook', async (req, res) => {
    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
        const message = body.entry[0].changes[0].value.messages[0];
        const sender = message.from;
        const text = message.text.body.toLowerCase();

        // Lógica do chatbot
        let responseText = "Desculpe, não entendi. Como posso ajudar?";
        if (text.includes("agendar consulta online")) {
            responseText = `Que ótimo que você escolheu nossa consulta online! 😊\n\n` +
                           `Aqui estão os detalhes:\n` +
                           `- Valor: R$500,00 (com a consulta de retorno inclusa em até 30 dias).\n` +
                           `- Horários de atendimento:\n` +
                           `  - Segunda a Quinta: das 09h às 20h\n` +
                           `  - Sexta-feira: das 09h às 18h\n` +
                           `  - Sábados: das 09h às 12h\n\n` +
                           `No dia da consulta, enviaremos um link para você acessar a plataforma de telemedicina. É simples e prático!\n\n` +
                           `Gostaria de confirmar o agendamento ou tirar mais dúvidas?`;
        }

        // Enviar resposta ao usuário
        await sendMessage(sender, responseText);
    }

    res.sendStatus(200);
});

// Função para enviar mensagem via API do WhatsApp
async function sendMessage(recipient, message) {
    await axios.post(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
        messaging_product: 'whatsapp',
        to: recipient,
        text: { body: message }
    }, {
        headers: {
            Authorization: `Bearer ${TOKEN}`
        }
    });
}

// Endpoint para verificar o webhook
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token === VERIFY_TOKEN) {
        res.send(challenge);
    } else {
        res.sendStatus(403);
    }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
