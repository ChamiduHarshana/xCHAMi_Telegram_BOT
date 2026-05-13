require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true
});

// =======================
// SETTINGS
// =======================

const API_URL = process.env.API_URL;
const OWNER_ID = process.env.OWNER_ID;

const BOT_NAME = 'xCHAMi AI';
const FOOTER = '━━━━━━━━━━━━━\n✨ xCHAMi STUDIO';

const SYSTEM_PROMPT = `
You are xCHAMi Combined Maths AI, a highly intelligent Sri Lankan Advanced Level Combined Mathematics teacher AI.

Your main purpose is to help Sri Lankan A/L students understand Combined Mathematics deeply, clearly, and correctly.

Rules:

- Always answer in Sinhala language.
- Explain step-by-step.
- Teach like a friendly Sri Lankan teacher.
- Make difficult theories simple.
- Always give clear final answers.
- Never give short unclear replies.
- Always help students understand the method.

Subjects You Must Know Perfectly:

✅ Pure Mathematics

- Functions
- Limits
- Differentiation
- Integration
- Trigonometry
- Complex Numbers
- Vectors
- Matrices
- Binomial Theorem
- Sequences & Series
- Logarithms
- Coordinate Geometry
- Differential Equations

✅ Applied Mathematics

- Mechanics
- Statics
- Dynamics
- Friction
- Projectiles
- Circular Motion
- Relative Velocity
- Work Energy Power
- Momentum
- SHM

✅ Statistics

- Probability
- Permutations
- Combinations
- Distributions
- Mean Variance
- Regression
- Correlation

Teaching Style:

- Use easy Sinhala explanations.
- Use examples.
- Use formulas clearly.
- Explain why the answer comes.
- Mention shortcuts when useful.
- Mention common mistakes students make.
- Give exam tips.
- Teach theory if needed before solving.
- Encourage the student.

Important:

If student asks:

- “methana explain karanna”
- “meka therenne ne”
- “step ekin kiyanna”
- “short cut thiyenawada”

Then explain very deeply and slowly.

When solving:

1. Write given data.
2. Select correct formula.
3. Show substitutions.
4. Solve step-by-step.
5. Give final answer clearly.

If image is sent:

- Analyze the image carefully.
- Read equations correctly.
- Answer only after understanding the image.

If question is incomplete:

- Politely ask for missing details.

If student is stressed:

- Motivate them positively like a real teacher.

Special Behavior:

- Never reply with broken JSON.
- Never show API data.
- Never expose technical information.
- Never use weird symbols.
- Format replies beautifully.
- Use paragraphs and spacing properly.

Exam Mode:

If user says:

- “paper class”
- “revision”
- “guess paper”
- “mcq”
- “structured”
- “essay”

Then respond like a real A/L teacher.

Extra Features:

- Give memory tricks.
- Give shortcuts.
- Mention calculator tricks.
- Mention past paper patterns.
- Mention important theory points.
- Mention unit conversions when needed.
- Mention graph explanations if needed.

You are not just a chatbot.
You are a real Sri Lankan A/L Combined Maths Master Teacher AI.
`;

// =======================
// MEMORY
// =======================

const userMemory = {};

// =======================
// BOT ONLINE
// =======================

console.log('✅ xCHAMi AI Bot Running...');

// =======================
// START COMMAND
// =======================

bot.onText(/\/start/, async (msg) => {

  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || 'User';

  bot.sendPhoto(
    chatId,
    'https://files.catbox.moe/jq0n2q.jpg',
    {
      caption:
`👋 Hello ${firstName}

Welcome to ${BOT_NAME}

🤖 Smart AI Chat
🖼 Photo Question Support
⚡ Fast Responses
🧠 AI Memory System
🌍 Public Access
🎨 Beautiful UI

${FOOTER}`,

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
              text: '📚 Commands',
              callback_data: 'help'
            },
            {
              text: 'ℹ️ Bot Info',
              callback_data: 'botinfo'
            }
          ]
        ]
      }
    }
  );
});

// =======================
// HELP COMMAND
// =======================

bot.onText(/\/help/, async (msg) => {

  bot.sendMessage(
    msg.chat.id,

`📚 Available Commands

/start - Start Bot
/help - Show Commands
/ping - Check Bot
/clear - Clear Memory
/botinfo - Owner Panel

🖼 Send Photo + Caption
Ask anything from images.

${FOOTER}`
  );
});

// =======================
// PING
// =======================

bot.onText(/\/ping/, async (msg) => {

  bot.sendMessage(
    msg.chat.id,
    `🏓 Pong!\n\n✅ Bot Online\n⚡ Speed Good\n\n${FOOTER}`
  );
});

// =======================
// CLEAR MEMORY
// =======================

bot.onText(/\/clear/, async (msg) => {

  const chatId = msg.chat.id;

  delete userMemory[chatId];

  bot.sendMessage(
    chatId,
    `🧹 Chat Memory Cleared\n\n${FOOTER}`
  );
});

// =======================
// OWNER BOT INFO
// =======================

bot.onText(/\/botinfo/, async (msg) => {

  const chatId = msg.chat.id;

  if (String(chatId) !== OWNER_ID) {

    return bot.sendMessage(
      chatId,
      `❌ Owner Only Command\n\n${FOOTER}`
    );
  }

  bot.sendMessage(
    chatId,

`📊 BOT INFORMATION

🤖 Bot Name : ${BOT_NAME}
⚡ Status : Online
🌐 API : Connected
🖼 Image AI : Enabled
🧠 Memory : Enabled
👥 Public Users : Enabled

${FOOTER}`
  );
});

// =======================
// MAIN MESSAGE SYSTEM
// =======================

bot.on('message', async (msg) => {

  try {

    const chatId = msg.chat.id;
    const text = msg.text;

    // Ignore Commands
    if (text && text.startsWith('/')) return;

    // Typing
    bot.sendChatAction(chatId, 'typing');

    // =======================
    // IMAGE SUPPORT
    // =======================

    if (msg.photo) {

      const photo = msg.photo[msg.photo.length - 1];

      const file = await bot.getFile(photo.file_id);

      const imageUrl =
`https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;

      const caption =
msg.caption || 'Describe this image';

      const response = await axios.get(
`${API_URL}?q=${encodeURIComponent(
`${SYSTEM_PROMPT}

Image URL: ${imageUrl}

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

${FOOTER}`,

        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🖼 Send Another Photo',
                  callback_data: 'photo'
                }
              ]
            ]
          }
        }
      );
    }

    // =======================
    // TEXT CHAT
    // =======================

    if (!text) return;

    // Save Memory
    if (!userMemory[chatId]) {
      userMemory[chatId] = [];
    }

    userMemory[chatId].push(text);

    // Keep Last 5 Messages
    userMemory[chatId] =
      userMemory[chatId].slice(-5);

    const memoryText =
      userMemory[chatId].join('\n');

    const response = await axios.get(
`${API_URL}?q=${encodeURIComponent(
`${SYSTEM_PROMPT}

Chat Memory:
${memoryText}

User: ${text}`
)}`
    );

    let reply =
      response.data.result ||
      response.data.reply ||
      response.data.message ||
      response.data.answer ||
      JSON.stringify(response.data);

    reply = cleanReply(reply);

    // Long Message Split
    if (reply.length > 4000) {
      reply = reply.substring(0, 3900);
    }

    bot.sendMessage(
      chatId,

`${reply}

${FOOTER}`,

      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '📚 Help',
                callback_data: 'help'
              },
              {
                text: '🧹 Clear',
                callback_data: 'clear'
              }
            ],
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

  } catch (error) {

    console.log(error.response?.data || error.message);

    bot.sendMessage(
      msg.chat.id,

`❌ AI Server Error

Please try again later.

${FOOTER}`
    );
  }
});

// =======================
// BUTTON EVENTS
// =======================

bot.on('callback_query', async (query) => {

  const chatId = query.message.chat.id;
  const data = query.data;

  // HELP
  if (data === 'help') {

    bot.sendMessage(
      chatId,

`📚 BOT FEATURES

✅ AI Chat
✅ Image Questions
✅ Fast Replies
✅ Chat Memory
✅ Stylish UI
✅ Inline Buttons
✅ Public Access
✅ Error Protection
✅ Owner Panel
✅ Smart Responses

${FOOTER}`
    );
  }

  // CLEAR
  if (data === 'clear') {

    delete userMemory[chatId];

    bot.sendMessage(
      chatId,
      `🧹 Memory Cleared\n\n${FOOTER}`
    );
  }

  // PHOTO
  if (data === 'photo') {

    bot.sendMessage(
      chatId,

`🖼 Send a photo with caption.

Example:
Send image + question.

${FOOTER}`
    );
  }

  bot.answerCallbackQuery(query.id);
});

// =======================
// CLEAN API RESPONSE
// =======================

function cleanReply(text) {

  if (!text) return 'No response';

  if (typeof text !== 'string') {
    text = JSON.stringify(text);
  }

  // Remove JSON garbage
  text = text.replace(/"success":true,/gi, '');
  text = text.replace(/"responseTime".*?,/gi, '');
  text = text.replace(/"attempts".*?,/gi, '');
  text = text.replace(/"requestId".*?,/gi, '');
  text = text.replace(/"creator".*?}/gi, '');
  text = text.replace(/"result":/gi, '');

  // Remove Symbols
  text = text.replace(/[{}[\]"]/g, '');

  // Fix line breaks
  text = text.replace(/\\n/g, '\n');

  // Remove commas
  text = text.replace(/,+/g, '');

  return text.trim();
       }
