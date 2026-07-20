window.clientModule = (() => {
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
          <div class="client-panel" id="client-panel-letters">
            <div class="client-panel-hd">
              <h2 data-i18n="clientLetters">Letters</h2>
              <button class="primary-button" id="client-new-req-btn" data-i18n="clientNewRequest">New Request</button>
            </div>
            <div class="client-table-wrap" id="client-letters-table">
              <div class="client-loading">Loading...</div>
            </div>
          </div>
          <div class="client-panel" id="client-panel-inventory">
            <div class="client-panel-hd">
              <h2 data-i18n="clientInventory">Inventory</h2>
               <button class="primary-button secondary" id="client-scan-btn">Scan</button>
            </div>
            <div class="client-scanner-area" id="client-scanner-area" style="display:none">
              <div id="client-scanner-viewport"></div>
              <button class="primary-button secondary" id="client-scan-stop" style="margin-top:0.5rem">Stop Scanner</button>
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
              <div class="client-search-results" id="client-search-results" style="display:none;position:absolute;top:100%;left:0;right:0;background:var(--card-bg);border:1px solid var(--line);border-radius:0.3rem;max-height:14rem;overflow-y:auto;z-index:10;margin-top:2px"></div>
            </div>
            <div class="client-empty-inv" id="client-empty-inv">Scan or search items to start.</div>
            <div class="client-tx-history" id="client-tx-history" style="margin-top:0.75rem;border-top:1px solid var(--line);padding-top:0.75rem;display:none">
              <h3 style="font-size:0.85rem;margin:0 0 0.5rem">Recent Check-outs</h3>
              <div id="client-tx-list" style="font-size:0.78rem"></div>
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
            <button type="button" class="primary-button secondary" id="client-add-item-btn" data-i18n="clientAddItem">+ Add Item</button>
            <hr />
            <div class="client-form-actions">
              <button type="button" class="primary-button secondary" id="client-form-cancel" data-i18n="clientCancel">Cancel</button>
              <button type="submit" class="primary-button" id="client-form-save" data-i18n="clientSave">Save</button>
            </div>
          </form>
        </div>
      </div>
    `;

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
    $("client-scan-stop")?.addEventListener("click", stopScanner);
    $("client-clear-btn")?.addEventListener("click", clearOrder);
    $("client-checkout-btn")?.addEventListener("click", doCheckout);
    $("client-search-input")?.addEventListener("input", onSearchInput);
    $("client-search-input")?.addEventListener("blur", () => setTimeout(() => hideSearchResults(), 200));
    $("client-search-input")?.addEventListener("focus", () => { if ($("client-search-input").value.trim()) onSearchInput(); });

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
              <th>${t("clientAcademicYear")}</th>
              <th>${t("clientDate")}</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(r => `
              <tr>
                <td><code>${escapeHtml(r.order_number)}</code></td>
                <td>${escapeHtml(r.requestor_name)}<br/><small>${escapeHtml(r.requestor_class)}</small></td>
                <td><small>${escapeHtml(r.requestor_id)}</small></td>
                <td>${renderItemsSummary(r.items)}</td>
                <td><span class="client-status-badge" style="color:${LETTER_TYPE_COLORS[r.status] || 'var(--muted)'}">${t("client" + r.status.charAt(0).toUpperCase() + r.status.slice(1))}</span></td>
                <td><small>${escapeHtml(r.academic_year)}</small></td>
                <td><small>${formatWIB(r.updated_at || r.created_at)}</small></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
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

  async function startScanner() {
    if (!window.Html5Qrcode) {
      showToast("Scanner library not loaded. Check internet.");
      return;
    }

    const area = $("client-scanner-area");
    if (!area) return;
    area.style.display = "block";

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
          qrbox: { width: 250, height: 150 },
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
      area.style.display = "none";
    }
  }

  async function lookupAndAddItem(code) {
    try {
      if (!sb) sb = getSupabaseClient();
      const q = code.trim();
      if (!q) return;

      const { data, error } = await sb.rpc("client_lookup_items", { search_query: q });

      if (error) throw error;

      const items = Array.isArray(data) ? data : [];
      const item = items.find(i => i.item_code === q) || items[0];

      if (!item) {
        showToast(`Item not found: ${q}`);
        return;
      }

      const existing = orderItems.find(o => o.code === item.item_code);
      if (existing) {
        existing.qty += 1;
      } else {
        orderItems.push({
          code: item.item_code,
          name: item.name || `Item ${item.item_code}`,
          stock: parseInt(item.stock) || 0,
          qty: 1
        });
      }
      renderOrder();
    } catch (err) {
      showToast(`Error: ${err.message}`);
    }
  }

  let searchTimer = null;

  function onSearchInput() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => doSearch(), 250);
  }

  function hideSearchResults() {
    const el = $("client-search-results");
    if (el) el.style.display = "none";
  }

  async function doSearch() {
    const input = $("client-search-input");
    const results = $("client-search-results");
    if (!input || !results) return;
    const q = input.value.trim();
    if (!q) { results.style.display = "none"; return; }

    try {
      if (!sb) sb = getSupabaseClient();
      const { data, error } = await sb.rpc("client_lookup_items", { search_query: q });

      if (error) throw error;

      const items = Array.isArray(data) ? data : [];

      if (!items || items.length === 0) {
        results.innerHTML = '<div style="padding:0.5rem;color:var(--muted);font-size:0.78rem">No items found.</div>';
        results.style.display = "";
        return;
      }

      results.innerHTML = items.map(item => `
        <div class="client-search-item" data-code="${escapeHtml(item.item_code)}" style="padding:0.4rem 0.6rem;cursor:pointer;border-bottom:1px solid var(--line);font-size:0.82rem;display:flex;justify-content:space-between;gap:0.5rem">
          <span><strong>${escapeHtml(item.item_code)}</strong> — ${escapeHtml(item.name || "")} <small style="color:var(--muted)">${escapeHtml(item.kategori || "")}</small></span>
          <small style="color:var(--muted);white-space:nowrap">stock: ${item.stock}</small>
        </div>
      `).join("");
      results.style.display = "";

      results.querySelectorAll(".client-search-item").forEach(el => {
        el.addEventListener("click", () => {
          const code = el.dataset.code;
          input.value = "";
          results.style.display = "none";
          lookupAndAddItem(code);
        });
      });
    } catch (err) {
      results.innerHTML = `<div style="padding:0.5rem;color:var(--due-text);font-size:0.78rem">${escapeHtml(err.message)}</div>`;
      results.style.display = "";
    }
  }

  async function onScanSuccess(decodedText) {
    if (!scannerActive) return;
    stopScanner();
    await lookupAndAddItem(decodedText);
  }

  function stopScanner() {
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
        <td>${escapeHtml(item.name)}<br/><small><code>${escapeHtml(item.code)}</code> &mdash; stock: ${item.stock}</small></td>
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
        .from("sarpras_transactions")
        .select("*")
        .order("date", { ascending: false })
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
        return `<div style="display:flex;justify-content:space-between;gap:0.5rem;padding:0.25rem 0;border-bottom:1px solid var(--line)">
          <span><strong>${escapeHtml(tx.token)}</strong> — ${escapeHtml(summary)}</span>
          <small style="color:var(--muted);white-space:nowrap">${escapeHtml(tx.petugas)} — ${formatWIB(tx.date)}</small>
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
      let token;
      try {
        const { data: lastTx } = await sb
          .from("sarpras_transactions")
          .select("token")
          .like("token", `${todayStr}%`)
          .order("token", { ascending: false })
          .limit(1);
        const lastSeq = lastTx?.length ? parseInt(lastTx[0].token.slice(-3)) : 0;
        token = `${todayStr}${String(lastSeq + 1).padStart(3, "0")}`;
      } catch {
        token = `${todayStr}001`;
      }

      const items = orderItems.map(o => ({
        code: o.code,
        name: o.name || o.code,
        qty: o.qty
      }));

      const totalQty = items.reduce((s, i) => s + i.qty, 0);
      const itemCount = items.length;
      const date = nowStampWIB();

      const { error: rpcError } = await sb.rpc("process_inventory_transaction", {
        p_token: token,
        p_type: "Keluar",
        p_date: date,
        p_items: items,
        p_total_qty: totalQty,
        p_item_count: itemCount,
        p_petugas: name.trim()
      });

      if (rpcError) throw rpcError;

      window.auditLog?.("CHECKOUT", "inventory", token, null, { petugas: name.trim(), items, totalQty });
      showToast(`Check-out complete. Token: ${token}`);
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
