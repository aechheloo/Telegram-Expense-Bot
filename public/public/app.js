const content = document.getElementById("content");
const amount = document.getElementById("amount");

amount.addEventListener("input", function () {

    let value = this.value.replace(/\D/g, "");

    if (value === "") {
        this.value = "";
        return;
    }

    this.value = Number(value).toLocaleString("vi-VN");

});

function clearMoney() {

    amount.value = "";

}

function setMoney(number) {

    amount.value = Number(number).toLocaleString("vi-VN");

}

async function sendData() {

    const noiDung = content.value.trim();

    const soTien = amount.value.replace(/\./g, "");

    if (noiDung === "") {

        alert("Vui lòng nhập nội dung.");

        return;

    }

    if (soTien === "") {

        alert("Vui lòng nhập số tiền.");

        return;

    }

    const btn = document.getElementById("sendBtn");

    btn.disabled = true;

    btn.innerHTML = "⏳ Đang gửi...";

    try {

        const res = await fetch("/send", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                content: noiDung,

                amount: soTien

            })

        });

        const data = await res.json();

        if (data.success) {

            btn.innerHTML = "✅ Đã gửi";

            content.value = "";

            amount.value = "";

            setTimeout(() => {

                btn.innerHTML = "🚀 GỬI GIAO DỊCH";

                btn.disabled = false;

            }, 1500);

        } else {

            btn.innerHTML = "❌ Lỗi";

            btn.disabled = false;

        }

    } catch (e) {

        btn.innerHTML = "❌ Lỗi";

        btn.disabled = false;

        alert("Không thể kết nối tới máy chủ.");

    }

}