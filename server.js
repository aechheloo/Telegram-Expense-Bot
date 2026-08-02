require("dotenv").config();

const express = require("express");
const TelegramBot = require("node-telegram-bot-api");

const app = express();
app.use(express.json());

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true,
});

bot.on("message", (msg) => {
  console.log(msg);

  if (!msg.text) return;

  bot.sendMessage(
    msg.chat.id,
    `Đã nhận:\n\n${msg.text}\n\nChat ID: ${msg.chat.id}`
  );
});

app.get("/", (req, res) => {
  res.send("Telegram Expense Bot is running.");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
