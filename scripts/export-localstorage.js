// export-localstorage.js
// Utility untuk backup & restore data LocalStorage aplikasi kasir
(function () {
  const KEY_PREFIXES = ["catalog", "purchases", "sales", "expenses", "settings"];

  window.exportLocalStorage = function () {
    const data = {};
    KEY_PREFIXES.forEach((key) => {
      const raw = localStorage.getItem(key);
      if (raw) data[key] = JSON.parse(raw);
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cashier-localstorage-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  window.importLocalStorage = function (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        Object.keys(data).forEach((k) => localStorage.setItem(k, JSON.stringify(data[k])));
        alert("✅ Data berhasil diimpor!");
      } catch (err) {
        alert("❌ Gagal memuat file JSON");
      }
    };
    reader.readAsText(file);
  };

  console.log("💾 exportLocalStorage.js loaded — use exportLocalStorage() or importLocalStorage(file)");
})();
