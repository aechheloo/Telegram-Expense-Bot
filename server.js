require("dotenv").config();

const express = require("express");
const TelegramBot = require("node-telegram-bot-api");

const app = express();

app.use(express.json());
app.use(express.static("public"));

const bot = new TelegramBot(process.env.BOT_TOKEN);

const CHAT_ID = process.env.CHAT_ID;

let expenses = [];

function formatMoney(number) {
    return Number(number).toLocaleString("vi-VN") + "đ";
}

app.post("/send", async (req, res) => {

    const { content, amount } = req.body;

    const now = new Date();

    const date = now.toLocaleDateString("vi-VN");
    const time = now.toLocaleTimeString("vi-VN");

    expenses.push({
        content,
        amount: Number(amount)
    });

    const message =
`📅 ${date} ${time}

💰 ${formatMoney(amount)}

📝 ${content}`;

    try {

        await bot.sendMessage(CHAT_ID, message);

        res.json({
            success: true
        });

    } catch (err) {

        console.log(err);

        res.json({
            success: false
        });

    }

});

bot.onText(/\/help/, async (msg) => {

    await bot.sendMessage(msg.chat.id,
`📖 LỆNH

/send (qua Web)

---------------------

/chot
Chốt cuối ngày

/reset
Xóa danh sách hôm nay

/help
Hiển thị hướng dẫn`);

});

bot.onText(/\/reset/, async (msg) => {

    expenses = [];

    await bot.sendMessage(msg.chat.id,
"🗑 Đã xóa toàn bộ chi tiêu hôm nay.");

});

bot.onText(/\/chot/, async (msg) => {

    if (expenses.length === 0) {

        return bot.sendMessage(msg.chat.id,
"📭 Hôm nay chưa có chi tiêu.");

    }

    let total = 0;

    let text = "📊 CHỐT CUỐI NGÀY\n\n";

    expenses.forEach(item => {

        total += item.amount;

        text += `• ${formatMoney(item.amount)} - ${item.content}\n`;

    });

    text += `\n--------------------\n`;
    text += `💰 Tổng chi: ${formatMoney(total)}`;

    await bot.sendMessage(msg.chat.id, text);

});

app.get("/", (req, res) => {

    res.sendFile(__dirname + "/public/index.html");

});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {

    console.log(`Server running on ${PORT}`);

});