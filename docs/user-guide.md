# User Guide — Cashier LocalStorage App v2

## Overview
Offline cashier app for small businesses.  
All data stored locally in browser using `localStorage`.

Supports:
- Sales & receipt printing
- Purchases / stock entry
- Expenses tracking (routine & one-off)
- Profit & loss report (PDF)
- Bilingual interface (Bahasa Indonesia / English)

## How to Use
1. **Open `index.html`** in your browser.
2. Add products in the **Catalog** section.
3. Record purchases under **Barang Masuk** with cost prices.
4. Record sales in **Point of Sale**, then print or save receipts.
5. Add expenses in **Pengeluaran** (routine or one-off).
6. Generate daily or ranged **PDF reports** from the header section.

## Data Backup
Use helper script `/scripts/export-localstorage.js`:
```js
exportLocalStorage()        // Download backup JSON
importLocalStorage(file)    // Restore data

## Printing
Receipts: small black-white layout for A6 or thermal printer.
Reports: detailed A4 layout with tables (sales, purchases, expenses, net profit).

## Language
Switch between Indonesian & English from the dropdown menu in the header.

## Requirements
Browser supporting LocalStorage (Chrome, Edge, Firefox)
Internet (optional for jsPDF CDN)

##Notes
This app is completely offline — ideal for kiosks, cafés, or small stores.

### 🧠 `docs/dev-notes.md
# Dev Notes — Cashier App LocalStorage v2
## Tech Stack
- HTML, CSS (dark neon theme)
- Vanilla JS (no framework)
- jsPDF + jsPDF-AutoTable for PDF generation

## Data Schema
catalog[]: { id, name, price, cost, unit }
purchases[]: { date, item, qty, unitCost, total }
sales[]: { date, customer, items[], total }
expenses[]: { date, desc, amount, type }
settings: { lang }

## LocalStorage Keys
- "catalog"
- "purchases"
- "sales"
- "expenses"
- "settings"

## Possible Next Features
- Authentication (PIN/Password)
- Cloud sync (Firebase or IndexedDB)
- Graphical reports (chart.js)
- Multi-user support
- Inventory stock tracking (deduct stock after sale)
- CSV export option

## Testing Tips
- Clear browser cache before testing persistence
- Verify totals for each day match between sales, purchases, and expenses
- Simulate offline by disconnecting network

## Deployment
Just host the folder statically (e.g., GitHub Pages or local file).  
No backend required.
