/*======================================
    TELEGRAM EXPENSE BOT
======================================*/

const contentInput = document.getElementById("content");
const amountInput = document.getElementById("amount");

const totalText = document.getElementById("total");
const countText = document.getElementById("count");

const list = document.getElementById("transactionList");

/*======================================
    FORMAT MONEY
======================================*/

function formatMoney(number){

    return Number(number).toLocaleString("vi-VN");

}

/*======================================
    QUICK MONEY
======================================*/

function setMoney(value){

    amountInput.value = value;

    amountInput.focus();

}

/*======================================
    SEND DATA
======================================*/

async function sendData(){

    const content = contentInput.value.trim();

    const amount = amountInput.value.trim();

    if(content===""){

        alert("Nhập nội dung.");

        return;

    }

    if(amount===""){

        alert("Nhập số tiền.");

        return;

    }

    const response = await fetch("/send",{

        method:"POST",

        headers:{

            "Content-Type":"application/json"

        },

        body:JSON.stringify({

            content,

            amount

        })

    });

    const data = await response.json();

    if(data.success){

        contentInput.value="";

        amountInput.value="";

        await loadToday();

        alert("✅ Đã gửi Telegram");

    }

    else{

        alert("❌ Gửi thất bại");

    }

}/*======================================
    LOAD TODAY
======================================*/

async function loadToday() {

    try {

        const response = await fetch("/api/today");

        const data = await response.json();

        if (!data.success) {

            console.log(data);

            return;

        }

        totalText.innerHTML = formatMoney(data.total);

        countText.innerHTML = data.count;

        renderTransactions(data.transactions);

    }

    catch (error) {

        console.log(error);

    }

}

/*======================================
    RENDER LIST
======================================*/

function renderTransactions(transactions) {

    if (!list) return;

    list.innerHTML = "";

    if (transactions.length === 0) {

        list.innerHTML = `

        <div class="empty">

            Chưa có giao dịch hôm nay.

        </div>

        `;

        return;

    }

    transactions.forEach(item => {

        const time = new Date(item.created_at)
            .toLocaleTimeString("vi-VN", {

                hour: "2-digit",

                minute: "2-digit"

            });

        list.innerHTML += `

        <div class="transaction-item">

            <div class="left">

                <h4>${item.content}</h4>

                <span>${time}</span>

            </div>

            <div class="right">

                ${formatMoney(item.amount)} đ

            </div>

        </div>

        `;

    });

}/*======================================
    CLOSE DAY
======================================*/

async function closeDay() {

    const ok = confirm("Bạn có chắc muốn CHỐT CUỐI NGÀY?");

    if (!ok) return;

    try {

        const response = await fetch("/api/close-day", {

            method: "POST"

        });

        const data = await response.json();

        if (data.success) {

            alert(
                `✅ Đã chốt ${data.count} giao dịch\n\n💰 Tổng tiền: ${formatMoney(data.total)} đ`
            );

            await loadToday();

        } else {

            alert(data.message || "❌ Không thể chốt cuối ngày.");

        }

    } catch (error) {

        console.log(error);

        alert("❌ Lỗi kết nối.");

    }

}

/*======================================
    ENTER TO SEND
======================================*/

contentInput.addEventListener("keydown", function (e) {

    if (e.key === "Enter") {

        amountInput.focus();

    }

});

amountInput.addEventListener("keydown", function (e) {

    if (e.key === "Enter") {

        sendData();

    }

});

/*======================================
    AUTO LOAD
======================================*/

window.addEventListener("load", () => {

    loadToday();

});

/*======================================
    AUTO REFRESH
======================================*/

setInterval(() => {

    loadToday();

}, 30000);