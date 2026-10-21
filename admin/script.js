// ================================
// KHO DỮ LIỆU (localStorage, có dữ liệu mẫu lần đầu)
// ================================

const KEY = "sweetbake:";

// Phải khai báo trước `db` vì dữ liệu mẫu hóa đơn dùng các hàm này
const fmt = n => n.toLocaleString("vi-VN") + "đ";
const pad = n => String(n).padStart(2, "0");
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function save(name, value) {
    try { localStorage.setItem(KEY + name, JSON.stringify(value)); } catch (e) { /* bỏ qua */ }
}

function load(name, seed) {
    try {
        const v = JSON.parse(localStorage.getItem(KEY + name));
        if (v) return v;
    } catch (e) { /* dùng dữ liệu mẫu */ }
    const s = seed();
    save(name, s);
    return s;
}

const CAT_BG = {
    "Bánh mì": "#f6dcc0",
    "Bánh ngọt": "#f8dfc8",
    "Bánh kem": "#ecd0be",
    "Bánh quy": "#f2d9a8",
    "Đồ uống": "#e3ecd9"
};

const db = {
    products: load("products", () => [
        { id: 1, name: "Bánh mì bơ sữa", cat: "Bánh mì", price: 15000, stock: 32, icon: "🍞" },
        { id: 2, name: "Bánh mì phô mai dừa", cat: "Bánh mì", price: 22000, stock: 18, icon: "🧀" },
        { id: 3, name: "Croissant bơ Pháp", cat: "Bánh ngọt", price: 28000, stock: 24, icon: "🥐" },
        { id: 4, name: "Bông lan trứng muối", cat: "Bánh ngọt", price: 65000, stock: 9, icon: "🍰" },
        { id: 5, name: "Tiramisu ly", cat: "Bánh kem", price: 45000, stock: 12, icon: "🍮" },
        { id: 6, name: "Cookie hạnh nhân", cat: "Bánh quy", price: 90000, stock: 15, icon: "🍪" },
        { id: 7, name: "Bánh su kem", cat: "Bánh ngọt", price: 8000, stock: 40, icon: "🧁" },
        { id: 8, name: "Tart trứng", cat: "Bánh ngọt", price: 18000, stock: 20, icon: "🥧" }
    ]),
    customers: load("customers", () => [
        { id: 1, name: "Nguyễn Thị Mai", phone: "0912000001", points: 120 },
        { id: 2, name: "Trần Văn Bình", phone: "0912000002", points: 260 },
        { id: 3, name: "Lê Thị Cẩm", phone: "0912000003", points: 540 },
        { id: 4, name: "Phạm Văn Dũng", phone: "0912000004", points: 35 }
    ]),
    staff: load("staff", () => [
        { id: 1, name: "Lê Thị Thu Hà", role: "Thu ngân", phone: "0988111222", shift: "Sáng" },
        { id: 2, name: "Nguyễn Văn Hùng", role: "Quản lý", phone: "0988333444", shift: "Cả ngày" },
        { id: 3, name: "Trần Thị Lan", role: "Nhân viên bán hàng", phone: "0988555666", shift: "Chiều" },
        { id: 4, name: "Phạm Minh Tuấn", role: "Giao hàng", phone: "0988777888", shift: "Tối" }
    ]),
    invoices: load("invoices", seedInvoices),
    tasks: load("tasks", () => [
        { id: 1, product: "Croissant bơ Pháp", qty: 30, due: dayKey(new Date()), status: "Đang làm", note: "Đơn online buổi sáng" },
        { id: 2, product: "Tiramisu ly", qty: 20, due: dayKey(new Date()), status: "Chờ làm", note: "" }
    ]),
    receipts: load("receipts", () => []),
    disposals: load("disposals", () => [])
};

function seedInvoices() {
    let r = 7;
    const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
    const prods = [
        ["Bánh mì bơ sữa", 15000], ["Bánh mì phô mai dừa", 22000], ["Croissant bơ Pháp", 28000],
        ["Bông lan trứng muối", 65000], ["Tiramisu ly", 45000], ["Cookie hạnh nhân", 90000],
        ["Bánh su kem", 8000], ["Tart trứng", 18000]
    ];
    const custs = [["Nguyễn Thị Mai", "0912000001"], ["Trần Văn Bình", "0912000002"], ["Lê Thị Cẩm", "0912000003"]];
    const list = [];
    for (let d = 29; d >= 0; d--) {
        const n = 8 + Math.floor(rnd() * 6);
        for (let i = 0; i < n; i++) {
            const t = new Date();
            t.setDate(t.getDate() - d);
            t.setHours(8 + Math.floor(rnd() * 12), Math.floor(rnd() * 60), 0, 0);
            if (t > new Date()) continue;
            const items = [];
            for (let k = 0; k < 1 + Math.floor(rnd() * 3); k++) {
                const p = prods[Math.floor(rnd() * prods.length)];
                if (!items.some(x => x.name === p[0])) items.push({ name: p[0], price: p[1], qty: 1 + Math.floor(rnd() * 3) });
            }
            const c = rnd() < 0.4 ? custs[Math.floor(rnd() * custs.length)] : null;
            list.push({
                time: t.toISOString(),
                customer: c ? c[0] : "Khách lẻ",
                phone: c ? c[1] : "",
                items,
                total: items.reduce((s, x) => s + x.price * x.qty, 0),
                pay: rnd() < 0.6 ? "Tiền mặt" : "VietQR",
                status: rnd() < 0.05 ? "cancel" : "ok"
            });
        }
    }
    list.sort((a, b) => a.time.localeCompare(b.time));
    const perDay = {};
    list.forEach(inv => {
        const k = dayKey(new Date(inv.time));
        perDay[k] = (perDay[k] || 0) + 1;
        inv.code = codeFor(new Date(inv.time), perDay[k]);
    });
    return list;
}


// ================================
// TIỆN ÍCH
// ================================

function dayKey(d) {
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}

function codeFor(d, seq) {
    return "HD" + String(d.getFullYear()).slice(2) + pad(d.getMonth() + 1) + pad(d.getDate()) + "-" + String(seq).padStart(4, "0");
}

function fmtTime(iso) {
    const d = new Date(iso);
    return pad(d.getDate()) + "/" + pad(d.getMonth() + 1) + "/" + d.getFullYear() + " " + pad(d.getHours()) + ":" + pad(d.getMinutes());
}

function nextId(list) {
    return list.reduce((m, x) => Math.max(m, x.id), 0) + 1;
}

function rankOf(points) {
    return points >= 500 ? "Vàng" : points >= 200 ? "Bạc" : "Thành viên";
}

function nextCode() {
    const now = new Date();
    const n = db.invoices.filter(i => dayKey(new Date(i.time)) === dayKey(now)).length;
    return codeFor(now, n + 1);
}

// Doanh thu (hóa đơn không bị hủy) theo từng ngày, n ngày gần nhất
function revenueByDay(n) {
    const labels = [], values = [];
    for (let d = n - 1; d >= 0; d--) {
        const day = new Date();
        day.setDate(day.getDate() - d);
        const k = dayKey(day);
        labels.push(pad(day.getDate()) + "/" + pad(day.getMonth() + 1));
        values.push(db.invoices
            .filter(i => i.status === "ok" && dayKey(new Date(i.time)) === k)
            .reduce((s, i) => s + i.total, 0));
    }
    return { labels, values };
}


// ================================
// MODAL
// ================================

const modal = document.getElementById("modal");

function openModal(title, bodyHtml, buttons) {
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalBody").innerHTML = bodyHtml;
    const box = document.getElementById("modalActions");
    box.innerHTML = "";
    buttons.forEach(b => {
        const el = document.createElement("button");
        el.className = "btn " + (b.cls || "");
        el.textContent = b.label;
        el.addEventListener("click", () => {
            if (!b.fn || b.fn() !== false) closeModal();
        });
        box.appendChild(el);
    });
    modal.classList.add("open");
}

function closeModal() {
    modal.classList.remove("open");
}

modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });


// ================================
// CÁC TRANG QUẢN LÝ (Sản phẩm, Khách hàng, Nhân viên, Hóa đơn)
// ================================

const stockBadge = s => s <= 0 ? `<span class="badge bad">Hết hàng</span>`
    : s < 10 ? `<span class="badge warn">Sắp hết</span>` : `<span class="badge ok">Còn hàng</span>`;

const entities = {
    products: {
        title: "Sản phẩm",
        addLabel: "+ Thêm sản phẩm",
        columns: [
            ["Sản phẩm", p => `${productImg(p, "thumb")} ${esc(p.name)}`],
            ["Loại", p => esc(p.cat)],
            ["Giá", p => fmt(p.price), "r"],
            ["Tồn kho", p => p.stock, "r"],
            ["Trạng thái", p => stockBadge(p.stock)]
        ],
        fields: [
            { key: "name", label: "Tên sản phẩm", type: "text", required: true },
            { key: "image", label: "Ảnh sản phẩm", type: "image" },
            { key: "icon", label: "Biểu tượng (emoji, dùng khi chưa có ảnh)", type: "text", def: "🍰" },
            { key: "cat", label: "Loại", type: "select", options: Object.keys(CAT_BG) },
            { key: "price", label: "Giá bán (đ)", type: "number", required: true },
            { key: "stock", label: "Tồn kho", type: "number", def: 0 }
        ],
        searchText: p => p.name + " " + p.cat
    },
    customers: {
        title: "Khách hàng",
        addLabel: "+ Thêm khách hàng",
        columns: [
            ["Họ tên", c => esc(c.name)],
            ["Số điện thoại", c => esc(c.phone)],
            ["Hạng", c => rankOf(c.points)],
            ["Điểm", c => c.points, "r"]
        ],
        fields: [
            { key: "name", label: "Họ tên", type: "text", required: true },
            { key: "phone", label: "Số điện thoại", type: "text", required: true, unique: true },
            { key: "points", label: "Điểm tích lũy", type: "number", def: 0 }
        ],
        searchText: c => c.name + " " + c.phone
    },
    staff: {
        title: "Nhân viên",
        addLabel: "+ Thêm nhân viên",
        columns: [
            ["Họ tên", s => esc(s.name)],
            ["Chức vụ", s => esc(s.role)],
            ["Số điện thoại", s => esc(s.phone)],
            ["Ca làm", s => esc(s.shift)]
        ],
        fields: [
            { key: "name", label: "Họ tên", type: "text", required: true },
            { key: "role", label: "Chức vụ", type: "select", options: ["Thu ngân", "Quản lý", "Nhân viên bán hàng", "Giao hàng"] },
            { key: "phone", label: "Số điện thoại", type: "text" },
            { key: "shift", label: "Ca làm", type: "select", options: ["Sáng", "Chiều", "Tối", "Cả ngày"] }
        ],
        searchText: s => s.name + " " + s.role + " " + s.phone
    },
    invoices: {
        title: "Hóa đơn",
        columns: [
            ["Mã hóa đơn", i => i.code],
            ["Thời gian", i => fmtTime(i.time)],
            ["Khách hàng", i => esc(i.customer)],
            ["Thanh toán", i => i.pay],
            ["Tổng tiền", i => fmt(i.total), "r"],
            ["Trạng thái", i => i.status === "ok" ? `<span class="badge ok">Hoàn tất</span>` : `<span class="badge bad">Đã hủy</span>`]
        ],
        searchText: i => i.code + " " + i.customer + " " + i.phone,
        filter: true
    },
    tasks: {
        title: "Đơn cần làm",
        addLabel: "+ Thêm đơn cần làm",
        columns: [
            ["Sản phẩm", t => esc(t.product)],
            ["Số lượng", t => t.qty, "r"],
            ["Hạn hoàn thành", t => esc(t.due)],
            ["Ghi chú", t => esc(t.note || "")],
            ["Trạng thái", t => `<span class="badge ${t.status === "Hoàn tất" ? "ok" : t.status === "Đang làm" ? "warn" : "bad"}">${t.status}</span>`]
        ],
        fields: [
            { key: "product", label: "Sản phẩm", type: "select", options: () => db.products.map(p => p.name) },
            { key: "qty", label: "Số lượng cần làm", type: "number", required: true },
            { key: "due", label: "Hạn hoàn thành", type: "date", def: () => dayKey(new Date()) },
            { key: "status", label: "Trạng thái (Hoàn tất sẽ cộng vào tồn kho)", type: "select", options: ["Chờ làm", "Đang làm", "Hoàn tất"] },
            { key: "note", label: "Ghi chú", type: "text" }
        ],
        locked: t => t.status === "Hoàn tất",
        apply: (obj, prev) => {
            if (obj.status !== "Hoàn tất") return null;
            const p = db.products.find(x => x.name === obj.product);
            if (!p) return "Không tìm thấy sản phẩm";
            p.stock += obj.qty;
            return null;
        },
        searchText: t => t.product + " " + t.status + " " + (t.note || "")
    },
    receipts: {
        title: "Nhập kho",
        addLabel: "+ Tạo phiếu nhập",
        stamp: true,
        noEdit: true,
        columns: [
            ["Thời gian", r => fmtTime(r.time)],
            ["Sản phẩm", r => esc(r.product)],
            ["Số lượng nhập", r => r.qty, "r"],
            ["Ghi chú", r => esc(r.note || "")]
        ],
        fields: [
            { key: "product", label: "Sản phẩm", type: "select", options: () => db.products.map(p => p.name) },
            { key: "qty", label: "Số lượng nhập", type: "number", required: true },
            { key: "note", label: "Ghi chú", type: "text" }
        ],
        apply: obj => {
            const p = db.products.find(x => x.name === obj.product);
            if (!p) return "Không tìm thấy sản phẩm";
            p.stock += obj.qty;
            return null;
        },
        revert: r => {
            const p = db.products.find(x => x.name === r.product);
            if (!p) return null;
            if (p.stock < r.qty) return "Tồn kho hiện tại không đủ để hoàn tác phiếu nhập này";
            p.stock -= r.qty;
            return null;
        },
        searchText: r => r.product + " " + (r.note || "")
    },
    disposals: {
        title: "Phiếu hủy",
        addLabel: "+ Tạo phiếu hủy",
        stamp: true,
        noEdit: true,
        columns: [
            ["Thời gian", r => fmtTime(r.time)],
            ["Sản phẩm", r => esc(r.product)],
            ["Số lượng hủy", r => r.qty, "r"],
            ["Lý do", r => esc(r.reason)],
            ["Ghi chú", r => esc(r.note || "")]
        ],
        fields: [
            { key: "product", label: "Sản phẩm", type: "select", options: () => db.products.map(p => p.name) },
            { key: "qty", label: "Số lượng hủy", type: "number", required: true },
            { key: "reason", label: "Lý do", type: "select", options: ["Hết hạn", "Hỏng", "Rơi vỡ", "Khác"] },
            { key: "note", label: "Ghi chú", type: "text" }
        ],
        apply: obj => {
            const p = db.products.find(x => x.name === obj.product);
            if (!p) return "Không tìm thấy sản phẩm";
            if (obj.qty > p.stock) return "Số lượng hủy lớn hơn tồn kho (" + p.stock + ")";
            p.stock -= obj.qty;
            return null;
        },
        revert: r => {
            const p = db.products.find(x => x.name === r.product);
            if (p) p.stock += r.qty;
            return null;
        },
        searchText: r => r.product + " " + r.reason + " " + (r.note || "")
    }
};

function visibleRows(name) {
    const cfg = entities[name];
    const root = document.querySelector(`.crud[data-entity="${name}"]`);
    const q = root.querySelector(".crud-search").value.trim().toLowerCase();
    const st = cfg.filter ? root.querySelector(".crud-filter").value : "all";
    let rows = db[name].filter(r => cfg.searchText(r).toLowerCase().includes(q) && (st === "all" || r.status === st));
    if (name === "invoices") rows = rows.slice().reverse();
    return rows;
}

function refreshTable(name) {
    const cfg = entities[name];
    const root = document.querySelector(`.crud[data-entity="${name}"]`);
    const rows = visibleRows(name);
    root.querySelector("tbody").innerHTML = rows.length
        ? rows.map(r => `
            <tr class="${name === "invoices" ? "click" : ""}" data-id="${name === "invoices" ? r.code : r.id}">
                ${cfg.columns.map(c => `<td class="${c[2] || ""}">${c[1](r)}</td>`).join("")}
                ${cfg.fields ? `<td class="r">
                    ${cfg.noEdit || (cfg.locked && cfg.locked(r)) ? "" : `<button class="btn small" data-act="edit" data-id="${r.id}">Sửa</button>`}
                    <button class="btn small danger" data-act="del" data-id="${r.id}">Xóa</button>
                </td>` : ""}
            </tr>`).join("")
        : `<tr><td class="empty-row" colspan="${cfg.columns.length + 1}">Không có dữ liệu</td></tr>`;
}

function buildEntity(name) {
    const cfg = entities[name];
    const root = document.querySelector(`.crud[data-entity="${name}"]`);
    root.innerHTML = `
        <div class="toolbar">
            <h2>${cfg.title}</h2>
            ${cfg.filter ? `<select class="crud-filter">
                <option value="all">Tất cả</option><option value="ok">Hoàn tất</option><option value="cancel">Đã hủy</option>
            </select>` : ""}
            <input class="crud-search" type="text" placeholder="Tìm kiếm...">
            ${cfg.fields ? `<button class="btn add" data-act="add">${cfg.addLabel}</button>` : ""}
        </div>
        <table class="data">
            <thead><tr>${cfg.columns.map(c => `<th class="${c[2] || ""}">${c[0]}</th>`).join("")}${cfg.fields ? `<th class="r">Thao tác</th>` : ""}</tr></thead>
            <tbody></tbody>
        </table>`;

    root.querySelector(".crud-search").addEventListener("input", () => refreshTable(name));
    if (cfg.filter) root.querySelector(".crud-filter").addEventListener("change", () => refreshTable(name));

    root.addEventListener("click", e => {
        const btn = e.target.closest("button[data-act]");
        if (btn) {
            const act = btn.dataset.act;
            if (act === "add") openForm(name, null);
            else if (act === "edit") openForm(name, db[name].find(r => r.id === Number(btn.dataset.id)));
            else if (act === "del") deleteRecord(name, Number(btn.dataset.id));
            return;
        }
        const row = e.target.closest("tr.click");
        if (row) showInvoice(row.dataset.id);
    });

    refreshTable(name);
}

// Ảnh đang chọn trong form; thu nhỏ trước khi lưu để không đầy localStorage
let formImage = "";

document.getElementById("modalBody").addEventListener("change", e => {
    if (e.target.id !== "f_image" || !e.target.files[0]) return;
    const reader = new FileReader();
    reader.onload = () => {
        const img = new Image();
        img.onload = () => {
            const scale = Math.min(1, 480 / Math.max(img.width, img.height));
            const canvas = document.createElement("canvas");
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
            formImage = canvas.toDataURL("image/jpeg", 0.8);
            const prev = document.getElementById("f_preview");
            prev.src = formImage;
            prev.style.display = "block";
        };
        img.src = reader.result;
    };
    reader.readAsDataURL(e.target.files[0]);
});

// Ảnh sản phẩm, hoặc emoji nếu chưa có ảnh
const productImg = (p, cls) => p.image ? `<img class="${cls}" src="${p.image}" alt="">` : esc(p.icon);

function openForm(name, record) {
    const cfg = entities[name];
    formImage = record && record.image ? record.image : "";
    const body = cfg.fields.map(f => {
        const def = typeof f.def === "function" ? f.def() : f.def;
        const val = record ? record[f.key] : (def !== undefined ? def : "");
        if (f.type === "image") {
            return `<div class="field"><label>${f.label}</label>
                <input id="f_${f.key}" type="file" accept="image/*">
                <img id="f_preview" class="img-preview" ${formImage ? `src="${formImage}"` : 'style="display:none"'} alt="">
            </div>`;
        }
        const input = f.type === "select"
            ? `<select id="f_${f.key}">${(typeof f.options === "function" ? f.options() : f.options).map(o => `<option ${o === val ? "selected" : ""}>${esc(o)}</option>`).join("")}</select>`
            : `<input id="f_${f.key}" type="${f.type}" ${f.type === "number" ? 'min="0"' : ""} value="${esc(val)}">`;
        return `<div class="field"><label>${f.label}</label>${input}</div>`;
    }).join("");

    openModal((record ? "Sửa " : "Thêm ") + cfg.title.toLowerCase(), body, [
        { label: "Hủy" },
        {
            label: "Lưu", cls: "add", fn: () => {
                const obj = {};
                for (const f of cfg.fields) {
                    if (f.type === "image") {
                        obj[f.key] = formImage;
                        continue;
                    }
                    let v = document.getElementById("f_" + f.key).value.trim();
                    if (f.type === "number") v = Number(v) || 0;
                    if (f.required && (v === "" || (f.type === "number" && v <= 0))) {
                        alert("Vui lòng nhập: " + f.label);
                        return false;
                    }
                    if (f.unique && db[name].some(r => r[f.key] === v && (!record || r.id !== record.id))) {
                        alert(f.label + " đã tồn tại");
                        return false;
                    }
                    obj[f.key] = v;
                }
                const err = cfg.apply ? cfg.apply(obj, record) : null;
                if (err) {
                    alert(err);
                    return false;
                }
                if (cfg.stamp && !record) obj.time = new Date().toISOString();
                if (record) Object.assign(record, obj);
                else db[name].push({ id: nextId(db[name]), ...obj });
                save(name, db[name]);
                if (cfg.apply) save("products", db.products);
                refreshAll();
            }
        }
    ]);
}

function deleteRecord(name, id) {
    if (!confirm("Bạn chắc chắn muốn xóa?")) return;
    const cfg = entities[name];
    const rec = db[name].find(r => r.id === id);
    if (cfg.revert && rec) {
        const err = cfg.revert(rec);
        if (err) {
            alert(err);
            return;
        }
        save("products", db.products);
    }
    db[name] = db[name].filter(r => r.id !== id);
    save(name, db[name]);
    refreshAll();
}

function showInvoice(code) {
    const inv = db.invoices.find(i => i.code === code);
    if (!inv) return;
    const rows = inv.items.map(x => `
        <tr><td>${esc(x.name)}</td><td class="r">${x.qty}</td><td class="r">${(x.price * x.qty).toLocaleString("vi-VN")}</td></tr>`).join("");
    const body = `
        <div class="detail-meta">
            Thời gian: ${fmtTime(inv.time)}<br>
            Khách hàng: ${esc(inv.customer)}${inv.phone ? " · " + esc(inv.phone) : ""}<br>
            Thanh toán: ${inv.pay} · ${inv.status === "ok" ? "Hoàn tất" : "Đã hủy"}
        </div>
        <table class="data"><thead><tr><th>Sản phẩm</th><th class="r">SL</th><th class="r">Thành tiền</th></tr></thead>
        <tbody>${rows}</tbody></table>
        <div class="sum-total"><span>Tổng cộng</span><b>${fmt(inv.total)}</b></div>`;
    const buttons = [{ label: "Đóng" }];
    if (inv.status === "ok") {
        buttons.unshift({
            label: "Hủy hóa đơn", cls: "danger", fn: () => {
                if (!confirm("Hủy hóa đơn " + inv.code + "? Số lượng bánh sẽ được trả lại kho.")) return false;
                inv.status = "cancel";
                inv.items.forEach(x => {
                    const p = db.products.find(p => p.name === x.name);
                    if (p) p.stock += x.qty;
                });
                save("invoices", db.invoices);
                save("products", db.products);
                refreshAll();
            }
        });
    }
    openModal("Hóa đơn " + inv.code, body, buttons);
}


// ================================
// CHUYỂN TRANG (SIDEBAR)
// ================================

const navItems = document.querySelectorAll(".nav-item[data-view]");

function showView(name) {
    navItems.forEach(b => b.classList.toggle("active", b.dataset.view === name));
    document.querySelectorAll(".view").forEach(v =>
        v.classList.toggle("active", v.id === "view-" + name));
    refreshAll();
}

navItems.forEach(b => b.addEventListener("click", () => showView(b.dataset.view)));


// ================================
// BIỂU ĐỒ + THỐNG KÊ
// ================================

const moneyTick = v => (v / 1000).toLocaleString("vi-VN") + "k";

function lineChart(canvasId) {
    return new Chart(document.getElementById(canvasId), {
        type: "line",
        data: {
            labels: [],
            datasets: [{
                label: "Doanh thu",
                data: [],
                borderColor: "#df777a",
                backgroundColor: "rgba(223,119,122,0.12)",
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5,
                tension: 0.38,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: c => fmt(c.raw) } }
            },
            scales: {
                y: { beginAtZero: true, ticks: { callback: moneyTick }, grid: { color: "#eee7e1" }, border: { display: false } },
                x: { grid: { color: "#f0eae5" }, border: { display: false } }
            }
        }
    });
}

function setChart(chart, n) {
    const r = revenueByDay(n);
    chart.data.labels = r.labels;
    chart.data.datasets[0].data = r.values;
    chart.update();
}

const homeChart = lineChart("revenueChart");
const reportChart = lineChart("reportChart");
let homeDays = 7;

document.getElementById("period").addEventListener("change", e => {
    homeDays = Number(e.target.value);
    setChart(homeChart, homeDays);
});

function renderHomeStats() {
    const today = dayKey(new Date());
    const todayInv = db.invoices.filter(i => i.status === "ok" && dayKey(new Date(i.time)) === today);
    document.getElementById("hmProducts").textContent = db.products.length;
    document.getElementById("hmCustomers").textContent = db.customers.length;
    document.getElementById("hmOrders").textContent = todayInv.length;
    document.getElementById("hmRevenue").textContent = fmt(todayInv.reduce((s, i) => s + i.total, 0));
}

function renderReport() {
    const since = new Date();
    since.setDate(since.getDate() - 29);
    since.setHours(0, 0, 0, 0);
    const inv = db.invoices.filter(i => new Date(i.time) >= since);
    const ok = inv.filter(i => i.status === "ok");
    const revenue = ok.reduce((s, i) => s + i.total, 0);

    document.getElementById("rpRevenue").textContent = revenue >= 1e6
        ? (revenue / 1e6).toFixed(1).replace(".", ",") + " triệu" : fmt(revenue);
    document.getElementById("rpCount").textContent = inv.length.toLocaleString("vi-VN");
    document.getElementById("rpCancel").textContent = inv.length - ok.length;
    document.getElementById("rpAvg").textContent = fmt(ok.length ? Math.round(revenue / ok.length) : 0);

    const qty = {};
    ok.forEach(i => i.items.forEach(x => { qty[x.name] = (qty[x.name] || 0) + x.qty; }));
    const top = Object.entries(qty).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const max = top.length ? top[0][1] : 1;
    document.getElementById("topList").innerHTML = top.map(([n, q]) => `
        <div class="hbar"><span>${esc(n)}</span><div><i style="width:${Math.round(q / max * 100)}%"></i></div><em>${q}</em></div>`).join("")
        || `<p class="placeholder">Chưa có dữ liệu</p>`;

    setChart(reportChart, 14);
}


// ================================
// BÁN HÀNG TẠI QUẦY
// ================================

const cart = [];
let activeCat = "all";
let currentCustomer = null;
let payMethod = "Tiền mặt";

const productOf = id => db.products.find(p => p.id === id);

function renderBillHead() {
    document.getElementById("billCode").textContent = "Hóa đơn " + nextCode();
    const n = new Date();
    document.getElementById("billTime").textContent = pad(n.getHours()) + ":" + pad(n.getMinutes());
}

function renderProducts() {
    const q = document.getElementById("posSearch").value.trim().toLowerCase();
    document.getElementById("productGrid").innerHTML = db.products
        .filter(p => (activeCat === "all" || p.cat === activeCat) && p.name.toLowerCase().includes(q))
        .map(p => `
            <div class="pcard ${p.stock <= 0 ? "out" : ""}" data-id="${p.id}">
                <div class="pcard-img" style="background:${CAT_BG[p.cat] || "#f6dcc0"}">${productImg(p, "")}</div>
                <div class="pcard-body">
                    <div class="pcard-name">${esc(p.name)}</div>
                    <div class="pcard-foot">
                        <span class="pcard-price">${fmt(p.price)}</span>
                        <span class="pcard-stock">${p.stock <= 0 ? "Hết hàng" : "Tồn " + p.stock}</span>
                    </div>
                </div>
            </div>`).join("")
        || `<p class="placeholder" style="grid-column:1/-1">Không có sản phẩm</p>`;
}

function renderCart() {
    // Bỏ các món đã bị xóa khỏi danh sách sản phẩm
    for (let i = cart.length - 1; i >= 0; i--) if (!productOf(cart[i].id)) cart.splice(i, 1);

    const body = document.getElementById("cartBody");
    body.innerHTML = cart.length ? cart.map(item => {
        const p = productOf(item.id);
        return `
            <tr>
                <td>${esc(p.name)}</td>
                <td class="qty">
                    <button data-act="dec" data-id="${p.id}">−</button>
                    ${item.qty}
                    <button data-act="inc" data-id="${p.id}">+</button>
                </td>
                <td class="r">${(p.price * item.qty).toLocaleString("vi-VN")}</td>
            </tr>`;
    }).join("") : `<tr><td colspan="3" class="cart-empty">Chưa có sản phẩm</td></tr>`;

    const total = cart.reduce((s, i) => s + productOf(i.id).price * i.qty, 0);
    document.getElementById("sumTotal").textContent = fmt(total);
}

function renderCustomer() {
    document.getElementById("custInfo").innerHTML = currentCustomer
        ? `👤 <b>${esc(currentCustomer.name)}</b> · ${rankOf(currentCustomer.points)} · <b>${currentCustomer.points} điểm</b>`
        : "👤 Khách lẻ";
}

function changeQty(id, delta) {
    const p = productOf(id);
    const item = cart.find(i => i.id === id);
    if (!item) {
        if (delta > 0 && p.stock > 0) cart.push({ id, qty: 1 });
    } else if (delta > 0 && item.qty + 1 > p.stock) {
        alert("Trong kho chỉ còn " + p.stock + " " + p.name);
    } else {
        item.qty += delta;
        if (item.qty <= 0) cart.splice(cart.indexOf(item), 1);
    }
    renderCart();
}

document.getElementById("productGrid").addEventListener("click", e => {
    const card = e.target.closest(".pcard");
    if (card) changeQty(Number(card.dataset.id), 1);
});

document.getElementById("cartBody").addEventListener("click", e => {
    const btn = e.target.closest("button[data-act]");
    if (btn) changeQty(Number(btn.dataset.id), btn.dataset.act === "inc" ? 1 : -1);
});

document.getElementById("posChips").addEventListener("click", e => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    activeCat = chip.dataset.cat;
    document.querySelectorAll("#posChips .chip").forEach(c => c.classList.toggle("active", c === chip));
    renderProducts();
});

document.getElementById("posSearch").addEventListener("input", renderProducts);

function findCustomer() {
    const phone = document.getElementById("custPhone").value.trim();
    currentCustomer = db.customers.find(c => c.phone === phone) || null;
    if (!currentCustomer && phone) alert("Không tìm thấy khách hàng, hóa đơn sẽ tính cho khách lẻ");
    renderCustomer();
}

document.getElementById("custFind").addEventListener("click", findCustomer);
document.getElementById("custPhone").addEventListener("keydown", e => { if (e.key === "Enter") findCustomer(); });

document.querySelectorAll("[data-pay]").forEach(btn =>
    btn.addEventListener("click", () => {
        payMethod = btn.dataset.pay === "qr" ? "VietQR" : "Tiền mặt";
        document.querySelectorAll("[data-pay]").forEach(b => b.classList.toggle("sel", b === btn));
    }));

function checkout() {
    if (!cart.length) {
        alert("Hóa đơn chưa có sản phẩm");
        return;
    }
    const over = cart.find(i => i.qty > productOf(i.id).stock);
    if (over) {
        alert("Không đủ hàng trong kho: " + productOf(over.id).name);
        return;
    }

    const items = cart.map(i => {
        const p = productOf(i.id);
        return { name: p.name, price: p.price, qty: i.qty };
    });
    const total = items.reduce((s, x) => s + x.price * x.qty, 0);
    const inv = {
        code: nextCode(),
        time: new Date().toISOString(),
        customer: currentCustomer ? currentCustomer.name : "Khách lẻ",
        phone: currentCustomer ? currentCustomer.phone : "",
        items, total, pay: payMethod, status: "ok"
    };

    cart.forEach(i => { productOf(i.id).stock -= i.qty; });
    if (currentCustomer) currentCustomer.points += Math.floor(total / 10000);
    db.invoices.push(inv);
    save("invoices", db.invoices);
    save("products", db.products);
    save("customers", db.customers);

    alert("Thanh toán thành công " + inv.code + ": " + fmt(total));
    cart.length = 0;
    currentCustomer = null;
    document.getElementById("custPhone").value = "";
    refreshAll();
}

document.getElementById("checkout").addEventListener("click", checkout);

document.addEventListener("keydown", e => {
    if (e.key === "F9" && document.getElementById("view-pos").classList.contains("active")) {
        e.preventDefault();
        checkout();
    }
});


// ================================
// KHỞI TẠO
// ================================

function refreshAll() {
    Object.keys(entities).forEach(refreshTable);
    renderProducts();
    renderCart();
    renderCustomer();
    renderBillHead();
    renderHomeStats();
    renderReport();
    setChart(homeChart, homeDays);
}

Object.keys(entities).forEach(buildEntity);
refreshAll();
setInterval(renderBillHead, 30000);
