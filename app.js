const translations = window.translations;

const pageData = {
  students: {
    features: ["Ledger", "Daftar Kelas", "Rekap", "Mutasi", "Buku Induk", "Request Update"],
    stats: [["842", "Total"], ["27", "Classes"], ["5", "Requests"], ["12", "Mutasi"]],
    columns: ["Name", "Class", "Guardian", "Scope", "Status"],
    rows: [
      ["Raka Pratama", "XI IPA 1", "Siti Aminah", "Assigned", "Active"],
      ["Nabila Putri", "X IPS 2", "Budi Santoso", "All", "Active"],
      ["Galih Saputra", "XII IPA 3", "Ratna Dewi", "Request", "Pending"]
    ]
  },
  staff: {
    features: ["Kehadiran", "Transport", "Statistik Kehadiran", "View Own", "Rekap", "Export"],
    stats: [["126", "Employees"], ["94%", "Present"], ["8", "Transport"], ["3", "Late"]],
    columns: ["Employee", "Unit", "Attendance", "Scope", "Status"],
    rows: [
      ["Daniel Wijaya", "TU", "Present", "Own", "Active"],
      ["Maria Santoso", "Kurikulum", "Present", "All", "Active"],
      ["Andre Lim", "Sarpras", "Late", "Own", "Pending"]
    ]
  },
  inventory: {
    features: ["Barang Masuk", "Barang Keluar", "Peminjaman", "Stok Barang", "Kontrol Anggaran", "Inventaris", "QR / OCR"],
    stats: [["1,248", "Items"], ["36", "Borrowed"], ["12", "Low Stock"], ["84%", "Budget"]],
    columns: ["Item", "Category", "Location", "Stock", "Status"],
    rows: [
      ["LCD Projector", "Electronics", "Lab 2", "14", "Active"],
      ["Student Desk", "Furniture", "Warehouse", "240", "Active"],
      ["Basketball", "Sport", "Gym", "3", "Pending"]
    ]
  },
  letters: {
    features: ["Surat Masuk", "Surat Keluar", "Nomor Surat", "Arsip", "Review", "Export"],
    stats: [["119", "Incoming"], ["54", "Outgoing"], ["7", "Review"], ["3", "Drafts"]],
    columns: ["Number", "Subject", "Type", "Owner", "Status"],
    rows: [
      ["IN/119/IV/2026", "Undangan dinas", "Incoming", "TU", "Review"],
      ["OUT/054/IV/2026", "Surat keterangan", "Outgoing", "Admin", "Sent"],
      ["SK/034/IV/2026", "Nomor surat", "Numbering", "TU", "Done"]
    ]
  },
  users: {
    features: ["Users", "Roles", "Permissions", "Scopes", "Invitations", "Access Review"],
    stats: [["48", "Users"], ["8", "Roles"], ["74", "Permissions"], ["6", "Review"]],
    columns: ["User", "Role", "Email", "Scope", "Status"],
    rows: [
      ["Admin User", "Super Admin", "admin@school.test", "All", "Active"],
      ["US Staff", "US/PSB", "us@school.test", "All", "Active"],
      ["Wali Kelas X-1", "Wali Kelas", "wali@school.test", "Assigned", "Pending"]
    ]
  },
  audit: {
    features: ["Activity", "Actor", "Module", "Scope Own", "Timestamp", "Export"],
    stats: [["1,209", "Events"], ["41", "Today"], ["6", "Warnings"], ["0", "Critical"]],
    columns: ["Actor", "Module", "Action", "Scope", "Status"],
    rows: [
      ["Admin User", "Users", "Updated role", "All", "Done"],
      ["US Staff", "Uang Sekolah", "Exported report", "Own", "Done"],
      ["Sarpras Staff", "Inventory", "Changed stock", "Own", "Review"]
    ]
  },
  diagnostics: {
    features: ["Session", "Schemas", "RLS Policies", "Counts", "Validation"],
    stats: [["-", "Session"], ["-", "RLS"], ["-", "Tables"], ["-", "Checks"]],
    columns: ["Check", "Status", "Detail", "Scope", "Result"],
    rows: [
      ["Session", "Pending", "Refresh to check", "All", "-"],
      ["RLS Policies", "Pending", "Refresh to check", "All", "-"],
      ["Table Schemas", "Pending", "Refresh to check", "All", "-"]
    ]
  },
  client: {
    features: ["Letters", "Inventory"],
    stats: [["-", "Letters"], ["-", "Inventory"]],
    columns: ["Order No", "Requestor", "Items", "Status", "Date"],
    rows: [
      ["-", "No records yet.", "", "", ""]
    ]
  }
};

function nowStamp() { return nowStampWIB(); }
function nowStampWIB() {
  const d = new Date();
  const wib = new Date(d.getTime() + 7 * 60 * 60 * 1000);
  return wib.toISOString().slice(0, 16).replace("T", " ");
}

let language = Store.getLanguage();

const languageSelect = document.querySelector("#languageSelect");
const themeMode      = document.querySelector("#themeMode");
const themeColor     = document.querySelector("#themeColor");
const menuToggle     = document.querySelector("#menuToggle");
const sidebar        = document.querySelector("#sidebar");

function t(key) {
  return translations[language][key] || translations.en[key] || key;
}

async function updateNavBadges() {
  const sb = window.authModule?.getSupabaseClient?.() || window._sb;
  if (!sb) return;
  const badge = document.getElementById("letters-badge");
  if (!badge) return;
  try {
    const { count } = await sb.from("client_requests").select("*", { count: "exact", head: true }).eq("status", "pending");
    badge.textContent = count > 0 ? String(count) : "";
  } catch { badge.textContent = ""; }
}

function applyLanguage() {
  document.documentElement.lang = language;
  languageSelect.value = language;
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.placeholder = t(node.dataset.i18nPlaceholder);
  });
  renderSimplePages();
  enhanceStaffPage();
  window.attendanceModule?.buildStaffOverview?.();
  /* Only call enhanceInventoryPage on the first run; language switch uses refreshInventoryLanguage */
  if (!document.querySelector("#inventory .module-page .module-subnav")) {
    enhanceInventoryPage();
  } else {
    refreshInventoryLanguage();
  }
  window.userManagementModule?.mount?.();
  window.diagnosticsModule?.mount?.();
}

function renderSimplePages() {
  document.querySelectorAll("[data-simple-page]").forEach((section) => {
    const key = section.dataset.simplePage;
    /* Don't rebuild inventory if it has already been enhanced (subnav exists) */
    if (key === "inventory" && section.querySelector(".module-page .module-subnav")) return;
    const title    = t(`page${capitalize(key)}Title`);
    const subtitle = t(`page${capitalize(key)}Subtitle`);
    const data     = pageData[key] || pageData.students;
    const features = data.features || [];
    section.innerHTML = `
      <div class="module-page">
        <div class="page-heading module-heading">
          <div>
            <p class="eyebrow">${t("module")}</p>
            <h1>${title}</h1>
            <span>${subtitle}</span>
          </div>
          ${key !== "inventory" ? `
          <div class="module-actions">
            <button class="primary-button secondary">${t("export")}</button>
            <button class="primary-button">${t("addRecord")}</button>
          </div>` : ""}
        </div>

        <div class="module-stat-grid">
          ${data.stats
            .map(([value, label]) => `
              <article class="module-stat">
                <span>${label}</span>
                <strong>${value}</strong>
              </article>
            `)
            .join("")}
        </div>

        <div class="module-toolbar">
          <div class="module-search"><span>⌕</span><input type="search" placeholder="${t("searchPlaceholder")}" /></div>
          <select><option>All Status</option><option>${t("active")}</option><option>${t("pending")}</option></select>
          <select><option>All Scope</option><option>All</option><option>Assigned</option><option>Own</option></select>
        </div>

        <div class="module-layout">
          <section class="module-table-card">
            <div class="panel-heading">
              <h2>${title}</h2>
              <span class="module-count">${data.rows.length} records</span>
            </div>
            <div class="module-table-scroll">
              <table class="module-table">
                <thead>
                  <tr>
                    ${data.columns.map((column) => `<th>${column}</th>`).join("")}
                    <th>${t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.rows
                    .map((row) => `
                      <tr>
                        ${row.map((cell, index) => `<td>${formatModuleCell(cell, index)}</td>`).join("")}
                        <td><button class="action-button" aria-label="${t("view")}">...</button></td>
                      </tr>
                    `)
                    .join("")}
                </tbody>
              </table>
            </div>
          </section>

          <aside class="module-side-card">
            <h2>${t("quickActions")}</h2>
            <div class="module-feature-list">
              ${features.map((feature) => `<button type="button">${feature}</button>`).join("")}
            </div>
            <h2>${t("recentRecords")}</h2>
            <ul class="status-list">
              <li><span>${title} 001</span><b class="pill green">${t("active")}</b></li>
              <li><span>${title} 002</span><b class="pill yellow">${t("pending")}</b></li>
              <li><span>${title} 003</span><b class="pill green">${t("done")}</b></li>
            </ul>
          </aside>
        </div>
      </div>
    `;
  });

  enhanceStaffPage();
  enhanceLettersPage();
  if (!document.querySelector("#inventory .module-page .module-subnav")) {
    enhanceInventoryPage();
  }
}

window.showToast = function (msg) {
  const el = document.getElementById("app-toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(window.showToast._t);
  window.showToast._t = setTimeout(() => el.classList.remove("show"), 3000);
};

function formatModuleCell(value, index) {
  const normalized = String(value);
  if (["Active", "Done", "Sent"].includes(normalized))
    return `<span class="module-pill good">${normalized}</span>`;
  if (["Pending", "Review", "Late"].includes(normalized))
    return `<span class="module-pill warn">${normalized}</span>`;
  if (["All", "Assigned", "Own", "Request"].includes(normalized))
    return `<span class="module-pill neutral">${normalized}</span>`;
  if (index === 0)
    return `<strong>${normalized}</strong>`;
  return normalized;
}






window.refreshDashboard = async () => renderDashboard();

async function renderDashboard() {
  const sb = window.authModule?.getSupabaseClient?.() || window._sb;
  const role = window.authModule?.getRole?.() || window.schoolAuth?.role || null;
  if (!sb || !role) return;

  const name = document.getElementById("profile-name")?.textContent || "User";
  const roleLabel = {super_admin:"Super Admin",admin:"US/PSB",sarpras:"Sarpras",kurikulum:"Kurikulum",wali_kelas:"Wali Kelas",client:"Client",tu:"TU Staff",user:"User"}[role]||role;
  const greeting = document.getElementById("dash-greeting");
  if (greeting) greeting.textContent = `${t("welcome") || "Welcome"}, ${name} — ${roleLabel}`;

  const statsEl = document.getElementById("dash-stats");
  const recentEl = document.getElementById("dash-recent");
  const alertsEl = document.getElementById("dash-alerts");
  if (!statsEl) return;

  statsEl.innerHTML = `<article class="module-stat"><span>${t("invOverviewLoading")}</span><strong>—</strong></article>`;

  async function qc(table, filter) {
    try {
      let q = sb.from(table).select("*", { count: "exact", head: true });
      if (filter) q = filter(q);
      const { count, error } = await q;
      return error ? null : count;
    } catch { return null; }
  }

  const [studentCount, lowStockCount, pendingLetters] = await Promise.all([
    qc("pd_students"),
    qc("sarpras_master_items", (q) => q.lte("stock", 2)),
    qc("client_requests", (q) => q.eq("status", "pending"))
  ]);

  /* Read today's payments from DOM after US Payment module computes it */
  const usTodayEl = document.getElementById("us-s-today");
  const todayPayments = usTodayEl ? (parseInt(usTodayEl.textContent) || 0) : null;

  statsEl.innerHTML = [
    ["blue",   t("studentsTotal"),       studentCount],
    ["orange", t("invOverviewLowStock"), lowStockCount],
    ["yellow", t("pendingRequests"),     pendingLetters],
    ["green",  t("dashPaymentsToday"),   todayPayments],
  ].filter(([,,v]) => v !== null)
   .map(([color, label, value]) =>
      `<article class="module-stat tone-filled-${color}"><span>${label}</span><strong>${value}</strong></article>`
    ).join("") || `<article class="module-stat"><span>${t("invOverviewLoading")}</span><strong>…</strong></article>`;

  if (recentEl) {
    try {
      const { data: logs } = await sb.from("audit_logs")
        .select("user_email, action, module, created_at")
        .order("created_at", { ascending: false }).limit(5);
      if (logs?.length) {
        recentEl.innerHTML = `<h3 style="margin:0 0 .5rem">${t("dashRecentActivity")}</h3>` +
          logs.map(l => `<div style="display:flex;justify-content:space-between;padding:.35rem 0;border-bottom:1px solid var(--border);gap:1rem"><span><strong>${l.action}</strong> — ${l.module}</span><small style="color:var(--muted);white-space:nowrap">${l.user_email}</small></div>`).join("");
      } else recentEl.innerHTML = `<p style="color:var(--muted);margin:0">${t("dashNoActivity")}</p>`;
    } catch { recentEl.innerHTML = `<p style="color:var(--muted);margin:0">${t("dashNoActivity")}</p>`; }
  }

  if (alertsEl) {
    const alerts = [];
    if (lowStockCount > 0) alerts.push(`${lowStockCount} ${t("invOverviewLowStock")}`);
    if (pendingLetters > 0) alerts.push(`${pendingLetters} ${t("pendingRequests")}`);
    if (alerts.length) {
      alertsEl.innerHTML = `<h3 style="margin:0 0 .5rem;color:var(--warn)">⚠ ${t("dashAlerts")}</h3>` +
        alerts.map(a => `<div style="padding:.35rem 0">${a}</div>`).join("");
    } else {
      alertsEl.innerHTML = `<p style="color:var(--muted);margin:0">${t("dashAllGood")}</p>`;
    }
  }

  updateNavBadges();
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function setTheme(value) {
  document.documentElement.style.setProperty("--bg", value);
  document.documentElement.style.setProperty("--page", value);
  themeColor.value = value;
  Store.setBg(value);
}

function setThemeMode(value) {
  document.documentElement.dataset.theme = value;
  themeMode.value = value;
  Store.setTheme(value);
  if (!Store.getBg()) {
    themeColor.value = value === "light" ? "#f8faf9" : "#071315";
  }
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".page").forEach((page) => page.classList.remove("active"));
    button.classList.add("active");
    const pageId = button.dataset.page;
    document.querySelector(`#${pageId}`).classList.add("active");
    sidebar.classList.remove("open");
    Store.set("reload_last_page", pageId);
  });
});

languageSelect.addEventListener("change", (event) => {
  language = event.target.value;
  Store.setLanguage(language);
  applyLanguage();
});

themeMode.addEventListener("change", (event) => {
  Store.removeBg();
  document.documentElement.style.removeProperty("--bg");
  document.documentElement.style.removeProperty("--page");
  setThemeMode(event.target.value);
});
themeColor.addEventListener("input", (event) => setTheme(event.target.value));
menuToggle.addEventListener("click", () => sidebar.classList.toggle("open"));

setThemeMode(Store.getTheme());
const savedBg = Store.getBg();
if (savedBg) setTheme(savedBg);


