const contentInput = document.getElementById("content");
const amountInput = document.getElementById("amount");

const totalText = document.getElementById("total");
const countText = document.getElementById("count");

const list = document.getElementById("transactionList");

/*=============================
SET MONEY
=============================*/

function setMoney(value){

    amountInput.value = value;

}

/*=============================
FORMAT MONEY
=============================*/

function money(number){

    return Number(number).toLocaleString("vi-VN");

}

/*=============================
SEND
=============================*/

async function sendData(){

    const content = contentInput.value.trim();

    const amount = amountInput.value.trim();

    if(content === ""){

        alert("Nhập nội dung");

        return;

    }

    if(amount === ""){

        alert("Nhập số tiền");

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

        loadToday();

        alert("✅ Đã gửi Telegram");

    }

    else{

        alert("❌ Gửi thất bại");

    }

}/*=============================
LOAD TODAY
=============================*/

async function loadToday() {

    const response = await fetch("/api/today");

    const data = await response.json();

    if (!data.success) {

        alert("Không tải được dữ liệu.");

        return;

    }

    totalText.innerText = money(data.total);

    countText.innerText = data.count;

    list.innerHTML = "";

    if (data.transactions.length === 0) {

        list.innerHTML = `

        <div class="empty">

            Chưa có giao dịch.

        </div>

        `;

        return;

    }

    data.transactions.forEach(item => {

        const time = new Date(item.created_at)
            .toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit"
            });

        list.innerHTML += `

        <div class="item">

            <div class="item-left">

                <div class="item-title">

                    ${item.content}

                </div>

                <div class="item-time">

                    ${time}

                </div>

            </div>

            <div class="item-right">

                ${money(item.amount)} đ

            </div>

        </div>

        `;

    });

}/*=============================
CLOSE DAY
=============================*/

async function closeDay() {

    const ok = confirm("Bạn có muốn CHỐT CUỐI NGÀY không?");

    if (!ok) {

        return;

    }

    const response = await fetch("/api/close-day", {

        method: "POST"

    });

    const data = await response.json();

    if (data.success) {

        alert(
            `✅ Đã chốt ${data.count} giao dịch\n\nTổng tiền: ${money(data.total)} đ`
        );

        loadToday();

    } else {

        alert(data.message || "❌ Không thể chốt cuối ngày.");

    }

}

/*=============================
ENTER TO SEND
=============================*/

contentInput.addEventListener("keypress", function(e){

    if(e.key==="Enter"){

        amountInput.focus();

    }

});

amountInput.addEventListener("keypress", function(e){

    if(e.key==="Enter"){

        sendData();

    }

});

/*=============================
AUTO LOAD
=============================*/

window.onload = function(){

    loadToday();

};

/*=============================
AUTO REFRESH
=============================*/

setInterval(function(){

    loadToday();

},30000);