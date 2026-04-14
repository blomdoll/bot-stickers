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
        executablePath: '/opt/render/project/src/.cache/puppeteer/chrome/linux-146.0.7680.153/chrome-linux64/chrome',
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
    if (msg.hasMedia && (command === 'sticker' || command === '!sticker')) {
        const userId = msg.from;
        let stats = userStats.get(userId) || { ultimoUso: 0, total: 0 };
        const ahora = Date.now();

        if (ahora - stats.ultimoUso < TIEMPO_ESPERA) {
            return msg.reply("⏳ Espera un momento antes de pedir otro.");
        }
        if (stats.total >= LIMITE_DIARIO) {
            return msg.reply("🚫 Límite diario alcanzado.");
        }

        try {
            const media = await msg.downloadMedia();
            stats.ultimoUso = ahora;
            stats.total += 1;
            userStats.set(userId, stats);

            await client.sendMessage(msg.from, media, {
                sendMediaAsSticker: true,
                stickerName: "Mi Bot",
                stickerAuthor: "Sage"
            });
        } catch (e) {
            console.log(e);
        }
    }
});

client.initialize();
