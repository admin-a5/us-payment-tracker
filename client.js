window.clientModule = (() => {
  var cfg = window.__CONFIG__ || {};
  var SUPABASE_URL = cfg.SUPABASE_URL || "";
  var SUPABASE_ANON = cfg.SUPABASE_ANON_KEY || "";

  function getSupabaseClient() {
    return window.authModule?.getSupabaseClient?.() || window.schoolAuth?.sb || window._sb || null;
  }

  function getAccessToken() {
    try {
      var keys = Object.keys(localStorage);
      for (var i = 0; i < keys.length; i++) {
        if (keys[i].indexOf("-auth-token") !== -1) {
          var stored = JSON.parse(localStorage.getItem(keys[i]));
          if (stored && stored.access_token) return stored.access_token;
        }
      }
    } catch (e) {}
    return "";
  }

  function supFetch(path, opts) {
    var headers = {
      "apikey": SUPABASE_ANON,
      "Content-Type": "application/json",
      "Prefer": "return=representation"
    };
    var tok = getAccessToken();
    if (tok) headers["Authorization"] = "Bearer " + tok;
    return fetch(SUPABASE_URL + path, {
      method: opts.method || "GET",
      headers: headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined
    }).then(function (r) {
      if (r.status >= 400) {
        return r.json().then(function (e) { throw new Error(e.message || e.msg || "HTTP " + r.status); });
      }
      return r.text().then(function (t) {
        if (!t) return null;
        try { return JSON.parse(t); } catch (e) { return null; }
      });
    });
  }

  let sb = null;
  let html5QrCode = null;
  let scannerActive = false;
  let orderItems = [];

  const ITEM_TYPES = [
    "Transkrip",
    "Rekomendasi",
    "Surat Ket",
    "Legalisir",
    "Rapor",
    "Ijazah"
  ];

  const LANGUAGES = ["Indonesia", "Inggris"];

  const LETTER_TYPE_COLORS = {
    submitted: "var(--money-warn)",
    pending: "var(--money-warn)",
    approved: "var(--accent)",
    done: "var(--paid-text)"
  };

  const $ = (id) => document.getElementById(id);

  function getSupabaseClient() {
    return window.authModule?.getSupabaseClient?.() || window.schoolAuth?.sb || window._sb || null;
  }

  function t(key) {
    if (window.t) return window.t(key);
    const lang = document.documentElement.lang || "en";
    const fallback = {
      clientTitle: "Client Service",
      clientLetters: "Letters",
      clientInventory: "Inventory",
      clientNewRequest: "New Request",
      clientOrderNo: "Order No",
      clientRequestor: "Requestor",
      clientItems: "Items",
      clientStatus: "Status",
      clientDate: "Date",
      clientNotes: "Notes",
      clientScanStart: "Start",
      clientScanStop: "Stop",
      clientSubmitted: "submitted",
      clientPending: "pending",
      clientApproved: "approved",
      clientDone: "done",
      clientId: "ID",
      clientName: "Name",
      clientClass: "Class",
      clientAcademicYear: "Academic Year",
      clientRequest: "Request",
      clientAddItem: "Add Item",
      clientType: "Type",
      clientLanguage: "Language",
      clientDescription: "Description",
      clientSave: "Save",
      clientCancel: "Cancel",
      clientScanBarcode: "Scan Barcode",
      clientCheckout: "Check Out",
      clientCheckoutConfirm: "Enter your name to confirm:",
      clientQty: "Qty",
      clientRemove: "Remove",
      clientClear: "Clear",
      clientEmpty: "No records yet."
    };
    return fallback[key] || key;
  }

  function nowStampWIB() {
    const d = new Date();
    const wib = new Date(d.getTime() + 7 * 60 * 60 * 1000);
    return wib.toISOString().slice(0, 19).replace("T", " ");
  }

  function nowDateStr() {
    return nowStampWIB().slice(0, 10).replace(/-/g, "");
  }

  function formatWIB(iso) {
    if (!iso) return "-";
    const d = new Date(iso);
    const wib = new Date(d.getTime() + 7 * 60 * 60 * 1000);
    return wib.toISOString().slice(0, 16).replace("T", " ");
  }

  function showToast(msg) {
    if (window.showToast) { window.showToast(msg); return; }
    const el = $("client-toast");
    if (!el) return;
    el.textContent = msg;
    el.style.display = "block";
    el.style.opacity = "1";
    setTimeout(() => { el.style.opacity = "0"; }, 3000);
  }

  function calculateEstimate() {
    var now = new Date();
    var day = now.getDay();
    var hour = now.getHours();
    var est = new Date(now);
    var count = 0;
    if (day >= 1 && day <= 4) { count = 1; }
    else if (day === 5) { if (hour < 12) { count = 1; } else { est.setDate(est.getDate() + 3); } }
    else if (day === 6) { est.setDate(est.getDate() + 2); }
    else { est.setDate(est.getDate() + 1); }
    while (count < 3) {
      est.setDate(est.getDate() + 1);
      var d = est.getDay();
      if (d !== 0 && d !== 6) count++;
    }
    return est;
  }

  function showEstimatePopup(orderNumber) {
    var existing = $("client-estimate-popup");
    if (existing) existing.remove();
    var est = calculateEstimate();
    var days = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
    var months = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
    var dayName = days[est.getDay()];
    var dateStr = dayName + ", " + est.getDate() + " " + months[est.getMonth()] + " " + est.getFullYear();
    var overlay = document.createElement("div");
    overlay.id = "client-estimate-popup";
    overlay.style.cssText = "position:fixed;top:0;right:0;bottom:0;left:0;background:rgba(0,0,0,0.4);display:-webkit-flex;display:flex;-webkit-align-items:center;align-items:center;-webkit-justify-content:center;justify-content:center;z-index:9999";
    overlay.addEventListener("click", function(e) { if (e.target === overlay) overlay.remove(); });
    overlay.innerHTML =
      '<div style="background:var(--card-bg,#fff);border-radius:1rem;padding:1.5rem;max-width:360px;width:90%;box-shadow:0 8px 30px rgba(0,0,0,0.2);text-align:center;position:relative">' +
      '<button id="client-estimate-close" style="position:absolute;top:0.5rem;right:0.75rem;border:none;background:none;font-size:1.2rem;cursor:pointer;color:var(--muted,#999)">&times;</button>' +
      '<div style="font-size:2rem;margin-bottom:0.5rem">&#x1F441;</div>' +
      '<h3 style="margin:0 0 0.25rem;font-size:1rem">Estimasi Selesai</h3>' +
      '<p style="margin:0.25rem 0;font-size:0.82rem;color:var(--muted,#666)">Nomor Order</p>' +
      '<p style="margin:0 0 1rem;font-size:1rem;font-weight:700;font-family:monospace">' + escapeHtml(orderNumber) + '</p>' +
      '<p style="margin:0;font-size:0.82rem;color:var(--muted,#666)">Estimasi Selesai</p>' +
      '<p style="margin:0.25rem 0 0;font-size:1.2rem;font-weight:700;color:var(--accent,#2563eb)">' + dateStr + '</p>' +
      '<p style="margin:0.75rem 0 0;font-size:0.72rem;color:var(--muted,#999)">3 hari kerja (Senin-Jumat)</p>' +
      '</div>';
    document.body.appendChild(overlay);
    setTimeout(function() {
      var closeBtn = document.getElementById("client-estimate-close");
      if (closeBtn) closeBtn.addEventListener("click", function() { overlay.remove(); });
    }, 0);
  }

  function mount() {
    const section = $("client");
    if (!section || section.querySelector(".client-page")) return;

    sb = getSupabaseClient();

    section.innerHTML = `
      <div class="client-page">
        <div class="page-heading module-heading">
          <div>
            <p class="eyebrow" data-i18n="navClient">Client</p>
            <h1 data-i18n="clientTitle">Client Service</h1>
          </div>
        </div>
        <div class="client-content">
          <div class="client-tabs">
            <button class="client-tab active" data-tab="letters"><span data-i18n="navLetters">Letters</span></button>
            <button class="client-tab" data-tab="inv"><span data-i18n="navInventory">Facilities</span></button>
          </div>

          <div class="client-tab-content active" id="client-tab-letters">
            <div class="client-panel">
              <div class="client-panel-hd">
                <h2 data-i18n="clientLetters">Letters</h2>
                <button class="primary-button" id="client-new-req-btn" data-i18n="clientNewRequest">New Request</button>
              </div>
              <div class="client-table-wrap" id="client-letters-table">
                <div class="client-loading">Loading...</div>
              </div>
            </div>
          </div>

          <div class="client-tab-content" id="client-tab-inv">
            <div class="client-panel">
              <div class="client-panel-hd">
                <h2 data-i18n="clientInventory">Facilities</h2>
                 <button class="primary-button secondary" id="client-scan-btn">Scan</button>
              </div>
              <div class="client-scanner-area" id="client-scanner-area" style="display:none">
                <div id="client-scanner-viewport" style="width:260px;height:260px"></div>
                <div class="client-scanner-actions">
                  <button class="primary-button secondary" id="client-scan-stop" data-i18n="clientScanStop">Stop</button>
                  <button class="primary-button" id="client-scan-capture" data-i18n="clientScanStart">Start</button>
                </div>
              </div>
              <div class="client-order-wrap" id="client-order-wrap" style="display:none">
                <table class="client-order-table">
                  <thead><tr>
                    <th data-i18n="clientItems">Item</th>
                    <th style="width:5rem" data-i18n="clientQty">Qty</th>
                    <th style="width:4rem"></th>
                  </tr></thead>
                  <tbody id="client-order-body"></tbody>
                </table>
                <div class="client-order-actions">
                  <button class="primary-button secondary" id="client-clear-btn" data-i18n="clientClear">Clear</button>
                  <button class="primary-button" id="client-checkout-btn" data-i18n="clientCheckout">Check Out</button>
                </div>
              </div>
              <div class="client-search-wrap" style="position:relative;padding:0.75rem 0">
                <input type="text" id="client-search-input" placeholder="Search item by code or name..." style="width:100%;min-height:2.2rem;padding:0 0.6rem;border:1px solid var(--line);border-radius:0.3rem;background:var(--input-bg);color:var(--text);font-size:0.85rem;box-sizing:border-box" />
                <div class="client-search-results" id="client-search-results" style="display:none;position:absolute;top:100%;left:0;right:0;background:var(--card-bg);border:1px solid var(--line);border-radius:0.3rem;max-height:14rem;overflow-y:auto;z-index:999;margin-top:2px;box-shadow:0 4px 12px rgba(0,0,0,0.15)"></div>
              </div>
              <div class="client-empty-inv" id="client-empty-inv">Scan or search items to start.</div>
              <div class="client-tx-history" id="client-tx-history" style="margin-top:0.75rem;border-top:1px solid var(--line);padding-top:0.75rem;display:none">
                <h3 style="font-size:0.85rem;margin:0 0 0.5rem">Recent Check-outs</h3>
                <div id="client-tx-list" style="font-size:0.78rem"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="client-modal" id="client-modal" hidden>
        <div class="client-modal-card">
          <button class="client-modal-close" id="client-modal-close">&times;</button>
          <h2 data-i18n="clientNewRequest">New Request</h2>
          <form id="client-req-form">
            <label><span data-i18n="clientId">ID</span> <input type="text" id="req-id" required /></label>
            <label><span data-i18n="clientName">Name</span> <input type="text" id="req-name" required /></label>
            <label><span data-i18n="clientClass">Class</span> <input type="text" id="req-class" required /></label>
            <label><span data-i18n="clientAcademicYear">Academic Year</span> <input type="text" id="req-year" required /></label>
            <hr />
            <div class="client-req-items" id="client-req-items">
              <div class="client-req-item">
                <select class="req-type">
                  ${ITEM_TYPES.map(t => `<option value="${t}">${t}</option>`).join("")}
                  <option value="__custom__">-- Custom --</option>
                </select>
                <select class="req-lang">
                  ${LANGUAGES.map(l => `<option value="${l}">${l}</option>`).join("")}
                </select>
                <input type="text" class="req-desc" placeholder="Description" />
                <button type="button" class="client-req-remove" title="Remove">&times;</button>
              </div>
            </div>
            <div class="client-req-sticky">
              <hr />
              <div class="client-req-sticky-row">
                <button type="button" class="primary-button secondary" id="client-add-item-btn" data-i18n="clientAddItem">+ Add Item</button>
                <div class="client-form-actions">
                  <button type="button" class="danger-button" id="client-form-cancel" data-i18n="clientCancel">Cancel</button>
                  <button type="submit" class="primary-button" id="client-form-save" data-i18n="clientSave">Save</button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    `;

    /* ─── Tab Switching ─── */
    const tabs = section.querySelectorAll(".client-tab");
    for (let i = 0; i < tabs.length; i++) {
      tabs[i].addEventListener("click", function () {
        for (let j = 0; j < tabs.length; j++) tabs[j].className = tabs[j] === this ? "client-tab active" : "client-tab";
        const name = this.dataset.tab;
        const contents = section.querySelectorAll(".client-tab-content");
        for (let j = 0; j < contents.length; j++) {
          contents[j].className = contents[j].id === "client-tab-" + name ? "client-tab-content active" : "client-tab-content";
        }
      });
    }

    bind();
    loadLetters();
    loadClientTxHistory();
  }

  function bind() {
    $("client-new-req-btn")?.addEventListener("click", openRequestForm);
    $("client-modal-close")?.addEventListener("click", closeRequestForm);
    $("client-form-cancel")?.addEventListener("click", closeRequestForm);
    $("client-req-form")?.addEventListener("submit", submitRequest);
    $("client-add-item-btn")?.addEventListener("click", addItemRow);
    $("client-scan-btn")?.addEventListener("click", startScanner);
    $("client-scan-capture")?.addEventListener("click", startCapture);
    $("client-scan-stop")?.addEventListener("click", stopScanner);
    $("client-clear-btn")?.addEventListener("click", clearOrder);
    $("client-checkout-btn")?.addEventListener("click", doCheckout);
    var si = $("client-search-input");
    if (si) {
      si.setAttribute("autocomplete", "off");
      si.addEventListener("input", onSearchInput);
      si.addEventListener("keyup", onSearchInput);
      si.addEventListener("blur", function () { setTimeout(function () { hideSearchResults(); }, 200); });
      si.addEventListener("focus", function () { if (si.value.trim()) onSearchInput(); });
    }

    document.addEventListener("click", (e) => {
      if (e.target.closest(".client-req-remove")) {
        const row = e.target.closest(".client-req-item");
        if (row && document.querySelectorAll(".client-req-item").length > 1) {
          row.remove();
        }
      }
    });
  }

  async function loadLetters() {
    const wrap = $("client-letters-table");
    if (!wrap) return;
    wrap.innerHTML = '<div class="client-loading">Loading...</div>';

    try {
      if (!sb) sb = getSupabaseClient();
      const { data, error } = await sb
        .from("client_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        wrap.innerHTML = `<div class="client-empty">${t("clientEmpty")}</div>`;
        return;
      }

      wrap.innerHTML = `
          <table class="client-letters-table">
            <thead>
              <tr>
                <th>${t("clientOrderNo")}</th>
                <th>${t("clientRequestor")}</th>
                <th>${t("clientId")}</th>
                <th>${t("clientItems")}</th>
                <th>${t("clientStatus")}</th>
                <th>${t("clientNotes")}</th>
                <th>${t("clientAcademicYear")}</th>
                <th>${t("clientDate")}</th>
              </tr>
            </thead>
            <tbody>
              ${data.map(r => {
                const statusLabel = t("client" + r.status.charAt(0).toUpperCase() + r.status.slice(1));
                return `
                <tr>
                  <td data-label="${t("clientOrderNo")}"><code>${escapeHtml(r.order_number)}</code> <button class="client-estimate-btn" data-order="${escapeHtml(r.order_number)}" title="Estimasi selesai" style="cursor:pointer;border:none;background:none;padding:0 0.15rem;font-size:0.85rem">&#x1F441;</button> <button class="client-copy-btn" data-order="${escapeHtml(r.order_number)}" data-requestor="${escapeHtml(r.requestor_name)}" data-class="${escapeHtml(r.requestor_class)}" data-id="${escapeHtml(r.requestor_id)}" data-year="${escapeHtml(r.academic_year)}" data-items="${escapeHtml(JSON.stringify(r.items))}" data-date="${escapeHtml(r.created_at)}" data-status="${escapeHtml(r.status)}" title="Salin">📋</button></td>
                  <td data-label="${t("clientRequestor")}">${escapeHtml(r.requestor_name)}<br/><small>${escapeHtml(r.requestor_class)}</small></td>
                  <td data-label="${t("clientId")}"><small>${escapeHtml(r.requestor_id)}</small></td>
                  <td data-label="${t("clientItems")}">${renderItemsSummary(r.items)}</td>
                  <td data-label="${t("clientStatus")}"><span class="client-status-badge" style="color:${LETTER_TYPE_COLORS[r.status] || 'var(--muted)'}">${statusLabel}</span></td>
                  <td data-label="${t("clientNotes")}"><small style="color:var(--warn)">${r.notes ? escapeHtml(r.notes) : ""}</small></td>
                  <td data-label="${t("clientAcademicYear")}"><small>${escapeHtml(r.academic_year)}</small></td>
                  <td data-label="${t("clientDate")}"><small>${formatWIB(r.updated_at || r.created_at)}</small></td>
                </tr>`;
              }).join("")}
            </tbody>
          </table>
      `;
      document.querySelectorAll(".client-copy-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const items = JSON.parse(btn.dataset.items || "[]");
          const itemsText = items.map((i, idx) => {
            const label = i.type === "__custom__" && i.description ? i.description : i.type;
            const lang = i.lang ? ` [${i.lang}]` : "";
            return `${idx + 1}. ${label}${lang}`;
          }).join("\n");
          const statusLabel = t("client" + btn.dataset.status.charAt(0).toUpperCase() + btn.dataset.status.slice(1));
          const text = `Permohonan surat telah dibuat dengan nomor order\n--------\n${btn.dataset.order}\nID : ${btn.dataset.id || "-"}\nNama : ${btn.dataset.requestor}\nKelas : ${btn.dataset.class}\nTahun Ajaran : ${btn.dataset.year}\nItems:\n${itemsText}\nTanggal Permohonan : ${formatWIB(btn.dataset.date)}\nStatus : ${statusLabel}\n\nMohon perhatian:\n1. Waktu pengerjaan normal 3 hari setelah tanggal permohonan\n2. Untuk Alumni mohon menyerahkan dokumen asli untuk pembuatan surat/transkrip`;
          navigator.clipboard.writeText(text).then(() => showToast("Disalin!"));
        });
      });
      document.querySelectorAll(".client-estimate-btn").forEach(function(btn) {
        btn.addEventListener("click", function() {
          showEstimatePopup(btn.dataset.order);
        });
      });
    } catch (err) {
      wrap.innerHTML = `<div class="client-error">${escapeHtml(err.message)}</div>`;
    }
  }

  function renderItemsSummary(items) {
    if (!items || !items.length) return "-";
    return items.map(i => {
      const label = i.type === "__custom__" && i.description ? i.description : i.type;
      const desc = i.description && i.type !== "__custom__" ? i.description : "";
      const lang = i.lang ? ` [${i.lang}]` : "";
      return `<span class="client-item-pill">${escapeHtml(label)}${lang}${desc ? ` <small style="color:var(--muted)">(${escapeHtml(desc)})</small>` : ""}</span>`;
    }).join(" ");
  }

  function openRequestForm() {
    const modal = $("client-modal");
    if (!modal) return;
    modal.hidden = false;
    const today = nowStampWIB().slice(0, 10);
    const year = today.slice(0, 4);
    const month = parseInt(today.slice(5, 7));
    const sem = month >= 7 ? `${year.slice(2,4)}${String(parseInt(year.slice(0,4))+1).slice(2,4)} I` : `${String(parseInt(year.slice(0,4))-1).slice(2,4)}${year.slice(2,4)} II`;
    $("req-year").value = sem;
    $("req-id").focus();
  }

  function closeRequestForm() {
    const modal = $("client-modal");
    if (modal) modal.hidden = true;
  }

  function addItemRow(type, lang, desc) {
    const container = $("client-req-items");
    if (!container) return;
    const row = document.createElement("div");
    row.className = "client-req-item";
    row.innerHTML = `
      <select class="req-type">
        ${ITEM_TYPES.map(t => `<option value="${t}" ${t === type ? "selected" : ""}>${t}</option>`).join("")}
        <option value="__custom__" ${type === "__custom__" ? "selected" : ""}>-- Custom --</option>
      </select>
      <select class="req-lang">
        ${LANGUAGES.map(l => `<option value="${l}" ${l === lang ? "selected" : ""}>${l}</option>`).join("")}
      </select>
      <input type="text" class="req-desc" placeholder="Description" value="${escapeHtml(desc || "")}" />
      <button type="button" class="client-req-remove" title="Remove">&times;</button>
    `;
    container.appendChild(row);
  }

  async function submitRequest(e) {
    e.preventDefault();

    const name = $("req-name").value.trim();
    const cls = $("req-class").value.trim();
    const year = $("req-year").value.trim();
    const id = $("req-id").value.trim();

    if (!name || !cls || !year || !id) {
      showToast("Please fill all fields.");
      return;
    }

    const itemRows = document.querySelectorAll(".client-req-item");
    const items = [];
    itemRows.forEach(row => {
      const type = row.querySelector(".req-type").value;
      const lang = row.querySelector(".req-lang").value;
      const desc = row.querySelector(".req-desc").value.trim();
      items.push({ type, lang, description: desc || "" });
    });

    if (items.length === 0) {
      showToast("Add at least one item.");
      return;
    }

    const saveBtn = $("client-form-save");
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";

    try {
      if (!sb) sb = getSupabaseClient();

      const todayStr = nowDateStr();
      const { data: lastOrder } = await sb
        .from("client_requests")
        .select("order_number")
        .like("order_number", `${todayStr}-%`)
        .order("order_number", { ascending: false })
        .limit(1);

      const lastNum = lastOrder?.length ? parseInt(lastOrder[0].order_number.slice(-3)) : 0;
      const orderNumber = `${todayStr}-${String(lastNum + 1).padStart(3, "0")}`;

      const { error } = await sb.from("client_requests").insert({
        order_number: orderNumber,
        requestor_id: id,
        requestor_name: name,
        requestor_class: cls,
        academic_year: year,
        items,
        status: "submitted",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (error) throw error;

      window.auditLog?.("INSERT", "client", orderNumber, null, { requestor: name, class: cls, year, items });
      closeRequestForm();
      resetForm();
      showToast(`Request ${orderNumber} submitted.`);
      loadLetters();
    } catch (err) {
      showToast(`Error: ${err.message}`);
      saveBtn.disabled = false;
      saveBtn.textContent = "Save";
    }
  }

  function resetForm() {
    $("req-id").value = "";
    $("req-name").value = "";
    $("req-class").value = "";
    $("req-year").value = "";
    const container = $("client-req-items");
    if (container) {
      container.innerHTML = `
        <div class="client-req-item">
          <select class="req-type">
            ${ITEM_TYPES.map(t => `<option value="${t}">${t}</option>`).join("")}
            <option value="__custom__">-- Custom --</option>
          </select>
          <select class="req-lang">
            ${LANGUAGES.map(l => `<option value="${l}">${l}</option>`).join("")}
          </select>
          <input type="text" class="req-desc" placeholder="Description" />
          <button type="button" class="client-req-remove" title="Remove">&times;</button>
        </div>
      `;
    }
  }

  let scanEnabled = false;

  async function startScanner() {
    if (!window.Html5Qrcode) {
      showToast("Scanner library not loaded. Check internet.");
      return;
    }

    const area = $("client-scanner-area");
    if (!area) return;

    const vp = $("client-scanner-viewport");
    if (vp) vp.innerHTML = "";

    area.style.display = "block";

    if (html5QrCode) return;

    try {
      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        showToast("No camera found.");
        return;
      }

      html5QrCode = new Html5Qrcode("client-scanner-viewport");
      scannerActive = true;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E
          ]
        },
        onScanSuccess,
        () => {}
      );
    } catch (err) {
      showToast(`Camera error: ${err.message}`);
      stopScanner();
    }
  }

  async function startCapture() {
    if (html5QrCode && scannerActive && !scanEnabled) {
      scanEnabled = true;
    }
  }

  function lookupAndAddItem(code) {
    var q = (code || "").trim();
    if (!q) return;
    supFetch("/rest/v1/rpc/client_lookup_items", {
      method: "POST",
      body: { search_query: q }
    }).then(function (data) {
      if (!data || data.code || data.error) {
        showToast("Item not found: " + q);
        return;
      }
      var list = Array.isArray(data) ? data : [];
      var item = null;
      for (var i = 0; i < list.length; i++) { if (list[i].item_code === q) { item = list[i]; break; } }
      if (!item && list.length) item = list[0];
      if (!item) { showToast("Item not found: " + q); return; }

      var found = false;
      for (var i = 0; i < orderItems.length; i++) {
        if (orderItems[i].code === item.item_code) { orderItems[i].qty += 1; found = true; break; }
      }
      if (!found) {
        orderItems.push({
          code: item.item_code,
          name: item.name || "Item " + item.item_code,
          stock: parseInt(item.stock) || 0,
          unit: item.unit || "pcs",
          qty: 1
        });
      }
      renderOrder();
    }).catch(function (e) { showToast("Error: " + (e.message || e)); });
  }

  let searchTimer = null;

  function onSearchInput() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () { doSearch(); }, 200);
  }

  function hideSearchResults() {
    var el = $("client-search-results");
    if (el) el.style.display = "none";
  }

  function doSearch() {
    var input = $("client-search-input");
    var results = $("client-search-results");
    if (!input || !results) return;
    var q = input.value.trim();
    if (!q) { results.style.display = "none"; return; }

    results.innerHTML = '<div style="padding:0.5rem;color:var(--muted);font-size:0.78rem">Searching...</div>';
    results.style.display = "block";

    supFetch("/rest/v1/rpc/client_lookup_items", {
      method: "POST",
      body: { search_query: q }
    }).then(function (data) {
      if (!data || data.code || data.error) {
        results.innerHTML = '<div style="padding:0.5rem;color:var(--muted);font-size:0.78rem">Tidak ditemukan.</div>';
        results.style.display = "block";
        return;
      }
      var list = Array.isArray(data) ? data : [];
      if (!list.length) {
        results.innerHTML = '<div style="padding:0.5rem;color:var(--muted);font-size:0.78rem">Tidak ditemukan.</div>';
        results.style.display = "block";
        return;
      }
      var html = "";
      for (var i = 0; i < list.length; i++) {
        var it = list[i];
        html += '<div class="client-search-item" data-code="' + escapeHtml(it.item_code) + '" style="padding:0.4rem 0.6rem;cursor:pointer;border-bottom:1px solid var(--line);font-size:0.82rem;display:-webkit-flex;display:flex;justify-content:space-between;gap:0.5rem">' +
          '<span><strong>' + escapeHtml(it.item_code) + '</strong> &mdash; ' + escapeHtml(it.name || "") + ' <small style="color:var(--muted)">' + escapeHtml(it.kategori || "") + '</small></span>' +
          '<small style="color:var(--muted);white-space:nowrap">' + escapeHtml(it.unit || "pcs") + ' &middot; stok: ' + it.stock + '</small></div>';
      }
      results.innerHTML = html;
      results.style.display = "block";

      var els = results.querySelectorAll(".client-search-item");
      for (var _i = 0; _i < els.length; _i++) {
        (function (el) {
          el.addEventListener("mousedown", function () {
            var code = el.dataset.code;
            input.value = "";
            results.style.display = "none";
            lookupAndAddItem(code);
          });
        })(els[_i]);
      }
    }).catch(function (err) {
      results.innerHTML = '<div style="padding:0.5rem;color:var(--due-text);font-size:0.78rem">Error: ' + escapeHtml(err.message || err) + '</div>';
      results.style.display = "block";
    });
  }

  function playBeep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
      osc.onended = () => ctx.close();
    } catch (e) { /* ignore */ }
  }

  async function onScanSuccess(decodedText) {
    if (!scannerActive || !scanEnabled) return;
    scanEnabled = false;
    playBeep();
    await lookupAndAddItem(decodedText);
  }

  function stopScanner() {
    scanEnabled = false;
    scannerActive = false;
    if (html5QrCode) {
      try { html5QrCode.stop(); } catch (e) { /* ignore */ }
      html5QrCode = null;
    }
    const area = $("client-scanner-area");
    if (area) area.style.display = "none";
    const vp = $("client-scanner-viewport");
    if (vp) vp.innerHTML = "";
  }

  function renderOrder() {
    const wrap = $("client-order-wrap");
    const body = $("client-order-body");
    const empty = $("client-empty-inv");
    if (!wrap || !body) return;

    if (orderItems.length === 0) {
      wrap.style.display = "none";
      if (empty) empty.style.display = "";
      return;
    }

    wrap.style.display = "";
    if (empty) empty.style.display = "none";

    body.innerHTML = orderItems.map((item, idx) => `
      <tr>
        <td>${escapeHtml(item.name)}<br/><small><code>${escapeHtml(item.code)}</code> &mdash; ${escapeHtml(item.unit || "pcs")} &middot; stock: ${item.stock}</small></td>
        <td><input type="number" class="client-qty-input" value="${item.qty}" min="1" max="${Math.max(item.stock, 99)}" data-idx="${idx}" /></td>
        <td><button class="client-remove-btn" data-idx="${idx}" title="Remove">&times;</button></td>
      </tr>
    `).join("");

    body.querySelectorAll(".client-qty-input").forEach(inp => {
      inp.addEventListener("change", () => {
        const idx = parseInt(inp.dataset.idx);
        const v = parseInt(inp.value) || 1;
        if (idx >= 0 && idx < orderItems.length) {
          orderItems[idx].qty = Math.max(1, v);
        }
      });
    });

    body.querySelectorAll(".client-remove-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.idx);
        if (idx >= 0 && idx < orderItems.length) {
          orderItems.splice(idx, 1);
          renderOrder();
        }
      });
    });
  }

  async function loadClientTxHistory() {
    try {
      if (!sb) sb = getSupabaseClient();
      const { data, error } = await sb
        .from("client_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      if (!data || data.length === 0) return;
      const container = $("client-tx-history");
      const list = $("client-tx-list");
      if (!container || !list) return;
      container.style.display = "";
      list.innerHTML = data.map(tx => {
        const items = Array.isArray(tx.items) ? tx.items : [];
        const summary = items.map(i => `${i.name || i.code} x${i.qty}`).join(", ");
        const badge = tx.status === "approved" ? "&#9989;" : tx.status === "rejected" ? "&#10060;" : "&#9203;";
        return `<div style="display:flex;justify-content:space-between;gap:0.5rem;padding:0.25rem 0;border-bottom:1px solid var(--line)">
          <span>${badge} <strong>${escapeHtml(tx.token)}</strong> — ${escapeHtml(summary)}</span>
          <small style="color:var(--muted);white-space:nowrap">${escapeHtml(tx.petugas)} — ${escapeHtml(tx.status)}</small>
        </div>`;
      }).join("");
    } catch (e) {
      // silently ignore — history is optional
    }
  }

  function clearOrder() {
    orderItems = [];
    renderOrder();
  }

  async function doCheckout() {
    if (orderItems.length === 0) return;

    const name = prompt(t("clientCheckoutConfirm"));
    if (!name || !name.trim()) return;

    const btn = $("client-checkout-btn");
    if (btn) { btn.disabled = true; btn.textContent = "Processing..."; }

    try {
      if (!sb) sb = getSupabaseClient();

      const todayStr = nowDateStr();
      const today = todayStr.slice(0, 4) + "-" + todayStr.slice(4, 6) + "-" + todayStr.slice(6, 8);
      const stored = Store.getInvToken();
      let token;
      if (stored.date === today && stored.token && stored.token.length === 11) {
        const seq = parseInt(stored.token.slice(-3)) + 1;
        token = todayStr + String(seq > 999 ? 1 : seq).padStart(3, "0");
      } else {
        token = todayStr + "001";
      }
      Store.saveInvToken(token, today);

      const items = orderItems.map(o => ({
        code: o.code,
        name: o.name || o.code,
        qty: o.qty
      }));

      const totalQty = items.reduce((s, i) => s + i.qty, 0);
      const itemCount = items.length;

      const { error: insertError } = await sb
        .from("client_transactions")
        .insert({
          token,
          items,
          total_qty: totalQty,
          item_count: itemCount,
          petugas: name.trim(),
          status: "pending"
        })
        .single();

      if (insertError) throw insertError;

      window.auditLog?.("CHECKOUT", "inventory", token, null, { petugas: name.trim(), items, totalQty, status: "pending" });
      showToast(`Request submitted (pending approval). Token: ${token}`);
      orderItems = [];
      renderOrder();
      loadClientTxHistory();
      if (btn) { btn.disabled = false; btn.textContent = t("clientCheckout"); }
    } catch (err) {
      showToast(`Check-out error: ${err.message}`);
      if (btn) { btn.disabled = false; btn.textContent = t("clientCheckout"); }
    }
  }

  return { mount, loadLetters };
})();

window.addEventListener("load", () => window.clientModule.mount());
