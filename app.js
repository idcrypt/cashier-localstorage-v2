// app.js — Kasir LocalStorage v2 by binka 2025
// bilingual, offline, PDF report + receipt

let currentLang = "id";
let translations = {};

let data = JSON.parse(localStorage.getItem("cashierDataV2")) || {
  sales: [],
  inventory: [],
  expenses: [],
};

// Shortcut
const $ = (sel) => document.querySelector(sel);
const fmt = (n) => "Rp " + Number(n).toLocaleString("id-ID");

// ======== INIT ========
document.addEventListener("DOMContentLoaded", async () => {
  await loadLanguage(currentLang);
  renderAll();

  $("#langSelect").addEventListener("change", async (e) => {
    currentLang = e.target.value;
    await loadLanguage(currentLang);
    renderText();
  });

  $("#salesForm").addEventListener("submit", addSale);
  $("#inventoryForm").addEventListener("submit", addInventory);
  $("#expenseForm").addEventListener("submit", addExpense);
  $("#exportPDF").addEventListener("click", exportReportPDF);
});

// ======== LANGUAGE LOADER ========
async function loadLanguage(lang) {
  try {
    const res = await fetch(`lang/${lang}.json`);
    translations = await res.json();
    renderText();
  } catch (err) {
    console.error("Gagal memuat file bahasa:", err);
  }
}

function renderText() {
  for (const key in translations) {
    const el = document.getElementById(key);
    if (el) el.textContent = translations[key];
  }
}

// ======== PENJUALAN ========
function addSale(e) {
  e.preventDefault();
  const name = $("#itemName").value.trim();
  const qty = parseFloat($("#itemQty").value);
  const price = parseFloat($("#itemPrice").value);
  if (!name || qty <= 0 || price <= 0) return alert("Data penjualan tidak valid.");

  const sale = {
    id: Date.now(),
    name,
    qty,
    price,
    total: qty * price,
    date: new Date().toISOString(),
  };

  data.sales.push(sale);
  saveData();
  renderSales();
  $("#salesForm").reset();
  printReceipt(sale);
}

function renderSales() {
  const tbody = $("#salesTable tbody");
  tbody.innerHTML = data.sales
    .map(
      (s, i) => `
      <tr>
        <td>${s.name}</td>
        <td>${s.qty}</td>
        <td>${fmt(s.price)}</td>
        <td>${fmt(s.total)}</td>
        <td><button onclick="printReceipt(${s.id})">🧾</button></td>
      </tr>`
    )
    .join("");
  renderSummary();
}

// ======== BARANG MASUK ========
function addInventory(e) {
  e.preventDefault();
  const name = $("#invName").value.trim();
  const qty = parseFloat($("#invQty").value);
  const cost = parseFloat($("#invCost").value);
  if (!name || qty <= 0 || cost <= 0) return alert("Data barang masuk tidak valid.");

  const inv = {
    id: Date.now(),
    name,
    qty,
    cost,
    total: qty * cost,
    date: new Date().toISOString(),
  };

  data.inventory.push(inv);
  saveData();
  renderInventory();
  $("#inventoryForm").reset();
}

function renderInventory() {
  const tbody = $("#inventoryTable tbody");
  tbody.innerHTML = data.inventory
    .map(
      (i, idx) => `
      <tr>
        <td>${i.name}</td>
        <td>${i.qty}</td>
        <td>${fmt(i.cost)}</td>
        <td>${fmt(i.total)}</td>
        <td><button onclick="deleteInventory(${idx})">❌</button></td>
      </tr>`
    )
    .join("");
  renderSummary();
}

function deleteInventory(idx) {
  if (confirm("Hapus data barang masuk ini?")) {
    data.inventory.splice(idx, 1);
    saveData();
    renderInventory();
  }
}

// ======== PENGELUARAN ========
function addExpense(e) {
  e.preventDefault();
  const name = $("#expName").value.trim();
  const amount = parseFloat($("#expAmount").value);
  const type = $("#expType").value;
  if (!name || amount <= 0) return alert("Data pengeluaran tidak valid.");

  const exp = {
    id: Date.now(),
    name,
    amount,
    type,
    date: new Date().toISOString(),
  };

  data.expenses.push(exp);
  saveData();
  renderExpenses();
  $("#expenseForm").reset();
}

function renderExpenses() {
  const tbody = $("#expenseTable tbody");
  tbody.innerHTML = data.expenses
    .map(
      (e, idx) => `
      <tr>
        <td>${e.name}</td>
        <td>${e.type}</td>
        <td>${fmt(e.amount)}</td>
        <td><button onclick="deleteExpense(${idx})">❌</button></td>
      </tr>`
    )
    .join("");
  renderSummary();
}

function deleteExpense(idx) {
  if (confirm("Hapus data pengeluaran ini?")) {
    data.expenses.splice(idx, 1);
    saveData();
    renderExpenses();
  }
}

// ======== STRUK PENJUALAN ========
function printReceipt(idOrSale) {
  const sale = typeof idOrSale === "object" ? idOrSale : data.sales.find((x) => x.id === idOrSale);
  if (!sale) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFont("courier", "normal");

  doc.text("STRUK PENJUALAN", 75, 20);
  doc.text(new Date(sale.date).toLocaleString(), 20, 35);
  doc.line(20, 40, 190, 40);

  let y = 50;
  sale.items
    ? sale.items.forEach((i) => {
        doc.text(`${i.name} (${i.qty}x${fmt(i.price)})`, 20, y);
        doc.text(fmt(i.price * i.qty), 170, y, { align: "right" });
        y += 10;
      })
    : doc.text(`${sale.name} (${sale.qty}x${fmt(sale.price)})`, 20, y);

  y += 10;
  doc.line(20, y, 190, y);
  doc.text(`Total: ${fmt(sale.total)}`, 20, (y += 10));
  doc.save(`Struk-${sale.name}.pdf`);
}

// ======== LAPORAN PDF ========
function exportReportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "pt", "a4");
  let y = 50;

  const totalSales = data.sales.reduce((a, b) => a + b.total, 0);
  const totalCost = data.inventory.reduce((a, b) => a + b.total, 0);
  const totalExpense = data.expenses.reduce((a, b) => a + b.amount, 0);
  const profit = totalSales - totalCost - totalExpense;

  doc.setFont("courier", "normal");
  doc.text("LAPORAN HARIAN", 220, y);
  y += 30;

  doc.text(`Total Penjualan: ${fmt(totalSales)}`, 50, (y += 20));
  doc.text(`Total Modal: ${fmt(totalCost)}`, 50, (y += 20));
  doc.text(`Total Pengeluaran: ${fmt(totalExpense)}`, 50, (y += 20));
  doc.text(`Laba/Rugi: ${fmt(profit)}`, 50, (y += 30));
  doc.line(50, (y += 10), 500, y);

  doc.autoTable({
    head: [["Tanggal", "Kategori", "Keterangan", "Nominal"]],
    body: [
      ...data.sales.map((s) => [
        new Date(s.date).toLocaleDateString(),
        "Penjualan",
        s.name,
        fmt(s.total),
      ]),
      ...data.inventory.map((i) => [
        new Date(i.date).toLocaleDateString(),
        "Barang Masuk",
        i.name,
        fmt(i.total),
      ]),
      ...data.expenses.map((e) => [
        new Date(e.date).toLocaleDateString(),
        "Pengeluaran",
        e.name,
        fmt(e.amount),
      ]),
    ],
    startY: y + 20,
    styles: { fontSize: 9 },
  });

  doc.save("Laporan-Harian.pdf");
}

// ======== RENDER & SAVE ========
function saveData() {
  localStorage.setItem("cashierDataV2", JSON.stringify(data));
}

function renderSummary() {
  const totalSales = data.sales.reduce((a, b) => a + b.total, 0);
  const totalCost = data.inventory.reduce((a, b) => a + b.total, 0);
  const totalExpense = data.expenses.reduce((a, b) => a + b.amount, 0);
  const profit = totalSales - totalCost - totalExpense;

  $("#sum-sales").textContent = fmt(totalSales);
  $("#sum-cost").textContent = fmt(totalCost);
  $("#sum-expense").textContent = fmt(totalExpense);
  $("#sum-profit").textContent = fmt(profit);
}

function renderAll() {
  renderSales();
  renderInventory();
  renderExpenses();
  renderSummary();
}
