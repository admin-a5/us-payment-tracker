window.diagnosticsModule = (() => {
  let sb = null;

  const $ = (id) => document.getElementById(id);

  function getSupabaseClient() {
    return window.authModule?.getSupabaseClient?.() || window.schoolAuth?.sb || window._sb || null;
  }

  function mount() {
    const section = $("diagnostics");
    if (!section || section.querySelector(".diagnostics-page")) return;

    sb = getSupabaseClient();

    section.innerHTML = `
      <div class="diagnostics-page">
        <div class="page-heading module-heading">
          <div>
            <p class="eyebrow" data-i18n="navDiagnostics">Diagnostics</p>
            <h1 data-i18n="pageDiagnosticsTitle">System Diagnostics</h1>
            <span data-i18n="pageDiagnosticsSubtitle">Check RLS policies, table schemas, and session info.</span>
          </div>
          <div class="module-actions">
            <button class="primary-button secondary" type="button" id="diag-refresh">↻ Refresh</button>
          </div>
        </div>
        <div class="diagnostics-content" id="diag-content">
          <div class="diag-loading">Running diagnostics...</div>
        </div>
      </div>
    `;

    $("diag-refresh")?.addEventListener("click", run);
    run();
  }

  async function run() {
    const content = $("diag-content");
    if (!content) return;
    content.innerHTML = '<div class="diag-loading">Running diagnostics...</div>';

    // Wait for auth to be fully initialized (up to 5s)
    for (let i = 0; i < 20; i++) {
      if (window.schoolAuth?.role) break;
      await new Promise(r => setTimeout(r, 250));
    }
    sb = getSupabaseClient();

    try {
      const results = [];

      results.push(getSessionInfo());
      results.push(getRoleInfo());

      const tables = ["students", "payments", "user_roles"];
      for (const table of tables) {
        results.push(await inspectTable(table));
      }

      results.push(getRLSReference());
      results.push(getValidationSummary());

      content.innerHTML = results.join("\n");
    } catch (err) {
      content.innerHTML = `<div class="diag-card error"><h3>Error</h3><p>${escapeHtml(err.message)}</p></div>`;
    }
  }

  function getSessionInfo() {
    const auth = window.schoolAuth || {};
    return `
<div class="diag-card">
  <h3>🔐 Session</h3>
  <table class="diag-table">
    <tr><td>User ID</td><td><code>${escapeHtml(auth.userId || "-")}</code></td></tr>
    <tr><td>Email</td><td>${escapeHtml(auth.userEmail || "-")}</td></tr>
    <tr><td>SB Client</td><td>${sb ? "Connected" : "<span class='diag-warn'>Not connected</span>"}</td></tr>
  </table>
</div>`;
  }

  function getRoleInfo() {
    const auth = window.schoolAuth || {};
    const role = auth.role || "unknown";
    const assignedClass = auth.assignedClass || null;

    const navMap = {
      super_admin: ["dashboard", "students", "finance", "staff", "inventory", "letters", "users", "audit", "diagnostics"],
      admin: ["dashboard", "students", "finance", "audit", "diagnostics"],
      sarpras: ["dashboard", "students", "inventory", "audit", "diagnostics"],
      kurikulum: ["dashboard", "students", "audit", "diagnostics"],
      wali_kelas: ["dashboard", "students", "finance", "audit", "diagnostics"],
      user: ["dashboard", "staff", "audit"]
    };
    const pages = navMap[role] || [];

    return `
<div class="diag-card">
  <h3>🎭 Role & Permissions</h3>
  <table class="diag-table">
    <tr><td>Role</td><td><strong>${escapeHtml(role)}</strong></td></tr>
    <tr><td>Assigned Class</td><td><strong>${escapeHtml(assignedClass || "(none)")}</strong></td></tr>
    <tr><td>Accessible Pages</td><td>${pages.join(", ")}</td></tr>
  </table>
</div>`;
  }

  async function inspectTable(tableName) {
    let html = `<div class="diag-card"><h3>📋 <code>${escapeHtml(tableName)}</code></h3>`;

    try {
      if (!sb) {
        html += `<p class="diag-warn">Supabase client not available</p></div>`;
        return html;
      }

      const { data: sample, error: sampleErr } = await sb.from(tableName).select("*").limit(1);
      if (sampleErr) {
        html += `<p class="diag-warn">${escapeHtml(sampleErr.message)}</p></div>`;
        return html;
      }

      const columns = sample && sample.length > 0 ? Object.keys(sample[0]) : [];
      html += `<details open><summary>Schema (${columns.length} columns)</summary>`;
      html += `<table class="diag-table"><thead><tr><th>Column</th><th>Sample Value</th><th>Inferred Type</th></tr></thead><tbody>`;
      if (columns.length === 0) {
        html += `<tr><td colspan="3" class="diag-warn">No columns — query returned empty result set. The session may not be authenticated yet (try Refresh).</td></tr>`;
      }
      columns.forEach((col) => {
        const val = sample[0][col];
        const type = val === null ? "null" : typeof val;
        const display = val === null ? "null" : typeof val === "object" ? JSON.stringify(val).slice(0, 60) : String(val).slice(0, 60);
        html += `<tr><td><code>${escapeHtml(col)}</code></td><td>${escapeHtml(display)}</td><td>${type}</td></tr>`;
      });
      html += `</tbody></table></details>`;

      html += `<details><summary>Row Count (RLS-filtered)</summary>`;
      try {
        const { count, error: countErr } = await sb.from(tableName).select("*", { count: "exact", head: true });
        if (countErr) throw countErr;
        html += `<p><strong>${count ?? "unknown"}</strong> rows visible to current user</p>`;
      } catch (e) {
        html += `<p class="diag-warn">Count error: ${escapeHtml(e.message)}</p>`;
      }
      html += `</details>`;

      const { data: rows } = await sb.from(tableName).select("*").limit(5);
      if (rows && rows.length > 0) {
        html += `<details><summary>Sample Rows (${rows.length})</summary>`;
        html += `<table class="diag-table"><thead><tr>`;
        columns.forEach((col) => { html += `<th>${escapeHtml(col)}</th>`; });
        html += `</tr></thead><tbody>`;
        rows.forEach((row) => {
          html += `<tr>`;
          columns.forEach((col) => {
            const v = row[col];
            const d = v === null ? "null" : typeof v === "object" ? JSON.stringify(v).slice(0, 40) : String(v).slice(0, 40);
            html += `<td>${escapeHtml(d)}</td>`;
          });
          html += `</tr>`;
        });
        html += `</tbody></table></details>`;
      } else {
        html += `<p class="diag-warn">No rows returned (RLS may be blocking all access)</p>`;
      }
    } catch (e) {
      html += `<p class="diag-warn">${escapeHtml(e.message)}</p>`;
    }

    html += `</div>`;
    return html;
  }

  function getRLSReference() {
    return `
<div class="diag-card">
  <h3>🛡️ Active RLS Policies (reference)</h3>
  <p>These policies were applied to <code>students</code> and <code>payments</code> tables. Verify below that they are working as expected.</p>
  <details>
    <summary>students — policies</summary>
    <pre>
1. students_admin_all (FOR ALL)
   — super_admin, admin: full access

2. students_wali_kelas_select (FOR SELECT)
   — wali_kelas: only rows where class = assigned_class

3. user_roles_select_own (FOR SELECT)
   — users can read their own row in user_roles
    </pre>
  </details>
  <details>
    <summary>payments — policies</summary>
    <pre>
1. payments_admin_all (FOR ALL)
   — super_admin, admin: full access

2. payments_wali_kelas_select (FOR SELECT)
   — wali_kelas: only payments linked to students in their class
   — joins through students.class = user_roles.assigned_class
    </pre>
  </details>
  <details>
    <summary>sarpras_transactions — policies (existing)</summary>
    <pre>
1. sarpras_transactions_all (FOR ALL)
   — super_admin, sarpras only
    </pre>
  </details>
</div>`;
  }

  function getValidationSummary() {
    return `
<div class="diag-card">
  <h3>✅ RLS Validation Checklist</h3>
  <table class="diag-table">
    <thead><tr><th>Test</th><th>Expected</th><th>How to Verify</th></tr></thead>
    <tbody>
      <tr>
        <td>wali_kelas sees only their class</td>
        <td>students table shows only their class</td>
        <td>Check "students" row count and sample rows above</td>
      </tr>
      <tr>
        <td>wali_kelas sees only linked payments</td>
        <td>payments table only shows their class's students</td>
        <td>Check "payments" sample rows — student_code should match their class</td>
      </tr>
      <tr>
        <td>wali_kelas cannot INSERT/UPDATE/DELETE</td>
        <td>Blocked by RLS (no policy for write)</td>
        <td>Try <code>sb.from('students').insert({})</code> in console</td>
      </tr>
      <tr>
        <td>super_admin sees all rows</td>
        <td>All rows visible</td>
        <td>Login as super_admin and compare counts</td>
      </tr>
      <tr>
        <td>admin sees all rows</td>
        <td>All rows visible (same as super_admin)</td>
        <td>Login as admin and check counts</td>
      </tr>
      <tr>
        <td>Class filter is locked</td>
        <td>Dropdown disabled, value = assigned_class</td>
        <td>Go to Finance page — class dropdown should be locked</td>
      </tr>
    </tbody>
  </table>
</div>`;
  }

  function escapeHtml(str) {
    if (str == null) return "";
    const s = String(str);
    const div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  return { mount };
})();

window.addEventListener("load", () => window.diagnosticsModule.mount());
