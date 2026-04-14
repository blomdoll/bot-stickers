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
    
    // Solo aceptamos imágenes (no GIFs, no Videos) para evitar que el servidor explote
    if (msg.hasMedia && msg.type === 'image' && (command === 'sticker' || command === '!sticker')) {
        const userId = msg.from;
        let stats = userStats.get(userId) || { ultimoUso: 0, total: 0 };
        const ahora = Date.now();

        if (ahora - stats.ultimoUso < TIEMPO_ESPERA) {
            return msg.reply("⏳ Espera un momento...");
        }

        try {
            const media = await msg.downloadMedia();
            // ... resto del código de envío ...
            await client.sendMessage(msg.from, media, {
                sendMediaAsSticker: true,
                stickerName: "Mi Bot",
                stickerAuthor: "Sage"
            });
            
            stats.ultimoUso = ahora;
            stats.total += 1;
            userStats.set(userId, stats);

        } catch (e) {
            console.log("Error procesando imagen:", e);
        }
    } else if (msg.hasMedia && msg.type !== 'image' && (command === 'sticker')) {
        // Si el usuario envía un GIF o Video, le avisamos que no se puede
        msg.reply("⚠️ Lo siento, por ahora solo puedo convertir fotos a stickers para mantener el servidor estable.");
    }
});

client.initialize();
