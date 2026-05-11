# bot-stickers

Bot de WhatsApp que convierte imágenes en stickers automáticamente.

---

## ¿Qué hace?

Recibe una imagen por WhatsApp y la convierte en sticker sin aplicaciones adicionales. Solo enviás la foto y el bot responde con el sticker listo para usar.

## Tecnologías

- JavaScript (Node.js)
- [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js)

## Instalación

```bash
git clone https://github.com/blomdoll/bot-stickers.git
cd bot-stickers
npm install
node index.js
```

Al correr por primera vez, escaneás el código QR con WhatsApp para vincular la sesión.

## Uso

1. Iniciá el bot con `node index.js`
2. Escaneá el QR con WhatsApp
3. Enviá cualquier imagen al número vinculado
4. El bot responde con la imagen convertida en sticker

---

Creado por [@blomdoll](https://github.com/blomdoll)
