let masterPageSize = 10;
let masterCurrentPage = 1;
let invActivityPageSize = 20;
let invActivityCurrentPage = 1;
let invActivityFilter = "semua";
let invActivitySearch = "";

/* ── Inventory operations state ── */
let invTransactionType = "masuk";
let invToken = "";
let invTokenDate = "";
let invTokenVisible = false;
let invCurrentOrder = [];
let invVideoScanner = null;

function datePrefix() {
  return nowStampWIB().slice(0, 10).replace(/-/g, "");
}

function loadInvTokenState() {
  const today = nowStampWIB().slice(0, 10);
  const stored = Store.getInvToken();
  if (stored.date === today && stored.token && stored.token.length === 11) {
    invToken = stored.token;
    invTokenDate = today;
  } else {
    invToken = datePrefix() + "001";
    invTokenDate = today;
    Store.saveInvToken(invToken, today);
  }
}
function saveInvTokenState() {
  const today = nowStampWIB().slice(0, 10);
  if (invTokenDate !== today) {
    invToken = datePrefix() + "001";
    invTokenDate = today;
  }
  Store.saveInvToken(invToken, invTokenDate);
}

const inventoryOpnameData = {
  metrics: [
    { value: "3", label: "Sesi aktif", tone: "sky" },
    { value: "128", label: "Barang diaudit", tone: "mint" },
    { value: "9", label: "Selisih ditemukan", tone: "rose" },
    { value: "93%", label: "Akurasi awal", tone: "sand" }
  ],
  sessions: [
    ["OPN-0626-01", "Gudang ATK", "30 Jun 2026", "Nadia", "Draft"],
    ["OPN-0626-02", "Gudang Kebersihan", "29 Jun 2026", "Farhan", "Selesai"],
    ["OPN-0626-03", "Lab Komputer", "28 Jun 2026", "Rizki", "Selesai"]
  ],
  discrepancies: [
    ["Cairan Pel Lemon", "Gudang Kebersihan", "12", "6", "-6", "Barang rusak / bocor"],
    ["Mouse Wireless Logitech", "Lab Komputer", "20", "18", "-2", "Dipakai belum tercatat"],
    ["Ordner Arsip Biru", "TU", "10", "12", "+2", "Ada stok pindahan"]
  ]
};

const inventoryStorageKeys = {
  items: "reload_sarpras_items",
  categories: "reload_sarpras_categories",
  kategoriList: "reload_sarpras_kategori_list",
  locations: "reload_sarpras_locations",
  units: "reload_sarpras_units",
  suppliers: "reload_sarpras_suppliers",
  transactions: "reload_sarpras_transactions",
  opnames: "reload_sarpras_opnames",
  discrepancies: "reload_sarpras_discrepancies"
};

const inventorySyncState = {
  master: "Local browser data aktif",
  inventory: "Transaksi tersimpan di browser",
  opname: "Local browser data aktif"
};

let inventoryState = null;

function loadInventoryStore(key, fallback) {
  return Store.loadInvData(key, fallback);
}

function persistInventoryStore() {
  if (!inventoryState) return;
  Store.persistAllInventory(inventoryState);
}

function ensureInventoryState() {
  if (inventoryState) return inventoryState;
  inventoryState = {
    items: loadInventoryStore(inventoryStorageKeys.items, []),
    categories: loadInventoryStore(inventoryStorageKeys.categories, []),
    kategoriList: loadInventoryStore(inventoryStorageKeys.kategoriList, []),
    locations: loadInventoryStore(inventoryStorageKeys.locations, []),
    units: loadInventoryStore(inventoryStorageKeys.units, ["pcs", "box", "rim", "liter", "kg", "pack", "lusin"]),
    suppliers: loadInventoryStore(inventoryStorageKeys.suppliers, []),
    transactions: loadInventoryStore(inventoryStorageKeys.transactions, []),
    opnames: loadInventoryStore(inventoryStorageKeys.opnames, []),
    discrepancies: loadInventoryStore(inventoryStorageKeys.discrepancies, [])
  };
  /* Normalize freq & unit — old items may not have row[6] / row[7] */
  inventoryState.items.forEach((row) => {
    if (row.length < 7) row.push("0");
    if (row.length < 8) row.push("pcs");
  });
  return inventoryState;
}

function computeTimeline(tx) {
  if (!tx.length) return [];
  const byDay = {};
  let earliest = null, latest = null;
  tx.forEach((row) => {
    const day = row[2].slice(0, 10);
    byDay[day] = (byDay[day] || 0) + 1;
    if (!earliest || day < earliest) earliest = day;
    if (!latest || day > latest) latest = day;
  });
  const start = new Date(earliest);
  const end = new Date(latest);
  const diffDays = Math.round((end - start) / 86400000) + 1;
  const useMonthly = diffDays > 365;
  const useWeekly = diffDays > 60 && !useMonthly;
  const result = [];
  if (useMonthly) {
    const byMonth = {};
    tx.forEach((row) => {
      const m = row[2].slice(0, 7);
      byMonth[m] = (byMonth[m] || 0) + 1;
    });
    const mStart = new Date(earliest.slice(0, 7) + "-01");
    const mEnd = new Date(latest.slice(0, 7) + "-01");
    for (let d = new Date(mStart); d <= mEnd; d.setMonth(d.getMonth() + 1)) {
      const key = d.toISOString().slice(0, 7);
      result.push({ label: key, value: byMonth[key] || 0 });
    }
  } else if (useWeekly) {
    const byWeek = {};
    tx.forEach((row) => {
      const d = new Date(row[2].slice(0, 10));
      const wkStart = new Date(d);
      wkStart.setDate(d.getDate() - d.getDay());
      const key = wkStart.toISOString().slice(0, 10);
      byWeek[key] = (byWeek[key] || 0) + 1;
    });
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 7)) {
      const key = d.toISOString().slice(0, 10);
      result.push({ label: key, value: byWeek[key] || 0 });
    }
  } else {
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      result.push({ label: key, value: byDay[key] || 0 });
    }
  }
  return result;
}
function computeTopItems(masterItems, n) {
  return masterItems
    .filter((row) => Number(row[6]) > 0)
    .sort((a, b) => Number(b[6]) - Number(a[6]))
    .slice(0, n || 3)
    .map((row) => ({ code: row[0], name: row[1], freq: Number(row[6]) }));
}
function computeFreqRanking(masterItems, n) {
  return masterItems
    .filter((row) => Number(row[6]) > 0)
    .sort((a, b) => Number(b[6]) - Number(a[6]))
    .slice(0, n || 10)
    .map((row, i) => ({ rank: i + 1, code: row[0], name: row[1], kategori: row[2] || "—", freq: Number(row[6]) }));
}
function computeMetrics(masterItems) {
  const totalItems = masterItems.length;
  const totalStock = masterItems.reduce((s, r) => s + (Number(r[4]) || 0), 0);
  const kategoriSet = new Set(masterItems.map((r) => r[2]).filter(Boolean));
  const lowStockItems = masterItems.filter((r) => Number(r[4]) <= 1 && Number(r[4]) > 0);
  const zeroStockItems = masterItems.filter((r) => Number(r[4]) === 0);
  return {
    cards: [
      { value: String(totalItems), label: "invOverviewTotalItems", tone: "mint" },
      { value: String(totalStock), label: "invOverviewTotalStock", tone: "sand" },
      { value: String(kategoriSet.size), label: "invOverviewCategories", tone: "sky" },
      { value: String(lowStockItems.length), label: "invOverviewLowStock", tone: "rose" },
      { value: String(zeroStockItems.length), label: "invOverviewZeroStock", tone: "rose" }
    ],
    lowStockItems,
    zeroStockItems
  };
}

function supabaseMasterToRaw(rows) {
  return (rows || []).map(r => [r.item_code, r.item_name, r.category, r.location, String(r.stock ?? 0), r.timestamp || null, String(r.freq ?? 0)]);
}
function supabaseTxToRaw(rows) {
  return (rows || []).map(r => [r.token, r.type, r.date, JSON.stringify(r.items ?? []), String(r.total_qty ?? 0), String(r.item_count ?? 0), r.petugas || '', r.status || 'Selesai']);
}

const _invOverviewCache = { data: null, ts: 0 };
const INV_CACHE_TTL = 60000;
async function refreshOverviewData() {
  if (_invOverviewCache.data && Date.now() - _invOverviewCache.ts < INV_CACHE_TTL) return _invOverviewCache.data;
  const state = ensureInventoryState();
  const sb = getInventorySupabaseClient();
  if (sb) {
    try {
      const [txRes, masterRes] = await Promise.all([
        sb.from("sarpras_transactions").select("*").order("date", { ascending: false }),
        sb.from("sarpras_master_items").select("*").order("item_code")
      ]);
      if (!txRes.error && !masterRes.error) {
        const masterRaw = supabaseMasterToRaw(masterRes.data);
        const txRaw = supabaseTxToRaw(txRes.data);
        const data = buildOverviewResult(masterRaw, txRaw);
        _invOverviewCache.data = data;
        _invOverviewCache.ts = Date.now();
        return data;
      }
    } catch (e) { console.warn("refreshOverviewData: Supabase fetch failed, falling back to local", e); }
  }
  const data = buildOverviewResult(state.items, state.transactions);
  _invOverviewCache.data = data;
  _invOverviewCache.ts = Date.now();
  return data;
}
function invalidateOverviewCache() { _invOverviewCache.ts = 0; }
function buildOverviewResult(masterRaw, txRaw) {
  const metrics = computeMetrics(masterRaw);
  return {
    masterRaw, txRaw,
    metrics: metrics.cards,
    timeline: computeTimeline(txRaw),
    topItems: computeTopItems(masterRaw, 3),
    freqRanking: computeFreqRanking(masterRaw, 10),
    lowStockItems: metrics.lowStockItems,
    zeroStockItems: metrics.zeroStockItems
  };
}

function getInventorySupabaseClient() {
  return window.authModule?.getSupabaseClient?.() || window.schoolAuth?.sb || window._sb || null;
}

function refreshInventoryLanguage() {
  const invPage = document.querySelector("#inventory .module-page");
  if (!invPage) return;
  const tabMap = { "inv-overview": "invTabOverview", "inv-qrocr": "invTabQrcr", "inv-master": "invTabMaster", "inv-inventory": "invTabInventory", "inv-opname": "invTabOpname", "inv-asset": "invTabAsset", "inv-borrow": "invTabBorrow", "inv-maintenance": "invTabMaintenance", "inv-activity": "invTabActivity", "inv-reports": "invTabReports", "inv-client": "invTabClient" };
  invPage.querySelectorAll("[data-invpage]").forEach((btn) => {
    const key = tabMap[btn.dataset.invpage];
    if (key) btn.textContent = t(key);
  });
  refreshInventorySubpages(invPage);
}

function enhanceInventoryPage() {
  loadInvTokenState();
  const section = document.querySelector("#inventory");
  const page    = section?.querySelector(".module-page");
  const heading = page?.querySelector(".module-heading");
  if (!section || !page || !heading || page.querySelector(".module-subnav")) return;
  ensureInventoryState();

  /* ── Wrap existing content into "overview" sub-page ── */
  const overview = document.createElement("section");
  overview.id        = "inv-overview";
  overview.className = "module-subpage";
  [...page.children].forEach((child) => {
    if (child !== heading) overview.appendChild(child);
  });
  buildInventoryOverview(overview);

  /* ── Subnav — same markup pattern as Staff ── */
  const subnav = document.createElement("div");
  subnav.className = "module-subnav";
  subnav.setAttribute("role", "tablist");
  subnav.setAttribute("aria-label", "Sarpras sub pages");
  subnav.innerHTML = `
    <button class="active" type="button" data-invpage="inv-overview">${t("invTabOverview")}</button>
    <button type="button" data-invpage="inv-qrocr">${t("invTabQrcr")}</button>
    <button type="button" data-invpage="inv-master">${t("invTabMaster")}</button>
    <button type="button" data-invpage="inv-inventory">${t("invTabInventory")}</button>
    <button type="button" data-invpage="inv-opname">${t("invTabOpname")}</button>
    <button type="button" data-invpage="inv-asset">${t("invTabAsset")}</button>
    <button type="button" data-invpage="inv-borrow">${t("invTabBorrow")}</button>
    <button type="button" data-invpage="inv-maintenance">${t("invTabMaintenance")}</button>
    <button type="button" data-invpage="inv-activity">${t("invTabActivity")}</button>
    <button type="button" data-invpage="inv-client">${t("invTabClient")}</button>
    <button type="button" data-invpage="inv-reports">${t("invTabReports")}</button>
  `;

  /* ── QR/OCR sub-page container ── */
  const qrPage = document.createElement("section");
  qrPage.id        = "inv-qrocr";
  qrPage.className = "module-subpage";
  qrPage.hidden    = true;
  qrPage.innerHTML = `
    <div class="sarpras-qr-loading" id="sarpras-qr-loading">
      <div class="qr-spinner"></div>
      <strong>Menyiapkan alat...</strong>
      <small>Memuat library QR, OCR, dan PDF scanner</small>
    </div>
  `;

  const masterPage = document.createElement("section");
  masterPage.id = "inv-master";
  masterPage.className = "module-subpage";
  masterPage.hidden = true;
  masterPage.innerHTML = buildInventoryMasterPage();

  const inventoryPage = document.createElement("section");
  inventoryPage.id = "inv-inventory";
  inventoryPage.className = "module-subpage";
  inventoryPage.hidden = true;
  inventoryPage.innerHTML = buildInventoryOperationsPage();

  const opnamePage = document.createElement("section");
  opnamePage.id = "inv-opname";
  opnamePage.className = "module-subpage";
  opnamePage.hidden = true;
  opnamePage.innerHTML = buildInventoryOpnamePage();

  const assetPage = document.createElement("section");
  assetPage.id = "inv-asset";
  assetPage.className = "module-subpage";
  assetPage.hidden = true;
  assetPage.innerHTML = buildInventoryPlaceholderPage(
    "Asset Management",
    "Pisahkan aset tetap dari stok habis pakai, lengkap dengan lokasi, PIC, status, dan dasar depresiasi garis lurus.",
    ["Kode asset", "Serial number", "Tanggal beli", "Lokasi dan PIC", "Status aktif / dipinjam / rusak"]
  );

  const borrowPage = document.createElement("section");
  borrowPage.id = "inv-borrow";
  borrowPage.className = "module-subpage";
  borrowPage.hidden = true;
  borrowPage.innerHTML = buildInventoryPlaceholderPage(
    "Peminjaman",
    "Untuk barang atau asset yang kembali lagi ke lokasi asal, termasuk kasus reparasi ke vendor.",
    ["Nomor peminjaman", "Peminjam", "Tujuan dipinjam / reparasi", "Status kembali", "Bukti PDF"]
  );

  const maintenancePage = document.createElement("section");
  maintenancePage.id = "inv-maintenance";
  maintenancePage.className = "module-subpage";
  maintenancePage.hidden = true;
  maintenancePage.innerHTML = buildInventoryPlaceholderPage(
    "Jadwal Maintenance",
    "Menjaga asset rutin diperiksa dengan interval bulanan sampai tahunan dan otomatis masuk ke riwayat aktivitas.",
    ["Nomor jadwal", "Asset", "Vendor", "Interval", "Tanggal berikutnya"]
  );

  const activityPage = document.createElement("section");
  activityPage.id = "inv-activity";
  activityPage.className = "module-subpage";
  activityPage.hidden = true;
  activityPage.innerHTML = buildInventoryPlaceholderPage(
    t("invActPlaceholderTitle"),
    t("invActPlaceholderDesc"),
    t("invActPlaceholderScope").split(", ")
  );

  const clientPage = document.createElement("section");
  clientPage.id = "inv-client";
  clientPage.className = "module-subpage";
  clientPage.hidden = true;
  clientPage.innerHTML = buildInventoryClientPage();

  const reportPage = document.createElement("section");
  reportPage.id = "inv-reports";
  reportPage.className = "module-subpage";
  reportPage.hidden = true;
  reportPage.innerHTML = buildInventoryReportsPage();

  page.append(subnav, overview, qrPage, masterPage, inventoryPage, opnamePage, assetPage, borrowPage, maintenancePage, activityPage, clientPage, reportPage);

  /* ── Toast & loading overlay ── */
  const toastEl = document.createElement("div");
  toastEl.className = "sarpras-toast";
  toastEl.id = "sarpras-toast";
  page.append(toastEl);

  const loadingEl = document.createElement("div");
  loadingEl.className = "sarpras-loading";
  loadingEl.id = "sarpras-loading";
  loadingEl.style.display = "none";
  loadingEl.innerHTML = '<div><div class="sarpras-spinner"></div><span>Menyimpan data ke database...</span></div>';
  page.append(loadingEl);

  /* ── Tab switching ── */
  let qrMounted = false;

  const openInvPage = (id) => {
    page.querySelectorAll("[data-invpage]").forEach((b) => {
      b.classList.toggle("active", b.dataset.invpage === id);
    });
    page.querySelectorAll(".module-subpage").forEach((s) => {
      s.hidden = s.id !== id;
    });
    localStorage.setItem("reload_last_inv_page", id);

    if (id === "inv-qrocr" && !qrMounted) {
      window.inventoryQROCR.loadDeps()
        .then(() => {
          qrMounted = true;
          window.inventoryQROCR.mount(qrPage);
        })
        .catch((err) => {
          qrPage.innerHTML = `
            <div class="sarpras-qr-loading">
              <strong style="color:var(--due-text)">Gagal memuat library.</strong>
              <small>${err.message}</small>
            </div>`;
        });
    }
    if (id !== "inv-inventory") {
      if (invVideoScanner) {
        try { invVideoScanner.stop(); } catch (e) {}
        invVideoScanner = null;
      }
      const area = document.getElementById("sarpras-video-scanner");
      if (area) area.style.display = "none";
    }
    if (id === "inv-activity") {
      const ap = page.querySelector("#inv-activity");
      if (ap) ap.innerHTML = buildInventoryActivityPage();
    }
    if (id === "inv-client") {
      loadClientTransactionsTable();
    }
  };

  page.querySelectorAll("[data-invpage]").forEach((b) => {
    b.addEventListener("click", () => openInvPage(b.dataset.invpage));
  });

  /* ── Wire "QR / OCR" quick-action button in Overview sidebar ── */
  page.querySelectorAll("[data-inv-target]").forEach((button) => {
    const target = button.dataset.invTarget;
    if (target) button.addEventListener("click", () => openInvPage(target));
  });

  /* Build all subpages on load */
  refreshInventorySubpages(page);

  /* Auto-load from Supabase if localStorage is empty (no dummy data) */
  if (localStorage.getItem(inventoryStorageKeys.items) === null) {
    const sb = getInventorySupabaseClient();
    if (sb) {
      Promise.all([
        sb.from("sarpras_master_items").select("*").order("item_code"),
        sb.from("sarpras_kategori").select("*").order("code"),
        sb.from("sarpras_transactions").select("*").order("date", { ascending: false }).limit(100)
      ]).then(([itemsRes, kategoriRes, txRes]) => {
        if (itemsRes.error || kategoriRes.error || txRes.error) return;
        const state = ensureInventoryState();
        state.items = (itemsRes.data || []).map(r => [r.item_code, r.item_name, r.category, r.location || "", String(r.stock ?? 0), r.timestamp || "", String(r.freq ?? 0), r.unit || "pcs"]);
        state.kategoriList = (kategoriRes.data || []).map(r => [r.code, r.name]);
        state.transactions = (txRes.data || []).map(r => [r.token, r.type, r.date, JSON.stringify(r.items || []), String(r.total_qty ?? 0), String(r.item_count ?? 0), r.petugas || "—", r.status || "Selesai"]);
        persistInventoryStore();
        refreshInventorySubpages(page);
        inventorySyncState.master = "Auto-loaded from Supabase";
        inventorySyncState.inventory = "Auto-loaded from Supabase";
      }).catch(() => {});
    }
  }

  bindInventoryWorkspace(page);
}

function bindInventoryWorkspace(page) {
  if (page.dataset.sarprasBound === "true") return;
  page.dataset.sarprasBound = "true";

  page.addEventListener("click", async (event) => {
    if (event.target.id === "sarpras-master-modal") {
      event.target.style.display = "none";
      return;
    }
    if (event.target.id === "sarpras-master-pageprev" && masterCurrentPage > 1) {
      masterCurrentPage--;
      refreshInventorySubpages(page);
      return;
    }
    if (event.target.id === "sarpras-master-pagenext") {
      const total = ensureInventoryState().items.length;
      const pages = Math.ceil(total / masterPageSize) || 1;
      if (masterCurrentPage < pages) {
        masterCurrentPage++;
        refreshInventorySubpages(page);
      }
      return;
    }
    if (event.target.id === "sarpras-activity-pageprev" && invActivityCurrentPage > 1) {
      invActivityCurrentPage--;
      refreshInventorySubpages(page);
      return;
    }
    if (event.target.id === "sarpras-activity-pagenext") {
      const total = ensureInventoryState().transactions.length;
      const pages = Math.ceil(total / invActivityPageSize) || 1;
      if (invActivityCurrentPage < pages) {
        invActivityCurrentPage++;
        refreshInventorySubpages(page);
      }
      return;
    }
    if (event.target.id === "sarpras-confirm-modal") {
      event.target.style.display = "none";
      return;
    }
    if (event.target.id === "sarpras-confirm-modal-close") {
      document.getElementById("sarpras-confirm-modal").style.display = "none";
      setTimeout(() => {
        const scanner = document.getElementById("sarpras-scanner");
        if (scanner) scanner.focus();
      }, 0);
      return;
    }
    const actionButton = event.target.closest("[data-sarpras-action]");
    if (!actionButton) return;
    const action = actionButton.dataset.sarprasAction;
    const index = Number(actionButton.dataset.index || -1);

    if (action === "master-load") await loadMasterFromSupabase(page);
    if (action === "master-save") {
      if (!confirm("Peringatan: Semua data di database (master item, kategori, transaksi) akan diganti dengan data saat ini. Lanjutkan?")) return;
      await saveMasterToSupabase(page);
    }
    if (action === "inventory-load") await loadInventoryFromSupabase(page);
    if (action === "inventory-save") await saveInventoryToSupabase(page);
    if (action === "opname-load") await loadOpnameFromSupabase(page);
    if (action === "opname-save") await saveOpnameToSupabase(page);

    /* ── Activity page ── */
    if (action === "activity-filter") {
      invActivityFilter = actionButton.dataset.value || "semua";
      invActivityCurrentPage = 1;
      refreshInventorySubpages(page);
    }
    if (action === "activity-clear") {
      if (!confirm(t("invActClearConfirm"))) return;
      const st = ensureInventoryState();
      st.transactions = [];
      persistInventoryStore();
      refreshInventorySubpages(page);
    }
    if (action === "activity-export") {
      exportActivityExcel();
    }
    /* ── Reports page ── */
    if (action === "report-set-type") {
      invReportType = actionButton.dataset.value || "bulanan";
      refreshInventorySubpages(page);
    }
    if (action === "report-generate") {
      const monthSel = page.querySelector("[data-sarpras-input='report-month']");
      const yearSel = page.querySelector("[data-sarpras-input='report-year']");
      if (monthSel) invReportMonth = Number(monthSel.value);
      if (yearSel) invReportYear = Number(yearSel.value);
      refreshInventorySubpages(page);
    }
    if (action === "report-export") {
      if (!confirm(t("invRepConfirmLoad"))) return;
      exportReportExcel();
    }
    if (action === "report-set-subtab") {
      invReportSubTab = actionButton.dataset.value || "ledger";
      localStorage.setItem("reload_last_report_subtab", invReportSubTab);
      refreshInventorySubpages(page);
    }
    if (action === "report-export-card") {
      if (!confirm(t("invRepConfirmLoad"))) return;
      exportStockCardExcel(invStockCardCode);
    }
    if (action === "report-export-all-cards") {
      if (!confirm(t("invRepConfirmLoad"))) return;
      exportAllStockCardsExcel();
    }
    if (action === "toggle-tx-detail") {
      const idx = Number(actionButton.dataset.index);
      const detailRow = page.querySelector(`tr.tx-detail-row[data-parent="${idx}"]`);
      const toggleBtn = actionButton;
      if (detailRow) {
        const isHidden = detailRow.style.display === "none";
        detailRow.style.display = isHidden ? "table-row" : "none";
        toggleBtn.textContent = isHidden ? "▼" : "▶";
      }
    }

    /* ── Client approval page ── */
    if (action === "client-refresh") {
      loadClientTransactionsTable();
    }
    if (action === "client-approve") {
      const token = actionButton.dataset.token;
      if (token) { await handleClientApprove(token); await loadMasterFromSupabase(page); loadClientTransactionsTable(); }
    }
    if (action === "client-reject") {
      const token = actionButton.dataset.token;
      if (token) { await handleClientReject(token); await loadMasterFromSupabase(page); loadClientTransactionsTable(); }
    }
    if (action === "client-delete") {
      const token = actionButton.dataset.token;
      if (token) { await handleClientDelete(token); await loadMasterFromSupabase(page); loadClientTransactionsTable(); }
    }
    if (action === "client-approve-all") {
      const sb = getInventorySupabaseClient();
      if (!sb) return;
      sb.from("client_transactions").select("token").eq("status", "pending").then(async ({ data, error }) => {
        if (error || !data) return;
        const tokens = data.map(r => r.token);
        if (tokens.length === 0) { inventoryToast("No pending transactions."); return; }
        if (!confirm("Approve all " + tokens.length + " pending transactions?")) return;
        for (const t of tokens) {
          await handleClientApprove(t);
        }
        await loadMasterFromSupabase(page);
        loadClientTransactionsTable();
      });
    }

    /* ── Inventory operations ── */
    if (action === "set-transaction-type") {
      invTransactionType = actionButton.dataset.value || "masuk";
      refreshInventorySubpages(page);
      setTimeout(() => {
        const scanner = document.getElementById("sarpras-scanner");
        if (scanner) scanner.focus();
      }, 0);
      return;
    }

    if (action === "inventory-token-toggle") {
      invTokenVisible = !invTokenVisible;
      const input = document.querySelector("[data-sarpras-input='inventory-token']");
      if (input) input.type = invTokenVisible ? "text" : "password";
      actionButton.textContent = invTokenVisible ? "🙈" : "👁";
      setTimeout(() => {
        const scanner = document.getElementById("sarpras-scanner");
        if (scanner) scanner.focus();
      }, 0);
      return;
    }

    if (action === "inventory-remove-order" && index >= 0 && index < invCurrentOrder.length) {
      invCurrentOrder.splice(index, 1);
      refreshInventorySubpages(page);
      setTimeout(() => {
        const scanner = document.getElementById("sarpras-scanner");
        if (scanner) scanner.focus();
      }, 0);
      return;
    }

    if (action === "inventory-clear-order") {
      invCurrentOrder = [];
      refreshInventorySubpages(page);
      setTimeout(() => {
        const scanner = document.getElementById("sarpras-scanner");
        if (scanner) scanner.focus();
      }, 0);
      return;
    }

    if (action === "inventory-confirm") {
      const tokenRaw = invToken;
      if (!tokenRaw || tokenRaw.length !== 11 || !/^\d{11}$/.test(tokenRaw)) {
        inventoryToast("Token tidak valid.");
        return;
      }
      if (invCurrentOrder.length === 0) {
        inventoryToast("Belum ada barang dalam daftar.");
        return;
      }
      if (invTransactionType === "keluar") {
        const state = ensureInventoryState();
        const insufficient = [];
        const checked = new Set();
        invCurrentOrder.forEach((orderItem) => {
          if (checked.has(orderItem.code)) return;
          checked.add(orderItem.code);
          const totalOrdered = invCurrentOrder.filter((o) => o.code === orderItem.code).reduce((s, o) => s + o.qty, 0);
          const masterItem = state.items.find((row) => row[0] === orderItem.code);
          if (masterItem && Number(masterItem[4]) < totalOrdered) {
            insufficient.push(`${orderItem.code} (tersedia ${masterItem[4]}, diminta ${totalOrdered})`);
          }
        });
        if (insufficient.length > 0) {
          inventoryToast("✗ Stok tidak mencukupi: " + insufficient.join("; "));
          return;
        }
      }
      document.getElementById("sarpras-confirm-modal").style.display = "grid";
      const input = document.getElementById("sarpras-confirm-token-input");
      if (input) { input.value = ""; input.focus(); }
      return;
    }

    if (action === "remove-item" && index >= 0) {
      inventoryState.items.splice(index, 1);
      persistInventoryStore();
      refreshInventorySubpages(page);
    }
    if (action === "remove-supplier" && index >= 0) {
      inventoryState.suppliers.splice(index, 1);
      persistInventoryStore();
      refreshInventorySubpages(page);
    }
    if (action === "remove-transaction" && index >= 0) {
      inventoryState.transactions.splice(index, 1);
      persistInventoryStore();
      refreshInventorySubpages(page);
    }
    if (action === "remove-opname" && index >= 0) {
      inventoryState.opnames.splice(index, 1);
      persistInventoryStore();
      refreshInventorySubpages(page);
    }
    if (action === "remove-discrepancy" && index >= 0) {
      inventoryState.discrepancies.splice(index, 1);
      persistInventoryStore();
      refreshInventorySubpages(page);
    }
    if (action === "remove-chip" && index >= 0) {
      const collection = actionButton.dataset.collection;
      if (Array.isArray(inventoryState[collection])) {
        inventoryState[collection].splice(index, 1);
        persistInventoryStore();
        refreshInventorySubpages(page);
      }
    }

    if (action === "add-item-show") {
      document.getElementById("sarpras-edit-index").value = "-1";
      document.getElementById("sarpras-master-modal-title").textContent = t("invMasterModalAdd");
      document.getElementById("sarpras-master-form").reset();
      document.getElementById("sarpras-master-modal").style.display = "grid";
    }

    if (action === "edit-item" && index >= 0) {
      const item = inventoryState.items[index];
      const form = document.getElementById("sarpras-master-form");
      form.elements["edit_index"].value = index;
      form.elements["item_code"].value = item[0];
      form.elements["item_name"].value = item[1];
      const catEntry = inventoryState.kategoriList.find(([, n]) => n === item[2]);
      form.elements["category"].value = catEntry ? catEntry[0] : "";
      form.elements["location"].value = item[3];
      form.elements["stock"].value = item[4];
      form.elements["unit"].value = item[7] || "pcs";
      document.getElementById("sarpras-master-modal-title").textContent = t("invMasterModalEdit");
      document.getElementById("sarpras-master-modal").style.display = "grid";
      form.elements["category"].disabled = true;
      form.elements["item_code"].readOnly = true;
    }

    if (action === "export-items") {
      exportMasterExcel();
    }

    if (action === "import-show") {
      const popup = document.getElementById("sarpras-import-popup");
      if (popup) popup.style.display = popup.style.display === "none" ? "" : "none";
    }
    if (action === "import-template") {
      downloadMasterTemplate();
      const popup = document.getElementById("sarpras-import-popup");
      if (popup) popup.style.display = "none";
    }
    if (action === "import-upload") {
      document.getElementById("sarpras-master-import")?.click();
      const popup = document.getElementById("sarpras-import-popup");
      if (popup) popup.style.display = "none";
    }

    if (action === "master-modal-close" || actionButton.id === "sarpras-master-modal-close" || actionButton.id === "sarpras-master-modal-cancel") {
      document.getElementById("sarpras-master-modal").style.display = "none";
      const f = document.getElementById("sarpras-master-form");
      if (f) { f.elements["category"].disabled = false; f.elements["item_code"].readOnly = false; }
    }
    if (action === "kategori-add-show") {
      document.getElementById("sarpras-kategori-form").reset();
      document.getElementById("sarpras-kategori-modal").style.display = "grid";
    }
    if (action === "kategori-modal-close" || actionButton.id === "sarpras-kategori-modal-close" || actionButton.id === "sarpras-kategori-modal-cancel") {
      document.getElementById("sarpras-kategori-modal").style.display = "none";
    }
    if (event.target.id === "sarpras-kategori-modal") {
      event.target.style.display = "none";
    }
  });

  /* ── Auto-generate item code on kategori select ── */
  page.addEventListener("change", (event) => {
    if (event.target.id === "sarpras-master-pagesize") {
      masterPageSize = Number(event.target.value) || 10;
      masterCurrentPage = 1;
      refreshInventorySubpages(page);
    }
  });
  page.addEventListener("change", (event) => {
    if (event.target.name === "category" && event.target.closest("#sarpras-master-form")) {
      const code = event.target.value;
      if (!code) return;
      const prefix = code + "-";
      let maxNum = 0;
      ensureInventoryState().items.forEach((row) => {
        if (row[0].startsWith(prefix)) {
          const num = parseInt(row[0].slice(prefix.length), 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        }
      });
      const kodeInput = document.getElementById("sarpras-master-form").elements["item_code"];
      kodeInput.value = prefix + String(maxNum + 1).padStart(3, "0");
    }
  });

  /* ── Inventory: qty change ── */
  page.addEventListener("change", (event) => {
    if (event.target.matches("[data-sarpras-action='inventory-update-qty']")) {
      const idx = Number(event.target.dataset.index);
      const val = parseInt(event.target.value, 10);
      if (!isNaN(idx) && idx >= 0 && idx < invCurrentOrder.length) {
        invCurrentOrder[idx].qty = Math.max(1, val || 1);
        event.target.value = invCurrentOrder[idx].qty;
        refreshInventorySubpages(page);
        setTimeout(() => {
          const scanner = document.getElementById("sarpras-scanner");
          if (scanner) scanner.focus();
        }, 0);
      }
    }
  });

  /* ── Close import popup on outside click ── */
  page.addEventListener("click", (event) => {
    const popup = document.getElementById("sarpras-import-popup");
    if (!popup || popup.style.display === "none") return;
    if (event.target.closest("[data-sarpras-action='import-show'], #sarpras-import-popup")) return;
    popup.style.display = "none";
  });

  page.addEventListener("input", (event) => {
    if (event.target.id === "sarpras-master-search") {
      filterMasterTable(event.target.value);
    }
    if (event.target.id === "sarpras-activity-search") {
      invActivitySearch = event.target.value;
      invActivityCurrentPage = 1;
      refreshInventorySubpages(page);
    }
  });

  page.addEventListener("change", (event) => {
    if (event.target.id === "sarpras-master-import" && event.target.files.length > 0) {
      importMasterExcel(event.target.files[0]);
      event.target.value = "";
    }
    if (event.target.id === "sarpras-activity-pagesize") {
      invActivityPageSize = Number(event.target.value) || 20;
      invActivityCurrentPage = 1;
      refreshInventorySubpages(page);
    }
    if (event.target.matches("[data-sarpras-input='stock-card-item']")) {
      invStockCardCode = event.target.value;
      refreshInventorySubpages(page);
    }
  });

  /* ── Inventory: video scanner ── */
  page.addEventListener("click", async (event) => {
    if (event.target.id === "sarpras-video-scan-btn") {
      if (!window.Html5Qrcode) { inventoryToast("Scanner library not loaded."); return; }
      const area = document.getElementById("sarpras-video-scanner");
      if (!area) return;
      area.style.display = "";
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (!cameras || cameras.length === 0) { inventoryToast("No camera found."); return; }
        invVideoScanner = new Html5Qrcode("sarpras-video-viewport");
        await invVideoScanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 150 },
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE, Html5QrcodeSupportedFormats.EAN_13, Html5QrcodeSupportedFormats.EAN_8, Html5QrcodeSupportedFormats.CODE_128, Html5QrcodeSupportedFormats.CODE_39, Html5QrcodeSupportedFormats.UPC_A, Html5QrcodeSupportedFormats.UPC_E] },
          async (decodedText) => {
            if (invVideoScanner) {
              try { invVideoScanner.stop(); } catch (e) {}
              invVideoScanner = null;
              area.style.display = "none";
            }
            const q = decodedText.trim();
            if (!q) return;
            const state = ensureInventoryState();
            const match = state.items.find((row) => row[0].toLowerCase() === q.toLowerCase() || row[1].toLowerCase().includes(q.toLowerCase()));
            if (match) {
              invCurrentOrder.push({ code: match[0], name: match[1], qty: 1 });
              refreshInventorySubpages(page);
            } else {
              inventoryToast("✗ Item not found: " + q);
            }
          },
          () => {}
        );
      } catch (err) {
        inventoryToast("Camera error: " + err.message);
        area.style.display = "none";
      }
      return;
    }
    if (event.target.id === "sarpras-video-stop") {
      if (invVideoScanner) {
        try { invVideoScanner.stop(); } catch (e) {}
        invVideoScanner = null;
      }
      const area = document.getElementById("sarpras-video-scanner");
      if (area) area.style.display = "none";
      return;
    }
  });

  /* ── Inventory: live search dropdown ── */
  let invSearchTimer = null;
  function hideInvSearchResults(resultsEl) {
    if (resultsEl) resultsEl.style.display = "none";
  }
  function doInventoryItemSearch(q, resultsEl) {
    if (!q) { hideInvSearchResults(resultsEl); return; }
    resultsEl.innerHTML = '<div style="padding:0.5rem;color:var(--muted);font-size:0.78rem">Searching...</div>';
    resultsEl.style.display = "block";
    var sb = getInventorySupabaseClient();
    if (!sb) { resultsEl.innerHTML = '<div style="padding:0.5rem;color:var(--due-text);font-size:0.78rem">Not authenticated.</div>'; return; }
    sb.rpc("client_lookup_items", { search_query: q }).then(function (res) {
      if (res.error) { throw res.error; }
      var data = res.data;
      if (!data || !Array.isArray(data) || !data.length) {
        resultsEl.innerHTML = '<div style="padding:0.5rem;color:var(--muted);font-size:0.78rem">Tidak ditemukan.</div>';
        resultsEl.style.display = "block";
        return;
      }
      var html = "";
      for (var i = 0; i < data.length; i++) {
        var it = data[i];
        html += '<div class="sarpras-inv-search-item" data-code="' + escapeHtml(it.item_code) + '" data-name="' + escapeHtml(it.name || "") + '" data-stock="' + it.stock + '" data-unit="' + escapeHtml(it.unit || "pcs") + '" style="padding:0.4rem 0.6rem;cursor:pointer;border-bottom:1px solid var(--line);font-size:0.82rem;display:flex;justify-content:space-between;gap:0.5rem">' +
          '<span><strong>' + escapeHtml(it.item_code) + '</strong> &mdash; ' + escapeHtml(it.name || "") + '</span>' +
          '<small style="color:var(--muted);white-space:nowrap">' + escapeHtml(it.unit || "pcs") + ' &middot; stok: ' + it.stock + '</small></div>';
      }
      resultsEl.innerHTML = html;
      resultsEl.style.display = "block";
    }).catch(function (err) {
      resultsEl.innerHTML = '<div style="padding:0.5rem;color:var(--due-text);font-size:0.78rem">Error: ' + escapeHtml(err.message || err) + '</div>';
      resultsEl.style.display = "block";
    });
  }

  page.addEventListener("input", function (e) {
    if (e.target.id === "sarpras-inv-search") {
      var results = document.getElementById("sarpras-inv-search-results");
      if (!results) return;
      var q = e.target.value.trim();
      if (!q) { results.style.display = "none"; return; }
      clearTimeout(invSearchTimer);
      invSearchTimer = setTimeout(function () { doInventoryItemSearch(q, results); }, 200);
    }
  });

  page.addEventListener("keyup", function (e) {
    if (e.target.id === "sarpras-inv-search") {
      var results = document.getElementById("sarpras-inv-search-results");
      if (!results) return;
      var q = e.target.value.trim();
      if (!q) { results.style.display = "none"; return; }
      clearTimeout(invSearchTimer);
      invSearchTimer = setTimeout(function () { doInventoryItemSearch(q, results); }, 200);
    }
  });

  page.addEventListener("focusin", function (e) {
    if (e.target.id === "sarpras-inv-search") {
      var results = document.getElementById("sarpras-inv-search-results");
      if (!results) return;
      var q = e.target.value.trim();
      if (q) { doInventoryItemSearch(q, results); }
    }
  });

  page.addEventListener("focusout", function (e) {
    if (e.target.id === "sarpras-inv-search") {
      var results = document.getElementById("sarpras-inv-search-results");
      if (!results) return;
      setTimeout(function () { results.style.display = "none"; }, 200);
    }
  });

  page.addEventListener("mousedown", function (e) {
    var item = e.target.closest(".sarpras-inv-search-item");
    if (!item) return;
    e.preventDefault();
    var code = item.dataset.code;
    var name = item.dataset.name;
    var stock = parseInt(item.dataset.stock) || 0;
    var input = document.getElementById("sarpras-inv-search");
    var results = document.getElementById("sarpras-inv-search-results");
    if (input) input.value = "";
    if (results) results.style.display = "none";
    invCurrentOrder.push({ code: code, name: name || code, qty: 1 });
    refreshInventorySubpages(page);
    setTimeout(function () {
      var scanner = document.getElementById("sarpras-scanner");
      if (scanner) scanner.focus();
    }, 0);
  });

  /* ── Inventory: add item on Enter ── */
  page.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const input = event.target.closest("[data-sarpras-input='inventory-item-input'], #sarpras-scanner");
      if (input) {
        event.preventDefault();
        const q = input.value.trim();
        input.value = "";
        const resultsEl = document.getElementById("sarpras-inv-search-results");
        if (resultsEl) resultsEl.style.display = "none";
        if (!q) return;
        const state = ensureInventoryState();
        const match = state.items.find((row) => row[0].toLowerCase() === q.toLowerCase() || row[1].toLowerCase().includes(q.toLowerCase()));
        if (match) {
          invCurrentOrder.push({ code: match[0], name: match[1], qty: 1 });
          refreshInventorySubpages(page);
          setTimeout(() => {
            const scanner = document.getElementById("sarpras-scanner");
            if (scanner) scanner.focus();
          }, 0);
        } else {
          inventoryToast("✗ Item tidak ditemukan. Silakan tambah dari tab Master Barang.");
          setTimeout(() => {
            const scanner = document.getElementById("sarpras-scanner");
            if (scanner) scanner.focus();
          }, 0);
        }
      }
    }
  });

  /* ── Inventory: token input change ── */
  page.addEventListener("input", (event) => {
    if (event.target.matches("[data-sarpras-input='inventory-token']")) {
      const datePart = datePrefix();
      const seq = event.target.value.replace(/\D/g, "").slice(-3).padStart(3, "0");
      event.target.value = datePart + seq;
      invToken = datePart + seq;
      saveInvTokenState();
    }
  });

  page.addEventListener("submit", (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    event.preventDefault();

    if (form.id === "sarpras-confirm-form") {
      const inputVal = form.querySelector("#sarpras-confirm-token-input")?.value.trim();
      if (inputVal === invToken.slice(-3)) {
        executeInventoryTransaction(page);
        form.reset();
        document.getElementById("sarpras-confirm-modal").style.display = "none";
      } else {
        inventoryToast("✗ Token salah. Silakan coba lagi.");
      }
      return;
    }

    if (form.dataset.sarprasForm === "master-item") {
      const formData = new FormData(form);
      const editIndex = parseInt(formData.get("edit_index") || "-1");
      const catCode = String(formData.get("category") || "").trim();
      const catName = (inventoryState.kategoriList.find(([c]) => c === catCode) || [])[1] || catCode;
      const newItem = [
        String(formData.get("item_code") || "").trim(),
        String(formData.get("item_name") || "").trim(),
        catName,
        String(formData.get("location") || "").trim(),
        String(formData.get("stock") || "0").trim(),
        nowStampWIB(),
        "0",
        String(formData.get("unit") || "pcs").trim()
      ];
      if (editIndex >= 0 && editIndex < inventoryState.items.length) {
        const oldFreq = inventoryState.items[editIndex][6] || "0";
        newItem[6] = oldFreq;
        inventoryState.items[editIndex] = newItem;
      } else {
        inventoryState.items.unshift(newItem);
      }
      inventorySyncState.master = "Perubahan master tersimpan di browser";
      persistInventoryStore();
      form.reset();
      form.elements["category"].disabled = false;
      form.elements["item_code"].readOnly = false;
      document.getElementById("sarpras-master-modal").style.display = "none";
      refreshInventorySubpages(page);
      filterMasterTable("");
    }

    if (form.dataset.sarprasForm === "master-supplier") {
      const formData = new FormData(form);
      inventoryState.suppliers.unshift([
        String(formData.get("supplier_name") || "").trim(),
        String(formData.get("supplier_pic") || "").trim(),
        String(formData.get("supplier_status") || "Aktif").trim()
      ]);
      inventorySyncState.master = "Perubahan supplier tersimpan di browser";
      persistInventoryStore();
      form.reset();
      refreshInventorySubpages(page);
    }

    if (form.dataset.sarprasForm === "master-chip") {
      const formData = new FormData(form);
      const collection = String(form.dataset.collection || "");
      const value = String(formData.get("value") || "").trim();
      if (value && Array.isArray(inventoryState[collection])) {
        inventoryState[collection].push(value);
        inventorySyncState.master = "Daftar master diperbarui di browser";
        persistInventoryStore();
        form.reset();
        refreshInventorySubpages(page);
      }
    }

    if (form.dataset.sarprasForm === "master-kategori") {
      const formData = new FormData(form);
      const code = String(formData.get("kategori_code") || "").trim().toUpperCase();
      const name = String(formData.get("kategori_name") || "").trim();
      if (code && name && !inventoryState.kategoriList.some(([c]) => c === code)) {
        inventoryState.kategoriList.push([code, name]);
        inventorySyncState.master = "Kategori baru tersimpan";
        persistInventoryStore();
        form.reset();
        document.getElementById("sarpras-kategori-modal").style.display = "none";
        refreshInventorySubpages(page);
        const catSelect = document.querySelector("#sarpras-master-form select[name='category']");
        if (catSelect) {
          const opt = document.createElement("option");
          opt.value = code;
          opt.textContent = code + " — " + name;
          catSelect.appendChild(opt);
          catSelect.value = code;
          catSelect.dispatchEvent(new Event("change"));
        }
      } else if (code && name) {
        inventoryToast("Kode kategori sudah ada");
      }
    }

    if (form.dataset.sarprasForm === "inventory-transaction") {
      const formData = new FormData(form);
      inventoryState.transactions.unshift([
        String(formData.get("transaction_no") || "").trim(),
        String(formData.get("transaction_type") || "").trim(),
        String(formData.get("transaction_date") || "").trim(),
        String(formData.get("location_route") || "").trim(),
        String(formData.get("qty_label") || "").trim(),
        String(formData.get("transaction_status") || "Draft").trim()
      ]);
      inventorySyncState.inventory = "Transaksi inventory tersimpan di browser";
      persistInventoryStore();
      form.reset();
      refreshInventorySubpages(page);
    }

    if (form.dataset.sarprasForm === "opname-session") {
      const formData = new FormData(form);
      inventoryState.opnames.unshift([
        String(formData.get("opname_no") || "").trim(),
        String(formData.get("opname_location") || "").trim(),
        String(formData.get("opname_date") || "").trim(),
        String(formData.get("opname_officer") || "").trim(),
        String(formData.get("opname_status") || "Draft").trim()
      ]);
      inventorySyncState.opname = "Sesi stock opname tersimpan di browser";
      persistInventoryStore();
      form.reset();
      refreshInventorySubpages(page);
    }

    if (form.dataset.sarprasForm === "opname-detail") {
      const formData = new FormData(form);
      inventoryState.discrepancies.unshift([
        String(formData.get("detail_item_name") || "").trim(),
        String(formData.get("detail_location_name") || "").trim(),
        String(formData.get("system_stock") || "").trim(),
        String(formData.get("physical_stock") || "").trim(),
        String(formData.get("variance_label") || "").trim(),
        String(formData.get("detail_notes") || "").trim()
      ]);
      inventorySyncState.opname = "Detail selisih tersimpan di browser";
      persistInventoryStore();
      form.reset();
      refreshInventorySubpages(page);
    }
  });
}

function refreshInventorySubpages(page) {
  const masterPage = page.querySelector("#inv-master");
  const inventoryPage = page.querySelector("#inv-inventory");
  const opnamePage = page.querySelector("#inv-opname");
  const overviewPage = page.querySelector("#inv-overview");
  const reportPage = page.querySelector("#inv-reports");
  const activityPage = page.querySelector("#inv-activity");
  if (overviewPage) buildInventoryOverview(overviewPage);
  if (masterPage) masterPage.innerHTML = buildInventoryMasterPage();
  if (inventoryPage) inventoryPage.innerHTML = buildInventoryOperationsPage();
  if (opnamePage) opnamePage.innerHTML = buildInventoryOpnamePage();
  if (activityPage) activityPage.innerHTML = buildInventoryActivityPage();
  if (reportPage) {
    reportPage.innerHTML = buildInventoryReportsPage();
  }
}

function inventoryToast(msg) {
  const el = document.getElementById("sarpras-toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(inventoryToast._t);
  inventoryToast._t = setTimeout(() => el.classList.remove("show"), 3400);
}

function inventoryLoading(show, text) {
  const el = document.getElementById("sarpras-loading");
  if (!el) return;
  if (show) {
    el.querySelector("span").textContent = text || "Memproses...";
    el.style.display = "grid";
  } else {
    el.style.display = "none";
  }
}

function executeInventoryTransaction(page) {
  loadInvTokenState();
  const state = ensureInventoryState();
  const type = invTransactionType;
  const typeLabel = type === "masuk" ? "Masuk" : "Keluar";
  const direction = type === "masuk" ? 1 : -1;
  const stamp = nowStampWIB();

  /* Capture snapshot of order before mutation */
  const orderSnapshot = invCurrentOrder.map((o) => ({ ...o }));
  const currentToken = invToken;

  /* Update stock & freq for each item in order */
  orderSnapshot.forEach((orderItem) => {
    const masterItem = state.items.find((row) => row[0] === orderItem.code);
    if (masterItem) {
      const newStock = (Number(masterItem[4]) || 0) + direction * orderItem.qty;
      masterItem[4] = String(Math.max(0, newStock));
      masterItem[6] = String((Number(masterItem[6]) || 0) + 1);
      masterItem[5] = stamp;
    }
  });

  /* Create transaction record */
  const petugas = window.authModule?.getRole?.() || window.schoolAuth?.role || "—";
  const totalQty = orderSnapshot.reduce((s, o) => s + o.qty, 0);
  const itemCount = new Set(orderSnapshot.map((o) => o.code)).size;
  const orderLen = orderSnapshot.length;
  const ordersJson = JSON.stringify(orderSnapshot.map((o) => ({ code: o.code, name: o.name, qty: o.qty })));
  state.transactions.unshift([
    currentToken, typeLabel, stamp, ordersJson, String(totalQty), String(itemCount), petugas, "Selesai"
  ]);

  persistInventoryStore();

  inventoryToast(`✓ ${typeLabel} — ${orderLen} item, ${totalQty} total qty`);
  window.auditLog?.("INSERT", "inventory", currentToken, null, { type: typeLabel, items: orderSnapshot, totalQty, petugas });

  /* Reset order immediately */
  invCurrentOrder = [];
  /* Increment token */
  const seq = (parseInt(invToken.slice(-3)) || 0) + 1;
  invToken = datePrefix() + String(seq > 999 ? 1 : seq).padStart(3, "0");
  saveInvTokenState();

  /* Re-render to clear order table */
  refreshInventorySubpages(page);

  /* Auto-save to Supabase with loading overlay */
  saveSingleTransactionToSupabase(page, currentToken, typeLabel, stamp, ordersJson, totalQty, itemCount, petugas);
}

async function saveSingleTransactionToSupabase(page, token, typeLabel, stamp, ordersJson, totalQty, itemCount, petugas) {
  const sb = getInventorySupabaseClient();
  if (!sb) {
    inventoryToast("⚠ Supabase tidak terhubung. Transaksi aman di browser. Klik Save to DB nanti.");
    inventorySyncState.inventory = "Supabase belum terhubung — transaksi tersimpan di browser saja";
    refreshInventorySubpages(page);
    return;
  }
  inventoryLoading(true, `Menyimpan transaksi ${typeLabel.toLowerCase()} ke database...`);
  try {
    const orders = JSON.parse(ordersJson);
    /* Atomic: call RPC — inserts transaction + updates stock in one DB transaction */
    const { data, error: rpcErr } = await sb.rpc("process_inventory_transaction", {
      p_token: token,
      p_type: typeLabel,
      p_date: stamp,
      p_items: orders,
      p_total_qty: totalQty,
      p_item_count: itemCount,
      p_petugas: petugas
    });
    if (rpcErr) throw rpcErr;

    inventoryLoading(false);
    inventorySyncState.inventory = `Transaksi ${typeLabel.toLowerCase()} tersimpan ke Supabase`;
    inventorySyncState.master = "Stok & frekuensi tersimpan ke Supabase";
    inventoryToast("✓ Transaksi + stok tersimpan ke database Supabase");
    invalidateOverviewCache();
    console.log("saveSingleTransaction: RPC ok", data);
  } catch (err) {
    inventoryLoading(false);
    inventoryToast("⚠ Gagal menyimpan ke database: " + err.message + ". Transaksi tetap aman di browser.");
    inventorySyncState.inventory = `Gagal simpan transaksi: ${err.message}`;
    console.error("saveSingleTransaction: RPC failed", err);
  }
  refreshInventorySubpages(page);
}

async function saveMasterToSupabase(page) {
  const sb = getInventorySupabaseClient();
  if (!sb) {
    inventoryToast("Supabase belum terhubung — data tetap aman di browser");
    inventorySyncState.master = "Supabase belum terhubung — data tetap aman di browser";
    refreshInventorySubpages(page);
    return;
  }
  inventoryLoading(true, "Menyimpan data ke database...");
  try {
    const items = inventoryState.items.map((row) => ({
      item_code: row[0], item_name: row[1], category: row[2], location: row[3],
      stock: Number(row[4]) || 0, timestamp: row[5] || null, freq: Number(row[6]) || 0, unit: row[7] || "pcs"
    }));
    const kategori = inventoryState.kategoriList.map(([code, name]) => ({ code, name }));
    const transactions = inventoryState.transactions.map((row) => ({
      token: row[0], type: row[1], date: row[2],
      items: typeof row[3] === "string" ? JSON.parse(row[3]) : row[3],
      total_qty: Number(row[4]) || 0, item_count: Number(row[5]) || 0,
      petugas: row[6] || "", status: row[7] || "Selesai"
    }));
    const { error } = await sb.rpc("bulk_save_inventory", {
      p_items: items, p_kategori: kategori, p_transactions: transactions
    });
    if (error) throw error;
    inventoryLoading(false);
    inventoryToast("✓ Semua data tersimpan ke database");
    inventorySyncState.master = "Master tersimpan ke Supabase (RPC)";
    inventorySyncState.inventory = "Transaksi tersimpan ke Supabase";
  } catch (error) {
    inventoryLoading(false);
    inventoryToast("✗ Gagal menyimpan: " + error.message);
    inventorySyncState.master = `Gagal simpan: ${error.message}`;
  }
  refreshInventorySubpages(page);
}

async function loadMasterFromSupabase(page) {
  const sb = getInventorySupabaseClient();
  if (!sb) {
    inventoryToast("Supabase belum terhubung — tampilkan data browser");
    inventorySyncState.master = "Supabase belum terhubung — tampilkan data browser";
    refreshInventorySubpages(page);
    return;
  }
  inventoryLoading(true, "Memuat data dari database...");
  try {
    const [itemsRes, kategoriRes, txRes] = await Promise.all([
      sb.from("sarpras_master_items").select("*").order("item_code"),
      sb.from("sarpras_kategori").select("*").order("code"),
      sb.from("sarpras_transactions").select("*").order("date", { ascending: false })
    ]);
    if (itemsRes.error) throw itemsRes.error;
    if (kategoriRes.error) throw kategoriRes.error;
    if (txRes.error) throw txRes.error;
    inventoryState.items = (itemsRes.data || []).map((row) => [row.item_code, row.item_name, row.category, row.location || "", String(row.stock ?? 0), row.timestamp || "", String(row.freq ?? 0), row.unit || "pcs"]);
    inventoryState.kategoriList = (kategoriRes.data || []).map((row) => [row.code, row.name]);
    inventoryState.transactions = (txRes.data || []).map((row) => [row.token, row.type, row.date, JSON.stringify(row.items || []), String(row.total_qty ?? 0), String(row.item_count ?? 0), row.petugas || "—", row.status || "Selesai"]);
    persistInventoryStore();
    inventoryLoading(false);
    inventoryToast(`✓ ${(itemsRes.data || []).length} item + ${(txRes.data || []).length} transaksi dimuat dari database`);
    inventorySyncState.master = "Master & transaksi dimuat dari Supabase";
    inventorySyncState.inventory = "Transaksi dimuat dari Supabase";
  } catch (error) {
    inventoryLoading(false);
    inventoryToast("✗ Gagal memuat: " + error.message);
    inventorySyncState.master = `Load Master gagal: ${error.message}`;
  }
  refreshInventorySubpages(page);
}

async function saveInventoryToSupabase(page) {
  const sb = getInventorySupabaseClient();
  if (!sb) {
    inventorySyncState.inventory = "Supabase belum terhubung — transaksi tetap tersimpan di browser";
    return;
  }
  inventoryLoading(true, "Menyimpan transaksi inventory ke database...");
  try {
    await sb.from("sarpras_transactions").upsert(
      inventoryState.transactions.map((row) => ({
        token: row[0], type: row[1], date: row[2], items: typeof row[3] === "string" ? JSON.parse(row[3]) : row[3], total_qty: Number(row[4]) || 0, item_count: Number(row[5]) || 0, petugas: row[7] || "", status: row[6] || "Selesai"
      })),
      { onConflict: "token" }
    );
    inventoryLoading(false);
    inventoryToast("✓ Transaksi inventory tersimpan ke database");
    inventorySyncState.inventory = "Transaksi inventory tersimpan ke Supabase (upsert)";
  } catch (error) {
    inventoryLoading(false);
    inventoryToast("✗ Gagal menyimpan transaksi: " + error.message);
    inventorySyncState.inventory = `Gagal simpan transaksi: ${error.message}`;
  }
  refreshInventorySubpages(page);
}

async function loadInventoryFromSupabase(page) {
  const sb = getInventorySupabaseClient();
  if (!sb) {
    inventoryToast("Supabase belum terhubung — tampilkan data browser");
    inventorySyncState.inventory = "Supabase belum terhubung — tampilkan data browser";
    refreshInventorySubpages(page);
    return;
  }
  inventoryLoading(true, "Memuat transaksi inventory dari database...");
  try {
    const { data, error } = await sb.from("sarpras_transactions").select("*").order("date", { ascending: false });
    if (error) throw error;
    inventoryState.transactions = (data || []).map((row) => [row.token, row.type, row.date, JSON.stringify(row.items || []), String(row.total_qty ?? 0), String(row.item_count ?? 0), row.petugas || "—", row.status || "Selesai"]);
    persistInventoryStore();
    inventoryLoading(false);
    inventoryToast(`✓ ${(data || []).length} transaksi dimuat dari database`);
    inventorySyncState.inventory = "Transaksi inventory dimuat dari Supabase";
  } catch (error) {
    inventoryLoading(false);
    inventoryToast("✗ Gagal memuat transaksi: " + error.message);
    inventorySyncState.inventory = `Load transaksi gagal: ${error.message}`;
  }
  refreshInventorySubpages(page);
}

async function saveOpnameToSupabase(page) {
  const sb = getInventorySupabaseClient();
  if (!sb) {
    inventoryToast("Supabase belum terhubung — data opname tetap tersimpan di browser");
    inventorySyncState.opname = "Supabase belum terhubung — data opname tetap tersimpan di browser";
    refreshInventorySubpages(page);
    return;
  }
  inventoryLoading(true, "Menyimpan stock opname ke database...");
  try {
    await sb.from("sarpras_stock_opnames").upsert(
      inventoryState.opnames.map((row) => ({
        opname_no: row[0], location_name: row[1], opname_date: row[2], officer_name: row[3], status: row[4]
      })),
      { onConflict: "opname_no" }
    );
    await sb.from("sarpras_stock_opname_details").upsert(
      inventoryState.discrepancies.map((row, index) => ({
        detail_key: `${row[0]}-${row[1]}-${index}`,
        item_name: row[0], location_name: row[1], system_stock: row[2], physical_stock: row[3], variance_label: row[4], notes: row[5]
      })),
      { onConflict: "detail_key" }
    );
    inventoryLoading(false);
    inventoryToast("✓ Stock opname tersimpan ke database");
    inventorySyncState.opname = "Stock opname tersimpan ke Supabase (upsert)";
  } catch (error) {
    inventoryLoading(false);
    inventoryToast("✗ Gagal menyimpan stock opname: " + error.message);
    inventorySyncState.opname = `Gagal simpan opname: ${error.message}`;
  }
  refreshInventorySubpages(page);
}

async function loadOpnameFromSupabase(page) {
  const sb = getInventorySupabaseClient();
  if (!sb) {
    inventoryToast("Supabase belum terhubung — tampilkan data browser");
    inventorySyncState.opname = "Supabase belum terhubung — tampilkan data browser";
    refreshInventorySubpages(page);
    return;
  }
  inventoryLoading(true, "Memuat stock opname dari database...");
  try {
    const [opnamesRes, detailsRes] = await Promise.all([
      sb.from("sarpras_stock_opnames").select("*").order("opname_date", { ascending: false }),
      sb.from("sarpras_stock_opname_details").select("*")
    ]);
    if (opnamesRes.error) throw opnamesRes.error;
    if (detailsRes.error) throw detailsRes.error;
    inventoryState.opnames = (opnamesRes.data || []).map((row) => [row.opname_no, row.location_name, row.opname_date, row.officer_name, row.status || "Draft"]);
    inventoryState.discrepancies = (detailsRes.data || []).map((row) => [row.item_name, row.location_name, row.system_stock, row.physical_stock, row.variance_label, row.notes || ""]);
    persistInventoryStore();
    inventoryLoading(false);
    inventoryToast(`✓ ${(opnamesRes.data || []).length} sesi opname dimuat dari database`);
    inventorySyncState.opname = "Stock opname dimuat dari Supabase";
  } catch (error) {
    inventoryLoading(false);
    inventoryToast("✗ Gagal memuat opname: " + error.message);
    inventorySyncState.opname = `Load opname gagal: ${error.message}`;
  }
  refreshInventorySubpages(page);
}

async function buildInventoryOverview(container) {
  container.innerHTML = `<div style="padding:2rem;text-align:center;color:var(--muted)">${t("invOverviewLoading") || "Loading..."}</div>`;
  try {
    const d = await refreshOverviewData();
    const isEmpty = !d.timeline.length && !d.topItems.length;
    const metricHtml = d.metrics.map((item) => {
      const clickAttr = (item.label === "invOverviewLowStock" || item.label === "invOverviewZeroStock") ? `data-metric="${item.label === "invOverviewLowStock" ? "low-stock" : "zero-stock"}"` : "";
      return `<article class="sarpras-metric sarpras-metric-${item.tone}" ${clickAttr}>
        <span>${t(item.label)}</span>
        <strong>${item.value}</strong>
      </article>`;
    }).join("");

    container.innerHTML = `
      <section class="sarpras-overview">
        <article class="sarpras-hero panel-card">
          <div>
            <p class="eyebrow">Sarpras workspace</p>
            <h2>${t("invTabOverview")}</h2>
            <span>${t("invOverviewNoData")}</span>
          </div>
          <div class="sarpras-hero-actions">
            <button type="button" class="primary-button" data-inv-target="inv-master">${t("invTabMaster")}</button>
            <button type="button" class="primary-button secondary" data-inv-target="inv-inventory">${t("invTabInventory")}</button>
            <button type="button" class="primary-button secondary" data-inv-target="inv-activity">${t("invTabActivity")}</button>
          </div>
        </article>

        <div class="sarpras-metric-grid">
          ${metricHtml}
        </div>

        <div class="sarpras-charts-grid">
          <section class="panel-card sarpras-chart-card">
            <div class="panel-heading">
              <h2>${t("invOverviewTransactionChart")}</h2>
              <span>${d.timeline.length ? d.timeline[0].label + " — " + d.timeline[d.timeline.length - 1].label : ""}</span>
            </div>
            <div class="sarpras-chart-wrap">
              ${isEmpty ? `<div class="sarpras-chart-empty">${t("invOverviewNoData")}</div>` : buildLineChartSVG(d.timeline, { lineColor: "var(--accent)", fillColor: "var(--accent)", width: 600, height: 220 })}
            </div>
          </section>

          <section class="panel-card sarpras-chart-card">
            <div class="panel-heading">
              <h2>${t("invOverviewTopItems")}</h2>
            </div>
            <div class="sarpras-chart-wrap">
              ${isEmpty ? `<div class="sarpras-chart-empty">${t("invOverviewNoData")}</div>` : buildBarChartSVG(d.topItems, { barColor: "var(--accent)", width: 260, height: 180 })}
            </div>
          </section>
        </div>

        <div class="sarpras-layout">
          <section class="table-panel sarpras-table-panel">
            <div class="panel-heading">
              <div>
                <h2>${t("invOverviewFreqRanking")}</h2>
              </div>
            </div>
            <div class="module-table-scroll">
              <table class="module-table sarpras-table" id="sarpras-overview-table">
                <thead>
                  <tr>
                    <th>${t("invOverviewRank")}</th>
                    <th>${t("invOverviewCode")}</th>
                    <th>${t("invOverviewName")}</th>
                    <th>${t("invOverviewCategory")}</th>
                    <th>${t("invOverviewFreq")}</th>
                  </tr>
                </thead>
                <tbody>
                  ${d.freqRanking.length ? d.freqRanking.map((row) => `
                    <tr>
                      <td data-label="${t("invOverviewRank")}"><strong>#${row.rank}</strong></td>
                      <td data-label="${t("invOverviewCode")}">${row.code}</td>
                      <td data-label="${t("invOverviewName")}">${row.name}</td>
                      <td data-label="${t("invOverviewCategory")}">${row.kategori}</td>
                      <td data-label="${t("invOverviewFreq")}"><b>${row.freq}</b></td>
                    </tr>
                  `).join("") : `
                    <tr><td colspan="5" style="text-align:center;color:var(--muted);padding:2rem">${t("invOverviewNoData")}</td></tr>
                  `}
                </tbody>
              </table>
            </div>
          </section>

          <aside class="sarpras-side-stack">
            <section class="panel-card sarpras-shortcuts-card">
              <div class="panel-heading">
                <h2>${t("invOverviewQuickActions")}</h2>
              </div>
              <div class="module-feature-list">
                <button type="button" data-inv-target="inv-master">${t("invTabMaster")}</button>
                <button type="button" data-inv-target="inv-inventory">${t("invTabInventory")}</button>
                <button type="button" data-inv-target="inv-activity">${t("invTabActivity")}</button>
                <button type="button" data-inv-target="inv-reports">${t("invTabReports")}</button>
                <button type="button" data-inv-target="inv-qrocr">${t("invTabQrcr")}</button>
              </div>
            </section>
          </aside>
        </div>
      </section>
      <div class="us-popup" id="inv-stock-popup" hidden>
        <div class="us-popup-card">
          <button class="us-popup-close" type="button" id="inv-popup-close">&times;</button>
          <h2 id="inv-popup-title"></h2>
          <p id="inv-popup-meta"></p>
          <pre id="inv-popup-list" style="white-space:pre-wrap;color:var(--text);font:inherit;line-height:1.7"></pre>
          <button class="us-copy" type="button" id="inv-popup-copy">Copy List</button>
        </div>
      </div>`;

    /* Attach metric click handler */
    const grid = container.querySelector(".sarpras-metric-grid");
    const popup = container.querySelector("#inv-stock-popup");
    const popupList = container.querySelector("#inv-popup-list");
    const popupTitle = container.querySelector("#inv-popup-title");
    const popupMeta = container.querySelector("#inv-popup-meta");
    const closeBtn = container.querySelector("#inv-popup-close");
    const copyBtn = container.querySelector("#inv-popup-copy");

    grid?.addEventListener("click", (e) => {
      const card = e.target.closest("[data-metric]");
      if (!card || !popup) return;
      const metric = card.dataset.metric;
      let items, title, meta;
      if (metric === "low-stock") {
        items = d.lowStockItems;
        title = t("invOverviewLowStock");
        meta = `${items.length} item${items.length !== 1 ? "s" : ""}`;
      } else if (metric === "zero-stock") {
        items = d.zeroStockItems;
        title = t("invOverviewZeroStock");
        meta = `${items.length} item${items.length !== 1 ? "s" : ""}`;
      } else return;
      const text = items.length ? items.map((r, i) => `${i + 1}. ${r[0]} — ${r[1]} (${r[2] || "—"}) — Stock: ${r[4]}`).join("\n") : "—";
      popupTitle.textContent = title;
      popupMeta.textContent = meta;
      popupList.textContent = text;
      popup.hidden = false;
    });

    /* Popup close handlers */
    function closePopup() {
      if (popup) popup.hidden = true;
      document.removeEventListener("keydown", onKeyDown);
    }
    function onKeyDown(e) {
      if (e.key === "Escape" && popup && !popup.hidden) closePopup();
    }
    closeBtn?.addEventListener("click", closePopup);
    popup?.addEventListener("click", (e) => { if (e.target === popup) closePopup(); });
    document.addEventListener("keydown", onKeyDown);

    /* Copy button */
    copyBtn?.addEventListener("click", () => {
      const txt = popupList?.textContent || "";
      if (navigator.clipboard) {
        navigator.clipboard.writeText(txt).then(() => inventoryToast("List copied."));
      } else {
        const ta = document.createElement("textarea");
        ta.value = txt;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        inventoryToast("List copied.");
      }
    });
  } catch (err) {
    container.innerHTML = `<div style="padding:2rem;text-align:center;color:var(--muted)">Error loading overview: ${err.message}</div>`;
    console.error("buildInventoryOverview:", err);
  }
}

function buildLineChartSVG(data, opts) {
  const w = opts.width || 600, h = opts.height || 220;
  const pad = { t: 20, r: 20, b: 30, l: 50 };
  const cw = w - pad.l - pad.r, ch = h - pad.t - pad.b;
  if (!data.length) return "";

  const values = data.map((d) => d.value);
  const maxV = Math.max(...values, 1);
  const niceMax = Math.ceil(maxV / 5) * 5 || 5;
  const ySteps = 5;
  const xMax = Math.max(data.length - 1, 1);

  const toX = (i) => pad.l + (i / xMax) * cw;
  const toY = (v) => pad.t + ch - (v / niceMax) * ch;

  const gridLines = [];
  for (let i = 0; i <= ySteps; i++) {
    const y = pad.t + (ch / ySteps) * i;
    const val = niceMax - (niceMax / ySteps) * i;
    gridLines.push(`<line x1="${pad.l}" y1="${y}" x2="${w - pad.r}" y2="${y}" stroke="var(--line)" stroke-width="1" opacity="0.3"/>`);
    gridLines.push(`<text x="${pad.l - 6}" y="${y + 4}" text-anchor="end" fill="var(--muted)" font-size="10">${val}</text>`);
  }

  const pts = data.map((d, i) => `${toX(i)},${toY(d.value)}`).join(" ");
  const polyline = `<polyline fill="none" stroke="${opts.lineColor || "var(--accent)"}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${pts}"/>`;

  const area = data.map((d, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(d.value)}`).join(" ") + ` L${toX(data.length - 1)},${pad.t + ch} L${pad.l},${pad.t + ch} Z`;
  const areaFill = `<path d="${area}" fill="${opts.fillColor || "var(--accent)"}" opacity="0.15"/>`;

  const xLabels = [];
  const labelStep = Math.max(1, Math.floor(data.length / 8));
  data.forEach((d, i) => {
    if (i % labelStep === 0 || i === data.length - 1) {
      const label = d.label.length > 7 ? d.label.slice(5) : d.label;
      xLabels.push(`<text x="${toX(i)}" y="${h - pad.b + 16}" text-anchor="${i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"}" fill="var(--muted)" font-size="9">${label}</text>`);
    }
  });

  return `<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;display:block" role="img" aria-label="Transaction volume chart">
    ${gridLines.join("")}
    ${areaFill}
    ${polyline}
    ${xLabels.join("")}
  </svg>`;
}

function buildBarChartSVG(items, opts) {
  const w = opts.width || 260, h = opts.height || 180;
  const pad = { t: 10, r: 10, b: 10, l: 10 };
  const barH = 34;
  const gap = 10;
  const totalH = items.length * (barH + gap) - gap;
  const svgH = Math.max(h, totalH + pad.t + pad.b);
  const cw = w - pad.l - pad.r;
  const maxFreq = Math.max(...items.map((i) => i.freq), 1);

  const bars = items.map((item, i) => {
    const y = pad.t + i * (barH + gap);
    const bw = (item.freq / maxFreq) * cw;
    return `
      <rect x="${pad.l}" y="${y}" width="${Math.max(bw, 4)}" height="${barH}" rx="4" fill="${opts.barColor || "var(--accent)"}" opacity="0.8"/>
      <text x="${pad.l + 6}" y="${y + barH / 2 + 4}" fill="#fff" font-size="11" font-weight="600">${item.name.length > 18 ? item.name.slice(0, 16) + "…" : item.name}</text>
      <text x="${pad.l + bw - 4}" y="${y + barH / 2 + 4}" text-anchor="end" fill="#fff" font-size="11" font-weight="700">${item.freq}</text>
    `;
  });

  return `<svg viewBox="0 0 ${w} ${svgH}" style="width:100%;height:auto;display:block" role="img" aria-label="Top items chart">
    ${bars.join("")}
  </svg>`;
}

function filterMasterTable(q) {
  const tbody = document.getElementById("sarpras-master-tbody");
  if (!tbody) return;
  const state = ensureInventoryState();
  const query = q.toLowerCase();
  const indexed = state.items.map((row, i) => ({ row, i }));
  const filtered = query ? indexed.filter(({ row }) => row.some((c) => String(c).toLowerCase().includes(query))) : indexed;
  const total = filtered.length;
  const pages = Math.ceil(total / masterPageSize) || 1;
  if (masterCurrentPage > pages) masterCurrentPage = pages;
  const start = (masterCurrentPage - 1) * masterPageSize;
  const page = filtered.slice(start, start + masterPageSize);
  tbody.innerHTML = page.length === 0
    ? `<tr><td colspan="9" style="text-align:center;color:var(--muted);padding:2rem">${t("invMasterEmpty")}</td></tr>`
    : page.map(({ row, i }) => `
      <tr>
        <td data-label="${t("invMasterCode")}"><strong>${escapeHtml(row[0])}</strong></td>
        <td data-label="${t("invMasterName")}">${escapeHtml(row[1])}</td>
        <td data-label="${t("invMasterCategory")}">${escapeHtml(row[2])}</td>
        <td data-label="${t("invMasterLocation")}">${escapeHtml(row[3])}</td>
        <td data-label="${t("invMasterStock")}">${row[4]}</td>
        <td data-label="${t("invMasterUnit")}"><small>${escapeHtml(row[7] || "pcs")}</small></td>
        <td data-label="${t("invMasterFreq")}" style="text-align:center;font-weight:600">${row[6] || "0"}</td>
        <td data-label="${t("invMasterTimestamp")}" style="white-space:nowrap;font-size:0.78rem;color:var(--muted)">${escapeHtml(row[5]) || "—"}</td>
        <td data-label="">
          <button type="button" class="action-button" data-sarpras-action="edit-item" data-index="${i}" title="${t("invMasterEdit")}">✎</button>
          <button type="button" class="action-button" data-sarpras-action="remove-item" data-index="${i}" title="${t("invMasterDelete")}" style="color:var(--due-text)">✕</button>
        </td>
      </tr>
    `).join("");
}

function exportMasterExcel() {
  const state = ensureInventoryState();
  const data = state.items.map((r) => ({ Kode: r[0], "Nama Barang": r[1], Kategori: r[2], Location: r[3], Stock: r[4], Unit: r[7] || "pcs", "Time Stamp": r[5] || "", Frekuensi: r[6] || "0" }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Master Barang");
  XLSX.writeFile(wb, "master-barang.xlsx");
}

function downloadMasterTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([["Kode", "Nama Barang", "Kategori", "Location", "Stock", "Unit"]]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Master Barang");
  XLSX.writeFile(wb, "template-master-barang.xlsx");
}

function importMasterExcel(file) {
  inventoryLoading(true, "Membaca file Excel...");
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const wb = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      const state = ensureInventoryState();
      state.items = [];
      let count = 0;
      rows.forEach((r) => {
        const kode = String(r.Kode || "").trim();
        if (kode) { state.items.push([kode, String(r["Nama Barang"] || r.Nama_Barang || "").trim(), String(r.Kategori || "").trim(), String(r.Location || "").trim(), String(r.Stock ?? "0").trim(), String(r["Time Stamp"] || r.Time_Stamp || r.timestamp || nowStampWIB()).trim(), "0", String(r.Unit || "pcs").trim()]); count++; }
      });
      persistInventoryStore();
      inventoryLoading(false);
      inventoryToast(`✓ ${count} ${t("invMasterImportSuccess")}`);
      refreshInventorySubpages(document.querySelector("#inventory"));
    } catch (err) {
      inventoryLoading(false);
      inventoryToast(`✗ ${t("invMasterImportFail")}: ${err.message}`);
    }
  };
  reader.onerror = function () {
    inventoryLoading(false);
    inventoryToast(`✗ ${t("invMasterReadFail")}`);
  };
  reader.readAsArrayBuffer(file);
}

function exportActivityExcel() {
  const state = ensureInventoryState();
  if (state.transactions.length === 0) { inventoryToast(`✗ ${t("invMasterImportFail")}`); return; }
  const data = state.transactions.map((row) => {
    const items = (() => { try { return JSON.parse(row[3]); } catch { return []; } })();
    return {
      Token: row[0],
      Tipe: row[1],
      Tanggal: row[2],
      "Total Qty": Number(row[4]),
      "Jumlah Item": Number(row[5]),
      Petugas: row[7] || "—",
      Status: row[6],
      "Detail Barang": items.map((i) => `${i.code} ${i.name} (${i.qty})`).join("; ")
    };
  });
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "Riwayat");
  XLSX.writeFile(wb, "riwayat-transaksi-sarpras.xlsx");
  inventoryToast(`✓ ${data.length} ${t("invActExportDone")}`);
}

function exportReportExcel() {
  const data = buildReportData(invReportType, invReportYear, invReportMonth);
  const { rows, periods, type } = data;
  const aoa = [];

  const titleLabel = type === "bulanan"
    ? (t("invRepMonthly") + " " + new Date(2000, invReportMonth - 1, 1).toLocaleString("default", { month: "long" }) + " " + invReportYear)
    : type === "tahunan-3"
    ? t("invRepQuarterly") + " " + invReportYear
    : t("invRepTahapan") + " " + invReportYear;

  const spacer = Array.from({ length: 5 + periods.length * 2 + 3 }, () => "");
  aoa.push(spacer);
  aoa.push([titleLabel, ...spacer.slice(1)]);
  aoa.push(spacer);

  const h1 = [t("invRepNo"), t("invRepCategory"), t("invRepCode"), t("invRepName"), t("invRepStockAwal")];
  periods.forEach((p) => { h1.push(p.label, ""); });
  h1.push(t("invRepTotalMasuk"), t("invRepTotalKeluar"), t("invRepSisaStock"));
  aoa.push(h1);

  const h2 = Array.from({ length: 5 }, () => "");
  periods.forEach(() => { h2.push(t("invRepMasuk"), t("invRepKeluar")); });
  h2.push("", "", "");
  aoa.push(h2);

  rows.forEach((r) => {
    const row = [r.idx + 1, r.kategori, r.code, r.name, r.stockAwal];
    r.periodData.forEach((p) => row.push(p.masuk || 0, p.keluar || 0));
    row.push(r.totalMasuk, r.totalKeluar, r.sisaStock);
    aoa.push(row);
  });
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  const merges = [];
  let ci = 5;
  periods.forEach(() => { merges.push({ s: { r: 3, c: ci }, e: { r: 3, c: ci + 1 } }); ci += 2; });
  merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: h1.length - 1 } });
  if (merges.length) ws["!merges"] = merges;

  ws["!cols"] = [{ wch: 5 }, { wch: 14 }, { wch: 14 }, { wch: 24 }, { wch: 11 }];
  ws["!cols"].push(...periods.flatMap(() => [{ wch: 7 }, { wch: 7 }]));
  ws["!cols"].push({ wch: 11 }, { wch: 11 }, { wch: 11 });
  const wb = XLSX.utils.book_new();
  const sheetName = type === "bulanan" ? t("invRepMonthly") : type === "tahunan-3" ? t("invRepQuarterly") : t("invRepTahapan");
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `laporan-${type}-${invReportYear}-${String(invReportMonth).padStart(2, "0")}.xlsx`);
  inventoryToast(`✓ ${t("invActExportDone")}`);
}

function exportStockCardExcel(code) {
  const movements = getItemStockCard(code);
  const state = ensureInventoryState();
  const item = state.items.find((r) => r[0] === code);
  const itemName = item ? item[1] : code;
  const itemCategory = item ? item[2] : "";
  const itemUnit = item ? (item[7] || "pcs") : "pcs";
  const aoa = [
    ["KARTU STOCK BARANG"],
    [`Unit kerja   : SMA KRISTEN PETRA 5`],
    [`Jenis Barang : ${itemCategory}`],
    [`Nama barang  : ${itemName}`],
    [`Satuan       : ${itemUnit}`],
    [`Stok Awal    : ${movements.initialStock || 0}`],
    [],
    [t("invRepNo"), t("invRepDate"), t("invRepStock"), t("invRepIn"), t("invRepOut"), t("invRepBalance"), t("invRepToken"), t("invRepCardOf")]
  ];
  movements.forEach((m, i) => {
    aoa.push([i + 1, m.date.slice(0, 10), m.stockBefore, m.type === "Masuk" ? m.qty : 0, m.type === "Masuk" ? 0 : m.qty, m.actualBalance, m.token, m.officer]);
  });
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = [{ wch: 5 }, { wch: 14 }, { wch: 10 }, { wch: 8 }, { wch: 8 }, { wch: 10 }, { wch: 10 }, { wch: 14 }];
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, code);
  XLSX.writeFile(wb, `kartu-stok-${code}.xlsx`);
  inventoryToast(`✓ ${t("invActExportDone")}`);
}

function exportAllStockCardsExcel() {
  const state = ensureInventoryState();
  const items = state.items;
  const wb = XLSX.utils.book_new();
  items.forEach((row) => {
    const code = row[0];
    const movements = getItemStockCard(code);
    const itemName = row[1];
    const itemCategory = row[2];
    const itemUnit = row[7] || "pcs";
    const aoa = [
      ["KARTU STOCK BARANG"],
      [`Unit kerja   : SMA KRISTEN PETRA 5`],
      [`Jenis Barang : ${itemCategory}`],
      [`Nama barang  : ${itemName}`],
      [`Satuan       : ${itemUnit}`],
      [`Stok Awal    : ${movements.initialStock || 0}`],
      [],
      [t("invRepNo"), t("invRepDate"), t("invRepStock"), t("invRepIn"), t("invRepOut"), t("invRepBalance"), t("invRepToken"), t("invRepCardOf")]
    ];
    if (!movements.length) {
      aoa.push([t("invRepCardNoTx")]);
    } else {
      movements.forEach((m, i) => {
        aoa.push([i + 1, m.date.slice(0, 10), m.stockBefore, m.type === "Masuk" ? m.qty : 0, m.type === "Masuk" ? 0 : m.qty, m.actualBalance, m.token, m.officer]);
      });
    }
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = [{ wch: 5 }, { wch: 14 }, { wch: 10 }, { wch: 8 }, { wch: 8 }, { wch: 10 }, { wch: 10 }, { wch: 14 }];
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }];
    XLSX.utils.book_append_sheet(wb, ws, code.slice(0, 31));
  });
  XLSX.writeFile(wb, `kartu-stok-semua-barang.xlsx`);
  inventoryToast(`✓ ${t("invActExportDone")}`);
}

function buildInventoryMasterPage() {
  const state = ensureInventoryState();
  const query = document.getElementById("sarpras-master-search")?.value || "";
  const q = query.toLowerCase();
  const indexed = state.items.map((row, i) => ({ row, i }));
  const filtered = q ? indexed.filter(({ row }) => row.some((c) => String(c).toLowerCase().includes(q))) : indexed;
  const total = filtered.length;
  const pages = Math.ceil(total / masterPageSize) || 1;
  if (masterCurrentPage > pages) masterCurrentPage = pages;
  const start = (masterCurrentPage - 1) * masterPageSize;
  const page = filtered.slice(start, start + masterPageSize);

  const rows = page.length === 0
    ? `<tr><td colspan="9" style="text-align:center;color:var(--muted);padding:2rem">${t("invMasterEmpty")}</td></tr>`
    : page.map(({ row, i }) => `
      <tr>
        <td data-label="${t("invMasterCode")}"><strong>${escapeHtml(row[0])}</strong></td>
        <td data-label="${t("invMasterName")}">${escapeHtml(row[1])}</td>
        <td data-label="${t("invMasterCategory")}">${escapeHtml(row[2])}</td>
        <td data-label="${t("invMasterLocation")}">${escapeHtml(row[3])}</td>
        <td data-label="${t("invMasterStock")}">${row[4]}</td>
        <td data-label="${t("invMasterUnit")}"><small>${escapeHtml(row[7] || "pcs")}</small></td>
        <td data-label="${t("invMasterFreq")}" style="text-align:center;font-weight:600">${row[6] || "0"}</td>
        <td data-label="${t("invMasterTimestamp")}" style="white-space:nowrap;font-size:0.78rem;color:var(--muted)">${escapeHtml(row[5]) || "—"}</td>
        <td data-label="">
          <button type="button" class="action-button" data-sarpras-action="edit-item" data-index="${i}" title="${t("invMasterEdit")}">✎</button>
          <button type="button" class="action-button" data-sarpras-action="remove-item" data-index="${i}" title="${t("invMasterDelete")}" style="color:var(--due-text)">✕</button>
        </td>
      </tr>
    `).join("");

  const paginationHtml = `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:0.75rem 1rem;border-top:1px solid var(--line);font-size:0.82rem">
      <span style="color:var(--muted)">${total} ${t("invMasterData")}</span>
      <div style="display:flex;align-items:center;gap:0.75rem">
        <label style="display:flex;align-items:center;gap:0.4rem;color:var(--muted)">
          ${t("invMasterShow")}
          <select id="sarpras-master-pagesize" style="min-height:2rem;padding:0 0.5rem;border:1px solid var(--line);border-radius:0.4rem;color:var(--text);background:var(--surface-soft)">
            ${[10, 20, 50, 100, 1000].map(s => `<option value="${s}"${s === masterPageSize ? " selected" : ""}>${s}</option>`).join("")}
          </select>
        </label>
        <div style="display:flex;align-items:center;gap:0.25rem">
          <button type="button" class="action-button" id="sarpras-master-pageprev" ${masterCurrentPage <= 1 ? "disabled" : ""} style="padding:0.25rem 0.6rem">‹</button>
          <span style="white-space:nowrap;color:var(--muted)">${masterCurrentPage}/${pages}</span>
          <button type="button" class="action-button" id="sarpras-master-pagenext" ${masterCurrentPage >= pages ? "disabled" : ""} style="padding:0.25rem 0.6rem">›</button>
        </div>
      </div>
    </div>
  `;

  return `
    <section class="sarpras-overview">
      <div class="module-toolbar" style="margin-bottom:0.85rem;position:relative">
        <div class="module-search"><span>⌕</span><input id="sarpras-master-search" type="search" placeholder="${t("invMasterSearch")}" /></div>
        <button type="button" class="primary-button" data-sarpras-action="add-item-show">${t("invMasterAdd")}</button>
        <button type="button" class="primary-button secondary" data-sarpras-action="export-items">${t("invMasterExport")}</button>
        <button type="button" class="primary-button secondary" data-sarpras-action="import-show">${t("invMasterImport")}</button>
        <div style="width:1px;height:1.8rem;background:var(--line);margin:0 0.25rem"></div>
        <button type="button" class="primary-button secondary" data-sarpras-action="master-save" style="font-size:0.78rem">${t("invMasterSave")}</button>
        <button type="button" class="primary-button secondary" data-sarpras-action="master-load" style="font-size:0.78rem">${t("invMasterLoad")}</button>
        <div id="sarpras-import-popup" style="display:none;position:absolute;top:100%;right:0;z-index:60;min-width:13rem;margin-top:0.25rem;padding:0.5rem;border:1px solid var(--line);border-radius:0.75rem;background:var(--surface);box-shadow:var(--shadow)">
          <button type="button" class="primary-button" data-sarpras-action="import-template" style="width:100%;justify-content:flex-start;padding:0.6rem 0.85rem;border:none;border-radius:0.5rem;color:var(--text);background:transparent;cursor:pointer;font-size:0.82rem;text-align:left">↓ ${t("invMasterTemplate")}</button>
          <button type="button" class="primary-button" data-sarpras-action="import-upload" style="width:100%;justify-content:flex-start;padding:0.6rem 0.85rem;border:none;border-radius:0.5rem;color:var(--text);background:transparent;cursor:pointer;font-size:0.82rem;text-align:left">📂 ${t("invMasterUpload")}</button>
        </div>
        <input type="file" id="sarpras-master-import" accept=".xlsx,.xls" style="display:none" />
      </div>

      <div class="table-panel" style="padding:0;position:relative">
        <div class="responsive-table">
          <table class="module-table" id="sarpras-master-table">
            <thead>
              <tr>
                <th>${t("invMasterCode")}</th>
                <th>${t("invMasterName")}</th>
                <th>${t("invMasterCategory")}</th>
                <th>${t("invMasterLocation")}</th>
                <th>${t("invMasterStock")}</th>
                <th>${t("invMasterUnit")}</th>
                <th>${t("invMasterFreq")}</th>
                <th>${t("invMasterTimestamp")}</th>
                <th style="width:5rem">${t("invMasterActions")}</th>
              </tr>
            </thead>
            <tbody id="sarpras-master-tbody">
              ${rows}
            </tbody>
          </table>
        </div>
        ${paginationHtml}
        <div style="padding:0.5rem 1rem;border-top:1px solid var(--line);font-size:0.78rem;color:var(--muted);display:flex;align-items:center;gap:0.5rem">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${inventorySyncState.master.includes("Supabase") ? "var(--success,#22c55e)" : "var(--muted,#888)"}"></span>
          <span id="sarpras-master-sync-status">${inventorySyncState.master}</span>
        </div>
      </div>

      <div class="sarpras-master-modal" id="sarpras-master-modal" style="position:fixed;inset:0;z-index:70;display:none;place-items:center;padding:1rem;background:rgba(10,12,12,0.54)">
        <div style="position:relative;width:min(24rem,100%);padding:1.2rem;border:1px solid var(--line);border-radius:1.4rem;background:var(--surface);box-shadow:var(--shadow)">
          <button type="button" id="sarpras-master-modal-close" data-sarpras-action="master-modal-close" style="position:absolute;top:0.75rem;right:0.75rem;width:2rem;height:2rem;border:1px solid var(--line);border-radius:0.75rem;color:var(--text);background:var(--surface-soft);cursor:pointer">×</button>
          <h2 id="sarpras-master-modal-title" style="margin:0 0 0.5rem;font-size:1rem">${t("invMasterModalAdd")}</h2>
          <form id="sarpras-master-form" data-sarpras-form="master-item" style="display:grid;gap:0.6rem">
            <input type="hidden" name="edit_index" id="sarpras-edit-index" value="-1" />
            <label style="display:grid;gap:0.2rem;font-size:0.78rem;font-weight:700;color:var(--muted)">
              Kategori
              <div style="display:flex;gap:0.35rem">
                <select name="category" required style="flex:1;min-height:2.4rem;padding:0 0.6rem;border:1px solid var(--line);border-radius:0.45rem;color:var(--text);background:var(--surface-soft)">
                  <option value="">— Pilih —</option>
                  ${state.kategoriList.map(([code, name]) => `<option value="${code}">${code} — ${name}</option>`).join("")}
                </select>
                <button type="button" class="primary-button" data-sarpras-action="kategori-add-show" style="min-height:2.4rem;width:2.4rem;padding:0;border:1px solid var(--line);border-radius:0.5rem;color:var(--text);background:var(--surface-soft);cursor:pointer;font-size:1.1rem">+</button>
              </div>
            </label>
            <label style="display:grid;gap:0.2rem;font-size:0.78rem;font-weight:700;color:var(--muted)">
              Kode
              <input type="text" name="item_code" required style="min-height:2.4rem;padding:0 0.6rem;border:1px solid var(--line);border-radius:0.45rem;color:var(--text);background:var(--surface-soft)" />
            </label>
            <label style="display:grid;gap:0.2rem;font-size:0.78rem;font-weight:700;color:var(--muted)">
              Nama Barang
              <input type="text" name="item_name" required style="min-height:2.4rem;padding:0 0.6rem;border:1px solid var(--line);border-radius:0.45rem;color:var(--text);background:var(--surface-soft)" />
            </label>
            <label style="display:grid;gap:0.2rem;font-size:0.78rem;font-weight:700;color:var(--muted)">
              Location
              <input type="text" name="location" required style="min-height:2.4rem;padding:0 0.6rem;border:1px solid var(--line);border-radius:0.45rem;color:var(--text);background:var(--surface-soft)" />
            </label>
            <label style="display:grid;gap:0.2rem;font-size:0.78rem;font-weight:700;color:var(--muted)">
              Stock
              <input type="number" name="stock" min="0" value="0" required style="min-height:2.4rem;padding:0 0.6rem;border:1px solid var(--line);border-radius:0.45rem;color:var(--text);background:var(--surface-soft)" />
            </label>
            <label style="display:grid;gap:0.2rem;font-size:0.78rem;font-weight:700;color:var(--muted)">
              Unit
              <select name="unit" required style="min-height:2.4rem;padding:0 0.6rem;border:1px solid var(--line);border-radius:0.45rem;color:var(--text);background:var(--surface-soft)">
                <option value="pcs">pcs</option>
                <option value="lbr">lbr</option>
                <option value="box">box</option>
                <option value="sheet">sheet</option>
                <option value="pack">pack</option>
                <option value="set">set</option>
                <option value="roll">roll</option>
                <option value="meter">meter</option>
                <option value="liter">liter</option>
                <option value="kg">kg</option>
                <option value="tube">tube</option>
                <option value="bottle">bottle</option>
                <option value="rim">rim</option>
                <option value="bundle">bundle</option>
                <option value="dozen">dozen</option>
              </select>
            </label>
            <div style="display:flex;gap:0.5rem;margin-top:0.25rem">
              <button type="submit" class="primary-button" style="flex:1">Simpan</button>
              <button type="button" class="primary-button secondary" id="sarpras-master-modal-cancel">Batal</button>
            </div>
          </form>
        </div>
      </div>

      <div class="sarpras-master-modal" id="sarpras-kategori-modal" style="position:fixed;inset:0;z-index:71;display:none;place-items:center;padding:1rem;background:rgba(10,12,12,0.54)">
        <div style="position:relative;width:min(20rem,100%);padding:1.2rem;border:1px solid var(--line);border-radius:1.4rem;background:var(--surface);box-shadow:var(--shadow)">
          <button type="button" id="sarpras-kategori-modal-close" data-sarpras-action="kategori-modal-close" style="position:absolute;top:0.75rem;right:0.75rem;width:2rem;height:2rem;border:1px solid var(--line);border-radius:0.75rem;color:var(--text);background:var(--surface-soft);cursor:pointer">×</button>
          <h2 style="margin:0 0 0.5rem;font-size:1rem">Tambah Kategori</h2>
          <form id="sarpras-kategori-form" data-sarpras-form="master-kategori" style="display:grid;gap:0.6rem">
            <label style="display:grid;gap:0.2rem;font-size:0.78rem;font-weight:700;color:var(--muted)">
              Kode
              <input type="text" name="kategori_code" placeholder="e.g. MHP-BRG" required style="min-height:2.4rem;padding:0 0.6rem;border:1px solid var(--line);border-radius:0.45rem;color:var(--text);background:var(--surface-soft)" />
            </label>
            <label style="display:grid;gap:0.2rem;font-size:0.78rem;font-weight:700;color:var(--muted)">
              Nama Kategori
              <input type="text" name="kategori_name" placeholder="e.g. Bahan Bangunan" required style="min-height:2.4rem;padding:0 0.6rem;border:1px solid var(--line);border-radius:0.45rem;color:var(--text);background:var(--surface-soft)" />
            </label>
            <div style="display:flex;gap:0.5rem;margin-top:0.25rem">
              <button type="submit" class="primary-button" style="flex:1">Simpan</button>
              <button type="button" class="primary-button secondary" id="sarpras-kategori-modal-cancel">Batal</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  `;
}

function buildInventoryOperationsPage() {
  const type = invTransactionType;
  const state = ensureInventoryState();
  const orderRows = invCurrentOrder.length === 0
    ? `<tr><td colspan="3" style="text-align:center;color:var(--muted);padding:2rem">${t("invOpEmpty")}</td></tr>`
    : invCurrentOrder.map((item, i) => `
      <tr>
        <td><strong>${escapeHtml(item.code)}</strong><br><span style="font-size:0.82rem;color:var(--muted)">${escapeHtml(item.name)}</span></td>
        <td><input type="number" min="1" value="${item.qty}" style="width:4.5rem;min-height:2rem;padding:0 0.4rem;border:1px solid var(--line);border-radius:0.4rem;color:var(--text);background:var(--surface-soft)" data-sarpras-action="inventory-update-qty" data-index="${i}" /></td>
        <td><button type="button" class="action-button" data-sarpras-action="inventory-remove-order" data-index="${i}" title="${t("invOpRemove")}" style="color:var(--due-text)">✕</button></td>
      </tr>
    `).join("");
  const uniqueItems = new Set(invCurrentOrder.map(item => item.code)).size;
  const totalQty = invCurrentOrder.reduce((sum, item) => sum + item.qty, 0);
  const confirmLabel = type === "masuk" ? t("invOpTypeIn") : t("invOpTypeOut");
  /* Category breakdown */
  const catCount = {};
  invCurrentOrder.forEach((item) => {
    const master = state.items.find((row) => row[0] === item.code);
    const cat = master ? master[2] : "—";
    catCount[cat] = (catCount[cat] || 0) + item.qty;
  });
  const catRows = Object.entries(catCount)
    .map(([cat, qty]) => `<div style="display:flex;justify-content:space-between;font-size:0.82rem"><span>${cat}</span><strong>${qty}</strong></div>`)
    .join("");

  return `
    <section class="sarpras-overview">

      <div style="display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap;margin-bottom:0.85rem">
        <div style="display:flex;border:1px solid var(--line);border-radius:0.5rem;overflow:hidden">
          <button type="button" class="primary-button${type === "masuk" ? "" : " secondary"}" data-sarpras-action="set-transaction-type" data-value="masuk" style="border-radius:0;padding:0.45rem 1rem">📥 ${t("invOpTypeIn")}</button>
          <button type="button" class="primary-button${type === "keluar" ? "" : " secondary"}" data-sarpras-action="set-transaction-type" data-value="keluar" style="border-radius:0;padding:0.45rem 1rem">📤 ${t("invOpTypeOut")}</button>
        </div>
        <div style="display:flex;align-items:center;gap:0.4rem;margin-left:0.25rem">
          <span style="font-size:0.82rem;color:var(--muted);font-weight:600">${t("invOpToken")}</span>
          <input type="${invTokenVisible ? "text" : "password"}" maxlength="11" value="${invToken}" data-sarpras-input="inventory-token" style="width:9rem;min-height:2rem;padding:0 0.5rem;border:1px solid var(--line);border-radius:0.4rem;color:var(--text);background:var(--surface-soft);font-family:monospace;font-size:0.95rem;letter-spacing:0.1em;text-align:center" />
          <button type="button" class="action-button" data-sarpras-action="inventory-token-toggle" title="${invTokenVisible ? "Sembunyikan" : "Tampilkan"}">${invTokenVisible ? "🙈" : "👁"}</button>
          <span style="font-size:0.72rem;color:var(--muted)">(edit 3 digit terakhir)</span>
        </div>
        <div style="margin-left:auto;display:flex;gap:0.35rem">
          <button type="button" class="primary-button secondary" data-sarpras-action="inventory-save" style="font-size:0.72rem;padding:0.35rem 0.6rem">${t("invMasterSave")}</button>
          <button type="button" class="primary-button secondary" data-sarpras-action="inventory-load" style="font-size:0.72rem;padding:0.35rem 0.6rem">${t("invMasterLoad")}</button>
        </div>
      </div>

      <div class="sarpras-layout">
        <section class="table-panel" style="padding:0;position:relative">
          <div class="panel-heading" style="padding:0.65rem 1rem">
            <h2>${t("invOpOrderList")}</h2>
            <span id="sarpras-order-count">${invCurrentOrder.length} ${t("invActItem")}</span>
          </div>
          <div style="padding:0.6rem 1rem;border-bottom:1px solid var(--line);display:flex;gap:0.4rem;flex-wrap:wrap">
            <div style="position:relative;flex:1;min-width:10rem">
              <input type="text" id="sarpras-inv-search" data-sarpras-input="inventory-item-input" placeholder="${t("invOpSearch")}" autocomplete="off" style="width:100%;min-height:2.2rem;padding:0 0.6rem;border:1px solid var(--line);border-radius:0.4rem;color:var(--text);background:var(--surface-soft);font-size:0.9rem;box-sizing:border-box" />
              <div class="sarpras-inv-search-results" id="sarpras-inv-search-results" style="display:none;position:absolute;top:100%;left:0;right:0;background:var(--card-bg);border:1px solid var(--line);border-radius:0.3rem;max-height:14rem;overflow-y:auto;z-index:999;margin-top:2px;box-shadow:0 4px 12px rgba(0,0,0,0.15)"></div>
            </div>
            <button type="button" class="primary-button secondary" id="sarpras-video-scan-btn" style="padding:0 0.6rem;font-size:0.82rem">📷 Scan</button>
          </div>
          <div id="sarpras-video-scanner" style="display:none;padding:0.6rem 1rem;border-bottom:1px solid var(--line)">
            <div id="sarpras-video-viewport" style="width:100%;max-width:360px;margin:0 auto"></div>
            <button type="button" class="primary-button secondary" id="sarpras-video-stop" style="display:block;margin:0.4rem auto 0;padding:0.3rem 0.8rem;font-size:0.78rem">Stop Scanner</button>
          </div>
          <div class="module-table-scroll">
            <table class="module-table">
              <thead>
                <tr>
                  <th>${t("invActItems")}</th>
                  <th style="width:5.5rem">${t("invOpQty")}</th>
                  <th style="width:3rem"></th>
                </tr>
              </thead>
              <tbody id="sarpras-order-tbody">
                ${orderRows}
              </tbody>
            </table>
          </div>
        </section>

        <aside class="sarpras-side-stack" style="min-width:14rem">
          <section class="panel-card" style="display:grid;gap:0.65rem;position:sticky;top:1rem">
            <div style="display:grid;gap:0.25rem">
              <span style="font-size:0.78rem;color:var(--muted)">${t("invOpUnique")}</span>
              <strong id="sarpras-order-unique" style="font-size:1.2rem">${uniqueItems}</strong>
            </div>
            <div style="display:grid;gap:0.25rem">
              <span style="font-size:0.78rem;color:var(--muted)">${t("invOpTotal")}</span>
              <strong id="sarpras-order-total" style="font-size:1.2rem">${totalQty}</strong>
            </div>
            ${catRows ? `<div style="display:grid;gap:0.2rem;padding:0.5rem 0;border-top:1px solid var(--line)">${catRows}</div>` : ""}
            <div style="display:flex;gap:0.5rem">
              <button type="button" class="primary-button" data-sarpras-action="inventory-confirm" id="sarpras-confirm-btn" ${invCurrentOrder.length === 0 ? "disabled" : ""} style="flex:1">${confirmLabel}</button>
              <button type="button" class="primary-button secondary" data-sarpras-action="inventory-clear-order" ${invCurrentOrder.length === 0 ? "disabled" : ""}>${t("invOpClear")}</button>
            </div>
          </section>
        </aside>
      </div>
      <div style="padding:0.5rem 1rem;border-top:1px solid var(--line);font-size:0.78rem;color:var(--muted);display:flex;align-items:center;gap:0.5rem;margin-top:0.85rem">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${inventorySyncState.inventory.includes("Supabase") ? "var(--success,#22c55e)" : "var(--muted,#888)"}"></span>
        <span>${inventorySyncState.inventory}</span>
      </div>
    </section>

    <div id="sarpras-confirm-modal" style="position:fixed;inset:0;z-index:80;display:none;place-items:center;padding:1rem;background:rgba(10,12,12,0.54)">
      <div style="position:relative;width:min(20rem,100%);padding:1.2rem;border:1px solid var(--line);border-radius:1.4rem;background:var(--surface);box-shadow:var(--shadow)">
        <button type="button" id="sarpras-confirm-modal-close" style="position:absolute;top:0.75rem;right:0.75rem;width:2rem;height:2rem;border:1px solid var(--line);border-radius:0.75rem;color:var(--text);background:var(--surface-soft);cursor:pointer">×</button>
        <h2 style="margin:0 0 0.5rem;font-size:1rem">${t("invOpConfirmTitle").replace("{type}", type === "masuk" ? t("invOpTypeIn") : t("invOpTypeOut"))}</h2>
        <p style="margin:0 0 1rem;font-size:0.82rem;color:var(--muted)">${t("invOpTokenReEnter")} <strong style="font-family:monospace;letter-spacing:0.15em">${invToken}</strong> — masukkan <strong>3 digit terakhir</strong></p>
        <form id="sarpras-confirm-form" style="display:grid;gap:0.6rem">
          <input type="text" maxlength="3" placeholder="${invToken.slice(-3)}" required style="width:100%;min-height:2.4rem;padding:0 0.6rem;border:1px solid var(--line);border-radius:0.45rem;color:var(--text);background:var(--surface-soft);font-family:monospace;font-size:1.5rem;letter-spacing:0.3em;text-align:center" id="sarpras-confirm-token-input" />
          <button type="submit" class="primary-button">${t("invOpConfirm").replace("{type}", type === "masuk" ? t("invOpTypeIn") : t("invOpTypeOut"))}</button>
        </form>
      </div>
    </div>

    <input id="sarpras-scanner" type="text" style="position:fixed;left:-9999px;width:1px;height:1px;opacity:0" autocomplete="off" value="" />
  `;
}

function buildInventoryOpnamePage() {
  return `
    <section class="sarpras-overview">
      <article class="sarpras-hero panel-card">
        <div>
          <p class="eyebrow">Stock Opname</p>
          <h2>Audit stok per lokasi dan selisih fisik</h2>
          <span>Tab ini fokus ke sesi opname, detail stok sistem vs stok fisik, lalu otomatis menyiapkan penyesuaian stok saat sesi selesai.</span>
        </div>
        <div class="sarpras-hero-actions">
          <button type="button" class="primary-button">Buat opname</button>
          <button type="button" class="primary-button secondary">Cetak worksheet</button>
        </div>
      </article>

      <div class="sarpras-metric-grid">
        ${inventoryOpnameData.metrics.map((item) => `
          <article class="sarpras-metric sarpras-metric-${item.tone}">
            <span>${item.label}</span>
            <strong>${item.value}</strong>
          </article>
        `).join("")}
      </div>

      <div class="sarpras-layout">
        <section class="table-panel sarpras-table-panel sarpras-section-stack">
          <div class="panel-heading">
            <div>
              <h2>Sesi opname</h2>
              <span>Draft ke selesai, per lokasi</span>
            </div>
            <b class="sarpras-badge">Audit flow</b>
          </div>
          <div class="module-table-scroll">
            <table class="module-table sarpras-table">
              <thead>
                <tr>
                  <th>Nomor</th>
                  <th>Lokasi</th>
                  <th>Tanggal</th>
                  <th>Petugas</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${inventoryOpnameData.sessions.map((row) => `
                  <tr>
                    <td><strong>${escapeHtml(row[0])}</strong></td>
                    <td>${escapeHtml(row[1])}</td>
                    <td>${escapeHtml(row[2])}</td>
                    <td>${escapeHtml(row[3])}</td>
                    <td>${formatInventoryRecordState(row[4])}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>

          <div class="panel-heading">
            <div>
              <h2>Selisih terdeteksi</h2>
              <span>Dasar otomatis untuk penyesuaian stok</span>
            </div>
          </div>
          <div class="module-table-scroll">
            <table class="module-table sarpras-table">
              <thead>
                <tr>
                  <th>Barang</th>
                  <th>Lokasi</th>
                  <th>Sistem</th>
                  <th>Fisik</th>
                  <th>Selisih</th>
                  <th>Keterangan</th>
                </tr>
              </thead>
              <tbody>
                ${inventoryOpnameData.discrepancies.map((row) => `
                  <tr>
                    <td><strong>${escapeHtml(row[0])}</strong></td>
                    <td>${escapeHtml(row[1])}</td>
                    <td>${escapeHtml(row[2])}</td>
                    <td>${escapeHtml(row[3])}</td>
                    <td>${formatInventoryVariance(row[4])}</td>
                    <td>${escapeHtml(row[5])}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </section>

        <aside class="sarpras-side-stack">
          <section class="panel-card sarpras-activity-card">
            <div class="panel-heading">
              <h2>Checklist opname</h2>
              <span>Flow yang akan kita hidupkan</span>
            </div>
            <div class="sarpras-activity-list">
              <article class="sarpras-activity-item">
                <strong>Buat sesi per lokasi</strong>
                <span>Tanggal, lokasi, dan petugas jadi header opname.</span>
                <small>Status mulai dari Draft</small>
              </article>
              <article class="sarpras-activity-item">
                <strong>Bandingkan stok</strong>
                <span>Setiap barang punya stok sistem, stok fisik, selisih, dan catatan.</span>
                <small>Fokus ke akurasi gudang</small>
              </article>
              <article class="sarpras-activity-item">
                <strong>Generate penyesuaian</strong>
                <span>Saat selesai, selisih otomatis masuk sebagai transaksi penyesuaian stok.</span>
                <small>Tanpa approval tambahan</small>
              </article>
            </div>
          </section>
        </aside>
      </div>
    </section>
  `;
}

function buildInventoryActivityPage() {
  const state = ensureInventoryState();
  const filter = invActivityFilter;
  const query = invActivitySearch.toLowerCase().trim();

  /* Filter transactions */
  let filtered = state.transactions;
  if (filter === "masuk") filtered = filtered.filter((r) => r[1] === "Masuk");
  else if (filter === "keluar") filtered = filtered.filter((r) => r[1] === "Keluar");
  if (query) {
    filtered = filtered.filter((r) => r[0].toLowerCase().includes(query) || r[3].toLowerCase().includes(query));
  }

  const total = filtered.length;
  const pages = Math.ceil(total / invActivityPageSize) || 1;
  if (invActivityCurrentPage > pages) invActivityCurrentPage = pages;
  const start = (invActivityCurrentPage - 1) * invActivityPageSize;
  const pageData = filtered.slice(start, start + invActivityPageSize);

  const filterBtn = (val, label) =>
    `<button type="button" class="primary-button${filter === val ? "" : " secondary"}" data-sarpras-action="activity-filter" data-value="${val}" style="border-radius:0;padding:0.35rem 0.75rem;font-size:0.78rem">${label}</button>`;

  const inLabel = t("invActIn");
  const outLabel = t("invActOut");

  const rows = pageData.length === 0
    ? `<tr><td colspan="8" style="text-align:center;color:var(--muted);padding:2rem">${t("invActEmpty")}</td></tr>`
    : pageData.map((row, si) => {
        const globalIdx = state.transactions.indexOf(row);
        const items = (() => { try { return JSON.parse(row[3]); } catch { return []; } })();
        const itemsPreview = items.length > 0
          ? items.map((i) => ` ${i.code} (${i.qty})`).join(",")
          : row[3].slice(0, 60);
        const typeBadge = row[1] === "Masuk"
          ? `<span class="module-pill good">${inLabel}</span>`
          : `<span class="module-pill warn">${outLabel}</span>`;
        return `
      <tr data-tx-index="${globalIdx}" style="cursor:pointer">
        <td data-label="${t("invActToken")}"><strong>${escapeHtml(row[0])}</strong></td>
        <td data-label="${t("invActType")}">${typeBadge}</td>
        <td data-label="${t("invActDate")}" style="white-space:nowrap">${escapeHtml(row[2])}</td>
        <td data-label="${t("invActItems")}" style="max-width:18rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"><span class="tx-items-preview">${escapeHtml(itemsPreview)}</span> <span style="color:var(--muted);font-size:0.72rem">(${items.length} ${t("invActItem")})</span></td>
        <td data-label="${t("invActTotalQty")}">${row[4]}</td>
        <td data-label="${t("invActOfficer")}">${escapeHtml(row[6] || "—")}</td>
        <td data-label="${t("invActStatus")}">${formatInventoryRecordState(row[7] || "Selesai")}</td>
        <td data-label="">
          <button type="button" class="action-button" data-sarpras-action="toggle-tx-detail" data-index="${globalIdx}" title="${t("invActDetail")}" style="font-size:0.7rem;padding:0.15rem 0.35rem">▶</button>
          <button type="button" class="action-button" data-sarpras-action="remove-transaction" data-index="${globalIdx}" title="${t("invActConfirmDelete")}" style="color:var(--due-text);font-size:0.78rem;padding:0.15rem 0.35rem">✕</button>
        </td>
      </tr>
      <tr class="tx-detail-row" data-parent="${globalIdx}" style="display:none">
        <td colspan="8" style="padding:0">
          <div style="padding:0.5rem 1rem 0.75rem 2rem;background:var(--surface-soft);border-bottom:1px solid var(--line)">
            ${items.length === 0 ? `<span style="color:var(--muted)">${t("invActNoDetail")}</span>` : `
            <table style="width:100%;font-size:0.78rem;border-collapse:collapse">
              <thead>
                <tr style="color:var(--muted)">
                  <th style="text-align:left;padding:0.25rem 0.5rem;border-bottom:1px solid var(--line)">${t("invActCode")}</th>
                  <th style="text-align:left;padding:0.25rem 0.5rem;border-bottom:1px solid var(--line)">${t("invActItemName")}</th>
                  <th style="text-align:center;padding:0.25rem 0.5rem;border-bottom:1px solid var(--line)">${t("invActQty")}</th>
                </tr>
              </thead>
              <tbody>
                ${items.map((i) => `
                <tr>
                  <td style="padding:0.2rem 0.5rem"><strong>${i.code}</strong></td>
                  <td style="padding:0.2rem 0.5rem">${i.name}</td>
                  <td style="padding:0.2rem 0.5rem;text-align:center">${i.qty}</td>
                </tr>`).join("")}
              </tbody>
            </table>`}
          </div>
        </td>
      </tr>`;
      }).join("");

  const txLabel = total > 1 ? `${t("invActTransaction")}s` : t("invActTransaction");
  const paginationHtml = total > invActivityPageSize ? `
    <div style="padding:0.5rem 1rem;border-top:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;font-size:0.78rem">
      <div style="display:flex;align-items:center;gap:0.5rem">
        <span style="color:var(--muted)">${total} ${txLabel}</span>
        <select id="sarpras-activity-pagesize" style="padding:0.2rem 0.4rem;border:1px solid var(--line);border-radius:0.3rem;color:var(--text);background:var(--surface);font-size:0.78rem">
          ${[10, 20, 50, 100].map(s => `<option value="${s}"${s === invActivityPageSize ? " selected" : ""}>${s}</option>`).join("")}
        </select>
      </div>
      <div style="display:flex;align-items:center;gap:0.25rem">
        <button type="button" class="action-button" id="sarpras-activity-pageprev" ${invActivityCurrentPage <= 1 ? "disabled" : ""} style="padding:0.25rem 0.6rem">‹</button>
        <span style="white-space:nowrap;color:var(--muted)">${invActivityCurrentPage}/${pages}</span>
        <button type="button" class="action-button" id="sarpras-activity-pagenext" ${invActivityCurrentPage >= pages ? "disabled" : ""} style="padding:0.25rem 0.6rem">›</button>
      </div>
    </div>` : `<div style="padding:0.5rem 1rem;border-top:1px solid var(--line);font-size:0.78rem;color:var(--muted)">${total} ${txLabel}</div>`;

  const syncIcon = inventorySyncState.inventory && inventorySyncState.inventory !== "Transaksi tersimpan di browser"
    ? `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#4ade80;margin-right:0.35rem"></span>`
    : `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--muted);margin-right:0.35rem"></span>`;

  const searchPlaceholder = t("invActSearch");
  const lblAll = t("invActAll");
  const lblExport = t("invActExport");
  const lblClear = t("invActClear");
  const syncBrowser = "Transaksi tersimpan di browser";

  return `
    <section class="sarpras-overview">
      <div class="module-toolbar" style="margin-bottom:0.85rem;flex-wrap:wrap;gap:0.5rem">
        <div class="module-search" style="flex:1;min-width:10rem"><span>⌕</span><input id="sarpras-activity-search" type="search" placeholder="${searchPlaceholder}" value="${invActivitySearch.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}" /></div>
        <div style="display:flex;gap:0.15rem">${filterBtn("semua", lblAll)}${filterBtn("masuk", t("invActIn"))}${filterBtn("keluar", t("invActOut"))}</div>
        <div style="display:flex;gap:0.35rem">
          <button type="button" class="primary-button secondary" data-sarpras-action="inventory-load" style="font-size:0.78rem;padding:0.35rem 0.75rem">Load DB</button>
          <button type="button" class="primary-button secondary" data-sarpras-action="activity-export" style="font-size:0.78rem;padding:0.35rem 0.75rem">${lblExport}</button>
          <button type="button" class="primary-button secondary" data-sarpras-action="activity-clear" style="font-size:0.78rem;padding:0.35rem 0.75rem;color:var(--due-text)">${lblClear}</button>
        </div>
      </div>
      <div class="table-panel" style="padding:0;position:relative">
        <div class="responsive-table">
          <table class="module-table" id="sarpras-activity-table">
            <thead>
              <tr>
                <th>${t("invActToken")}</th>
                <th>${t("invActType")}</th>
                <th>${t("invActDate")}</th>
                <th>${t("invActItems")}</th>
                <th>${t("invActTotalQty")}</th>
                <th>${t("invActOfficer")}</th>
                <th>${t("invActStatus")}</th>
                <th style="width:3.5rem">${t("invActDetail")}</th>
              </tr>
            </thead>
            <tbody id="sarpras-activity-tbody">
              ${rows}
            </tbody>
          </table>
        </div>
        ${paginationHtml}
        <div style="padding:0.5rem 1rem;border-top:1px solid var(--line);font-size:0.78rem;color:var(--muted);display:flex;align-items:center;gap:0.5rem">
          ${syncIcon}
          <span>${inventorySyncState.inventory || syncBrowser}</span>
        </div>
      </div>
    </section>
  `;
}

function buildInventoryPlaceholderPage(title, description, bullets) {
  return `
    <section class="sarpras-overview">
      <article class="sarpras-hero panel-card">
        <div>
          <p class="eyebrow">${title}</p>
          <h2>${title}</h2>
          <span>${description}</span>
        </div>
      </article>
      <section class="panel-card sarpras-activity-card">
        <div class="panel-heading">
          <h2>Scope inti</h2>
          <span>Sudah disiapkan di struktur tab</span>
        </div>
        <div class="sarpras-master-list">
          ${bullets.map((item) => `
            <article class="sarpras-master-item">
              <div>
                <strong>${item}</strong>
                <small>Siap kita bangun di slice berikutnya</small>
              </div>
            </article>
          `).join("")}
        </div>
      </section>
    </section>
  `;
}

let invReportType = "bulanan";
let invReportYear = new Date().getFullYear();
let invReportMonth = new Date().getMonth() + 1;
let invReportSubTab = "ledger";
let invStockCardCode = "";

function getItemStockCard(code) {
  const state = ensureInventoryState();
  const item = state.items.find((r) => r[0] === code);
  const currentStock = item ? Number(item[4]) || 0 : 0;
  const allTxs = state.transactions;
  const movements = [];
  allTxs.forEach((tx) => {
    const type = tx[1];
    const date = tx[2];
    const token = tx[0];
    const officer = tx[6] || "—";
    let orders;
    try { orders = JSON.parse(tx[3]); } catch { orders = []; }
    let qty = 0;
    orders.forEach((o) => { if (o.code === code) qty += Number(o.qty) || 0; });
    if (qty > 0) movements.push({ date, type, qty, token, officer });
  });
  movements.sort((a, b) => a.date.localeCompare(b.date));
  let balance = 0;
  movements.forEach((m) => {
    if (m.type === "Masuk") balance += m.qty;
    else balance -= m.qty;
    m.balance = balance;
  });
  const txFinalBalance = movements.length > 0 ? movements[movements.length - 1].balance : 0;
  const initialStock = Math.max(0, currentStock - txFinalBalance);
  let running = initialStock;
  movements.forEach((m) => {
    m.stockBefore = running;
    if (m.type === "Masuk") running += m.qty;
    else running -= m.qty;
    m.actualBalance = running;
  });
  movements.initialStock = initialStock;
  return movements;
}

function getDaysInMonth(y, m) {
  return new Date(y, m, 0).getDate();
}

function buildReportData(type, year, month) {
  const state = ensureInventoryState();
  const items = state.items;
  const allTxs = state.transactions;
  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth() + 1;
  const curDay = now.getDate();

  /* Parse all transactions into item-level movements */
  function expandTransactions(txList) {
    const movements = [];
    txList.forEach((tx) => {
      const t = tx[1];
      const dt = tx[2].slice(0, 10);
      let orders;
      try { orders = JSON.parse(tx[3]); } catch { orders = []; }
      orders.forEach((o) => {
        movements.push({ code: o.code, name: o.name, qty: Number(o.qty) || 0, type: t, date: dt });
      });
    });
    return movements;
  }

  const allMovements = expandTransactions(allTxs);

  function sumMovementsInRange(code, startDate, endDate) {
    let masuk = 0, keluar = 0;
    allMovements.forEach((m) => {
      if (m.code !== code) return;
      if (m.date >= startDate && m.date <= endDate) {
        if (m.type === "Masuk") masuk += m.qty;
        else keluar += m.qty;
      }
    });
    return { masuk, keluar };
  }

  function getStockBefore(code, beforeDate) {
    let net = 0;
    allMovements.forEach((m) => {
      if (m.code !== code) return;
      if (m.date < beforeDate) {
        if (m.type === "Masuk") net += m.qty;
        else net -= m.qty;
      }
    });
    return net;
  }

  const isMidMonth = curDay <= 15 && curMonth === month && curYear === year;

  /* Build period structure */
  let periods = [];
  if (type === "bulanan") {
    const days = getDaysInMonth(year, month);
    for (let d = 1; d <= days; d++) {
      periods.push({ key: `day-${d}`, label: String(d), start: `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`, end: `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}` });
    }
  } else if (type === "tahunan-3") {
    for (let i = 0; i < 3; i++) {
      const m = month + i;
      const y = year + Math.floor((m - 1) / 12);
      const mm = ((m - 1) % 12) + 1;
      const monthName = new Date(y, mm - 1, 1).toLocaleString("default", { month: "short" });
      const days = getDaysInMonth(y, mm);
      periods.push({ key: `month-${i}`, label: `${monthName} ${y}`, start: `${y}-${String(mm).padStart(2, "0")}-01`, end: `${y}-${String(mm).padStart(2, "0")}-${String(days).padStart(2, "0")}` });
    }
  } else if (type === "tahapan") {
    periods.push({ key: "tahap1", label: t("invRepTahapan1"), start: `${year}-01-01`, end: `${year}-06-30` });
    periods.push({ key: "tahap2", label: t("invRepTahapan2"), start: `${year}-07-01`, end: `${year}-12-31` });
  }

  const periodStart = periods[0].start;
  const periodEnd = periods[periods.length - 1].end;
  const afterStart = periods.length ? periods[0].start : "";
  const afterEnd = "9999-12-31";

  /* Compute report rows */
  const rows = items.map((row, idx) => {
    const code = row[0];
    const name = row[1];
    const kategori = row[2] || "—";
    const currentStock = Number(row[4]) || 0;

    /* Stock Awal = current stock - net change during & after period */
    const netDuring = sumMovementsInRange(code, periodStart, "9999-12-31");
    const stockAwal = currentStock - netDuring.masuk + netDuring.keluar;

    const periodData = periods.map((p) => sumMovementsInRange(code, p.start, p.end));
    const totalMasuk = periodData.reduce((s, p) => s + p.masuk, 0);
    const totalKeluar = periodData.reduce((s, p) => s + p.keluar, 0);
    const sisaStock = stockAwal + totalMasuk - totalKeluar;

    return { idx, code, name, kategori, stockAwal, periodData, totalMasuk, totalKeluar, sisaStock };
  });

  return { rows, periods, type, year, month };
}

function renderReportTable(data) {
  const { rows, periods, type } = data;

  let html = `<div class="sarpras-report-scroll"><table class="module-table sarpras-report-table" style="min-width:${periods.length > 6 ? "180rem" : "max-content"}">`;
  html += `<thead><tr>
    <th rowspan="2" class="rep-sticky" data-sticky="0">${t("invRepNo")}</th>
    <th rowspan="2" class="rep-sticky" data-sticky="1">${t("invRepCategory")}</th>
    <th rowspan="2" class="rep-sticky" data-sticky="2">${t("invRepCode")}</th>
    <th rowspan="2" class="rep-sticky" data-sticky="3">${t("invRepName")}</th>
    <th rowspan="2" class="rep-sticky" data-sticky="4">${t("invRepStockAwal")}</th>`;

  periods.forEach((p) => {
    html += `<th colspan="2" class="rep-period-header">${p.label}</th>`;
  });

  html += `<th rowspan="2">${t("invRepTotalMasuk")}</th>
    <th rowspan="2">${t("invRepTotalKeluar")}</th>
    <th rowspan="2">${t("invRepSisaStock")}</th>
  </tr><tr>`;
  periods.forEach(() => {
    html += `<th class="rep-sub">${t("invRepMasuk")}</th><th class="rep-sub">${t("invRepKeluar")}</th>`;
  });
  html += `</tr></thead><tbody>`;

  rows.forEach((r) => {
    html += `<tr>
      <td class="rep-sticky" data-sticky="0">${r.idx + 1}</td>
      <td class="rep-sticky" data-sticky="1">${r.kategori}</td>
      <td class="rep-sticky" data-sticky="2"><strong>${r.code}</strong></td>
      <td class="rep-sticky" data-sticky="3">${r.name}</td>
      <td class="rep-sticky" data-sticky="4"><strong>${r.stockAwal}</strong></td>`;
    r.periodData.forEach((p) => {
      html += `<td class="rep-masuk">${p.masuk || ""}</td><td class="rep-keluar">${p.keluar || ""}</td>`;
    });
    html += `<td><strong>${r.totalMasuk}</strong></td>
      <td><strong>${r.totalKeluar}</strong></td>
      <td><strong>${r.sisaStock}</strong></td>
    </tr>`;
  });

  html += `</tbody></table></div>`;
  return html;
}

function renderStockCardTable(movements, code) {
  const state = ensureInventoryState();
  const item = state.items.find((r) => r[0] === code);
  const currentStock = item ? Number(item[4]) || 0 : 0;
  const itemName = item ? item[1] : code;
  const initialStock = movements.initialStock || 0;

  let html = `<div class="sarpras-card-header"><strong>${code} — ${itemName}</strong> &bull; ${t("invRepCurrentStock")}: <b>${currentStock}</b></div>`;
  html += `<div class="sarpras-card-header" style="font-size:0.82rem;margin-top:-0.4rem">${t("invRepStockAwal")}: <b>${initialStock}</b></div>`;
  html += `<div class="sarpras-report-scroll" style="max-height:60vh"><table class="module-table sarpras-report-table" style="min-width:max-content">`;
  html += `<thead><tr>
    <th>${t("invRepNo")}</th>
    <th>${t("invRepDate")}</th>
    <th>${t("invRepStock")}</th>
    <th>${t("invRepIn")}</th>
    <th>${t("invRepOut")}</th>
    <th>${t("invRepBalance")}</th>
    <th>${t("invRepToken")}</th>
    <th>${t("invRepCardOf")}</th>
  </tr></thead><tbody>`;

  if (!movements.length) {
    html += `<tr><td colspan="8" style="text-align:center;padding:2rem;color:var(--muted)">${t("invRepCardNoTx")}</td></tr>`;
  } else {
    movements.forEach((m, i) => {
      const isIn = m.type === "Masuk";
      html += `<tr>
        <td>${i + 1}</td>
        <td>${m.date.slice(0, 10)}</td>
        <td><strong>${m.stockBefore}</strong></td>
        <td class="rep-masuk">${isIn ? m.qty : ""}</td>
        <td class="rep-keluar">${isIn ? "" : m.qty}</td>
        <td><strong>${m.actualBalance}</strong></td>
        <td style="font-family:monospace">${m.token}</td>
        <td>${m.officer}</td>
      </tr>`;
    });
  }

  html += `</tbody></table></div>`;
  return html;
}

/* ─── Client Approval Page ─── */
function buildInventoryClientPage() {
  return `
    <div class="sarpras-section-header">
      <h3>Client Transactions</h3>
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
        <button type="button" class="primary-button" data-sarpras-action="client-refresh">&#x21bb; Refresh</button>
        <button type="button" class="primary-button" data-sarpras-action="client-approve-all">&#x2714; Approve All Pending</button>
      </div>
    </div>
    <div class="module-table-scroll" style="margin-top:0.75rem">
      <table class="module-table sarpras-table" id="client-tx-table">
        <thead>
          <tr>
            <th>Token</th>
            <th>Items</th>
            <th>Total Qty</th>
            <th>Petugas</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="client-tx-body">
          <tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--muted)">Loading...</td></tr>
        </tbody>
      </table>
    </div>
  `;
}

async function loadClientTransactionsTable() {
  const tbody = document.getElementById("client-tx-body");
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--muted)">Loading...</td></tr>';
  try {
    const sb = getInventorySupabaseClient();
    if (!sb) { tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--error)">Supabase not connected</td></tr>'; return; }
    const { data, error } = await sb
      .from("client_transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--muted)">No transactions found.</td></tr>';
      return;
    }
    tbody.innerHTML = data.map(tx => {
      const items = Array.isArray(tx.items) ? tx.items : [];
      const summary = items.map(i => `${i.name || i.code} x${i.qty}`).join(", ");
      const isPending = tx.status === "pending";
      const statusBadge = tx.status === "approved" ? `<span style="color:var(--success-text)">&#9989; Approved</span>`
        : tx.status === "rejected" ? `<span style="color:var(--due-text)">&#10060; Rejected</span>`
        : `<span style="color:var(--warning-text)">&#9203; Pending</span>`;
      return `<tr>
        <td><strong>${escapeHtml(tx.token)}</strong></td>
        <td style="font-size:0.82rem">${escapeHtml(summary)}</td>
        <td style="text-align:center">${tx.total_qty}</td>
        <td>${escapeHtml(tx.petugas)}</td>
        <td>${statusBadge}</td>
        <td style="white-space:nowrap;font-size:0.78rem;color:var(--muted)">${tx.created_at ? new Date(tx.created_at).toLocaleString() : "—"}</td>
        <td>${isPending ? `
          <button type="button" class="action-button" data-sarpras-action="client-approve" data-token="${escapeHtml(tx.token)}" title="Approve" style="color:var(--success-text)">&#x2714;</button>
          <button type="button" class="action-button" data-sarpras-action="client-reject" data-token="${escapeHtml(tx.token)}" title="Reject" style="color:var(--warning-text)">&#x2718;</button>
          <button type="button" class="action-button" data-sarpras-action="client-delete" data-token="${escapeHtml(tx.token)}" title="Delete" style="color:var(--due-text)">&#x1F5D1;</button>
        ` : `<span style="color:var(--muted);font-size:0.78rem">—</span>`}</td>
      </tr>`;
    }).join("");
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--due-text)">Error: ${escapeHtml(e.message)}</td></tr>`;
  }
}

async function handleClientApprove(token) {
  const sb = getInventorySupabaseClient();
  if (!sb) return;
  try {
    const { data, error } = await sb.rpc("approve_client_transaction", { p_token: token });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    inventoryToast("Approved: " + token);
    loadClientTransactionsTable();
  } catch (e) {
    inventoryToast("Approve error: " + e.message);
  }
}

async function handleClientReject(token) {
  const sb = getInventorySupabaseClient();
  if (!sb) return;
  try {
    const { data, error } = await sb.rpc("reject_client_transaction", { p_token: token });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    inventoryToast("Rejected: " + token);
    loadClientTransactionsTable();
  } catch (e) {
    inventoryToast("Reject error: " + e.message);
  }
}

async function handleClientDelete(token) {
  if (!confirm("Delete transaction " + token + "?")) return;
  const sb = getInventorySupabaseClient();
  if (!sb) return;
  try {
    const { error } = await sb.from("client_transactions").delete().eq("token", token);
    if (error) throw error;
    inventoryToast("Deleted: " + token);
    loadClientTransactionsTable();
  } catch (e) {
    inventoryToast("Delete error: " + e.message);
  }
}

function buildInventoryReportsPage() {
  const isCards = invReportSubTab === "cards";
  const state = ensureInventoryState();
  const allItems = state.items;

  if (isCards) {
    const movements = invStockCardCode ? getItemStockCard(invStockCardCode) : [];
    return `
      <section class="sarpras-overview">
        <article class="panel-card" style="padding:1rem 1.5rem">
          <div class="sarpras-report-controls" style="margin-top:0">
            <button type="button" class="primary-button${!isCards ? "" : " secondary"}" data-sarpras-action="report-set-subtab" data-value="ledger">${t("invRepLedger")}</button>
            <button type="button" class="primary-button${isCards ? "" : " secondary"}" data-sarpras-action="report-set-subtab" data-value="cards">${t("invRepCards")}</button>
            <span style="flex:1"></span>
            <select data-sarpras-input="stock-card-item" style="min-height:2.2rem;padding:0 0.5rem;border:1px solid var(--line);border-radius:0.4rem;color:var(--text);background:var(--surface-soft);min-width:16rem">
              <option value="">${t("invRepSelectItem")}</option>
              ${allItems.map((r) => `<option value="${r[0]}" ${r[0] === invStockCardCode ? "selected" : ""}>${r[0]} — ${r[1]}</option>`).join("")}
            </select>
            ${invStockCardCode ? `<button type="button" class="primary-button secondary" data-sarpras-action="report-export-card">${t("invRepExportCard")}</button>` : ""}
            <button type="button" class="primary-button secondary" data-sarpras-action="report-export-all-cards">${t("invRepExportAll")}</button>
          </div>
        </article>
        <section class="panel-card">
          ${invStockCardCode ? renderStockCardTable(movements, invStockCardCode) : `<div style="padding:2rem;text-align:center;color:var(--muted)">${t("invRepSelectItem")}</div>`}
        </section>
      </section>
    `;
  }

  const data = buildReportData(invReportType, invReportYear, invReportMonth);
  const { rows, periods, type } = data;
  const hasData = rows.some((r) => r.totalMasuk > 0 || r.totalKeluar > 0);

  return `
    <section class="sarpras-overview">
      <article class="panel-card" style="padding:1rem 1.5rem">
        <div class="sarpras-report-controls" style="margin-top:0">
          <button type="button" class="primary-button${!isCards ? "" : " secondary"}" data-sarpras-action="report-set-subtab" data-value="ledger">${t("invRepLedger")}</button>
          <button type="button" class="primary-button${isCards ? "" : " secondary"}" data-sarpras-action="report-set-subtab" data-value="cards">${t("invRepCards")}</button>
          <span style="flex:1"></span>
          <button type="button" class="primary-button${type === "bulanan" ? "" : " secondary"}" data-sarpras-action="report-set-type" data-value="bulanan">${t("invRepMonthly")}</button>
          <button type="button" class="primary-button${type === "tahunan-3" ? "" : " secondary"}" data-sarpras-action="report-set-type" data-value="tahunan-3">${t("invRepQuarterly")}</button>
          <button type="button" class="primary-button${type === "tahapan" ? "" : " secondary"}" data-sarpras-action="report-set-type" data-value="tahapan">${t("invRepTahapan")}</button>
          <span class="rep-period-picker">
            <select data-sarpras-input="report-month" style="min-height:2.2rem;padding:0 0.5rem;border:1px solid var(--line);border-radius:0.4rem;color:var(--text);background:var(--surface-soft)">
              ${type !== "tahapan" ? Array.from({length: 12}, (_, i) => `<option value="${i + 1}" ${i + 1 === invReportMonth ? "selected" : ""}>${new Date(2000, i, 1).toLocaleString("default", { month: "long" })}</option>`).join("") : `<option value="1">${t("invRepTahapan1")}</option>`}
            </select>
            <select data-sarpras-input="report-year" style="min-height:2.2rem;padding:0 0.5rem;border:1px solid var(--line);border-radius:0.4rem;color:var(--text);background:var(--surface-soft)">
              ${Array.from({length: 10}, (_, i) => { const y = new Date().getFullYear() - 5 + i; return `<option value="${y}" ${y === invReportYear ? "selected" : ""}>${y}</option>`; }).join("")}
            </select>
          </span>
          <button type="button" class="primary-button" data-sarpras-action="report-generate">${t("invRepGenerate")}</button>
          ${hasData ? `<button type="button" class="primary-button secondary" data-sarpras-action="report-export">${t("invRepExport")}</button>` : ""}
        </div>
      </article>

      <section class="panel-card">
        ${hasData ? renderReportTable(data) : `<div style="padding:2rem;text-align:center;color:var(--muted)">${t("invRepNoData")}</div>`}
      </section>
    </section>
  `;
}

function formatInventoryStatus(status) {
  if (status === "Aman") return `<span class="module-pill good">${status}</span>`;
  if (status === "Kosong") return `<span class="module-pill neutral">${status}</span>`;
  return `<span class="module-pill warn">${status}</span>`;
}

function formatInventoryRecordState(status) {
  const value = String(status);
  if (["Aktif", "Selesai"].includes(value)) return `<span class="module-pill good">${value}</span>`;
  if (["Draft", "Proses", "Review", "Pending update"].includes(value)) return `<span class="module-pill warn">${value}</span>`;
  return `<span class="module-pill neutral">${value}</span>`;
}

function formatInventoryVariance(value) {
  const normalized = String(value);
  if (normalized.startsWith("+")) return `<span class="module-pill good">${normalized}</span>`;
  if (normalized.startsWith("-")) return `<span class="module-pill warn">${normalized}</span>`;
  return `<span class="module-pill neutral">${normalized}</span>`;
}

applyLanguage();
