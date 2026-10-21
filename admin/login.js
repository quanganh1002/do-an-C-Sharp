// Đăng nhập chạy hoàn toàn trên trình duyệt (chưa có backend) nên chỉ mang tính giao diện, không bảo mật thật.
const ACCOUNTS = {
    thungan: { password: "sweet1234", name: "Lê Thị Thu Hà", role: "Thu ngân" },
    admin: { password: "admin1234", name: "Quản trị viên", role: "Quản lý" }
};

const MAX_TRIES = 5;
const LOCK_MS = 15 * 60 * 1000;
const SESSION_KEY = "sweetbake:session";
const LOCK_KEY = "sweetbake:lock";

function read(store, key) {
    try { return JSON.parse(store.getItem(key)); } catch (e) { return null; }
}

function write(store, key, value) {
    try { store.setItem(key, JSON.stringify(value)); } catch (e) { /* bỏ qua */ }
}

// Đã đăng nhập thì vào thẳng trang quản trị
if (read(localStorage, SESSION_KEY) || read(sessionStorage, SESSION_KEY)) {
    location.replace("index.html");
}

const errorEl = document.getElementById("error");

document.getElementById("forgot").addEventListener("click", e => {
    e.preventDefault();
    alert("Vui lòng liên hệ quản lý để được cấp lại mật khẩu.");
});

document.getElementById("loginForm").addEventListener("submit", e => {
    e.preventDefault();

    const lock = read(localStorage, LOCK_KEY) || { tries: 0, until: 0 };
    if (lock.until > Date.now()) {
        const mins = Math.ceil((lock.until - Date.now()) / 60000);
        errorEl.textContent = "Tài khoản đang bị khóa, thử lại sau " + mins + " phút";
        return;
    }

    const user = document.getElementById("username").value.trim().toLowerCase();
    const pass = document.getElementById("password").value;
    const acc = ACCOUNTS[user];

    if (!acc || acc.password !== pass) {
        lock.tries = (lock.until && lock.until <= Date.now() ? 0 : lock.tries) + 1;
        if (lock.tries >= MAX_TRIES) {
            lock.until = Date.now() + LOCK_MS;
            lock.tries = 0;
            errorEl.textContent = "Sai mật khẩu 5 lần, tài khoản bị khóa 15 phút";
        } else {
            lock.until = 0;
            errorEl.textContent = "Sai tên đăng nhập hoặc mật khẩu (còn " + (MAX_TRIES - lock.tries) + " lần thử)";
        }
        write(localStorage, LOCK_KEY, lock);
        return;
    }

    write(localStorage, LOCK_KEY, { tries: 0, until: 0 });
    const store = document.getElementById("remember").checked ? localStorage : sessionStorage;
    write(store, SESSION_KEY, { user, name: acc.name, role: acc.role });
    location.replace("index.html");
});
