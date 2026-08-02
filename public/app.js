async function sendData() {

    const content = document.getElementById("content").value.trim();
    const amount = document.getElementById("amount").value.trim();

    if (!content || !amount) {
        alert("Vui lòng nhập đầy đủ.");
        return;
    }

    const response = await fetch("/send", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            content,
            amount
        })
    });

    const data = await response.json();

    if (data.success) {

        alert("✅ Đã gửi thành công.");

        document.getElementById("content").value = "";
        document.getElementById("amount").value = "";

    } else {

        alert("❌ Gửi thất bại.");

    }

}