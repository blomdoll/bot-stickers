const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('Bot Online'));
app.listen(process.env.PORT || 3000);

const userStats = new Map();
const TIEMPO_ESPERA = 30 * 1000; 
const LIMITE_DIARIO = 50; 

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--single-process'
        ]
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('ESCANEAME CON WHATSAPP:');
});

client.on('ready', () => {
    console.log('¡El bot está listo!');
});

client.on('message', async (msg) => {
    const command = msg.body.toLowerCase();
    
    // Filtro: Solo fotos (evita que los GIFs reinicien el bot)
    if (msg.hasMedia && msg.type === 'image' && (command === 'sticker' || command === '!sticker')) {
        const userId = msg.from;
        let stats = userStats.get(userId) || { ultimoUso: 0, total: 0 };
        const ahora = Date.now();

        if (ahora - stats.ultimoUso < TIEMPO_ESPERA) {
            return msg.reply("⏳ Por favor, espera unos segundos...");
        }

        try {
            const media = await msg.downloadMedia();
            
            stats.ultimoUso = ahora;
            stats.total += 1;
            userStats.set(userId, stats);

            // AQUÍ ESTÁN TUS CAMBIOS DE NOMBRE
            await client.sendMessage(msg.from, media, {
                sendMediaAsSticker: true,
                stickerName: "Sticker", // El nombre del bot
                stickerAuthor: "miau"   // El autor
            });
            
        } catch (e) {
            console.log("Error:", e);
        }
    } else if (msg.hasMedia && msg.type !== 'image' && (command === 'sticker')) {
        // Mensaje amigable para cuando envíen GIFs
        msg.reply("🐱 Solo puedo hacer stickers de fotos por ahora para no cansarme.");
    }
});

client.initialize();
