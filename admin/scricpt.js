// ================================
// SIDEBAR DROPDOWN
// ================================

document.querySelectorAll(".nav-toggle").forEach(button => {

    button.addEventListener("click", () => {

        const group = button.closest(".nav-group");
        const submenu = group.querySelector(".submenu");

        // Đóng / mở menu
        group.classList.toggle("open");

        if (submenu) {
            if (group.classList.contains("open")) {
                submenu.style.display = "block";
            } else {
                submenu.style.display = "none";
            }
        }

    });

});


// ================================
// SEARCH - CTRL + K / CMD + K
// ================================

document.addEventListener("keydown", (e) => {

    // Windows: Ctrl + K
    // Mac: Command + K

    if (
        (e.ctrlKey || e.metaKey) &&
        e.key.toLowerCase() === "k"
    ) {

        e.preventDefault();

        document.querySelector("#searchInput").focus();

    }

});


// ================================
// BIỂU ĐỒ DOANH THU
// ================================

const ctx = document.getElementById("revenueChart");

new Chart(ctx, {

    type: "line",

    data: {

        labels: [
            "07/09",
            "08/09",
            "09/09",
            "10/09",
            "11/09",
            "12/09",
            "13/09"
        ],

        datasets: [

            {
                label: "Doanh thu",

                data: [
                    4.5,
                    7.3,
                    10.2,
                    7.1,
                    9.9,
                    8.3,
                    13.7
                ],

                borderColor: "#df777a",

                backgroundColor: "rgba(223,119,122,0.12)",

                borderWidth: 2,

                pointRadius: 3,

                pointHoverRadius: 5,

                tension: 0.38,

                fill: true
            }

        ]

    },

    options: {

        responsive: true,

        maintainAspectRatio: false,

        plugins: {

            // Ẩn chú thích "Doanh thu"
            legend: {
                display: false
            },

            // Tooltip khi rê chuột vào biểu đồ
            tooltip: {

                callbacks: {

                    label: function(context) {

                        return context.raw.toFixed(1)
                            + " triệu đồng";

                    }

                }

            }

        },

        scales: {

            // Trục Y
            y: {

                beginAtZero: true,

                max: 20,

                ticks: {

                    stepSize: 5,

                    callback: function(value) {

                        return value.toLocaleString("vi-VN")
                            + ".000.000";

                    }

                },

                grid: {
                    color: "#eee7e1"
                },

                border: {
                    display: false
                }

            },

            // Trục X
            x: {

                grid: {
                    color: "#f0eae5"
                },

                border: {
                    display: false
                }

            }

        }

    }

});


// ================================
// NÚT THÔNG BÁO
// ================================

document
    .querySelector(".notification")
    .addEventListener("click", () => {

        alert("Bạn có 3 thông báo mới! 🔔");

    });


// ================================
// SELECT KHOẢNG THỜI GIAN
// ================================

document
    .querySelector("#period")
    .addEventListener("change", (e) => {

        console.log(
            "Đã chọn:",
            e.target.value
        );

    });