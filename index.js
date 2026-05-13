require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true
});

// ඔයාගේ API URL
const API_URL = process.env.API_URL;

const SYSTEM_PROMPT = `
You are a Sinhala AI assistant.
Reply short.
Talk friendly.
`;

console.log('Bot Running...');

bot.on('message', async (msg) => {
  try {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text) return;

    // Start Command
    if (text === '/start') {
      return bot.sendMessage(
        chatId,
        '👋 Welcome! Mama xCHAMi MD AI BOT.'
      );
    }

    // Ping Command
    if (text === '/ping') {
      return bot.sendMessage(chatId, '✅ Online');
    }

    // Owner Only Bot Info Command
    if (text === '/botinfo') {
      if (String(chatId) !== process.env.OWNER_ID) {
        return bot.sendMessage(
          chatId,
          '❌ You are not authorized.'
        );
      }

      return bot.sendMessage(
        chatId,
        `📊 Bot Information

👤 Users: Public
🤖 Status: Online
⚡ System: Active
🧠 AI Connected: Yes`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '📢 Channel',
                  url: 'https://t.me/yourchannel'
                }
              ],
              [
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

    bot.sendChatAction(chatId, 'typing');(chatId, 'typing');

    // API Request
    const response = await axios.post(
      API_URL,
      {
        message: text,
        prompt: SYSTEM_PROMPT,
        user_id: chatId
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // API response text
    const reply =
      response.data.reply ||
      response.data.message ||
      'No response';

    // Send reply with buttons
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
                callback_data: 'info'
              }
            ]
          ]
        }
      }
    );
  } catch (err) {
    console.log(err.response?.data || err.message);

    bot.sendMessage(
      msg.chat.id,
      '❌ API Error'
    );
  }
});
