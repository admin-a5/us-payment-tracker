window.studentsModule = (() => {
  const I18N = {
    en: {
      eyebrow: "Academic Records", title: "Students",
      subtitle: "Recap, class list, student data, and mutations.",
      btnUpload: "Upload Data", btnExport: "Export",
      tabRekap: "Rekap", tabKelas: "Daftar Kelas",
      tabData: "Data Siswa", tabMutasi: "Mutasi",
      statTotal: "Total Students", statClasses: "Active Classes",
      statGender: "Gender", statGradeX: "Grade X",
      statGradeXI: "Grade XI", statGradeXII: "Grade XII",
      searchPlaceholder: "Search student…", filterAll: "All Classes",
      filterGrade: "All Grades", gradeX: "Grade X", gradeXI: "Grade XI", gradeXII: "Grade XII",
      tahunAjaran: "Academic Year", allYears: "All Years",
      colNo: "#", colName: "Name", colNickname: "Nickname", colClass: "Class",
      colInduk: "No. Induk", colGender: "Gender", colDob: "Date of Birth",
      colReligion: "Religion", colBlood: "Blood", colOriginSchool: "Origin School",
      colPhone: "Phone", colParent: "Father", colNisn: "NISN", colHealth: "Health Notes",
      colWali: "Homeroom Teacher",
      noData: "No student data yet", noDataHint: "Upload the student master Excel file to get started.",
      noMatch: "No students match the current filters.",
      mutasiTitle: "Student Mutations", mutasiSub: "Transfer in / transfer out records.",
    },
    id: {
      eyebrow: "Data Akademik", title: "Peserta Didik",
      subtitle: "Rekap, daftar kelas, data siswa, dan mutasi.",
      btnUpload: "Unggah Data", btnExport: "Ekspor",
      tabRekap: "Rekap", tabKelas: "Daftar Kelas",
      tabData: "Data Siswa", tabMutasi: "Mutasi",
      statTotal: "Total Siswa", statClasses: "Kelas Aktif",
      statGender: "Jenis Kelamin", statGradeX: "Kelas X",
      statGradeXI: "Kelas XI", statGradeXII: "Kelas XII",
      searchPlaceholder: "Cari siswa…", filterAll: "Semua Kelas",
      filterGrade: "Semua Tingkat", gradeX: "Kelas X", gradeXI: "Kelas XI", gradeXII: "Kelas XII",
      tahunAjaran: "Tahun Ajaran", allYears: "Semua TA",
      colNo: "#", colName: "Nama", colNickname: "Panggilan", colClass: "Kelas",
      colInduk: "No. Induk", colGender: "J/K", colDob: "Tanggal Lahir",
      colReligion: "Agama", colBlood: "Gol. Darah", colOriginSchool: "Asal Sekolah",
      colPhone: "HP", colParent: "Nama Ayah", colNisn: "NISN", colHealth: "Catatan Kesehatan",
      colWali: "Wali Kelas",
      noData: "Belum ada data siswa", noDataHint: "Unggah file Excel data master peserta didik untuk memulai.",
      noMatch: "Tidak ada siswa yang sesuai filter.",
      mutasiTitle: "Mutasi Siswa", mutasiSub: "Catatan mutasi masuk / mutasi keluar.",
    }
  };

  // ── State ──────────────────────────────────────────────────────────────────
  let studentsData   = [];
  let kelasData      = [];   // [{kelas, wali, gender_l, gender_p}] from upload
  let activeTab      = "rekap";
  let activeTa       = "";   // e.g. "2526" | "" = all
  let detectedTas    = [];   // e.g. ["2324","2425","2526"]
  let taColMap       = {};   // { "2526": {kls:12, no:13}, … }

  const lang = () => window._studentsLang || localStorage.getItem("schoolos_language") || "en";
  const T    = (k)  => (I18N[lang()] || I18N.en)[k] || k;
  const $    = (id) => document.getElementById(id);

  // ── TA helpers ─────────────────────────────────────────────────────────────
  function taLabel(key) {
    if (!key) return T("allYears");
    const y = String(key);
    return y.length === 4 ? `20${y.slice(0,2)}/20${y.slice(2,4)}` : y;
  }

  // Returns true if value looks like a valid class name (e.g. "X-1", "XI-IPA2")
  // Returns false for pure numbers ("1", "10") which are NO values stored incorrectly
  function isValidClass(v) {
    if (!v) return false;
    const s = String(v).trim();
    if (!s) return false;
    // Valid class must start with X, XI, or XII (Roman numeral grade)
    return /^X{1,3}(I{0,3})?(-|$)/i.test(s) || /^X{1,3}(I{0,3})?\s/i.test(s);
  }

  function studentClassForTa(s, ta) {
    if (!ta) {
      for (const t of [...detectedTas].reverse()) {
        const kls = s.taData?.[t]?.kls;
        if (kls && isValidClass(kls)) return kls;
      }
      return s.class && isValidClass(s.class) ? s.class : "";
    }
    const kls = s.taData?.[ta]?.kls;
    return (kls && isValidClass(kls)) ? kls : "";
  }

  function studentNoForTa(s, ta) {
    const t = ta || detectedTas[detectedTas.length - 1] || "";
    return (s.taData && s.taData[t] && s.taData[t].no) || "";
  }

  function effectiveClass(s) { return studentClassForTa(s, activeTa); }

  function activeStudents() {
    if (!activeTa) return studentsData;
    return studentsData.filter(s => Boolean(studentClassForTa(s, activeTa)));
  }

  // ── Mount ──────────────────────────────────────────────────────────────────
  function mount() {
    const section = $("students");
    if (!section) return;
    section.removeAttribute("data-simple-page");
    section.innerHTML = buildShell();
    bindEvents();
    setActiveTab("rekap");

    // Inject loading overlay ke body sekali saja (tidak ikut di-reset oleh innerHTML)
    if (!$("pd-loading-overlay")) {
      const overlay = document.createElement("div");
      overlay.id = "pd-loading-overlay";
      overlay.style.cssText = "display:none;position:fixed;inset:0;z-index:9000;align-items:center;justify-content:center;background:rgba(0,0,0,0.55);backdrop-filter:blur(6px)";
      overlay.innerHTML = `
        <div style="background:var(--surface);border:1px solid var(--line);border-radius:14px;
          padding:2rem 2.5rem;display:flex;flex-direction:column;align-items:center;gap:1rem;
          box-shadow:0 8px 40px rgba(0,0,0,0.4);min-width:18rem;text-align:center">
          <div style="width:2.5rem;height:2.5rem;border-radius:50%;
            border:3px solid var(--line);border-top-color:var(--accent);
            animation:pd-spin 0.8s linear infinite"></div>
          <strong id="pd-loading-title" style="font-size:0.95rem;color:var(--text)">Memuat data…</strong>
          <span id="pd-loading-sub" style="font-size:0.8rem;color:var(--muted)">Mohon tunggu sebentar</span>
          <div style="width:100%;height:4px;background:var(--line);border-radius:2px;overflow:hidden">
            <div id="pd-loading-bar" style="height:100%;width:0%;background:var(--accent);border-radius:2px;transition:width 0.3s ease"></div>
          </div>
        </div>
        <style>@keyframes pd-spin{to{transform:rotate(360deg)}}</style>`;
      document.body.appendChild(overlay);
    }
    // Pastikan overlay tersembunyi saat mount (state bersih)
    hideLoading();
  }

  // ── Shell HTML ─────────────────────────────────────────────────────────────
  function buildShell() {
    return `
    <div class="module-page" id="students-app">

      <!-- Page heading -->
      <div class="page-heading module-heading">
        <div>
          <p class="eyebrow" id="pd-eyebrow">${T("eyebrow")}</p>
          <h1 id="pd-title">${T("title")}</h1>
          <span id="pd-subtitle">${T("subtitle")}</span>
        </div>
        <div class="module-actions">
          <span id="pd-last-updated" style="color:var(--muted);font-size:0.78rem;align-self:center"></span>
          <button class="primary-button secondary" type="button" id="pd-load-db">Load DB</button>
          <button class="primary-button secondary" type="button" id="pd-clear-db" style="color:var(--due-text);border-color:var(--due-border)" hidden>Clear DB</button>
          <button class="primary-button secondary" type="button" id="pd-save-db" hidden>Save to DB</button>
          <label class="primary-button secondary" id="pd-upload-btn" style="cursor:pointer">
            <input type="file" id="pd-file" accept=".xlsx,.xls" style="display:none"/>
            <span id="pd-upload-label">${T("btnUpload")}</span>
          </label>
          <button class="primary-button" id="pd-export">${T("btnExport")}</button>
        </div>
      </div>

      <!-- Subnav -->
      <div class="module-subnav" role="tablist" id="pd-subnav">
        <button class="active" type="button" data-pd-tab="rekap"  id="pd-subnav-rekap">${T("tabRekap")}</button>
        <button type="button"                data-pd-tab="kelas"  id="pd-subnav-kelas">${T("tabKelas")}</button>
        <button type="button"                data-pd-tab="data"   id="pd-subnav-data">${T("tabData")}</button>
        <button type="button"                data-pd-tab="mutasi" id="pd-subnav-mutasi">${T("tabMutasi")}</button>
      </div>

      <!-- ══════════ REKAP ══════════ -->
      <section class="module-subpage" id="pd-sub-rekap">

        <!-- TA selector -->
        <div id="pd-ta-bar" style="display:none;align-items:center;gap:0.65rem;flex-wrap:wrap">
          <span style="font-size:0.75rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.05em">${T("tahunAjaran")}</span>
          <select id="pd-ta-select" style="min-height:2.1rem;padding:0 0.7rem;border:1px solid var(--line);border-radius:0.45rem;color:var(--text);background:var(--surface-soft);font-size:0.84rem">
            <option value="">${T("allYears")}</option>
          </select>
        </div>

        <!-- Stat cards: row 1 -->
        <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0.85rem" id="pd-stat-row1">
          <!-- Card 1: Total Siswa -->
          <article class="module-stat" style="background:linear-gradient(135deg,#13bbb2,#0f756f);border:none;color:#fff">
            <span style="color:rgba(255,255,255,.78);font-size:0.72rem;font-weight:800;text-transform:uppercase" id="pd-lbl-total">${T("statTotal")}</span>
            <strong style="font-size:2.4rem;color:#fff;margin-top:.5rem" id="pd-s-total">0</strong>
            <small style="color:rgba(255,255,255,.65);font-size:0.75rem" id="pd-s-ta-label">—</small>
          </article>

          <!-- Card 2: Kelas Aktif -->
          <article class="module-stat" style="background:linear-gradient(135deg,#7b5cff,#271184);border:none;color:#fff">
            <span style="color:rgba(255,255,255,.78);font-size:0.72rem;font-weight:800;text-transform:uppercase" id="pd-lbl-classes">${T("statClasses")}</span>
            <strong style="font-size:2.4rem;color:#fff;margin-top:.5rem" id="pd-s-classes">0</strong>
            <small style="color:rgba(255,255,255,.65);font-size:0.75rem" id="pd-s-class-detail">X: 0 / XI: 0 / XII: 0</small>
          </article>

          <!-- Card 3: Gender -->
          <article class="module-stat" style="background:linear-gradient(135deg,#f65aa0,#77113e);border:none;color:#fff">
            <span style="color:rgba(255,255,255,.78);font-size:0.72rem;font-weight:800;text-transform:uppercase" id="pd-lbl-gender">${T("statGender")}</span>
            <div style="display:flex;gap:1.2rem;margin-top:.5rem;align-items:flex-end">
              <div>
                <div style="font-size:1.85rem;font-weight:800;color:#fff;line-height:1" id="pd-s-male">0</div>
                <div style="font-size:0.7rem;color:rgba(255,255,255,.7);margin-top:.15rem">♂ Laki</div>
              </div>
              <div style="width:1px;height:2.5rem;background:rgba(255,255,255,.3)"></div>
              <div>
                <div style="font-size:1.85rem;font-weight:800;color:#fff;line-height:1" id="pd-s-female">0</div>
                <div style="font-size:0.7rem;color:rgba(255,255,255,.7);margin-top:.15rem">♀ Perempuan</div>
              </div>
            </div>
          </article>
        </div>

        <!-- Stat cards: row 2 — per grade -->
        <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0.85rem" id="pd-stat-row2">
          ${buildGradeCard("X",  "pd-gx",  "#13bbb2")}
          ${buildGradeCard("XI", "pd-gxi", "#7b5cff")}
          ${buildGradeCard("XII","pd-gxii","#ff9b54")}
        </div>

        <!-- No-data empty state for rekap -->
        <div id="pd-rekap-empty" class="att-empty" style="display:none">
          <strong id="pd-empty-title">${T("noData")}</strong>
          <span id="pd-empty-hint">${T("noDataHint")}</span>
        </div>
      </section>

      <!-- ══════════ DAFTAR KELAS ══════════ -->
      <section class="module-subpage" id="pd-sub-kelas" hidden>
        <div style="display:grid;gap:1rem">

          <!-- Upload card for wali kelas file -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.85rem">
            <label class="us-upload-card" id="pd-kelas-upload-card" style="min-height:7rem">
              <input type="file" id="pd-kelas-file" accept=".xlsx,.xls" style="display:none"/>
              <span class="us-upload-icon">◫</span>
              <strong>File Daftar Kelas & Wali</strong>
              <small>Kolom: Kelas | Wali Kelas | L | P (opsional)</small>
              <em id="pd-kelas-filename" style="color:var(--muted);font-size:.75rem;font-style:normal"></em>
            </label>
            <div class="module-stat" style="display:flex;flex-direction:column;gap:.5rem;justify-content:center">
              <span style="color:var(--muted);font-size:0.72rem;font-weight:800;text-transform:uppercase">Info Upload</span>
              <p style="color:var(--muted);font-size:0.8rem;margin:0;line-height:1.6">
                Upload Excel dengan kolom:<br>
                <b style="color:var(--accent)">Kelas</b> · <b style="color:var(--accent)">Wali Kelas</b> · <b style="color:var(--accent)">L</b> · <b style="color:var(--accent)">P</b><br>
                Atau biarkan kosong — data L/P otomatis dari data siswa.
              </p>
            </div>
          </div>

          <!-- Controls -->
          <div style="display:flex;align-items:center;gap:.65rem;flex-wrap:wrap">
            <div class="us-search" style="flex:1">
              <span>⌕</span>
              <input id="pd-kelas-search" type="search" placeholder="Cari kelas atau wali kelas…"/>
            </div>
            <select id="pd-kelas-grade" style="min-height:2.35rem;padding:0 0.65rem;border:1px solid var(--line);border-radius:0.45rem;color:var(--text);background:var(--surface-soft)">
              <option value="">Semua Tingkat</option>
              <option value="X">Kelas X</option>
              <option value="XI">Kelas XI</option>
              <option value="XII">Kelas XII</option>
            </select>
            <select id="pd-kelas-ta" style="min-height:2.35rem;padding:0 0.65rem;border:1px solid var(--line);border-radius:0.45rem;color:var(--text);background:var(--surface-soft)">
              <option value="">${T("allYears")}</option>
            </select>
          </div>

          <!-- Kelas table -->
          <div class="module-table-card" style="padding:1rem">
            <div class="panel-heading">
              <h2>Daftar Kelas</h2>
              <span class="module-count" id="pd-kelas-count">0 kelas</span>
            </div>
            <div class="module-table-scroll" style="border:1px solid var(--line);border-radius:.5rem;overflow:hidden">
              <table class="module-table" style="min-width:36rem">
                <thead>
                  <tr>
                    <th>Kelas</th>
                    <th style="text-align:center">♂ L</th>
                    <th style="text-align:center">♀ P</th>
                    <th style="text-align:center">Total</th>
                    <th>${T("colWali")}</th>
                    <th style="text-align:center">Aksi</th>
                  </tr>
                </thead>
                <tbody id="pd-kelas-body">
                  <tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--muted)">${T("noData")}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════ DATA SISWA ══════════ -->
      <section class="module-subpage" id="pd-sub-data" hidden>

        <!-- TA selector for data siswa -->
        <div id="pd-data-ta-bar" style="display:none;align-items:center;gap:0.65rem;flex-wrap:wrap">
          <span style="font-size:0.75rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.05em">${T("tahunAjaran")}</span>
          <select id="pd-data-ta-select" style="min-height:2.1rem;padding:0 0.7rem;border:1px solid var(--line);border-radius:0.45rem;color:var(--text);background:var(--surface-soft);font-size:0.84rem">
            <option value="">${T("allYears")}</option>
          </select>
        </div>

        <!-- Filters -->
        <div class="module-toolbar">
          <div class="module-search"><span>⌕</span><input id="pd-search" type="search" placeholder="${T("searchPlaceholder")}"/></div>
          <select id="pd-filter-grade">
            <option value="">${T("filterGrade")}</option>
            <option value="X">${T("gradeX")}</option>
            <option value="XI">${T("gradeXI")}</option>
            <option value="XII">${T("gradeXII")}</option>
          </select>
          <select id="pd-filter-class"><option value="">${T("filterAll")}</option></select>
          <select id="pd-filter-religion"><option value="">${T("statGender")}</option></select>
          <select id="pd-filter-gender">
            <option value="">♂/♀</option>
            <option value="LAKI-LAKI">♂ ${T("statGradeX").includes("Grade")?"Male":"Laki-laki"}</option>
            <option value="PEREMPUAN">♀ ${T("statGradeX").includes("Grade")?"Female":"Perempuan"}</option>
          </select>
        </div>

        <section class="module-table-card">
          <div class="panel-heading">
            <h2 id="pd-data-title">${T("tabData")}</h2>
            <span class="module-count" id="pd-count">0</span>
          </div>
          <div id="pd-empty" class="att-empty">
            <strong id="pd-empty2-title">${T("noData")}</strong>
            <span id="pd-empty2-hint">${T("noDataHint")}</span>
          </div>
          <div class="module-table-scroll" id="pd-table-wrap" hidden>
            <table class="module-table">
              <thead id="pd-thead"></thead>
              <tbody id="pd-tbody"></tbody>
            </table>
          </div>
        </section>
      </section>

      <!-- ══════════ MUTASI ══════════ -->
      <section class="module-subpage" id="pd-sub-mutasi" hidden>

        <!-- TA selector for mutasi -->
        <div id="pd-mut-ta-bar" style="display:none;align-items:center;gap:0.65rem;flex-wrap:wrap;margin-bottom:0.5rem">
          <span style="font-size:0.75rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.05em">${T("tahunAjaran")}</span>
          <select id="pd-mut-ta-select" style="min-height:2.1rem;padding:0 0.7rem;border:1px solid var(--line);border-radius:0.45rem;color:var(--text);background:var(--surface-soft);font-size:0.84rem">
            <option value="">${T("allYears")}</option>
          </select>
        </div>

        <div class="module-table-card" style="padding:1rem">
          <div class="panel-heading">
            <h2 id="pd-mutasi-title">${T("mutasiTitle")}</h2>
          </div>
          <p style="color:var(--muted);font-size:0.85rem;margin:0 0 1rem">${T("mutasiSub")}</p>
          <div id="pd-mutasi-body"></div>
        </div>
      </section>

      <div class="att-toast" id="pd-toast"></div>
    </div>`;
  }

  function buildGradeCard(grade, prefix, color) {
    return `
      <article class="module-stat" style="border:1px solid ${color}40;background:${color}12;gap:0.5rem">
        <span style="color:var(--muted);font-size:0.72rem;font-weight:800;text-transform:uppercase">Kelas ${grade}</span>
        <strong style="font-size:1.7rem;line-height:1.1;color:${color}" id="${prefix}-total">0</strong>
        <div style="display:flex;gap:.85rem">
          <span style="font-size:0.78rem;color:var(--muted)">♂ <b style="color:var(--text)" id="${prefix}-l">0</b></span>
          <span style="font-size:0.78rem;color:var(--muted)">♀ <b style="color:var(--text)" id="${prefix}-p">0</b></span>
          <span style="font-size:0.78rem;color:var(--muted)" id="${prefix}-kelas-count"></span>
        </div>
      </article>`;
  }

  // ── Bind events ─────────────────────────────────────────────────────────────
  function bindEvents() {
    $("pd-file").addEventListener("change", (e) => { const f = e.target.files[0]; if (f) processFile(f); });
    $("pd-export").addEventListener("click", exportData);
    $("pd-load-db").addEventListener("click", loadFromSupabase);
    $("pd-save-db").addEventListener("click", saveToSupabase);
    $("pd-clear-db").addEventListener("click", clearDb);

    // Rekap TA dropdown
    $("pd-ta-select").addEventListener("change", (e) => {
      activeTa = e.target.value;
      syncAllTaDropdowns("rekap");
      updateStats();
    });

    // Data siswa TA dropdown
    $("pd-data-ta-select").addEventListener("change", (e) => {
      activeTa = e.target.value;
      syncAllTaDropdowns("data");
      populateClassFilter();
      renderData();
    });

    // Mutasi TA dropdown
    $("pd-mut-ta-select").addEventListener("change", (e) => {
      activeTa = e.target.value;
      syncAllTaDropdowns("mutasi");
      renderMutasi();
    });

    // Data siswa filters
    $("pd-search").addEventListener("input", renderData);
    $("pd-filter-grade").addEventListener("change", () => { populateClassFilter(); renderData(); });
    $("pd-filter-class").addEventListener("change", renderData);
    $("pd-filter-religion").addEventListener("change", renderData);
    $("pd-filter-gender").addEventListener("change", renderData);

    // Daftar kelas
    $("pd-kelas-file").addEventListener("change", (e) => { const f = e.target.files[0]; if (f) processKelasFile(f); });
    $("pd-kelas-search").addEventListener("input", renderKelas);
    $("pd-kelas-grade").addEventListener("change", renderKelas);
    $("pd-kelas-ta").addEventListener("change", (e) => {
      activeTa = e.target.value;
      syncAllTaDropdowns("kelas");
      renderKelas();
    });

    // Subnav tabs
    document.querySelectorAll("[data-pd-tab]").forEach(b =>
      b.addEventListener("click", () => setActiveTab(b.dataset.pdTab)));

    // Upload drag-drop for main file
    const lbl = $("pd-upload-btn");
    lbl.addEventListener("dragover", (e) => { e.preventDefault(); lbl.style.borderColor = "var(--accent)"; });
    lbl.addEventListener("dragleave", () => { lbl.style.borderColor = ""; });
    lbl.addEventListener("drop", (e) => { e.preventDefault(); lbl.style.borderColor = ""; const f = e.dataTransfer.files[0]; if (f) processFile(f); });

    // Upload drag-drop for kelas file
    const kelasCard = $("pd-kelas-upload-card");
    kelasCard.addEventListener("dragover", (e) => { e.preventDefault(); kelasCard.classList.add("dragover"); });
    kelasCard.addEventListener("dragleave", () => kelasCard.classList.remove("dragover"));
    kelasCard.addEventListener("drop", (e) => { e.preventDefault(); kelasCard.classList.remove("dragover"); const f = e.dataTransfer.files[0]; if (f) processKelasFile(f); });
  }

  function setActiveTab(tab) {
    activeTab = tab;
    document.querySelectorAll("[data-pd-tab]").forEach(b => b.classList.toggle("active", b.dataset.pdTab === tab));
    ["rekap","kelas","data","mutasi"].forEach(t => {
      const el = $(`pd-sub-${t}`);
      if (el) el.hidden = t !== tab;
    });
    if (tab === "kelas")   renderKelas();
    else if (tab === "data")   renderData();
    else if (tab === "mutasi") renderMutasi();
    else renderRekap();
  }

  // Sync all TA dropdowns to same value
  function syncAllTaDropdowns(except) {
    const ids = ["pd-ta-select","pd-data-ta-select","pd-mut-ta-select","pd-kelas-ta"];
    ids.forEach(id => { const el = $(id); if (el) el.value = activeTa; });
  }

  // ── Parse main student file ────────────────────────────────────────────────
  function processFile(file) {
    if (!window.XLSX) { toast("Excel parser not loaded."); return; }
    showLoading("Membaca file Excel…", file.name);
    setLoadingProgress(20, "Membuka workbook…");
    toast(`Parsing ${file.name}…`);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        setLoadingProgress(50, "Mendeteksi kolom dan TA…");
        const wb = window.XLSX.read(e.target.result, { type: "binary", cellDates: false });
        setLoadingProgress(70, "Parsing baris data…");
        parseStudents(wb, file.name);
      } catch (err) {
        hideLoading();
        toast(`Parse error: ${err.message}`);
      }
    };
    reader.readAsBinaryString(file);
  }

  function parseStudents(wb, filename) {
    // Detect sheet: prefer sheets named like "2526", "2526 LATE", "SISWA", "DATA"
    // Exclude sheets that look like class lists (e.g. "X-1", "XI IPA")
    const sheetName = wb.SheetNames.find(s => /^\d{4}/i.test(s.trim())) ||
                      wb.SheetNames.find(s => /siswa|data|master/i.test(s)) ||
                      wb.SheetNames[0];
    const rows = window.XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, defval: "" });

    // Find header row — look for row containing NAMA + (KELAS or INDUK or TAHUN or STUDENT)
    let hr = 0;
    for (let i = 0; i < Math.min(8, rows.length); i++) {
      const t = rows[i].join(" ").toUpperCase();
      if (t.includes("NAMA") && (t.includes("KELAS") || t.includes("INDUK") || t.includes("TAHUN") || t.includes("STUDENT"))) { hr = i; break; }
    }
    // Expand to 60 cols to capture all TA columns
    const headers = rows[hr].slice(0, 60).map(h => String(h).trim().toUpperCase().replace(/[\s\/\-\.\n]+/g, "_"));

    const col = (...names) => {
      for (const n of names) {
        const idx = headers.findIndex(h => h === n || h.includes(n));
        if (idx >= 0) return idx;
      }
      return -1;
    };

    // Detect TA columns — pattern: "2324_KLS", "2324 KLS", "2526_KLS" etc.
    taColMap = {};
    headers.forEach((h, i) => {
      const m = h.match(/^(\d{4})_KLS$/);
      if (m) taColMap[m[1]] = { kls: i, no: i + 1 };
    });
    detectedTas = Object.keys(taColMap).sort();

    const idx = {
      code:        col("STUDENT_CODE","STUDENTCODE"),
      name:        col("NAMA_SISWA","NAMA"),
      nickname:    col("NAMA_PANGGILAN","PANGGILAN"),
      nisn:        col("NISN"),
      nik:         col("NIK"),
      noInduk:     col("NO_INDUK","NOINDUK","INDUK"),
      status:      col("STATUS"),
      tahunAjaran: col("TAHUN_AJARAN"),
      yearKeluar:  col("TAHUN_KELUAR"),
      birthPlace:  col("TEMPAT_LAHIR"),
      dob:         col("TGL_LAHIR","TANGGAL_LAHIR"),
      // "L/P" normalizes to "L_P" after replace; also handle plain "L_P" or "GENDER"
      gender:      col("L_P","GENDER","JENIS_KELAMIN"),
      religion:    col("AGAMA"),
      address:     col("ALAMAT"),
      phone:       col("HP_SISWA","HP"),
      email:       col("EMAIL_SISWA","EMAIL"),
      originSchool:col("SMP_ASAL_SEKOLAH","ASAL_SEKOLAH"),
      // "GOL. DAR" → "GOL__DAR" after double-replace; also "GOL_DAR" or "DARAH"
      blood:       col("GOL__DAR","GOL_DAR","DARAH","GOL_"),
      health:      col("RIWAYAT_PENYAKIT","RIWAYAT"),
      kelainan:    col("KELAINAN_JASMANI","KELAINAN"),
      fatherName:  col("AYAH_NAMA","AYAH"),
    };

    const parsed = [];
    for (let i = hr + 1; i < rows.length; i++) {
      const r = rows[i];
      const name = String(r[idx.name] || "").trim();
      if (!name) continue;

      const taData = {};
      detectedTas.forEach(ta => {
        taData[ta] = {
          kls: normalizeClass(r[taColMap[ta].kls]),
          no:  String(r[taColMap[ta].no] || "").trim()
        };
      });

      let defaultClass = "";
      for (const ta of [...detectedTas].reverse()) {
        if (taData[ta] && taData[ta].kls) { defaultClass = taData[ta].kls; break; }
      }

      parsed.push({
        code:         String(r[idx.code] || "").trim(),
        name,
        nickname:     String(r[idx.nickname] || "").trim(),
        nisn:         String(r[idx.nisn] || "").trim(),
        nik:          idx.nik >= 0 ? String(r[idx.nik] || "").trim() : "",
        noInduk:      String(r[idx.noInduk] || "").trim(),
        status:       idx.status >= 0 ? String(r[idx.status] || "").trim() : "",
        tahunMasuk:   String(r[idx.tahunAjaran] || "").trim(),
        yearKeluar:   String(r[idx.yearKeluar] || "").trim(),
        birthPlace:   String(r[idx.birthPlace] || "").trim(),
        dob:          String(r[idx.dob] || "").trim(),
        gender:       String(r[idx.gender] || "").trim().toUpperCase(),
        religion:     String(r[idx.religion] || "").trim().toUpperCase(),
        address:      String(r[idx.address] || "").trim(),
        phone:        String(r[idx.phone] || "").trim(),
        email:        idx.email >= 0 ? String(r[idx.email] || "").trim() : "",
        originSchool: String(r[idx.originSchool] || "").trim(),
        blood:        String(r[idx.blood] || "").trim().replace(/^0$/, ""), // clean spurious "0"
        health:       String(r[idx.health] || "").trim().replace(/^-$/, ""),
        kelainan:     idx.kelainan >= 0 ? String(r[idx.kelainan] || "").trim().replace(/^-$/, "") : "",
        fatherName:   String(r[idx.fatherName] || "").trim(),
        taData,
        class: defaultClass,
      });
    }

    studentsData = parsed;
    activeTa = detectedTas[detectedTas.length - 1] || "";

    $("pd-upload-label").textContent = `${filename} (${parsed.length})`;
    // Show Save to DB, hide Clear DB
    const saveBtn = $("pd-save-db");
    if (saveBtn) { saveBtn.hidden = false; }
    const clearBtn = $("pd-clear-db");
    if (clearBtn) clearBtn.hidden = true;

    setLoadingProgress(90, "Merender tampilan…");
    buildTaDropdowns();
    populateClassFilter();
    populateReligionFilter();
    updateStats();
    renderAll();

    setLoadingProgress(100, "Selesai!");
    setTimeout(hideLoading, 400);

    window.auditLog?.("INSERT", "students", "upload_bulk", null, { count: parsed.length, file: filename, ta: activeTa });
    toast(`${parsed.length} siswa dimuat dari "${sheetName}" — TA ${taLabel(activeTa)} terpilih.`);
  }

  // ── Parse kelas/wali file ──────────────────────────────────────────────────
  function processKelasFile(file) {
    if (!window.XLSX) { toast("Excel parser not loaded."); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb   = window.XLSX.read(e.target.result, { type: "binary", cellDates: false });
        const rows = window.XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: "" });

        let hr = 0;
        for (let i = 0; i < Math.min(5, rows.length); i++) {
          const t = rows[i].join(" ").toUpperCase();
          if (t.includes("KELAS") || t.includes("WALI")) { hr = i; break; }
        }
        const headers = rows[hr].map(h => String(h).trim().toUpperCase().replace(/\s+/g,"_"));
        const ci = headers.findIndex(h => h.includes("KELAS"));
        const wi = headers.findIndex(h => h.includes("WALI") || h.includes("GURU"));
        const li = headers.findIndex(h => h === "L" || h.includes("LAKI"));
        const pi = headers.findIndex(h => h === "P" || h.includes("PEREMPUAN"));

        const result = [];
        for (let i = hr + 1; i < rows.length; i++) {
          const r = rows[i];
          const kelas = normalizeClass(r[ci >= 0 ? ci : 0]);
          if (!kelas) continue;
          result.push({
            kelas,
            wali:  wi >= 0 ? String(r[wi] || "").trim() : "",
            genderL: li >= 0 ? Number(r[li]) || 0 : null,
            genderP: pi >= 0 ? Number(r[pi]) || 0 : null,
          });
        }
        kelasData = result;
        $("pd-kelas-filename").textContent = `${file.name} — ${result.length} kelas`;
        $("pd-kelas-upload-card").classList.add("loaded");
        renderKelas();
        toast(`${result.length} kelas dimuat dari ${file.name}.`);
      } catch (err) { toast(`Parse error: ${err.message}`); }
    };
    reader.readAsBinaryString(file);
  }

  // ── TA dropdown management ─────────────────────────────────────────────────
  function buildTaDropdowns() {
    const ids = ["pd-ta-select","pd-data-ta-select","pd-mut-ta-select","pd-kelas-ta"];
    ids.forEach(id => {
      const sel = $(id);
      if (!sel) return;
      const cur = sel.value;
      sel.innerHTML = `<option value="">${T("allYears")}</option>`;
      detectedTas.forEach(ta => {
        const opt = document.createElement("option");
        opt.value = ta;
        opt.textContent = taLabel(ta);
        sel.appendChild(opt);
      });
      sel.value = detectedTas.includes(cur) ? cur : activeTa;
    });

    // Show/hide TA bars
    const show = detectedTas.length > 0;
    ["pd-ta-bar","pd-data-ta-bar","pd-mut-ta-bar"].forEach(id => {
      const el = $(id);
      if (el) el.style.display = show ? "flex" : "none";
    });
    const kelTa = $("pd-kelas-ta");
    if (kelTa) kelTa.parentElement && (kelTa.style.display = show ? "" : "none");
  }

  // ── Filters ────────────────────────────────────────────────────────────────
  function getFiltered() {
    const base  = activeStudents();
    const q     = ($("pd-search")?.value || "").trim().toLowerCase();
    const grade = $("pd-filter-grade")?.value || "";
    const cls   = $("pd-filter-class")?.value || "";
    const rel   = $("pd-filter-religion")?.value || "";
    const gen   = $("pd-filter-gender")?.value || "";
    return base.filter(s => {
      const c = effectiveClass(s);
      if (q && !`${s.name} ${s.noInduk} ${s.code} ${s.nickname} ${c}`.toLowerCase().includes(q)) return false;
      if (grade && !c.startsWith(grade)) return false;
      if (cls   && c !== cls)            return false;
      if (rel   && s.religion !== rel)   return false;
      if (gen   && s.gender !== gen)     return false;
      return true;
    }).sort((a,b) => sortClasses(effectiveClass(a), effectiveClass(b)) || a.name.localeCompare(b.name));
  }

  function allClassesForTa() {
    return [...new Set(activeStudents().map(s => effectiveClass(s)).filter(Boolean))].sort(sortClasses);
  }

  function populateClassFilter() {
    const grade = $("pd-filter-grade")?.value || "";
    const sel = $("pd-filter-class");
    if (!sel) return;
    const classes = allClassesForTa().filter(c => !grade || c.startsWith(grade));
    sel.innerHTML = `<option value="">${T("filterAll")}</option>`;
    classes.forEach(c => { const o = document.createElement("option"); o.value = c; o.textContent = c; sel.appendChild(o); });
  }

  function populateReligionFilter() {
    const rels = [...new Set(studentsData.map(s => s.religion).filter(Boolean))].sort();
    const sel  = $("pd-filter-religion");
    if (!sel) return;
    sel.innerHTML = `<option value="">Agama</option>`;
    rels.forEach(r => { const o = document.createElement("option"); o.value = r; o.textContent = capitalize(r); sel.appendChild(o); });
  }

  // ── Render: Rekap (stat cards) ─────────────────────────────────────────────
  function renderRekap() {
    const empty = $("pd-rekap-empty");
    if (!studentsData.length) {
      if (empty) empty.style.display = "";
      return;
    }
    if (empty) empty.style.display = "none";
    updateStats();
  }

  function updateStats() {
    const data    = activeStudents();
    const classes = allClassesForTa();

    // Row 1 cards
    $("pd-s-total").textContent   = data.length;
    $("pd-s-ta-label").textContent = activeTa ? taLabel(activeTa) : T("allYears");
    $("pd-s-classes").textContent = classes.length;

    const cntX   = classes.filter(c => c.startsWith("X-")  || c === "X").length;
    const cntXI  = classes.filter(c => c.startsWith("XI-") || c === "XI").length;
    const cntXII = classes.filter(c => c.startsWith("XII-")|| c === "XII").length;
    $("pd-s-class-detail").textContent = `X: ${cntX} / XI: ${cntXI} / XII: ${cntXII}`;

    const male   = data.filter(s => s.gender.includes("LAKI")).length;
    const female = data.filter(s => s.gender.includes("PEREMPUAN")).length;
    $("pd-s-male").textContent   = male;
    $("pd-s-female").textContent = female;

    // Row 2 cards — per grade
    const grades = [
      { prefix:"pd-gx",   grade:"X"   },
      { prefix:"pd-gxi",  grade:"XI"  },
      { prefix:"pd-gxii", grade:"XII" },
    ];
    grades.forEach(({ prefix, grade }) => {
      const gradeStudents = data.filter(s => {
        const c = effectiveClass(s);
        return c === grade || c.startsWith(grade+"-");
      });
      const l = gradeStudents.filter(s => s.gender.includes("LAKI")).length;
      const p = gradeStudents.filter(s => s.gender.includes("PEREMPUAN")).length;
      const kelasCount = [...new Set(gradeStudents.map(s => effectiveClass(s)).filter(Boolean))].length;
      const t = $(`${prefix}-total`); if (t) t.textContent = gradeStudents.length;
      const le = $(`${prefix}-l`);    if (le) le.textContent = l;
      const pe = $(`${prefix}-p`);    if (pe) pe.textContent = p;
      const ke = $(`${prefix}-kelas-count`); if (ke) ke.textContent = kelasCount ? `${kelasCount} kelas` : "";
    });
  }

  // ── Render: Daftar Kelas ───────────────────────────────────────────────────
  function renderKelas() {
    if (!studentsData.length && !kelasData.length) {
      $("pd-kelas-body").innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--muted)">${T("noData")}</td></tr>`;
      $("pd-kelas-count").textContent = "0 kelas";
      return;
    }

    const q     = ($("pd-kelas-search")?.value || "").trim().toLowerCase();
    const grade = $("pd-kelas-grade")?.value || "";

    // Build class list from student data + merge with kelasData
    const base = activeStudents();
    const classGroups = {};
    base.forEach(s => {
      const c = effectiveClass(s);
      if (!c) return;
      if (!classGroups[c]) classGroups[c] = { l: 0, p: 0 };
      if (s.gender.includes("LAKI")) classGroups[c].l++;
      else classGroups[c].p++;
    });

    // Build wali map from kelasData
    const waliMap = {};
    kelasData.forEach(k => { waliMap[k.kelas] = k; });

    let classes = Object.keys(classGroups).sort(sortClasses);

    // If no student data but have kelasData
    if (!base.length && kelasData.length) {
      classes = kelasData.map(k => k.kelas).sort(sortClasses);
      classes.forEach(c => {
        const k = waliMap[c];
        classGroups[c] = { l: k?.genderL ?? 0, p: k?.genderP ?? 0 };
      });
    }

    // Apply filters
    classes = classes.filter(c => {
      if (grade && !c.startsWith(grade+"-") && c !== grade) return false;
      if (q && !c.toLowerCase().includes(q) && !(waliMap[c]?.wali||"").toLowerCase().includes(q)) return false;
      return true;
    });

    $("pd-kelas-count").textContent = `${classes.length} kelas`;

    if (!classes.length) {
      $("pd-kelas-body").innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--muted)">${T("noMatch")}</td></tr>`;
      return;
    }

    $("pd-kelas-body").innerHTML = classes.map(c => {
      const g    = classGroups[c] || { l: 0, p: 0 };
      const kd   = waliMap[c];
      const l    = kd?.genderL ?? g.l;
      const p    = kd?.genderP ?? g.p;
      const wali = kd?.wali || "—";
      const total = l + p;
      // Grade color accent
      const color = c.startsWith("XII") ? "#ff9b54" : c.startsWith("XI") ? "#7b5cff" : "#3ecf8e";
      return `<tr>
        <td><strong style="color:${color}">${escH(c)}</strong></td>
        <td style="text-align:center"><span class="att-num" style="color:var(--paid-text)">${l}</span></td>
        <td style="text-align:center"><span class="att-num" style="color:var(--partial-text)">${p}</span></td>
        <td style="text-align:center"><span class="att-num">${total}</span></td>
        <td><span style="font-size:0.85rem">${escH(wali)}</span></td>
        <td style="text-align:center">
          <button type="button" class="action-button" data-kelas="${escH(c)}" style="font-size:0.72rem;width:auto;padding:0 0.55rem" onclick="window._pdViewKelas('${escH(c)}')">Lihat</button>
        </td>
      </tr>`;
    }).join("");
  }

  // View kelas detail — shows a mini popup with student list
  window._pdViewKelas = function(kelas) {
    const students = activeStudents()
      .filter(s => effectiveClass(s) === kelas)
      .sort((a,b) => {
        const na = Number(studentNoForTa(a, activeTa)) || 999;
        const nb = Number(studentNoForTa(b, activeTa)) || 999;
        return na - nb || a.name.localeCompare(b.name);
      });

    // Re-use the finance popup or create own
    const popup = document.getElementById("us-popup");
    if (popup && document.getElementById("us-popup-title")) {
      document.getElementById("us-popup-title").textContent = `Kelas ${kelas}`;
      document.getElementById("us-popup-meta").textContent  = `${students.length} siswa — TA ${taLabel(activeTa)||"Semua"}`;
      document.getElementById("us-popup-body").innerHTML    = `
        <div style="overflow-x:auto;max-height:55vh">
          <table style="width:100%;border-collapse:collapse;font-size:0.82rem">
            <thead><tr>
              <th style="padding:0.4rem 0.6rem;border-bottom:1px solid var(--line);color:var(--muted);text-align:left">#</th>
              <th style="padding:0.4rem 0.6rem;border-bottom:1px solid var(--line);color:var(--muted);text-align:left">Nama</th>
              <th style="padding:0.4rem 0.6rem;border-bottom:1px solid var(--line);color:var(--muted)">J/K</th>
              <th style="padding:0.4rem 0.6rem;border-bottom:1px solid var(--line);color:var(--muted)">Agama</th>
            </tr></thead>
            <tbody>
              ${students.map((s,i) => `<tr>
                <td style="padding:0.4rem 0.6rem;border-bottom:1px solid var(--line);color:var(--muted)">${i+1}</td>
                <td style="padding:0.4rem 0.6rem;border-bottom:1px solid var(--line)"><strong>${escH(s.name)}</strong></td>
                <td style="padding:0.4rem 0.6rem;border-bottom:1px solid var(--line);text-align:center">${s.gender.includes("LAKI")?"♂":"♀"}</td>
                <td style="padding:0.4rem 0.6rem;border-bottom:1px solid var(--line);text-align:center;font-size:0.75rem">${escH(capitalize(s.religion))}</td>
              </tr>`).join("")}
            </tbody>
          </table>
        </div>`;
      popup.hidden = false;
    } else {
      toast(`Kelas ${kelas}: ${students.length} siswa`);
    }
  };

  // ── Render: Data Siswa ─────────────────────────────────────────────────────
  function renderData() {
    if (!studentsData.length) {
      $("pd-empty").hidden  = false;
      $("pd-table-wrap").hidden = true;
      return;
    }
    const rows = getFiltered();
    $("pd-count").textContent = `${rows.length} siswa`;

    if (!rows.length) {
      $("pd-empty").hidden  = false;
      $("pd-empty2-title").textContent = T("noMatch");
      $("pd-empty2-hint").textContent  = "";
      $("pd-table-wrap").hidden = true;
      return;
    }
    $("pd-empty").hidden  = true;
    $("pd-table-wrap").hidden = false;

    $("pd-thead").innerHTML = `<tr>
      <th>${T("colNo")}</th><th>${T("colName")}</th><th>${T("colClass")}</th>
      <th>${T("colInduk")}</th><th>${T("colGender")}</th><th>${T("colDob")}</th>
      <th>${T("colReligion")}</th><th>${T("colBlood")}</th>
      <th>${T("colOriginSchool")}</th><th>${T("colPhone")}</th>
    </tr>`;

    $("pd-tbody").innerHTML = rows.map((s,i) => {
      const c = effectiveClass(s);
      return `<tr>
        <td>${i+1}</td>
        <td><div class="us-student-name"><strong>${escH(s.name)}</strong><span>${escH(s.nickname||s.code)}</span></div></td>
        <td><span class="module-pill neutral">${escH(c||"—")}</span></td>
        <td style="font-family:monospace;font-size:0.78rem">${escH(s.noInduk)}</td>
        <td><span class="module-pill ${s.gender.includes("LAKI")?"good":"warn"}">${s.gender.includes("LAKI")?"♂":"♀"}</span></td>
        <td style="font-size:0.82rem">${escH(s.dob)}</td>
        <td style="font-size:0.82rem">${escH(capitalize(s.religion))}</td>
        <td><span class="att-ket-chip">${escH(s.blood||"—")}</span></td>
        <td style="font-size:0.78rem;max-width:12rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${escH(s.originSchool)}">${escH(s.originSchool.length>28?s.originSchool.slice(0,28)+"…":s.originSchool)}</td>
        <td style="font-family:monospace;font-size:0.78rem">${escH(s.phone)}</td>
      </tr>`;
    }).join("");
  }

  // ── Render: Mutasi ─────────────────────────────────────────────────────────
  function renderMutasi() {
    if (!studentsData.length) {
      $("pd-mutasi-body").innerHTML = `<div class="att-empty"><strong>${T("noData")}</strong></div>`;
      return;
    }

    let masukRows = [], keluarRows = [];
    if (!activeTa) {
      masukRows  = [...studentsData];
      keluarRows = studentsData.filter(s => s.yearKeluar);
    } else {
      const taIdx   = detectedTas.indexOf(activeTa);
      const prevTas = detectedTas.slice(0, taIdx);
      masukRows  = studentsData.filter(s => s.taData[activeTa]?.kls && !prevTas.some(t => s.taData[t]?.kls));
      keluarRows = studentsData.filter(s => prevTas.some(t => s.taData[t]?.kls) && !s.taData[activeTa]?.kls);
      keluarRows = [...keluarRows, ...studentsData.filter(s => s.yearKeluar && !keluarRows.includes(s))];
    }

    $("pd-mutasi-body").innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem">
        <div>
          <div style="display:flex;align-items:center;gap:.75rem;margin-bottom:.75rem">
            <h2 style="font-size:0.95rem;margin:0">Mutasi Masuk / Transfer In</h2>
            <span class="us-class-paid">${masukRows.length}</span>
          </div>
          <div style="overflow-x:auto;border:1px solid var(--line);border-radius:.5rem">
            <table class="module-table" style="min-width:26rem">
              <thead><tr>
                <th>${T("colName")}</th><th>${T("colClass")}</th><th>${T("colOriginSchool")}</th>
              </tr></thead>
              <tbody>${masukRows.map(s=>`<tr>
                <td><strong>${escH(s.name)}</strong></td>
                <td><span class="module-pill neutral">${escH(effectiveClass(s)||s.class)}</span></td>
                <td style="font-size:0.78rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:14rem">${escH((s.originSchool||"").slice(0,30)+((s.originSchool||"").length>30?"…":""))}</td>
              </tr>`).join()||`<tr><td colspan="3" style="text-align:center;color:var(--muted);padding:1.5rem">—</td></tr>`}</tbody>
            </table>
          </div>
        </div>
        <div>
          <div style="display:flex;align-items:center;gap:.75rem;margin-bottom:.75rem">
            <h2 style="font-size:0.95rem;margin:0">Mutasi Keluar / Transfer Out</h2>
            <span class="us-class-due">${keluarRows.length}</span>
          </div>
          <div style="overflow-x:auto;border:1px solid var(--line);border-radius:.5rem">
            <table class="module-table" style="min-width:22rem">
              <thead><tr>
                <th>${T("colName")}</th><th>Last Class</th><th>Tahun Keluar</th>
              </tr></thead>
              <tbody>${keluarRows.map(s=>{
                const last=[...detectedTas].reverse().map(t=>s.taData[t]?.kls).find(Boolean)||s.class;
                return `<tr>
                  <td><strong>${escH(s.name)}</strong></td>
                  <td><span class="module-pill neutral">${escH(last)}</span></td>
                  <td><span class="module-pill warn">${escH(s.yearKeluar||activeTa)}</span></td>
                </tr>`;
              }).join()||`<tr><td colspan="3" style="text-align:center;color:var(--muted);padding:1.5rem">—</td></tr>`}</tbody>
            </table>
          </div>
        </div>
      </div>`;
  }

  // ── Loading overlay ────────────────────────────────────────────────────────
  function showLoading(title = "Memuat data…", sub = "Mohon tunggu sebentar") {
    const el = $("pd-loading-overlay");
    if (!el) return;
    const t = $("pd-loading-title");
    const s = $("pd-loading-sub");
    if (t) t.textContent = title;
    if (s) s.textContent = sub;
    setLoadingProgress(0);
    el.style.display = "flex";
  }

  function hideLoading() {
    const el = $("pd-loading-overlay");
    if (el) el.style.display = "none";
  }

  function setLoadingProgress(pct, sub) {
    const bar = $("pd-loading-bar");
    if (bar) bar.style.width = `${Math.min(100, pct)}%`;
    if (sub) { const s = $("pd-loading-sub"); if (s) s.textContent = sub; }
  }

  // Set loading state ringan di tombol Load DB (untuk background auto-load)
  function setLoadBtn(loading) {
    const btn = $("pd-load-db");
    if (!btn) return;
    btn.disabled = loading;
    btn.textContent = loading ? "Loading…" : "Load DB";
  }

  // ── Clear DB ────────────────────────────────────────────────────────────────
  async function clearDb() {
    if (!window.confirm("Hapus semua data peserta didik dari database?\nData harus diupload ulang dari Excel setelahnya.")) return;
    const sb = window._sb || window.schoolAuth?.sb;
    if (!sb) { toast("Database tidak terhubung."); return; }

    const btn = $("pd-clear-db");
    if (btn) { btn.disabled = true; btn.textContent = "Menghapus…"; }

    try {
      const { error } = await sb.from("peserta_didik").delete().neq("id", 0);
      if (error) throw error;

      // Reset state lokal
      studentsData = [];
      kelasData    = [];
      detectedTas  = [];
      activeTa     = "";
      buildTaDropdowns();
      updateStats();
      renderAll();

      const lbl = $("pd-upload-label");
      if (lbl) lbl.textContent = T("btnUpload");
      const lastUpd = $("pd-last-updated");
      if (lastUpd) lastUpd.textContent = "";
      if (btn) btn.hidden = true;
      const saveBtn = $("pd-save-db");
      if (saveBtn) saveBtn.hidden = true;

      window.auditLog?.("DELETE", "students", "clear_db", null, null);
      toast("✓ Data peserta didik dihapus. Silakan upload Excel baru.");
    } catch (err) {
      toast(`Gagal menghapus: ${err.message}`);
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = "Clear DB"; }
    }
  }

  // ── Save to Supabase ────────────────────────────────────────────────────────
  async function saveToSupabase() {
    const sb = window._sb || window.schoolAuth?.sb;
    if (!sb) { toast("Database tidak terhubung."); return; }
    if (!studentsData.length) { toast("Tidak ada data untuk disimpan."); return; }

    const saveBtn = $("pd-save-db");
    if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = "Menyimpan…"; }
    showLoading("Menyimpan ke database…", `Mempersiapkan ${studentsData.length} siswa`);

    try {
      // Flatten taData menjadi kolom JSON agar mudah di-store
      const rows = studentsData.map(s => ({
        student_code:   s.code       || null,
        no_induk:       s.noInduk    || null,
        nisn:           s.nisn       || null,
        nik:            s.nik        || null,
        name:           s.name,
        nickname:       s.nickname   || null,
        status:         s.status     || null,
        tahun_masuk:    s.tahunMasuk || null,
        tahun_keluar:   s.yearKeluar || null,
        birth_place:    s.birthPlace || null,
        dob:            s.dob        || null,
        gender:         s.gender     || null,
        religion:       s.religion   || null,
        address:        s.address    || null,
        phone:          s.phone      || null,
        email:          s.email      || null,
        origin_school:  s.originSchool || null,
        blood_type:     s.blood      || null,
        health_notes:   s.health     || null,
        kelainan:       s.kelainan   || null,
        father_name:    s.fatherName || null,
        // Sanitize taData — pastikan kls hanya berisi nama kelas valid, bukan angka
        ta_data: Object.fromEntries(
          Object.entries(s.taData || {}).map(([ta, v]) => [ta, {
            kls: isValidClass(v?.kls) ? v.kls : "",
            no:  v?.no || ""
          }])
        ),
        class:          effectiveClass(s) || null,  // gunakan effectiveClass yang sudah divalidasi
        detected_tas:   detectedTas,
      }));

      setLoadingProgress(10, "Menghapus data lama…");
      const { error: delError } = await sb.from("peserta_didik").delete().neq("id", 0);
      if (delError) throw delError;

      const batchSize = 200;
      const totalBatches = Math.ceil(rows.length / batchSize);
      for (let i = 0; i < rows.length; i += batchSize) {
        const batchNum = Math.floor(i / batchSize) + 1;
        const pct = 15 + Math.round((batchNum / totalBatches) * 80);
        setLoadingProgress(pct, `Menyimpan batch ${batchNum}/${totalBatches} (${Math.min(i + batchSize, rows.length)} siswa)…`);
        const { error } = await sb.from("peserta_didik").insert(rows.slice(i, i + batchSize));
        if (error) throw error;
        await new Promise(r => setTimeout(r, 80));
      }

      setLoadingProgress(100, "Selesai!");
      await new Promise(r => setTimeout(r, 500));

      updateLastUpdated(new Date().toISOString());
      window.auditLog?.("INSERT", "students", "save_db", null, { count: rows.length, tas: detectedTas });
      toast(`✓ ${rows.length} siswa berhasil disimpan ke database.`);
      if (saveBtn) { saveBtn.hidden = true; }

    } catch (err) {
      toast(`Gagal menyimpan: ${err.message}`);
    } finally {
      hideLoading();
      if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = "Save to DB"; }
    }
  }

  // ── Load from Supabase ─────────────────────────────────────────────────────
  async function loadFromSupabase(silent = false) {
    const sb = window._sb || window.schoolAuth?.sb;
    if (!sb) { if (!silent) toast("Database tidak terhubung."); return; }

    setLoadBtn(true);
    if (!silent) showLoading("Memuat data peserta didik…", "Menghubungi database");

    try {
      // Fetch semua data (paginate jika > 1000)
      let all = [];
      let from = 0;
      let page = 1;
      while (true) {
        if (!silent) setLoadingProgress(10 + page * 15, `Mengambil halaman ${page}…`);
        const { data, error } = await sb
          .from("peserta_didik")
          .select("*")
          .order("id")
          .range(from, from + 999);
        if (error) throw error;
        all = all.concat(data || []);
        if (!data || data.length < 1000) break;
        from += 1000;
        page++;
      }

      if (!all.length) {
        // Tabel ada tapi kosong — diam saja saat silent
        if (!silent) toast("Belum ada data peserta didik di database. Upload Excel terlebih dahulu.");
        return;
      }

      if (!silent) setLoadingProgress(70, `Memproses ${all.length} siswa…`);

      // Restore detectedTas dari data pertama
      const firstRow = all[0];
      detectedTas = firstRow.detected_tas || [];

      // Konversi kembali ke format internal
      studentsData = all.map(r => {
        // Sanitize taData dari DB — kls yang berupa angka (data lama) diabaikan
        const rawTaData = r.ta_data || {};
        const cleanTaData = Object.fromEntries(
          Object.entries(rawTaData).map(([ta, v]) => [ta, {
            kls: isValidClass(v?.kls) ? v.kls : "",
            no:  v?.no || ""
          }])
        );
        // Derive class dari cleanTaData jika r.class tidak valid
        let cls = isValidClass(r.class) ? r.class : "";
        if (!cls) {
          const tas = (r.detected_tas || Object.keys(cleanTaData)).sort();
          for (const ta of [...tas].reverse()) {
            if (cleanTaData[ta]?.kls) { cls = cleanTaData[ta].kls; break; }
          }
        }
        return {
          code:         r.student_code  || "",
          name:         r.name          || "",
          nickname:     r.nickname      || "",
          nisn:         r.nisn          || "",
          nik:          r.nik           || "",
          noInduk:      r.no_induk      || "",
          status:       r.status        || "",
          tahunMasuk:   r.tahun_masuk   || "",
          yearKeluar:   r.tahun_keluar  || "",
          birthPlace:   r.birth_place   || "",
          dob:          r.dob           || "",
          gender:       r.gender        || "",
          religion:     r.religion      || "",
          address:      r.address       || "",
          phone:        r.phone         || "",
          email:        r.email         || "",
          originSchool: r.origin_school || "",
          blood:        r.blood_type    || "",
          health:       r.health_notes  || "",
          kelainan:     r.kelainan      || "",
          fatherName:   r.father_name   || "",
          taData:       cleanTaData,
          class:        cls,
        };
      });

      activeTa = detectedTas[detectedTas.length - 1] || "";
      updateLastUpdated(firstRow.updated_at || firstRow.created_at);

      if (!silent) setLoadingProgress(90, "Membangun tampilan…");
      const lbl = $("pd-upload-label");
      if (lbl) lbl.textContent = `Database (${studentsData.length})`;
      const saveBtn = $("pd-save-db");
      if (saveBtn) saveBtn.hidden = true;
      const clearBtn = $("pd-clear-db");
      if (clearBtn) clearBtn.hidden = false;

      buildTaDropdowns();
      populateClassFilter();
      populateReligionFilter();
      updateStats();
      renderAll();

      if (!silent) {
        setLoadingProgress(100, "Selesai!");
        await new Promise(r => setTimeout(r, 400));
      }

      window.auditLog?.("VIEW", "students", "load_db", null, { count: studentsData.length });
      if (!silent) toast(`✓ ${studentsData.length} siswa dimuat dari database — TA ${taLabel(activeTa)}.`);

    } catch (err) {
      // Jika tabel belum ada, diam saja saat silent (tabel mungkin belum dibuat)
      if (!silent) {
        if (err.message?.includes("does not exist") || err.message?.includes("relation")) {
          toast("Tabel peserta_didik belum ada. Buat tabel di Supabase dulu (lihat dokumentasi).");
        } else {
          toast(`Gagal memuat: ${err.message}`);
        }
      }
    } finally {
      hideLoading(); // selalu hide, apapun kondisinya
      setLoadBtn(false);
    }
  }

  // ── Update last-updated label ───────────────────────────────────────────────
  function updateLastUpdated(ts) {
    const el = $("pd-last-updated");
    if (!el || !ts) return;
    const d = new Date(ts);
    const now = new Date();
    const diffMin = Math.floor((now - d) / 60000);
    let label = "";
    if (diffMin < 1) label = "baru saja";
    else if (diffMin < 60) label = `${diffMin}m lalu`;
    else if (diffMin < 1440) label = `${Math.floor(diffMin/60)}j lalu`;
    else label = d.toLocaleDateString("id-ID", { day:"2-digit", month:"short", year:"numeric" });
    el.textContent = `Terakhir: ${label}`;
  }

  // ── Export ─────────────────────────────────────────────────────────────────
  function exportData() {
    if (!window.XLSX) { toast("Excel export library not loaded."); return; }
    if (!studentsData.length) { toast("No data to export."); return; }
    const base  = activeStudents();
    const taStr = activeTa ? taLabel(activeTa) : "All";
    const wb    = window.XLSX.utils.book_new();

    // Sheet 1 - Data Siswa
    const ws1 = window.XLSX.utils.aoa_to_sheet([
      ["No","No Induk","NISN","Nama","Panggilan","Kelas","No di Kelas","L/P","TTL","Agama","Gol Darah","Asal Sekolah","HP","Ayah"],
      ...base.map((s,i) => [
        i+1, s.noInduk, s.nisn, s.name, s.nickname,
        effectiveClass(s), studentNoForTa(s, activeTa),
        s.gender, `${s.birthPlace}, ${s.dob}`,
        s.religion, s.blood, s.originSchool, s.phone, s.fatherName
      ])
    ]);
    window.XLSX.utils.book_append_sheet(wb, ws1, `Data Siswa ${taStr.slice(0,20)}`);

    // Sheet 2 - Rekap per kelas
    const classesForSheet = [...new Set(base.map(s => effectiveClass(s)).filter(Boolean))].sort(sortClasses);
    const ws2 = window.XLSX.utils.aoa_to_sheet([
      ["Kelas","Total","L","P","Kristen","Katolik","Budha","Islam","Hindu"],
      ...classesForSheet.map(c => {
        const s = base.filter(x => effectiveClass(x) === c);
        return [c, s.length,
          s.filter(x=>x.gender.includes("LAKI")).length,
          s.filter(x=>x.gender.includes("PEREMPUAN")).length,
          ...["KRISTEN","KATOLIK","BUDHA","ISLAM","HINDU"].map(r => s.filter(x=>x.religion===r).length)
        ];
      })
    ]);
    window.XLSX.utils.book_append_sheet(wb, ws2, "Rekap Per Kelas");

    window.XLSX.writeFile(wb, `Data_PD_${taStr.replace(/\//g,"-")}.xlsx`);
    window.auditLog?.("EXPORT", "students", `Data_PD_${taStr}`, null, { count: base.length, ta: taStr });
    toast("Exported successfully.");
  }

  // ── Language update ────────────────────────────────────────────────────────
  function updateLanguage() {
    if (!$("students-app")) return;
    const u = (id, key) => { const el=$(id); if(el) el.textContent=T(key); };
    u("pd-eyebrow","eyebrow"); u("pd-title","title"); u("pd-subtitle","subtitle");
    u("pd-subnav-rekap","tabRekap"); u("pd-subnav-kelas","tabKelas");
    u("pd-subnav-data","tabData"); u("pd-subnav-mutasi","tabMutasi");
    u("pd-lbl-total","statTotal"); u("pd-lbl-classes","statClasses");
    u("pd-lbl-gender","statGender"); u("pd-mutasi-title","mutasiTitle");
    if($("pd-search")) $("pd-search").placeholder = T("searchPlaceholder");
    buildTaDropdowns();
    renderAll();
  }

  function renderAll() {
    if (activeTab === "kelas")   renderKelas();
    else if (activeTab === "data")   renderData();
    else if (activeTab === "mutasi") renderMutasi();
    else renderRekap();
    updateStats();
  }

  // ── Utilities ──────────────────────────────────────────────────────────────
  function normalizeClass(v) { return String(v||"").trim().replace(/\s+/g,"-").toUpperCase(); }

  function sortClasses(a="",b="") {
    const o={X:0,XI:1,XII:2};
    const [ga,ra=""] = String(a).split("-");
    const [gb,rb=""] = String(b).split("-");
    return (o[ga]??9)-(o[gb]??9) || ra.localeCompare(rb,undefined,{numeric:true}) || String(a).localeCompare(String(b));
  }

  function capitalize(s) { return String(s||"").charAt(0).toUpperCase()+String(s||"").slice(1).toLowerCase(); }

  function escH(v) {
    return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }

  function toast(msg) {
    const el=$("pd-toast"); if(!el) return;
    el.textContent=msg; el.classList.add("show");
    clearTimeout(toast._t); toast._t=setTimeout(()=>el.classList.remove("show"),3400);
  }

  return { mount, updateLanguage, loadFromSupabase };
})();

window.addEventListener("load", () => window.studentsModule.mount());
