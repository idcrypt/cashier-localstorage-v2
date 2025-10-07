# Smoke Test Checklist — Cashier App LocalStorage v2

## ✅ Basic UI
- [ ] App title, header, and footer visible
- [ ] Language toggle works (Bahasa <-> English)
- [ ] LocalStorage persistence after refresh

## 📦 Catalog
- [ ] Add item updates catalog list
- [ ] Edit item updates values correctly
- [ ] Delete item removes it from list

## 💰 Sales / POS
- [ ] Add to cart displays correctly
- [ ] Completing sale creates a new transaction entry
- [ ] Receipt prints correctly (both print and PDF)
- [ ] Profit calculation correct: `totalSales - (cost + expenses)`

## 📥 Purchases
- [ ] Purchase form adds to purchase list
- [ ] Total cost reflected in modal calculation

## 💸 Expenses
- [ ] Routine expense stored under "routine"
- [ ] One-off expense stored under "oneoff"
- [ ] Reflected properly in PDF report

## 🧾 Reports
- [ ] Report PDF shows correct totals and profit/loss
- [ ] Report date range filters transactions accurately

## ⚙️ Data Management
- [ ] Clear data button removes all localStorage keys
- [ ] exportLocalStorage() downloads correct JSON
- [ ] importLocalStorage() restores all data
