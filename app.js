// app.js — Cashier App with LocalStorage + PDF Reports
// v1.0 — Dark Neon Dual Language

const LANG = {
  id: {
    sales: "Penjualan",
    expenses: "Pengeluaran",
    incoming: "Barang Masuk",
    add: "Tambah",
    product: "Nama Barang",
    qty: "Qty",
    price: "Harga",
    total: "Total",
    sell: "Jual",
    buyer: "Nama Pembeli",
    report: "Laporan Harian",
    profit: "Keuntungan",
    loss: "Kerugian",
    exportPDF: "Ekspor PDF",
    printReceipt: "Cetak Struk",
    expenseType: "Jenis Pengeluaran",
    expenseAmount: "Jumlah",
    expenseAdd: "Tambah Pengeluaran",
  },
  en: {
    sales: "Sales",
    expenses: "Expenses",
    incoming: "Incoming Goods",
    add: "Add",
    product: "Product",
    qty: "Qty",
    price: "Price",
    total: "Total",
    sell: "Sell",
    buyer: "Customer Name",
    report: "Daily Report",
    profit: "Profit",
    loss: "Loss",
    exportPDF: "Export PDF",
    printReceipt: "Print Receipt",
    expenseType: "Expense Type",
    expenseAmount: "Amount",
    expenseAdd: "Add Expense",
  },
};

let lang = "id";
let data = JSON.parse(localStorage.getItem("cashierData")) || {
  sales: [],
  incoming: [],
  expenses: [],
};

const t = (key) => LANG[lang][key] || key;

const el = (sel) => document.querySelector(sel);
const els = (sel) => document.querySelectorAll(sel);

// ============ INIT ============
window.addEventListener("DOMContentLoaded", () => {
  el("#langSelect").addEventListener("change", (e) => {
    lang = e.target.value;
    renderAll();
  });
  el("#addSale").addEventListener("click", addSale);
  el("#addIncoming").addEventListener("click", addIncoming);
  el("#addExpense").addEventListener("click", addExpense);
  el("#exportPDF").addEventListener("click", exportPDF);

  renderAll();
});

// ============ CORE FUNCTIONS ============

function addSale() {
  const product = el("#saleProduct").value.trim();
  const qty = parseFloat(el("#saleQty").value);
  const price = parseFloat(el("#salePrice").value);
  const buyer = el("#saleBuyer").value.trim() || "-";
  if (!product || qty <= 0 || price <= 0) return alert("Data tidak valid");

  const total = qty * price;
  const sale = {
    id: Date.now(),
    product,
    qty,
    price,
    total,
    buyer,
    date: new Date().toISOString(),
  };
  data.sales.push(sale);
  saveData();
  renderSales();
  printReceipt(sale);
}

function addIncoming() {
  const product = el("#inProduct").value.trim();
  const qty = parseFloat(el("#inQty").value);
  const cost = parseFloat(el("#inCost").value);
  if (!product || qty <= 0 || cost <= 0) return alert("Data tidak valid");

  data.incoming.push({
    id: Date.now(),
    product,
    qty,
    cost,
    total: qty * cost,
    date: new Date().toISOString(),
  });
  saveData();
  renderIncoming();
}

function addExpense() {
  const type = el("#exType").value.trim();
  const amount = parseFloat(el("#exAmount").value);
  if (!type || amount <= 0) return alert("Data tidak valid");

  data.expenses.push({
    id: Date.now(),
    type,
    amount,
    date: new Date().toISOString(),
  });
  saveData();
  renderExpenses();
}

function saveData() {
  localStorage.setItem("cashierData", JSON.stringify(data));
  renderAll();
}

// ============ RENDER ============

function renderAll() {
  renderSales();
  renderIncoming();
  renderExpenses();
}

function renderSales() {
  const wrap = el("#salesList");
  wrap.innerHTML = data.sales
    .map(
      (s) => `
      <div class="row">
        <div>${s.product} (${s.qty} x ${fmt(s.price)})</div>
        <small>${fmt(s.total)}</small>
        <button onclick="printReceipt(${s.id})">${t("printReceipt")}</button>
      </div>`
    )
    .join("");
}

function renderIncoming() {
  const wrap = el("#incomingList");
  wrap.innerHTML = data.incoming
    .map(
      (i) => `
      <div class="row">
        <div>${i.product} (${i.qty} x ${fmt(i.cost)})</div>
        <small>${fmt(i.total)}</small>
      </div>`
    )
    .join("");
}

function renderExpenses() {
  const wrap = el("#expensesList");
  wrap.innerHTML = data.expenses
    .map(
      (e) => `
      <div class="row">
        <div>${e.type}</div>
        <small>${fmt(e.amount)}</small>
      </div>`
    )
    .join("");
}

// ============ UTILS ============

function fmt(n) {
  return "Rp" + n.toLocaleString("id-ID");
}

// ============ RECEIPT PRINTING ============

function printReceipt(idOrObj) {
  const s =
    typeof idOrObj === "object"
      ? idOrObj
      : data.sales.find((x) => x.id === idOrObj);
  if (!s) return alert("Data tidak ditemukan");

  const div = document.createElement("div");
  div.id = "printableReceipt";
  div.innerHTML = `
    <div style="text-align:center;font-family:monospace;">
      <h3>STRUK PEMBELIAN</h3>
      <hr/>
      <p>${new Date(s.date).toLocaleString()}</p>
      <p>${s.product}</p>
      <p>${s.qty} x ${fmt(s.price)}</p>
      <p>Total: <strong>${fmt(s.total)}</strong></p>
      <hr/>
      <p>Terima kasih ${s.buyer}</p>
    </div>
  `;
  document.body.appendChild(div);
  window.print();
  div.remove();
}

// ============ REPORT PDF ============

function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "pt", "a4");
  let y = 40;

  doc.setFont("courier", "normal");
  doc.text("LAPORAN HARIAN TOKO", 200, y);
  y += 20;

  const totalSales = sum(data.sales.map((x) => x.total));
  const totalIncoming = sum(data.incoming.map((x) => x.total));
  const totalExpense = sum(data.expenses.map((x) => x.amount));
  const profit = totalSales - totalIncoming - totalExpense;

  doc.text(`Total Penjualan: ${fmt(totalSales)}`, 40, (y += 20));
  doc.text(`Modal Barang Masuk: ${fmt(totalIncoming)}`, 40, (y += 20));
  doc.text(`Pengeluaran: ${fmt(totalExpense)}`, 40, (y += 20));
  doc.text(
    `${profit >= 0 ? t("profit") : t("loss")}: ${fmt(profit)}`,
    40,
    (y += 30)
  );

  doc.text("RINCIAN PENJUALAN:", 40, (y += 30));
  y = drawTable(doc, ["Barang", "Qty", "Harga", "Total"], data.sales, y, [
    "product",
    "qty",
    "price",
    "total",
  ]);

  y += 20;
  doc.text("RINCIAN PENGELUARAN:", 40, (y += 20));
  y = drawTable(doc, ["Jenis", "Jumlah"], data.expenses, y, ["type", "amount"]);

  doc.save("Laporan-Harian.pdf");
}

function drawTable(doc, headers, arr, y, keys) {
  if (!arr.length) {
    doc.text("- Tidak ada data -", 60, (y += 16));
    return y;
  }
  doc.setFontSize(9);
  y += 10;
  doc.text(headers.join(" | "), 40, y);
  y += 10;
  arr.forEach((r) => {
    const line = keys
      .map((k) => (r[k] !== undefined ? String(r[k]) : ""))
      .join(" | ");
    doc.text(line, 40, y);
    y += 14;
  });
  return y;
}

function sum(arr) {
  return arr.reduce((a, b) => a + (b || 0), 0);
}
