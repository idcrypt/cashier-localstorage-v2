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
