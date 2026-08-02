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

    if (!content || !amount) {
        return res.json({
            success: false,
            message: "Thiếu dữ liệu"
        });
    }

    const now = new Date();

    const date = now.toLocaleDateString("vi-VN");
    const time = now.toLocaleTimeString("vi-VN");

    expenses.push({
        amount: Number(amount),
        content
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

bot.onText(/\/chot/, (msg) => {

    if (expenses.length === 0) {
        return bot.sendMessage(msg.chat.id, "Hôm nay chưa có khoản chi nào.");
    }

    let total = 0;

    let text = "📊 CHỐT CHI TIÊU HÔM NAY\n\n";

    expenses.forEach(item => {
        total += item.amount;
        text += `• ${formatMoney(item.amount)} - ${item.content}\n`;
    });

    text += `\n💰 Tổng chi: ${formatMoney(total)}`;

    bot.sendMessage(msg.chat.id, text);

});

bot.onText(/\/reset/, (msg) => {

    expenses = [];

    bot.sendMessage(msg.chat.id, "✅ Đã xóa danh sách hôm nay.");

});

bot.onText(/\/help/, (msg) => {

    bot.sendMessage(
        msg.chat.id,
`📖 HƯỚNG DẪN

/chot  - Chốt cuối ngày

/reset - Xóa danh sách hôm nay

/help  - Hướng dẫn sử dụng`
    );

});

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});