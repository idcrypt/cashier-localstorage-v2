// app.js — Cashier App LocalStorage v2 (Bilingual Auto-Loader)
// by binka 2025 — idcrypt.xyz edition

let LANG = {};
let currentLang = "id";

let data = JSON.parse(localStorage.getItem("cashierDataV2")) || {
  items: [],
  purchases: [],
  sales: [],
  expenses: [],
};

let cart = [];
let lastSale = null;

const $ = (s) => document.querySelector(s);
const fmt = (n) =>
  currentLang === "id"
    ? "Rp " + Number(n).toLocaleString("id-ID")
    : "$" + Number(n).toLocaleString("en-US");

// === INIT ===
window.addEventListener("DOMContentLoaded", async () => {
  await loadLanguage(currentLang);

  // Event listeners
  $("#langSelect").addEventListener("change", async (e) => {
    currentLang = e.target.value;
    await loadLanguage(currentLang);
    renderAll();
  });

  $("#itemForm").addEventListener("submit", addOrUpdateItem);
  $("#addPurchaseBtn").addEventListener("click", addPurchase);
  $("#addToCartBtn").addEventListener("click", addToCart);
  $("#completeSaleBtn").addEventListener("click", completeSale);
  $("#printLastReceiptBtn").addEventListener("click", printLastReceipt);
  $("#pdfReceiptBtn").addEventListener("click", saveReceiptPDF);
  $("#addExpenseBtn").addEventListener("click", addExpense);
  $("#downloadPdfBtn").addEventListener("click", downloadReportPDF);
  $("#clearBtn").addEventListener("click", clearData);

  renderAll();
});

// === LANGUAGE LOADER ===
async function loadLanguage(code) {
  try {
    const res = await fetch(`lang/${code}.json`);
    LANG = await res.json();
    updateLangLabels();
  } catch (err) {
    console.error("⚠️ Failed to load language file:", err);
  }
}

// Update semua teks dan placeholder
function updateLangLabels() {
  document.querySelectorAll("[data-lang]").forEach((el) => {
    const key = el.getAttribute("data-lang");
    if (LANG[key]) el.textContent = LANG[key];
  });

  document.querySelectorAll("[data-lang-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-lang-placeholder");
    if (LANG[key]) el.placeholder = LANG[key];
  });

  // Update judul halaman juga
  if (LANG["appTitle"]) document.title = LANG["appTitle"];
}

// === FALLBACK LANG ===
const fallbackLang = {
  id: {
    catalogTitle: "Katalog Barang",
    purchaseTitle: "Barang Masuk",
    posTitle: "Kasir",
    todayTitle: "Transaksi Hari Ini",
    expenseTitle: "Pengeluaran",
    report: "Laporan Harian",
    profit: "Keuntungan",
    loss: "Kerugian",
    routine: "Rutin",
    oneoff: "Mendadak",
  },
  en: {
    catalogTitle: "Catalog",
    purchaseTitle: "Purchases",
    posTitle: "Point of Sale",
    todayTitle: "Transactions",
    expenseTitle: "Expenses",
    report: "Daily Report",
    profit: "Profit",
    loss: "Loss",
    routine: "Routine",
    oneoff: "One-off",
  },
};

// === ITEM MANAGEMENT ===
function addOrUpdateItem(e) {
  e.preventDefault();
  const name = $("#itemName").value.trim();
  const price = parseFloat($("#itemPrice").value);
  const cost = parseFloat($("#itemCost").value);
  const unit = $("#itemUnit").value;

  if (!name || price <= 0 || cost <= 0) return alert("Invalid item data.");

  const existing = data.items.find((i) => i.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    existing.price = price;
    existing.cost = cost;
    existing.unit = unit;
  } else {
    data.items.push({ id: Date.now(), name, price, cost, unit });
  }

  saveData();
  renderItems();
  $("#itemForm").reset();
}

function renderItems() {
  const list = $("#catalogList");
  list.innerHTML =
    data.items.length === 0
      ? "<small>No items yet.</small>"
      : data.items
          .map(
            (i) => `
      <div class="row">
        <div>${i.name} (${i.unit})</div>
        <small>Sell: ${fmt(i.price)} | Cost: ${fmt(i.cost)}</small>
      </div>`
          )
          .join("");

  const selects = [$("#purchaseItem"), $("#selectItem")];
  selects.forEach((sel) => {
    sel.innerHTML = data.items
      .map((i) => `<option value="${i.id}">${i.name}</option>`)
      .join("");
  });
}

// === PURCHASES ===
function addPurchase() {
  const itemId = parseInt($("#purchaseItem").value);
  const qty = parseFloat($("#purchaseQty").value);
  const cost = parseFloat($("#purchaseCost").value);
  const item = data.items.find((i) => i.id === itemId);
  if (!item || qty <= 0 || cost <= 0) return alert("Invalid purchase data.");

  data.purchases.push({
    id: Date.now(),
    itemId,
    name: item.name,
    qty,
    cost,
    total: qty * cost,
    date: new Date().toISOString(),
  });

  saveData();
  renderPurchases();
  $("#purchaseForm").reset();
}

function renderPurchases() {
  $("#purchaseList").innerHTML =
    data.purchases.length === 0
      ? "<small>No purchases yet.</small>"
      : data.purchases
          .map((p) => `<div class="row"><div>${p.name} (${p.qty})</div><small>${fmt(p.total)}</small></div>`)
          .join("");
}

// === POS CART ===
function addToCart() {
  const id = parseInt($("#selectItem").value);
  const qty = parseFloat($("#qty").value);
  const item = data.items.find((i) => i.id === id);
  if (!item || qty <= 0) return alert("Invalid item or quantity.");

  const existing = cart.find((c) => c.id === id);
  if (existing) existing.qty += qty;
  else cart.push({ ...item, qty });

  renderCart();
}

function renderCart() {
  const wrap = $("#cart");
  wrap.innerHTML =
    cart.length === 0
      ? "<small>Cart empty.</small>"
      : cart
          .map(
            (c, idx) => `
      <div class="line">
        <span>${c.name} (${c.qty}x)</span>
        <strong>${fmt(c.price * c.qty)}</strong>
        <button onclick="removeCart(${idx})">x</button>
      </div>`
          )
          .join("");
}

function removeCart(i) {
  cart.splice(i, 1);
  renderCart();
}

// === SALES ===
function completeSale() {
  if (cart.length === 0) return alert("Cart is empty.");
  const customer = $("#customerName").value.trim() || "-";
  const total = cart.reduce((a, b) => a + b.price * b.qty, 0);

  const sale = {
    id: Date.now(),
    date: new Date().toISOString(),
    customer,
    items: [...cart],
    total,
  };
  data.sales.push(sale);
  lastSale = sale;
  cart = [];
  saveData();
  renderSales();
  renderCart();
  printReceipt(sale);
}

function renderSales() {
  $("#transactionsList").innerHTML =
    data.sales.length === 0
      ? "<small>No transactions.</small>"
      : data.sales
          .slice()
          .reverse()
          .map(
            (s) => `
      <div class="row">
        <div>${new Date(s.date).toLocaleString()} - ${s.customer}</div>
        <small>${fmt(s.total)}</small>
        <button onclick="printReceipt(${s.id})">🧾</button>
      </div>`
          )
          .join("");
}

// === RECEIPT ===
function printReceipt(idOrSale) {
  const sale = typeof idOrSale === "object" ? idOrSale : data.sales.find((x) => x.id === idOrSale);
  if (!sale) return;

  const div = document.createElement("div");
  div.id = "printableReceipt";
  div.innerHTML = `
    <div style="font-family:monospace;text-align:center;">
      <h3>STRUK PENJUALAN</h3>
      <p>${new Date(sale.date).toLocaleString()}</p>
      <hr/>
      ${sale.items
        .map((i) => `<div>${i.name} (${i.qty}x${fmt(i.price)}) = ${fmt(i.price * i.qty)}</div>`)
        .join("")}
      <hr/>
      <strong>Total: ${fmt(sale.total)}</strong>
      <p>Terima kasih, ${sale.customer}</p>
    </div>`;
  document.body.appendChild(div);
  window.print();
  div.remove();
}

function printLastReceipt() {
  if (!lastSale) return alert("No recent sale.");
  printReceipt(lastSale);
}

function saveReceiptPDF() {
  if (!lastSale) return alert("No recent sale.");
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 20;

  doc.setFont("courier", "normal");
  doc.text("STRUK PENJUALAN", 70, y);
  y += 10;
  doc.text(new Date(lastSale.date).toLocaleString(), 20, (y += 10));
  doc.line(20, (y += 5), 190, y);
  y += 10;

  lastSale.items.forEach((i) => {
    doc.text(`${i.name} (${i.qty}x${i.price})`, 20, y);
    doc.text(fmt(i.qty * i.price), 150, y, { align: "right" });
    y += 10;
  });
  doc.line(20, (y += 5), 190, y);
  doc.text(`Total: ${fmt(lastSale.total)}`, 20, (y += 15));
  doc.text(`Customer: ${lastSale.customer}`, 20, (y += 15));
  doc.save("Receipt.pdf");
}

// === EXPENSES ===
function addExpense() {
  const desc = $("#expenseDesc").value.trim();
  const amount = parseFloat($("#expenseAmount").value);
  const type = $("#expenseType").value;
  if (!desc || amount <= 0) return alert("Invalid expense.");

  data.expenses.push({
    id: Date.now(),
    desc,
    amount,
    type,
    date: new Date().toISOString(),
  });
  saveData();
  renderExpenses();
  $("#expenseForm").reset();
}

function renderExpenses() {
  $("#expenseList").innerHTML =
    data.expenses.length === 0
      ? "<small>No expenses yet.</small>"
      : data.expenses
          .map(
            (e) => `
      <div class="row">
        <div>${e.desc} (${LANG[e.type] || e.type})</div>
        <small>${fmt(e.amount)}</small>
      </div>`
          )
          .join("");
}

// === REPORT PDF ===
function downloadReportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "pt", "a4");
  let y = 40;

  const totalSales = sum(data.sales.map((s) => s.total));
  const totalCost = sum(data.purchases.map((p) => p.total));
  const totalExpenses = sum(data.expenses.map((e) => e.amount));
  const profit = totalSales - totalCost - totalExpenses;

  doc.setFont("courier", "normal");
  doc.text(`${LANG.report || "Report"}`, 230, y);
  y += 30;

  doc.text(`Total Sales: ${fmt(totalSales)}`, 40, y);
  doc.text(`Cost of Goods: ${fmt(totalCost)}`, 40, (y += 20));
  doc.text(`Expenses: ${fmt(totalExpenses)}`, 40, (y += 20));
  doc.text(`${profit >= 0 ? LANG.profit : LANG.loss}: ${fmt(profit)}`, 40, (y += 30));

  doc.line(40, (y += 10), 500, y);
  doc.text("Sales Summary:", 40, (y += 20));

  data.sales.forEach((s) => {
    doc.text(`${new Date(s.date).toLocaleDateString()} - ${fmt(s.total)}`, 60, (y += 14));
    if (y > 760) {
      doc.addPage();
      y = 40;
    }
  });

  doc.save("Daily-Report.pdf");
}

// === HELPERS ===
function sum(arr) {
  return arr.reduce((a, b) => a + (b || 0), 0);
}

function saveData() {
  localStorage.setItem("cashierDataV2", JSON.stringify(data));
  renderAll();
}

function clearData() {
  if (confirm("Delete all data?")) {
    localStorage.removeItem("cashierDataV2");
    location.reload();
  }
}

function renderAll() {
  renderItems();
  renderPurchases();
  renderSales();
  renderExpenses();
}
