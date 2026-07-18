/**
 * audit.js — Audit Log Module
 *
 * Access matrix:
 *   super_admin  → sees ALL rows in audit_logs
 *   everyone else → sees only rows where user_id = auth.uid()
 *
 * Also exports window.auditLog(action, module, recordId, oldData, newData)
 * so other modules can write audit entries.
 */

window.auditModule = (() => {
  /* ─── state ─────────────────────────────────────── */
  let sb = null;
  let role = null;
  let userId = null;
  let rows = [];
  let filtered = [];
  let currentPage = 1;
  const PAGE_SIZE = 25;

  const MODULE_COLORS = {
    students: "teal",
    finance:  "violet",
    staff:    "orange",
    users:    "pink",
    inventory:"blue",
    letters:  "yellow",
    auth:     "muted",
  };

  const $ = (id) => document.getElementById(id);

  /* ─── mount ─────────────────────────────────────── */
  function mount() {
    const section = $("audit");
    if (!section || section.querySelector(".audit-page")) return;

    section.innerHTML = `
      <div class="audit-page">
        <div class="page-heading module-heading">
          <div>
            <p class="eyebrow">Activity</p>
            <h1>Audit Log</h1>
            <span id="audit-scope-label">Riwayat aktivitas Anda.</span>
          </div>
          <div class="module-actions">
            <button class="primary-button secondary" type="button" id="audit-refresh">↺ Refresh</button>
            <button class="primary-button secondary" type="button" id="audit-export">⬇ Export CSV</button>
          </div>
        </div>

        <div class="audit-stat-grid">
          <article><span>Total Entries</span><strong id="audit-s-total">—</strong></article>
          <article><span>Today</span><strong id="audit-s-today">—</strong></article>
          <article><span>This Week</span><strong id="audit-s-week">—</strong></article>
          <article><span>Unique Modules</span><strong id="audit-s-modules">—</strong></article>
        </div>

        <div class="audit-controls">
          <div class="audit-search-wrap">
            <span>⌕</span>
            <input id="audit-search" type="search" placeholder="Search action, module, record…" />
          </div>
          <select id="audit-filter-module">
            <option value="">All Modules</option>
          </select>
          <select id="audit-filter-action">
            <option value="">All Actions</option>
            <option value="INSERT">INSERT</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="LOGIN">LOGIN</option>
            <option value="LOGOUT">LOGOUT</option>
            <option value="EXPORT">EXPORT</option>
            <option value="VIEW">VIEW</option>
          </select>
          <select id="audit-filter-range">
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>

        <section class="audit-table-shell">
          <div class="audit-empty" id="audit-empty" hidden>
            <strong>No log entries found.</strong>
            <span>Actions performed in this system will appear here.</span>
          </div>
          <div class="audit-table-scroll" id="audit-table-scroll">
            <table class="audit-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th id="audit-col-user" style="display:none">User</th>
                  <th>Module</th>
                  <th>Action</th>
                  <th>Record ID</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody id="audit-tbody">
                <tr><td colspan="6" class="audit-loading">Loading…</td></tr>
              </tbody>
            </table>
          </div>
          <div class="audit-pagination" id="audit-pagination"></div>
        </section>

        <div class="audit-detail-modal" id="audit-detail-modal" hidden>
          <div class="audit-modal-card">
            <button class="audit-modal-close" id="audit-modal-close" type="button" aria-label="Close">×</button>
            <h2>Log Detail</h2>
            <div id="audit-modal-body"></div>
          </div>
        </div>

        <div class="audit-toast" id="audit-toast"></div>
      </div>
    `;

    bind();
    loadWhenReady();
  }

  /* ─── wait for auth to be ready ─────────────────── */
  function loadWhenReady() {
    const check = () => {
      const auth = window.authModule;
      if (auth?.getSupabaseClient() && auth?.getRole()) {
        sb     = auth.getSupabaseClient();
        role   = auth.getRole();
        userId = auth.getUser()?.id;
        applyScopeLabel();
        load();
      } else {
        setTimeout(check, 150);
      }
    };
    check();
  }

  function applyScopeLabel() {
    const label = $("audit-scope-label");
    if (!label) return;
    if (role === "super_admin") {
      label.textContent = "Semua aktivitas sistem — akses penuh Super Admin.";
      label.style.color = "var(--accent)";
    } else {
      label.textContent = "Menampilkan riwayat aktivitas Anda sendiri.";
    }
  }

  /* ─── bind events ────────────────────────────────── */
  function bind() {
    $("audit-refresh").addEventListener("click", load);
    $("audit-export").addEventListener("click", exportCsv);
    $("audit-modal-close").addEventListener("click", closeModal);
    $("audit-detail-modal").addEventListener("click", (e) => {
      if (e.target === $("audit-detail-modal")) closeModal();
    });

    ["audit-search", "audit-filter-module", "audit-filter-action", "audit-filter-range"].forEach((id) => {
      $(id)?.addEventListener("input", () => { currentPage = 1; applyFilters(); });
      $(id)?.addEventListener("change", () => { currentPage = 1; applyFilters(); });
    });
  }

  /* ─── load from Supabase ─────────────────────────── */
  async function load() {
    if (!sb) return;
    setLoading(true);

    let query = sb
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(2000);

    // Non-super-admin: filter to own records only
    // (RLS also enforces this on DB side — this is a belt-and-suspenders UI filter)
    if (role !== "super_admin") {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) {
      showError(`Failed to load audit log: ${error.message}`);
      return;
    }

    rows = data || [];
    populateModuleFilter();
    applyFilters();
    updateStats();
    setLoading(false);

    // Cleanup old logs (once per session, super_admin only)
    if (role === "super_admin" && !window._auditCleanupDone) {
      window._auditCleanupDone = true;
      try {
        await sb.rpc("cleanup_old_audit_logs");
      } catch { /* non-critical */ }
    }
  }

  /* ─── filter & render ────────────────────────────── */
  function applyFilters() {
    const search  = $("audit-search")?.value.toLowerCase() || "";
    const mod     = $("audit-filter-module")?.value || "";
    const action  = $("audit-filter-action")?.value || "";
    const range   = $("audit-filter-range")?.value || "";

    const now   = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const week  = new Date(today); week.setDate(today.getDate() - 7);
    const month = new Date(today); month.setDate(1);

    filtered = rows.filter((r) => {
      if (mod    && r.module !== mod)              return false;
      if (action && r.action !== action)           return false;
      if (range) {
        const t = new Date(r.created_at);
        if (range === "today" && t < today)        return false;
        if (range === "week"  && t < week)         return false;
        if (range === "month" && t < month)        return false;
      }
      if (search) {
        const hay = [r.action, r.module, r.record_id, r.user_email].join(" ").toLowerCase();
        if (!hay.includes(search)) return false;
      }
      return true;
    });

    renderTable();
    renderPagination();
  }

  function renderTable() {
    const tbody = $("audit-tbody");
    const scroll = $("audit-table-scroll");
    const empty  = $("audit-empty");
    const userCol = $("audit-col-user");

    if (role === "super_admin" && userCol) userCol.style.display = "";

    const start = (currentPage - 1) * PAGE_SIZE;
    const slice = filtered.slice(start, start + PAGE_SIZE);

    if (!slice.length) {
      tbody.innerHTML = "";
      if (empty)  { empty.hidden = false; }
      if (scroll) { scroll.style.display = "none"; }
      return;
    }

    if (empty)  { empty.hidden = true; }
    if (scroll) { scroll.style.display = ""; }

    tbody.innerHTML = slice.map((r) => {
      const modColor = MODULE_COLORS[r.module] || "muted";
      const actionCls = actionClass(r.action);
      const hasDetail = r.old_data || r.new_data;
      const userCell = role === "super_admin"
        ? `<td class="audit-cell-user"><span title="${escHtml(r.user_email || "")}">${escHtml(shortEmail(r.user_email))}</span></td>`
        : "";

      return `
        <tr class="audit-row${hasDetail ? " audit-row-clickable" : ""}"
            ${hasDetail ? `data-id="${escAttr(r.id)}"` : ""}>
          <td class="audit-cell-time" title="${escHtml(r.created_at || "")}">${formatTs(r.created_at)}</td>
          ${userCell}
          <td><span class="audit-badge mod-${escAttr(modColor)}">${escHtml(r.module || "—")}</span></td>
          <td><span class="audit-badge action-${escAttr(actionCls)}">${escHtml(r.action || "—")}</span></td>
          <td class="audit-cell-record">${escHtml(r.record_id || "—")}</td>
          <td>${hasDetail ? `<button class="audit-detail-btn" data-id="${escAttr(r.id)}" type="button">View</button>` : "—"}</td>
        </tr>
      `;
    }).join("");

    // Row click to open detail
    tbody.querySelectorAll(".audit-row-clickable").forEach((row) => {
      row.addEventListener("click", (e) => {
        if (e.target.closest(".audit-detail-btn")) return; // handled below
        openDetail(row.dataset.id);
      });
    });
    tbody.querySelectorAll(".audit-detail-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        openDetail(btn.dataset.id);
      });
    });
  }

  function renderPagination() {
    const el = $("audit-pagination");
    if (!el) return;
    const total = Math.ceil(filtered.length / PAGE_SIZE);
    if (total <= 1) { el.innerHTML = ""; return; }

    let html = `<span class="audit-page-info">${filtered.length} entries — Page ${currentPage} of ${total}</span>`;
    html += `<div class="audit-page-btns">`;
    html += `<button type="button" ${currentPage === 1 ? "disabled" : ""} data-pg="${currentPage - 1}">‹ Prev</button>`;

    const range = pageBtns(currentPage, total);
    range.forEach((pg) => {
      if (pg === "…") {
        html += `<span class="audit-page-ellipsis">…</span>`;
      } else {
        html += `<button type="button" class="${pg === currentPage ? "active" : ""}" data-pg="${pg}">${pg}</button>`;
      }
    });

    html += `<button type="button" ${currentPage === total ? "disabled" : ""} data-pg="${currentPage + 1}">Next ›</button>`;
    html += `</div>`;
    el.innerHTML = html;

    el.querySelectorAll("[data-pg]").forEach((btn) => {
      btn.addEventListener("click", () => {
        currentPage = Number(btn.dataset.pg);
        renderTable();
        renderPagination();
      });
    });
  }

  function pageBtns(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const result = [1];
    if (current > 3) result.push("…");
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) result.push(i);
    if (current < total - 2) result.push("…");
    result.push(total);
    return result;
  }

  /* ─── stats ──────────────────────────────────────── */
  function updateStats() {
    const now   = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const week  = new Date(today); week.setDate(today.getDate() - 7);

    const todayCount = rows.filter((r) => new Date(r.created_at) >= today).length;
    const weekCount  = rows.filter((r) => new Date(r.created_at) >= week).length;
    const modSet     = new Set(rows.map((r) => r.module).filter(Boolean));

    setText("audit-s-total",   rows.length);
    setText("audit-s-today",   todayCount);
    setText("audit-s-week",    weekCount);
    setText("audit-s-modules", modSet.size);
  }

  /* ─── module filter options ──────────────────────── */
  function populateModuleFilter() {
    const sel = $("audit-filter-module");
    if (!sel) return;
    const mods = [...new Set(rows.map((r) => r.module).filter(Boolean))].sort();
    sel.innerHTML = `<option value="">All Modules</option>` +
      mods.map((m) => `<option value="${escAttr(m)}">${escHtml(m)}</option>`).join("");
  }

  /* ─── detail modal ───────────────────────────────── */
  function openDetail(id) {
    const entry = rows.find((r) => String(r.id) === String(id));
    if (!entry) return;

    const body = $("audit-modal-body");
    body.innerHTML = `
      <dl class="audit-detail-dl">
        <dt>Timestamp</dt><dd>${escHtml(formatTs(entry.created_at, true))}</dd>
        <dt>User</dt><dd>${escHtml(entry.user_email || entry.user_id || "—")}</dd>
        <dt>Module</dt><dd>${escHtml(entry.module || "—")}</dd>
        <dt>Action</dt><dd>${escHtml(entry.action || "—")}</dd>
        <dt>Record ID</dt><dd>${escHtml(entry.record_id || "—")}</dd>
      </dl>
      ${entry.old_data ? `<h3>Before</h3><pre class="audit-json">${escHtml(JSON.stringify(entry.old_data, null, 2))}</pre>` : ""}
      ${entry.new_data ? `<h3>After</h3><pre class="audit-json">${escHtml(JSON.stringify(entry.new_data, null, 2))}</pre>` : ""}
    `;
    $("audit-detail-modal").hidden = false;
  }

  function closeModal() {
    $("audit-detail-modal").hidden = true;
  }

  /* ─── export CSV ─────────────────────────────────── */
  function exportCsv() {
    if (!filtered.length) { toast("Nothing to export."); return; }

    const isSuperAdmin = role === "super_admin";
    const headers = isSuperAdmin
      ? ["Timestamp", "User Email", "Module", "Action", "Record ID"]
      : ["Timestamp", "Module", "Action", "Record ID"];

    const lines = [
      headers.join(","),
      ...filtered.map((r) => {
        const base = [
          csvCell(formatTs(r.created_at, true)),
          ...(isSuperAdmin ? [csvCell(r.user_email)] : []),
          csvCell(r.module),
          csvCell(r.action),
          csvCell(r.record_id),
        ];
        return base.join(",");
      }),
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `audit_log_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast(`Exported ${filtered.length} rows.`);
  }

  /* ─── helpers ────────────────────────────────────── */
  function setLoading(on) {
    const tbody = $("audit-tbody");
    if (on && tbody) {
      tbody.innerHTML = `<tr><td colspan="6" class="audit-loading">Loading…</td></tr>`;
    }
  }

  function showError(msg) {
    const tbody = $("audit-tbody");
    if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="audit-loading" style="color:var(--danger)">${escHtml(msg)}</td></tr>`;
  }

  function setText(id, val) {
    const el = $(id);
    if (el) el.textContent = val;
  }

  function formatTs(ts, full = false) {
    if (!ts) return "—";
    const d = new Date(ts);
    if (isNaN(d)) return ts;
    if (full) return d.toLocaleString("id-ID");
    const today = new Date();
    const isToday =
      d.getDate()     === today.getDate() &&
      d.getMonth()    === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
    if (isToday) return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }) +
      " " + d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  }

  function shortEmail(email) {
    if (!email) return "—";
    const [local] = email.split("@");
    return local.length > 14 ? local.slice(0, 13) + "…" : local;
  }

  function actionClass(action) {
    const map = {
      INSERT: "insert", UPDATE: "update", DELETE: "delete",
      LOGIN: "login", LOGOUT: "logout", EXPORT: "export", VIEW: "view"
    };
    return map[action] || "muted";
  }

  const escHtml = (v) => window.escapeHtml(v);

  function escAttr(v) {
    return escHtml(v).replace(/`/g, "&#096;");
  }

  function csvCell(v) {
    const s = String(v ?? "").replace(/"/g, '""');
    return `"${s}"`;
  }

  function toast(msg) {
    const el = $("audit-toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("show"), 3000);
  }

  /* ─── public write helper ────────────────────────── */
  async function logAction(action, module, recordId = null, oldData = null, newData = null) {
    const auth = window.authModule;
    const _sb  = auth?.getSupabaseClient();
    if (!_sb) return;
    const user = auth?.getUser();

    await _sb.from("audit_logs").insert({
      user_id:    user?.id || null,
      user_email: user?.email || null,
      action:     action,
      module:     module,
      record_id:  recordId ? String(recordId) : null,
      old_data:   oldData || null,
      new_data:   newData || null,
    });
  }

  return { mount, load, logAction };
})();

/* ─── global shorthand ───────────────────────────── */
window.auditLog = window.auditModule.logAction;

window.addEventListener("load", () => window.auditModule.mount());
