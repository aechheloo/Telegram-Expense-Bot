require("dotenv").config();

const express = require("express");
const path = require("path");
const { Pool } = require("pg");

const app = express();

const PORT = process.env.PORT || 3000;

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const DATABASE_URL = process.env.DATABASE_URL;

/* ===========================
   DATABASE
=========================== */

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

/* ===========================
   EXPRESS
=========================== */

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

app.use(express.static(
    path.join(__dirname, "public")
));

/* ===========================
   CREATE TABLE
=========================== */

async function createTable() {

    await pool.query(`

        CREATE TABLE IF NOT EXISTS transactions(

            id SERIAL PRIMARY KEY,

            content TEXT NOT NULL,

            amount BIGINT NOT NULL,

            business_date DATE NOT NULL,

            created_at TIMESTAMP DEFAULT NOW(),

            closed BOOLEAN DEFAULT FALSE

        )

    `);

}

createTable();

/* ===========================
   FORMAT MONEY
=========================== */

function money(number){

    return Number(number)
        .toLocaleString("vi-VN");

}

/* ===========================
   DATE
=========================== */

function today(){

    const d = new Date();

    return d.toLocaleDateString(
        "en-CA",
        {
            timeZone:"Asia/Ho_Chi_Minh"
        }
    );

}

/* ===========================
   TIME
=========================== */

function time(){

    return new Date()
        .toLocaleTimeString(
            "vi-VN",
            {
                hour12:false,
                timeZone:"Asia/Ho_Chi_Minh"
            }
        );

}

/* ===========================
   SEND TELEGRAM
=========================== */

async function telegram(message){

    await fetch(

        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,

        {

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({

                chat_id:CHAT_ID,

                text:message

            })

        }

    );

}/* ===========================
   API SEND TRANSACTION
=========================== */

app.post("/send", async (req, res) => {

    try {

        const content = String(req.body.content || "").trim();
        const amount = Number(req.body.amount);

        if (!content || !amount) {

            return res.json({
                success: false,
                message: "Thiếu dữ liệu"
            });

        }

        await pool.query(

            `
            INSERT INTO transactions
            (content,amount,business_date)

            VALUES($1,$2,$3)
            `,

            [
                content,
                amount,
                today()
            ]

        );

        const message =

`💸 GIAO DỊCH MỚI

📅 ${today()}

🕒 ${time()}

💰 ${money(amount)} VNĐ

📝 ${content}`;

        await telegram(message);

        res.json({

            success: true

        });

    }

    catch(error){

        console.log(error);

        res.json({

            success:false,

            error:error.message

        });

    }

});

/* ===========================
   TODAY
=========================== */

app.get("/api/today", async(req,res)=>{

    try{

        const list = await pool.query(

            `
            SELECT *

            FROM transactions

            WHERE business_date=$1

            ORDER BY id DESC
            `,

            [

                today()

            ]

        );

        const total = await pool.query(

            `
            SELECT

            COALESCE(
                SUM(amount),
                0
            ) total

            FROM transactions

            WHERE business_date=$1
            `,

            [

                today()

            ]

        );

        res.json({

            success:true,

            total:Number(
                total.rows[0].total
            ),

            count:list.rows.length,

            transactions:list.rows

        });

    }

    catch(error){

        res.json({

            success:false,

            error:error.message

        });

    }

}/* ===========================
   API SEND TRANSACTION
=========================== */

app.post("/send", async (req, res) => {

    try {

        const content = String(req.body.content || "").trim();
        const amount = Number(req.body.amount);

        if (!content || !amount) {

            return res.json({
                success: false,
                message: "Thiếu dữ liệu"
            });

        }

        await pool.query(

            `
            INSERT INTO transactions
            (content,amount,business_date)

            VALUES($1,$2,$3)
            `,

            [
                content,
                amount,
                today()
            ]

        );

        const message =

`💸 GIAO DỊCH MỚI

📅 ${today()}

🕒 ${time()}

💰 ${money(amount)} VNĐ

📝 ${content}`;

        await telegram(message);

        res.json({

            success: true

        });

    }

    catch(error){

        console.log(error);

        res.json({

            success:false,

            error:error.message

        });

    }

});

/* ===========================
   TODAY
=========================== */

app.get("/api/today", async(req,res)=>{

    try{

        const list = await pool.query(

            `
            SELECT *

            FROM transactions

            WHERE business_date=$1

            ORDER BY id DESC
            `,

            [

                today()

            ]

        );

        const total = await pool.query(

            `
            SELECT

            COALESCE(
                SUM(amount),
                0
            ) total

            FROM transactions

            WHERE business_date=$1
            `,

            [

                today()

            ]

        );

        res.json({

            success:true,

            total:Number(
                total.rows[0].total
            ),

            count:list.rows.length,

            transactions:list.rows

        });

    }

    catch(error){

        res.json({

            success:false,

            error:error.message

        });

    }

});/* ===========================
   CLOSE DAY
=========================== */

app.post("/api/close-day", async (req, res) => {

    try {

        const result = await pool.query(

            `
            SELECT *
            FROM transactions
            WHERE business_date=$1
            AND closed=false
            ORDER BY id ASC
            `,

            [today()]

        );

        if (result.rows.length === 0) {

            return res.json({
                success: false,
                message: "Không có giao dịch để chốt."
            });

        }

        let total = 0;

        let report = `✅ CHỐT CUỐI NGÀY\n\n`;
        report += `📅 ${today()}\n\n`;

        result.rows.forEach((item, index) => {

            total += Number(item.amount);

            report += `${index + 1}. ${item.content}\n`;
            report += `${money(item.amount)} VNĐ\n\n`;

        });

        report += `━━━━━━━━━━━━━━\n`;
        report += `💰 Tổng tiền: ${money(total)} VNĐ\n`;
        report += `📊 Số giao dịch: ${result.rows.length}\n`;
        report += `🕒 Chốt lúc: ${time()}`;

        await telegram(report);

        await pool.query(

            `
            UPDATE transactions
            SET closed=true
            WHERE business_date=$1
            `,

            [today()]

        );

        res.json({

            success: true,

            total,

            count: result.rows.length

        });

    }

    catch (error) {

        console.log(error);

        res.json({

            success: false,

            error: error.message

        });

    }

});/* ===========================
   HOME
=========================== */

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "public", "index.html")
    );

});

/* ===========================
   HEALTH CHECK
=========================== */

app.get("/health", async (req, res) => {

    try {

        await pool.query("SELECT NOW()");

        res.json({

            success: true,

            server: "Running",

            database: "Connected",

            date: today(),

            time: time()

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            database: "Disconnected",

            error: error.message

        });

    }

});

/* ===========================
   404
=========================== */

app.use((req, res) => {

    res.status(404).json({

        success: false,

        message: "API Not Found"

    });

});

/* ===========================
   START SERVER
=========================== */

app.listen(PORT, () => {

    console.log("====================================");
    console.log("🚀 Telegram Expense Bot Started");
    console.log("🌐 Port :", PORT);
    console.log("📅 Date :", today());
    console.log("🕒 Time :", time());
    console.log("====================================");

});