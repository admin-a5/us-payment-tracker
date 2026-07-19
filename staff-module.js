function enhanceStaffPage() {
  const section = document.querySelector("#staff");
  const page    = section?.querySelector(".module-page");
  const heading = page?.querySelector(".module-heading");
  if (!section || !page || !heading || page.querySelector(".module-subnav")) return;

  const overview = document.createElement("section");
  overview.id        = "staff-overview";
  overview.className = "module-subpage";

  [...page.children].forEach((child) => {
    if (child !== heading) overview.appendChild(child);
  });

  const subnav = document.createElement("div");
  subnav.className = "module-subnav";
  subnav.setAttribute("role", "tablist");
  subnav.setAttribute("aria-label", "Kepegawaian sub pages");
  subnav.innerHTML = `
    <button class="active" type="button" data-subpage="staff-overview">Overview</button>
    <button type="button" data-subpage="staff-attendance">Kehadiran</button>
    <button type="button" data-subpage="staff-rules">Rules</button>
  `;

  const rules = document.createElement("section");
  rules.id        = "staff-rules";
  rules.className = "module-subpage";
  rules.hidden    = true;
  rules.innerHTML = `
    <div class="panel-card" style="padding:1.5rem;max-width:800px">
      <h2 style="margin:0 0 1rem;font-size:1.1rem">${t("staffRulesTitle")}</h2>

      <section style="margin-bottom:1.25rem">
        <h3 style="font-size:0.95rem;margin:0 0 0.4rem">${t("staffRulesRealKehadiran")}</h3>
        <p style="font-size:0.82rem;color:var(--muted);margin:0;line-height:1.5">${t("staffRulesRealKehadiranDesc")}</p>
      </section>

      <section style="margin-bottom:1.25rem">
        <h3 style="font-size:0.95rem;margin:0 0 0.4rem">${t("staffRulesAbsents")}</h3>
        <p style="font-size:0.82rem;color:var(--muted);margin:0;line-height:1.5">${t("staffRulesAbsentsDesc")}</p>
      </section>

      <section style="margin-bottom:1.25rem">
        <h3 style="font-size:0.95rem;margin:0 0 0.4rem">${t("staffRulesPD")}</h3>
        <p style="font-size:0.82rem;color:var(--muted);margin:0;line-height:1.5">${t("staffRulesPDDesc")}</p>
      </section>

      <section style="margin-bottom:1.25rem">
        <h3 style="font-size:0.95rem;margin:0 0 0.4rem">${t("staffRulesLateMin")}</h3>
        <p style="font-size:0.82rem;color:var(--muted);margin:0;line-height:1.5">${t("staffRulesLateMinDesc")}</p>
      </section>

      <section style="margin-bottom:1.25rem">
        <h3 style="font-size:0.95rem;margin:0 0 0.4rem">${t("staffRulesLateCount")}</h3>
        <p style="font-size:0.82rem;color:var(--muted);margin:0;line-height:1.5">${t("staffRulesLateCountDesc")}</p>
      </section>
    </div>
  `;

  const attendance = document.createElement("section");
  attendance.id        = "staff-attendance";
  attendance.className = "module-subpage";
  attendance.hidden    = true;
  attendance.innerHTML = `
    <div class="att-page" id="attendance-app">
      <div class="att-upload-grid">
        <label class="att-upload-card" id="att-card-jpayroll">
          <input type="file" id="att-file-jpayroll" accept=".xlsx,.xls" />
          <span class="att-upload-icon">▤</span>
          <strong>JPAYROLL Attendance File</strong>
          <small>Attendance Status by Criteria Report [M1] - .xlsx</small>
          <em id="att-filename-jpayroll"></em>
        </label>
        <label class="att-upload-card" id="att-card-ket">
          <input type="file" id="att-file-ket" accept=".xlsx,.xls" />
          <span class="att-upload-icon">✎</span>
          <strong>Keterangan File <small>(optional)</small></strong>
          <small>Columns: No. Peg. | Add | Izin | Sakit | Cuti | Keterangan</small>
          <em id="att-filename-ket"></em>
        </label>
      </div>

      <input type="file" id="att-file-patch-ket" accept=".xlsx,.xls" style="display:none" />
      <button type="button" class="primary-button secondary" id="att-patch-ket-btn" style="width:100%" hidden>✎ Update Keterangan (patch active period)</button>
      <div id="att-pd-bar">
        <label>PD Cutoff: <input type="text" id="att-pd-cutoff" placeholder="06:23" style="width:5em" /></label>
        <button type="button" class="primary-button secondary" id="att-pd-compute-btn" style="margin-left:0.5rem">🔄 Compute PD</button>
        <input type="file" id="att-file-pd" accept=".xlsx,.xls" style="display:none" />
        <button type="button" class="primary-button secondary" id="att-pd-upload-btn" style="margin-left:0.5rem">✎ Upload PD Excel</button>
      </div>
      <button type="button" class="primary-button" id="att-save-btn" style="width:100%" hidden>Save to DB</button>

      <div class="att-er-panel">
        <strong>Hari Efektif (ER)</strong>
        <label>Guru <input type="number" id="att-er-guru" min="1" max="31" value="18" /></label>
        <label>Karyawan <input type="number" id="att-er-karyawan" min="1" max="31" value="18" /></label>
        <label>Satpam <input type="number" id="att-er-satpam" min="1" max="31" value="24" /></label>
        <span>Periode: <b id="att-period-er">-</b></span>
      </div>

      <div class="att-preview" id="att-preview" hidden>
        <span>Parsed <strong id="att-preview-count">0</strong> employees for <strong id="att-preview-period">-</strong>.</span>
        <span id="att-preview-icc"></span>
      </div>

      <div class="att-stats" id="att-stats" hidden>
        <article class="module-stat"><span>Total Karyawan</span><strong id="att-s-total">0</strong><small id="att-s-period">-</small></article>
        <article class="module-stat"><span>Rata-rata Hadir</span><strong class="good" id="att-s-pct">0%</strong><small>TotR vs ER</small></article>
        <article class="module-stat"><span>Total Tidak Hadir</span><strong class="bad" id="att-s-absen">0</strong><small>Izin / Sakit / Cuti</small></article>
        <article class="module-stat"><span>Total Terlambat</span><strong class="warn" id="att-s-late">0</strong><small>kumulatif kejadian</small></article>
        <article class="module-stat"><span>ICC Klarifikasi</span><strong id="att-s-icc">0</strong><small>employees with ICC</small></article>
        <article class="module-stat"><span>Perhatian Khusus</span><strong class="bad" id="att-s-alert">0</strong><small>absen or late</small></article>
      </div>

      <div class="att-controls" id="att-controls" hidden>
        <div class="att-tabs">
          <button class="active" type="button" data-att-tab="rekap">Per Karyawan</button>
          <button type="button" data-att-tab="unit">Per Unit</button>
          <button type="button" data-att-tab="alert">Perhatian Khusus</button>
          <button type="button" data-att-tab="icc">ICC Klarifikasi</button>
        </div>
        <div class="att-period-nav">
          <button type="button" id="att-prev-period">‹</button>
          <strong id="att-period-label">-</strong>
          <button type="button" id="att-next-period">›</button>
          <button type="button" id="att-latest-period">Latest</button>
        </div>
        <div class="att-filter-row">
          <div class="att-search"><span>⌕</span><input id="att-search" type="search" placeholder="Search employee..." /></div>
          <select id="att-unit"><option value="">All Units</option></select>
          <select id="att-stat"><option value="">All Stat.</option><option>GT</option><option>GK</option><option>KT</option><option>PT</option></select>
          <select id="att-status"><option value="">All Status</option><option value="icc">Has ICC</option><option value="alert">Perhatian Khusus</option><option value="clean">Normal</option></select>
          <button class="primary-button secondary" type="button" id="att-export">Export</button>
        </div>
      </div>

      <section class="att-table-shell">
        <div class="att-empty" id="att-empty">
          <strong>No attendance data yet</strong>
          <span>Upload the JPAYROLL file to get started. Keterangan is optional.</span>
        </div>
        <div class="att-table-scroll" id="att-table-scroll" hidden>
          <table class="att-table">
            <thead id="att-table-head"></thead>
            <tbody id="att-table-body"></tbody>
          </table>
        </div>
      </section>
      <div class="att-toast" id="att-toast"></div>
    </div>
  `;

  page.append(subnav, overview, rules, attendance);

  const openSubpage = (id) => {
    page.querySelectorAll("[data-subpage]").forEach((button) => {
      button.classList.toggle("active", button.dataset.subpage === id);
    });
    page.querySelectorAll(".module-subpage").forEach((subpage) => {
      subpage.hidden = subpage.id !== id;
    });
  };

  page.querySelectorAll("[data-subpage]").forEach((button) => {
    button.addEventListener("click", () => openSubpage(button.dataset.subpage));
  });

  page.querySelectorAll(".module-feature-list button").forEach((button) => {
    if (button.textContent.trim().toLowerCase() === "kehadiran") {
      button.addEventListener("click", () => {
        openSubpage("staff-attendance");
        window.setTimeout(() => window.attendanceModule?.init?.(), 0);
      });
    }
  });
}
