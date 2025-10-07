# 💳 Cashier LocalStorage v2

**Offline Cashier App** for small businesses, built with **pure HTML, CSS, and JavaScript** — no backend, no database, everything saved in the user’s **localStorage**.
Designed with a **dark neon UI** and supports **Indonesian 🇮🇩** and **English 🇬🇧**.

---

## ✨ Features

* **Sales / POS (Penjualan)**

  * Add items to cart, complete sales, auto-record transactions.
  * Print or save each transaction as a **PDF receipt** (styled neatly for small thermal printers or A4).

* **Catalog Management (Katalog Barang)**

  * Add or update products with name, unit, selling price, and cost price.

* **Purchases / Goods In (Barang Masuk)**

  * Record stock entries and modal (cost of goods).
  * Automatically included in the profit & loss calculation.

* **Expenses (Pengeluaran)**

  * Record routine (e.g., rent, utilities) and one-off expenses (e.g., repairs, sudden costs).

* **Reports**

  * Generate detailed **black & white PDF reports** for any date range.
  * Include all sales, purchases, expenses, and **profit & loss summary**.

* **Storage**

  * All data is stored locally in your browser via `localStorage`.
  * No internet or backend required.
  * Optional export/import of data via JSON (for backup).

---

## 🧾 Data Structure

| Section      | Key (localStorage)        | Description                            |
| ------------ | ------------------------- | -------------------------------------- |
| Catalog      | `cashier_catalog_v2`      | Product list (name, unit, price, cost) |
| Transactions | `cashier_transactions_v2` | Sales history with timestamp           |
| Purchases    | `cashier_purchases_v2`    | Stock entries and modal                |
| Expenses     | `cashier_expenses_v2`     | Store’s expense records                |
| Last Receipt | `cashier_lastReceipt_v2`  | Cached printable receipt               |
| Language     | `cashier_lang_v2`         | User language preference               |

---

## 🧰 File Overview

```
cashier-localstorage-v2/
├── index.html          # Main interface (bilingual UI)
├── style.css           # Dark neon theme
├── app.js              # App logic (POS, catalog, reports, receipts)
├── assets/             # Logo and icons
├── lib/                # jsPDF libraries (optional local copy)
├── samples/            # Example JSON data and PDF reports
├── scripts/            # Export/import helpers
├── tests/              # Manual test checklist
└── docs/               # User guide and developer notes
```

---

## 🖨️ PDF & Receipt System

Each completed transaction generates a digital receipt:

* View or print directly from browser
* Save as **PDF receipt**
* Includes date/time, customer name, item details, totals, and store name (editable)

For **daily or range reports**, users can:

* Filter by date range
* Generate full PDF report in **black & white** layout (suitable for printing)
* Includes summary tables for:

  * Sales income
  * Purchase cost (modal)
  * Expenses
  * **Profit/Loss result**

---

## 🌐 Bilingual UI

Switch language anytime via dropdown:

* **English** → default language
* **Bahasa Indonesia** → local adaptation (currency, labels, etc.)

---

## 🧮 Profit & Loss Formula

```
Profit = Total Sales - (Total Purchase Cost + Total Expenses)
```

Each section is timestamped and traceable by date range for easy auditing.

---

## 🚀 How to Use

1. **Download or clone the repo**

   ```bash
   git clone https://github.com/yourusername/cashier-localstorage-v2.git
   ```
2. **Open `index.html`** in any modern browser (Chrome, Edge, Brave, Firefox).
3. Start adding products, recording sales, and tracking expenses.
4. Use **“PDF Report”** button to generate a full summary anytime.

---

## 🧱 Tech Stack

* HTML5 + CSS3 (Dark Neon theme)
* Vanilla JavaScript (no frameworks)
* jsPDF + AutoTable for PDF generation
* Browser localStorage for persistence

---

## 📂 Example Data

Example data is available in `samples/seed-data.json`.
Load it manually via Developer Tools or `scripts/export-localstorage.js` to preview reports instantly.

---

## 🪪 License

MIT License © 2025
You are free to use, modify, and distribute this project with attribution.

---

## 🧠 Future Plans

* QR-based receipt for easy reprint.
* Optional cloud sync (using Firebase or Supabase).
* Support for barcode scanners.
* Integration with PWA offline-first mode.

---

## 👨‍💻 Author

Created by **binka** —
Crypto & Web3 Enthusiast | Developer | Writer | Trader | NFT Artist
🪙 Blog: [idcrypt.xyz](https://idcrypt.xyz)
