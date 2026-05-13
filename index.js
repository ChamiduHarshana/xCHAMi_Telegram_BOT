require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true
});

const API_URL = process.env.API_URL;

const SYSTEM_PROMPT = `
You are a Sinhala AI assistant.
Reply cleanly.
Reply shortly.
Avoid broken symbols.
`;

console.log('✅ Bot Running...');

// =========================
// START COMMAND
// =========================

bot.onText(/\/start/, async (msg) => {

  const chatId = msg.chat.id;

  bot.sendPhoto(
    chatId,
    'https://files.catbox.moe/jq0n2q.jpg',
    {
      caption: `👋 Welcome to xCHAMi AI Bot

🤖 AI Chat
🖼 Image Questions
⚡ Fast Replies
🧠 Smart AI

━━━━━━━━━━━━━
✨ xCHAMi STUDIO`,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '📢 Updates',
              url: 'https://t.me/yourchannel'
            },
            {
              text: '👨‍💻 Owner',
              url: 'https://t.me/yourusername'
            }
          ]
        ]
      }
    }
  );
});

// =========================
// MAIN MESSAGE EVENT
// =========================

bot.on('message', async (msg) => {

  try {

    const chatId = msg.chat.id;
    const text = msg.text;

    // Ignore commands
    if (text && text.startsWith('/')) return;

    bot.sendChatAction(chatId, 'typing');

    // =========================
    // IMAGE SUPPORT
    // =========================

    if (msg.photo) {

      const photo = msg.photo[msg.photo.length - 1];

      const file = await bot.getFile(photo.file_id);

      const imageUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;

      const caption = msg.caption || 'Describe this image';

      const response = await axios.get(
        `${API_URL}?q=${encodeURIComponent(
          `Image URL: ${imageUrl}
Question: ${caption}`
        )}`
      );

      let reply =
        response.data.result ||
        response.data.reply ||
        response.data.message ||
        response.data.answer ||
        JSON.stringify(response.data);

      reply = cleanReply(reply);

      return bot.sendMessage(
        chatId,
        `${reply}

━━━━━━━━━━━━━
✨ xCHAMi STUDIO`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '📢 Updates',
                  url: 'https://t.me/yourchannel'
                },
                {
                  text: '👨‍💻 Owner',
                  url: 'https://t.me/yourusername'
                }
              ]
            ]
          }
        }
      );
    }

    // =========================
    // TEXT CHAT
    // =========================

    if (!text) return;

    const response = await axios.get(
      `${API_URL}?q=${encodeURIComponent(
        `${SYSTEM_PROMPT}
User: ${text}`
      )}`
    );

    let reply =
      response.data.result ||
      response.data.reply ||
      response.data.message ||
      response.data.answer ||
      JSON.stringify(response.data);

    // Clean API garbage
    reply = cleanReply(reply);

    // Send Reply
    bot.sendMessage(
      chatId,
      `${reply}

━━━━━━━━━━━━━
✨ xCHAMi STUDIO`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '📢 Updates',
                url: 'https://t.me/yourchannel'
              },
              {
                text: '👨‍💻 Owner',
                url: 'https://t.me/yourusername'
              }
            ],
            [
              {
                text: '🤖 Bot Info',
                callback_data: 'botinfo'
              }
            ]
          ]
        }
      }
    );

  } catch (error) {

    console.log(error.response?.data || error.message);

    bot.sendMessage(
      msg.chat.id,
      `❌ AI Server Error
Try Again Later

━━━━━━━━━━━━━
✨ xCHAMi STUDIO`
    );
  }
});

// =========================
// BUTTON EVENTS
// =========================

bot.on('callback_query', async (query) => {

  const chatId = query.message.chat.id;

  if (query.data === 'botinfo') {

    if (String(chatId) !== process.env.OWNER_ID) {

      return bot.answerCallbackQuery(query.id, {
        text: '❌ Owner Only Command',
        show_alert: true
      });
    }

    bot.sendMessage(
      chatId,
      `📊 Bot Information

🤖 Status : Online
⚡ System : Active
🌐 API : Connected
🖼 Image AI : Enabled
👤 Users : Public

━━━━━━━━━━━━━
✨ xCHAMi STUDIO`
    );

    bot.answerCallbackQuery(query.id);
  }
});

// =========================
// CLEAN API RESPONSE
// =========================

function cleanReply(text) {

  if (!text) return 'No response';

  // Convert object to string
  if (typeof text !== 'string') {
    text = JSON.stringify(text);
  }

  // Remove JSON labels
  text = text.replace(/"success":true,/gi, '');
  text = text.replace(/"responseTime".*?,/gi, '');
  text = text.replace(/"attempts".*?,/gi, '');
  text = text.replace(/"requestId".*?,/gi, '');
  text = text.replace(/"creator".*?}/gi, '');
  text = text.replace(/"result":/gi, '');

  // Remove symbols
  text = text.replace(/[{}[\]"]/g, '');

  // Fix line breaks
  text = text.replace(/\n/g, '
');

  // Remove extra commas
  text = text.replace(/,+/g, '');

  return text.trim();
  }
