const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

async function sendTelegram(text) {

    const response = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                chat_id: CHAT_ID,
                text
            })
        }
    );

    const data = await response.json();

    if (!data.ok) {
        throw new Error(data.description);
    }

    return data;
}

module.exports = sendTelegram;