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
    return Number(number).toLocaleString("vi-VN") + " đ";
}

app.post("/send", async (req, res) => {

    const { content, amount } = req.body;

    if (!content || !amount) {
        return res.json({
            success: false
        });
    }

    const now = new Date();

    const date = now.toLocaleDateString("vi-VN");

    const time = now.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit"
    });

    expenses.push({
        content,
        amount: Number(amount)
    });

    const message = `
💸 GIAO DỊCH MỚI

📝 Nội dung : ${content}
💰 Số tiền : ${formatMoney(amount)}

📅 Ngày : ${date}
🕒 Giờ : ${time}

━━━━━━━━━━━━━━━━━━━━
🤖 Telegram Expense Bot
`;

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

    await bot.sendMessage(
        msg.chat.id,
`📖 HƯỚNG DẪN

/chot
Chốt cuối ngày

/reset
Xóa dữ liệu hôm nay

/help
Xem hướng dẫn`
    );

});

bot.onText(/\/reset/, async (msg) => {

    expenses = [];

    await bot.sendMessage(
        msg.chat.id,
        "🗑 Đã xóa toàn bộ giao dịch hôm nay."
    );

});

bot.onText(/\/chot/, async (msg) => {

    if (expenses.length === 0) {

        return bot.sendMessage(
            msg.chat.id,
            "📭 Hôm nay chưa có giao dịch."
        );

    }

    let total = 0;

    let report = `📊 CHỐT CHI TIÊU\n\n`;

    expenses.forEach((item, index) => {

        total += item.amount;

        report += `${index + 1}. 💰 ${formatMoney(item.amount)}\n`;
        report += `📝 ${item.content}\n\n`;

    });

    report += `━━━━━━━━━━━━━━━━━━━━\n`;
    report += `💵 TỔNG CHI: ${formatMoney(total)}`;

    await bot.sendMessage(msg.chat.id, report);

});

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});