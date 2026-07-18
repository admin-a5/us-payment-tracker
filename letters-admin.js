function enhanceLettersPage() {
  const section = document.querySelector("#letters");
  const page    = section?.querySelector(".module-page");
  const heading = page?.querySelector(".module-heading");
  if (!section || !page || !heading || page.querySelector(".letters-admin")) return;

  const role = window.schoolAuth?.role || "";
  if (role !== "super_admin" && role !== "admin") return;

  const isSuper = role === "super_admin";

  page.innerHTML = `
    <div class="page-heading module-heading">
      <div>
        <p class="eyebrow">${t("module")}</p>
        <h1>${t("pageLettersTitle")}</h1>
        <span>${t("pageLettersSubtitle")}</span>
      </div>
      <div class="module-actions">
        <button class="primary-button secondary" id="letters-refresh">↻ Refresh</button>
      </div>
    </div>
    <div class="module-layout letters-admin">
      <section class="module-table-card">
        <div class="panel-heading">
          <h2>${t("clientRequests") || "Client Requests"}</h2>
          <span class="module-count" id="letters-count">0 records</span>
        </div>
        <div class="module-table-scroll">
          <table class="module-table" id="letters-admin-table">
            <thead>
              <tr>
                <th>Order No</th>
                <th>Requestor</th>
                <th>Class</th>
                <th>ID</th>
                <th>Items</th>
                <th>Status</th>
                <th>Date</th>
                <th>TA</th>
                ${isSuper ? "<th>Actions</th>" : ""}
              </tr>
            </thead>
            <tbody id="letters-admin-body">
              <tr><td colspan="9" style="text-align:center;padding:2rem;color:var(--muted)">Loading...</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `;

  loadLettersAdmin();
  document.getElementById("letters-refresh")?.addEventListener("click", loadLettersAdmin);
}

async function loadLettersAdmin() {
  const sb = window.authModule?.getSupabaseClient?.() || window.schoolAuth?.sb || window._sb || null;
  if (!sb) return;

  const role = window.schoolAuth?.role || "";
  const isSuper = role === "super_admin";

  try {
    const { data, error } = await sb
      .from("client_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const tbody = document.getElementById("letters-admin-body");
    const count = document.getElementById("letters-count");
    if (!tbody) return;
    if (count) count.textContent = `${(data || []).length} records`;

    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:2rem;color:var(--muted)">No requests yet.</td></tr>';
      return;
    }

    const statusColors = { submitted: "warn", approved: "neutral", done: "good", pending: "warn" };

    tbody.innerHTML = data.map(r => `
      <tr>
        <td><code>${escapeHtml(r.order_number)}</code></td>
        <td><strong>${escapeHtml(r.requestor_name)}</strong></td>
        <td>${escapeHtml(r.requestor_class)}</td>
        <td><small>${escapeHtml(r.requestor_id)}</small></td>
        <td>${(r.items || []).map(i => {
          const label = i.type === "__custom__" && i.description ? i.description : i.type;
          const desc = i.description && i.type !== "__custom__" ? i.description : "";
          return `<span class="module-pill neutral">${escapeHtml(label)}${desc ? ` <small style="color:var(--muted)">(${escapeHtml(desc)})</small>` : ""}</span>`;
        }).join(" ")}</td>
        <td>
          <select class="letters-status-select" data-id="${r.id}" data-order="${escapeHtml(r.order_number)}" data-prev-status="${escapeHtml(r.status)}">
            <option value="submitted" ${r.status === "submitted" ? "selected" : ""}>submitted</option>
            <option value="pending" ${r.status === "pending" ? "selected" : ""}>pending</option>
            <option value="approved" ${r.status === "approved" ? "selected" : ""}>approved</option>
            <option value="done" ${r.status === "done" ? "selected" : ""}>done</option>
          </select>
        </td>
        <td><small>${formatDate(r.updated_at || r.created_at)}</small></td>
        <td><small>${escapeHtml(r.academic_year)}</small></td>
        ${isSuper ? `<td>
          <button class="action-button letters-delete-btn" data-id="${r.id}" data-order="${escapeHtml(r.order_number)}" title="Delete">✕</button>
        </td>` : ""}
      </tr>
    `).join("");

    tbody.querySelectorAll(".letters-status-select").forEach(sel => {
      sel.addEventListener("change", async () => {
        const id = sel.dataset.id;
        const order = sel.dataset.order;
        const status = sel.value;
        try {
          const prevStatus = sel.dataset.prevStatus;
          const { error: upErr } = await sb
            .from("client_requests")
            .update({ status, updated_at: new Date().toISOString() })
            .eq("id", id);
          if (upErr) throw upErr;
          sel.dataset.prevStatus = status;
          window.auditLog?.("UPDATE", "letters", id, { status: prevStatus }, { status });
          showToastGlobal(`Request ${order} → ${status}`);
        } catch (e) {
          showToastGlobal(`Error: ${e.message}`);
        }
      });
    });

    if (isSuper) {
      tbody.querySelectorAll(".letters-delete-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
          if (!confirm(`Delete request ${btn.dataset.order}?`)) return;
          try {
            const { error: delErr } = await sb
              .from("client_requests")
              .delete()
              .eq("id", btn.dataset.id);
            if (delErr) throw delErr;
            btn.closest("tr").remove();
            showToastGlobal(`Request ${btn.dataset.order} deleted.`);
          } catch (e) {
            showToastGlobal(`Error: ${e.message}`);
          }
        });
      });
    }
  } catch (err) {
    const tbody = document.getElementById("letters-admin-body");
    if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--due-text)">${escapeHtml(err.message)}</td></tr>`;
  }
}

function formatDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  const wib = new Date(d.getTime() + 7 * 60 * 60 * 1000);
  return wib.toISOString().slice(0, 16).replace("T", " ");
}

function showToastGlobal(msg) {
  const existing = document.querySelector(".letters-toast");
  if (existing) existing.remove();
  const el = document.createElement("div");
  el.className = "letters-toast";
  el.textContent = msg;
  Object.assign(el.style, {
    position: "fixed", bottom: "2rem", left: "50%", transform: "translateX(-50%)",
    background: "var(--card-bg)", border: "1px solid var(--line)",
    padding: "0.75rem 1.5rem", borderRadius: "0.4rem", fontSize: "0.85rem",
    zIndex: "9999", boxShadow: "0 0.25rem 1rem rgba(0,0,0,0.25)",
    opacity: "1", transition: "opacity 0.3s"
  });
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity = "0"; setTimeout(() => el.remove(), 300); }, 3000);
}
