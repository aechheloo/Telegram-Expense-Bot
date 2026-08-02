async function sendData() {

    const content = document.getElementById("content").value;
    const amount = document.getElementById("amount").value;

    if (!content || !amount) {
        alert("Vui lòng nhập đầy đủ.");
        return;
    }

    const res = await fetch("/send", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            content,
            amount
        })
    });

    const data = await res.json();

    if (data.success) {

        alert("✅ Đã gửi Telegram");

        document.getElementById("content").value = "";
        document.getElementById("amount").value = "";

    } else {

        alert("❌ Gửi thất bại");

    }

}