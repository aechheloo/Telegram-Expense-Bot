const content = document.getElementById("content");
const amount = document.getElementById("amount");
const sendBtn = document.getElementById("sendBtn");

amount.addEventListener("input", function () {

    let value = this.value.replace(/\D/g, "");

    if (!value) {
        this.value = "";
        return;
    }

    this.value = Number(value).toLocaleString("vi-VN");

});

function clearMoney() {

    amount.value = "";
    amount.focus();

}

function setMoney(value) {

    amount.value = Number(value).toLocaleString("vi-VN");

}

async function sendData() {

    const noiDung = content.value.trim();
    const soTien = amount.value.replace(/\./g, "");

    if (noiDung === "") {

        alert("Vui lòng nhập nội dung.");
        content.focus();
        return;

    }

    if (soTien === "") {

        alert("Vui lòng nhập số tiền.");
        amount.focus();
        return;

    }

    sendBtn.disabled = true;
    sendBtn.innerHTML = "⏳ ĐANG GỬI...";

    try {

        const response = await fetch("/send", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                content: noiDung,
                amount: soTien

            })

        });

        const result = await response.json();

        if (result.success) {

            sendBtn.innerHTML = "✅ ĐÃ GỬI";

            content.value = "";
            amount.value = "";

            setTimeout(() => {

                sendBtn.innerHTML = "🚀 GỬI GIAO DỊCH";
                sendBtn.disabled = false;

            }, 1200);

        } else {

            alert("Gửi thất bại.");

            sendBtn.innerHTML = "🚀 GỬI GIAO DỊCH";
            sendBtn.disabled = false;

        }

    } catch (e) {

        alert("Không thể kết nối máy chủ.");

        sendBtn.innerHTML = "🚀 GỬI GIAO DỊCH";
        sendBtn.disabled = false;

    }

}