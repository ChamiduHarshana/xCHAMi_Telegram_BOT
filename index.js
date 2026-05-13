require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Bot Setup
const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true
});

// API URL
const API_URL = process.env.API_URL;

// Custom Prompt
const SYSTEM_PROMPT = `
You are a Sinhala AI assistant.
Reply friendly.
Talk like a Sri Lankan friend.
`;

console.log('✅ Bot Running...');

// Start Message
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    `👋 Welcome to AI Chat Bot

🤖 Ask me anything
⚡ Fast Replies
🧠 AI Powered

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
});

// All Messages
bot.on('message', async (msg) => {
  try {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Ignore empty messages
    if (!text) return;

    // Ignore commands
    if (text.startsWith('/')) return;

    // Typing Status
    bot.sendChatAction(chatId, 'typing');

    // API Request
    const response = await axios.get(
      `${API_URL}?q=${encodeURIComponent(
        `${SYSTEM_PROMPT}\nUser: ${text}`
      )}`
    );

    // API Reply
    const reply =
      response.data.reply ||
      response.data.message ||
      response.data.answer ||
      JSON.stringify(response.data);

    // Send Message
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
      `❌ Error while getting response

━━━━━━━━━━━━━
✨ xCHAMi STUDIO`
    );
  }
});

// Button Clicks
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  // Owner Only Bot Info
  if (data === 'botinfo') {

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
👤 Access : Public Users

━━━━━━━━━━━━━
✨ xCHAMi STUDIO`
    );

    bot.answerCallbackQuery(query.id);
  }
});
