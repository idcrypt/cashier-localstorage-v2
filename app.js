// app.js — Cashier App LocalStorage v2
// by binka 2025 — bilingual, pdf report, print receipt

const LANG = {
  id: {
    catalog: "Katalog Barang",
    purchase: "Barang Masuk",
    pos: "Kasir",
    expense: "Pengeluaran",
    total: "Total",
    profit: "Keuntungan",
    loss: "Kerugian",
    report: "Laporan Harian",
    routine: "Rutin",
    oneoff: "Mendadak",
  },
  en: {
    catalog: "Catalog",
    purchase: "Incoming Goods",
    pos: "Point of Sale",
    expense: "Expenses",
    total: "Total",
    profit: "Profit",
    loss: "Loss",
    report: "Daily Report",
    routine: "Routine",
    oneoff: "One-off",
  },
};

let lang = "id";
let data = JSON.parse(localStorage.getItem("cashierDataV2")) || {
  items: [],
  purchases: [],
  sales: [],
  expenses: [],
};

let cart = [];
let lastSale = null;

// ===== Utility Shortcuts =====
const $ = (s) => document.querySelector(s);
const fmt = (n) => "Rp " + Number(n).toLocaleString("id-ID");

// ===== Init =====
window.addEventListener("DOMContentLoaded", () => {
  $("#langSelect").addEventListener("change", (e) => {
    lang = e.target.value;
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

// ===== Item Management =====
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
  list.innerHTML = data.items
    .map(
      (i) => `
      <div class="row">
        <div>${i.name} (${i.unit})</div>
        <small>Sell: ${fmt(i.price)} | Cost: ${fmt(i.cost)}</small>
      </div>`
    )
    .join("");

  // refresh dropdowns
  const selects = [$("#purchaseItem"), $("#selectItem")];
  selects.forEach((sel) => {
    sel.innerHTML = data.items
      .map((i) => `<option value="${i.id}">${i.name}</option>`)
      .join("");
  });
}

// ===== Purchases (Barang Masuk) =====
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
  $("#purchaseList").innerHTML = data.purchases
    .map((p) => `<div class="row"><div>${p.name} (${p.qty})</div><small>${fmt(p.total)}</small></div>`)
    .join("");
}

// ===== POS Cart =====
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
  wrap.innerHTML = cart
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

// ===== Complete Sale =====
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
  $("#transactionsList").innerHTML = data.sales
    .slice()
    .reverse()
    .map(
      (s) => `
      <div class="row">
        <div>${new Date(s.date).toLocaleString()} - ${s.customer}</div>
        <small>${fmt(s.total)}</small>
        <button onclick="printReceipt(${s.id})">Print</button>
      </div>`
    )
    .join("");
}

// ===== Receipt =====
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

// ===== Expenses =====
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
  $("#expenseList").innerHTML = data.expenses
    .map(
      (e) => `
      <div class="row">
        <div>${e.desc} (${LANG[lang][e.type] || e.type})</div>
        <small>${fmt(e.amount)}</small>
      </div>`
    )
    .join("");
}

// ===== Report PDF =====
function downloadReportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "pt", "a4");
  let y = 40;

  const totalSales = sum(data.sales.map((s) => s.total));
  const totalCost = sum(data.purchases.map((p) => p.total));
  const totalExpenses = sum(data.expenses.map((e) => e.amount));
  const profit = totalSales - totalCost - totalExpenses;

  doc.setFont("courier", "normal");
  doc.text(`${LANG[lang].report}`, 230, y);
  y += 30;

  doc.text(`Total Sales: ${fmt(totalSales)}`, 40, y);
  doc.text(`Cost of Goods: ${fmt(totalCost)}`, 40, (y += 20));
  doc.text(`Expenses: ${fmt(totalExpenses)}`, 40, (y += 20));
  doc.text(
    `${profit >= 0 ? LANG[lang].profit : LANG[lang].loss}: ${fmt(profit)}`,
    40,
    (y += 30)
  );

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

// ===== Helpers =====
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

// ===== Render All =====
function renderAll() {
  renderItems();
  renderPurchases();
  renderSales();
  renderExpenses();
}
