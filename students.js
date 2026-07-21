window.studentsModule = (() => {
  const I18N = {
    en: {
      eyebrow: "Academic Records", title: "Students",
      subtitle: "Overview, student data, and mutations.",
      btnUpload: "Upload Data", btnExport: "Export",
      tabOverview: "Overview", tabStudents: "Students",
      tabMutasi: "Mutation",
      statTotal: "Total Students", statClasses: "Active Classes",
      statGender: "Gender", statGradeX: "Grade X",
      statGradeXI: "Grade XI", statGradeXII: "Grade XII",
      searchPlaceholder: "Search student\u2026", filterAll: "All Classes",
      filterGrade: "All Grades", gradeX: "Grade X", gradeXI: "Grade XI", gradeXII: "Grade XII",
      tahunAjaran: "Academic Year", allYears: "All Years",
      colNo: "#", colName: "Name", colNickname: "Nickname", colClass: "Class",
      colInduk: "No. Induk", colGender: "Gender", colDob: "Date of Birth",
      colReligion: "Religion", colBlood: "Blood", colOriginSchool: "Origin School",
      colPhone: "Phone", colParent: "Father", colNisn: "NISN", colHealth: "Health Notes",
      colWali: "Homeroom Teacher",
      noData: "No student data yet", noDataHint: "Upload the student master Excel file to get started.",
      noMatch: "No students match the current filters.",
      mutasiTitle: "Student Mutations", mutasiSub: "Year-over-year transfer records.",
      btnExportHadir: "Export Daftar Hadir",
      chartStudentsPerTa: "Students per Academic Year",
      chartGenderPerTa: "Gender Distribution per Year",
      mutasiMasuk: "Transfer In", mutasiKeluar: "Transfer Out",
      mutasiGraduated: "Graduated",
      colStudentCode: "Student Code",
    },
    id: {
      eyebrow: "Data Akademik", title: "Peserta Didik",
      subtitle: "Ringkasan, data siswa, dan mutasi.",
      btnUpload: "Unggah Data", btnExport: "Ekspor",
      tabOverview: "Ringkasan", tabStudents: "Siswa",
      tabMutasi: "Mutasi",
      statTotal: "Total Siswa", statClasses: "Kelas Aktif",
      statGender: "Jenis Kelamin", statGradeX: "Kelas X",
      statGradeXI: "Kelas XI", statGradeXII: "Kelas XII",
      searchPlaceholder: "Cari siswa\u2026", filterAll: "Semua Kelas",
      filterGrade: "Semua Tingkat", gradeX: "Kelas X", gradeXI: "Kelas XI", gradeXII: "Kelas XII",
      tahunAjaran: "Tahun Ajaran", allYears: "Semua TA",
      colNo: "#", colName: "Nama", colNickname: "Panggilan", colClass: "Kelas",
      colInduk: "No. Induk", colGender: "J/K", colDob: "Tanggal Lahir",
      colReligion: "Agama", colBlood: "Gol. Darah", colOriginSchool: "Asal Sekolah",
      colPhone: "HP", colParent: "Nama Ayah", colNisn: "NISN", colHealth: "Catatan Kesehatan",
      colWali: "Wali Kelas",
      noData: "Belum ada data siswa", noDataHint: "Unggah file Excel data master peserta didik untuk memulai.",
      noMatch: "Tidak ada siswa yang sesuai filter.",
      mutasiTitle: "Mutasi Siswa", mutasiSub: "Catatan mutasi antar tahun ajaran.",
      btnExportHadir: "Ekspor Daftar Hadir",
      chartStudentsPerTa: "Jumlah Siswa per Tahun Ajaran",
      chartGenderPerTa: "Distribusi J/K per Tahun",
      mutasiMasuk: "Mutasi Masuk", mutasiKeluar: "Mutasi Keluar",
      mutasiGraduated: "Lulus",
      colStudentCode: "Kode Siswa",
    }
  };

  let studentsData   = [];
  let kelasData      = [];
  let activeTab      = "overview";
  let activeTa       = "";
  let detectedTas    = [];
  let taColMap       = {};
  let mutTa          = "";
  let mutView        = "in";
  let studentPageSize = 20;
  let studentPage     = 1;

  const lang = () => window._studentsLang || Store.getLanguage();
  const T    = (k)  => (I18N[lang()] || I18N.en)[k] || k;
  const $    = (id) => document.getElementById(id);

  function taLabel(key) {
    if (!key) return T("allYears");
    const y = String(key);
    return y.length === 4 ? `20${y.slice(0,2)}/20${y.slice(2,4)}` : y;
  }

  function isValidClass(v) {
    if (!v) return false;
    const s = String(v).trim();
    if (!s) return false;
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

  function getSb() {
    const auth = window.authModule;
    return auth?.getSupabaseClient ? auth.getSupabaseClient() : window._sb;
  }

  function isMale(s) {
    const g = s.gender || "";
    return g.includes("LAKI") || g === "L";
  }

  function genderLabel(s) {
    if (lang() === "id") return isMale(s) ? "L" : "P";
    return isMale(s) ? "M" : "F";
  }

  function matchesGenderFilter(s, filter) {
    if (!filter) return true;
    const g = (s.gender || "").toUpperCase();
    if (filter === "L") return g === "L" || g.includes("LAKI");
    if (filter === "P") return g === "P" || g.includes("PEREMPUAN");
    return true;
  }

  function mount() {
    const section = $("students");
    if (!section) return;
    section.removeAttribute("data-simple-page");
    section.innerHTML = buildShell();
    bindEvents();
    setActiveTab("overview");

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
          <strong id="pd-loading-title" style="font-size:0.95rem;color:var(--text)">Memuat data\u2026</strong>
          <span id="pd-loading-sub" style="font-size:0.8rem;color:var(--muted)">Mohon tunggu sebentar</span>
          <div style="width:100%;height:4px;background:var(--line);border-radius:2px;overflow:hidden">
            <div id="pd-loading-bar" style="height:100%;width:0%;background:var(--accent);border-radius:2px;transition:width 0.3s ease"></div>
          </div>
        </div>
        <style>@keyframes pd-spin{to{transform:rotate(360deg)}}</style>`;
      document.body.appendChild(overlay);
    }
    const sectionEl = $("students");
    if (sectionEl) {
      const obs = new MutationObserver(() => {
        if (sectionEl.classList.contains("active") && activeTab === "overview") {
          drawCharts();
        }
      });
      obs.observe(sectionEl, { attributes: true, attributeFilter: ["class"] });
      window._pdChartObserver = obs;
    }
    hideLoading();
  }

  function buildShell() {
    const isAdmin = ["super_admin", "admin"].includes(window.authModule?.getRole?.());
    return `
    <div class="module-page" id="students-app">

      <div class="page-heading module-heading">
        <div>
          <p class="eyebrow" id="pd-eyebrow">${T("eyebrow")}</p>
          <h1 id="pd-title">${T("title")}</h1>
          <span id="pd-subtitle">${T("subtitle")}</span>
        </div>
        <div class="module-actions">
          <span id="pd-last-updated" style="color:var(--muted);font-size:0.78rem;align-self:center"></span>
          ${isAdmin ? `
          <button class="primary-button secondary" type="button" id="pd-load-db">Load DB</button>
          <button class="primary-button secondary" type="button" id="pd-clear-db" style="color:var(--due-text);border-color:var(--due-border)" hidden>Clear DB</button>
          <button class="primary-button secondary" type="button" id="pd-save-db" hidden>Save to DB</button>
          <label class="primary-button secondary" id="pd-upload-btn" style="cursor:pointer">
            <input type="file" id="pd-file" accept=".xlsx,.xls" style="display:none"/>
            <span id="pd-upload-label">${T("btnUpload")}</span>
          </label>
          ` : ""}
          <button class="primary-button" id="pd-export">${T("btnExport")}</button>
        </div>
      </div>

      <div class="module-subnav" role="tablist" id="pd-subnav">
        <button class="active" type="button" data-pd-tab="overview" id="pd-subnav-overview">${T("tabOverview")}</button>
        <button type="button" data-pd-tab="students"  id="pd-subnav-students">${T("tabStudents")}</button>
        <button type="button" data-pd-tab="mutasi"    id="pd-subnav-mutasi">${T("tabMutasi")}</button>
      </div>

      <section class="module-subpage" id="pd-sub-overview">

        <!-- TA selector -->
        <div id="pd-ta-bar" style="display:none;align-items:center;gap:0.65rem;flex-wrap:wrap">
          <span style="font-size:0.75rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.05em">${T("tahunAjaran")}</span>
          <select id="pd-ta-select" style="min-height:2.1rem;padding:0 0.7rem;border:1px solid var(--line);border-radius:0.45rem;color:var(--text);background:var(--surface-soft);font-size:0.84rem">
            <option value="">${T("allYears")}</option>
          </select>
        </div>

        <!-- Stat cards: row 1 -->
        <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0.85rem" id="pd-stat-row1">
          <article class="module-stat tone-filled-teal">
            <span id="pd-lbl-total">${T("statTotal")}</span>
            <strong style="font-size:2.4rem;margin-top:.5rem" id="pd-s-total">0</strong>
            <small style="font-size:0.75rem" id="pd-s-ta-label">\u2014</small>
          </article>
          <article class="module-stat tone-filled-violet">
            <span id="pd-lbl-classes">${T("statClasses")}</span>
            <strong style="font-size:2.4rem;margin-top:.5rem" id="pd-s-classes">0</strong>
            <small style="font-size:0.75rem" id="pd-s-class-detail">X: 0 / XI: 0 / XII: 0</small>
          </article>
          <article class="module-stat tone-filled-pink">
            <span id="pd-lbl-gender">${T("statGender")}</span>
            <div style="display:flex;gap:1.2rem;margin-top:.5rem;align-items:flex-end">
              <div>
                <div style="font-size:1.85rem;font-weight:800;color:#fff;line-height:1" id="pd-s-male">0</div>
                <div style="font-size:0.7rem;color:rgba(255,255,255,.7);margin-top:.15rem">\u2642 Laki</div>
              </div>
              <div style="width:1px;height:2.5rem;background:rgba(255,255,255,.3)"></div>
              <div>
                <div style="font-size:1.85rem;font-weight:800;color:#fff;line-height:1" id="pd-s-female">0</div>
                <div style="font-size:0.7rem;color:rgba(255,255,255,.7);margin-top:.15rem">\u2640 Perempuan</div>
              </div>
            </div>
          </article>
        </div>

        <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0.85rem" id="pd-stat-row2">
          ${buildGradeCard("X",  "pd-gx",  "tone-outline-teal")}
          ${buildGradeCard("XI", "pd-gxi", "tone-outline-violet")}
          ${buildGradeCard("XII","pd-gxii","tone-outline-orange")}
        </div>

        <!-- Charts -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.85rem;margin-top:0.85rem">
          <div class="module-table-card" style="padding:1rem">
            <div class="panel-heading">
              <h2>${T("chartStudentsPerTa")}</h2>
            </div>
            <canvas id="pd-chart-year" style="width:100%;height:220px;display:block"></canvas>
          </div>
          <div class="module-table-card" style="padding:1rem">
            <div class="panel-heading">
              <h2>${T("chartGenderPerTa")}</h2>
            </div>
            <canvas id="pd-chart-gender" style="width:100%;height:220px;display:block"></canvas>
          </div>
        </div>

        <div id="pd-rekap-empty" class="att-empty" style="display:none">
          <strong id="pd-empty-title">${T("noData")}</strong>
          <span id="pd-empty-hint">${T("noDataHint")}</span>
        </div>
      </section>

      <!-- Students tab -->
      <section class="module-subpage" id="pd-sub-students" hidden>

        <!-- TA selector -->
        <div id="pd-students-ta-bar" style="display:none;align-items:center;gap:0.65rem;flex-wrap:wrap">
          <span style="font-size:0.75rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.05em">${T("tahunAjaran")}</span>
          <select id="pd-students-ta-select" style="min-height:2.1rem;padding:0 0.7rem;border:1px solid var(--line);border-radius:0.45rem;color:var(--text);background:var(--surface-soft);font-size:0.84rem">
            <option value="">${T("allYears")}</option>
          </select>
        </div>

        <!-- Stats cards -->
        <div id="pd-students-stats" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(7rem,1fr));gap:0.65rem;margin-bottom:0.85rem">
          <article class="module-stat tone-filled-teal" style="gap:0.15rem;padding:0.65rem 0.85rem">
            <span style="font-size:0.65rem">${T("statTotal")}</span>
            <strong style="font-size:1.5rem;line-height:1.2" id="pd-st-total">0</strong>
          </article>
          <article class="module-stat tone-outline-teal" style="gap:0.15rem;padding:0.65rem 0.85rem">
            <span style="font-size:0.65rem">X</span>
            <strong style="font-size:1.5rem;line-height:1.2" id="pd-st-x">0</strong>
          </article>
          <article class="module-stat tone-outline-violet" style="gap:0.15rem;padding:0.65rem 0.85rem">
            <span style="font-size:0.65rem">XI</span>
            <strong style="font-size:1.5rem;line-height:1.2" id="pd-st-xi">0</strong>
          </article>
          <article class="module-stat tone-outline-orange" style="gap:0.15rem;padding:0.65rem 0.85rem">
            <span style="font-size:0.65rem">XII</span>
            <strong style="font-size:1.5rem;line-height:1.2" id="pd-st-xii">0</strong>
          </article>
          <article class="module-stat tone-outline-green" style="gap:0.15rem;padding:0.65rem 0.85rem">
            <span style="font-size:0.65rem">\u2642 ${lang() === "id" ? "L" : "M"}</span>
            <strong style="font-size:1.5rem;line-height:1.2" id="pd-st-l">0</strong>
          </article>
          <article class="module-stat tone-outline-pink" style="gap:0.15rem;padding:0.65rem 0.85rem">
            <span style="font-size:0.65rem">\u2640 ${lang() === "id" ? "P" : "F"}</span>
            <strong style="font-size:1.5rem;line-height:1.2" id="pd-st-p">0</strong>
          </article>
        </div>

        <!-- Toolbar -->
        <div class="module-toolbar">
          <div class="module-search"><span>\u2315</span><input id="pd-search" type="search" placeholder="${T("searchPlaceholder")}"/></div>
          <select id="pd-filter-grade">
            <option value="">${T("filterGrade")}</option>
            <option value="X">${T("gradeX")}</option>
            <option value="XI">${T("gradeXI")}</option>
            <option value="XII">${T("gradeXII")}</option>
          </select>
          <select id="pd-filter-class"><option value="">${T("filterAll")}</option></select>
          <select id="pd-filter-gender">
            <option value="">\u2642/\u2640</option>
            <option value="L">\u2642 L</option>
            <option value="P">\u2640 P</option>
          </select>
          <button class="primary-button" id="pd-export-hadir" style="font-size:0.78rem;padding:0 0.85rem;min-height:2rem">${T("btnExportHadir")}</button>
        </div>

        <div class="table-panel" style="padding:0;position:relative">
          <div id="pd-empty" class="att-empty">
            <strong id="pd-empty2-title">${T("noData")}</strong>
            <span id="pd-empty2-hint">${T("noDataHint")}</span>
          </div>
          <div class="responsive-table" id="pd-table-wrap" hidden>
            <table class="module-table" id="pd-students-table">
              <thead id="pd-thead"></thead>
              <tbody id="pd-tbody"></tbody>
            </table>
          </div>
          <div id="pd-pagination" style="display:none;align-items:center;justify-content:space-between;gap:1rem;padding:0.75rem 1rem;border-top:1px solid var(--line);font-size:0.82rem">
            <span style="color:var(--muted)"><span id="pd-count">0</span> items</span>
            <div style="display:flex;align-items:center;gap:0.75rem">
              <label style="display:flex;align-items:center;gap:0.4rem;color:var(--muted)">
                Show
                <select id="pd-pagesize" style="min-height:2rem;padding:0 0.5rem;border:1px solid var(--line);border-radius:0.4rem;color:var(--text);background:var(--surface-soft)">
                  <option value="10">10</option>
                  <option value="20" selected>20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </label>
              <div style="display:flex;align-items:center;gap:0.25rem">
                <button type="button" class="action-button" id="pd-pageprev" style="padding:0.25rem 0.6rem">‹</button>
                <span style="white-space:nowrap;color:var(--muted)" id="pd-pageinfo">1/1</span>
                <button type="button" class="action-button" id="pd-pagenext" style="padding:0.25rem 0.6rem">›</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Mutation tab -->
      <section class="module-subpage" id="pd-sub-mutasi" hidden>

        <!-- TA selector -->
        <div id="pd-mut-ta-bar" style="display:none;align-items:center;gap:0.65rem;flex-wrap:wrap">
          <span style="font-size:0.75rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.05em">${T("tahunAjaran")}</span>
          <select id="pd-mut-ta-select" style="min-height:2.1rem;padding:0 0.7rem;border:1px solid var(--line);border-radius:0.45rem;color:var(--text);background:var(--surface-soft);font-size:0.84rem"></select>
        </div>

        <!-- Switch: In / Out / Graduated -->
        <div class="segmented" id="pd-mut-switch" style="margin-bottom:0.85rem">
          <button class="active" type="button" data-mut-view="in">${T("mutasiMasuk")}</button>
          <button type="button" data-mut-view="out">${T("mutasiKeluar")}</button>
          <button type="button" data-mut-view="graduated">${T("mutasiGraduated")}</button>
        </div>

        <div class="module-table-card" style="padding:1rem">
          <div class="panel-heading">
            <h2 id="pd-mutasi-title">${T("mutasiTitle")}</h2>
            <span class="module-count" id="pd-mut-count">0</span>
          </div>
          <p style="color:var(--muted);font-size:0.85rem;margin:0 0 1rem" id="pd-mutasi-sub">${T("mutasiSub")}</p>
          <div id="pd-mutasi-body"></div>
        </div>
      </section>

      <div class="att-toast" id="pd-toast"></div>
    </div>`;
  }

  function buildGradeCard(grade, prefix, toneClass) {
    return `
      <article class="module-stat ${toneClass}" style="gap:0.5rem">
        <span>Kelas ${grade}</span>
        <strong style="font-size:1.7rem;line-height:1.1" id="${prefix}-total">0</strong>
        <div style="display:flex;gap:.85rem">
          <span style="font-size:0.78rem">\u2642 <b style="color:var(--text)" id="${prefix}-l">0</b></span>
          <span style="font-size:0.78rem">\u2640 <b style="color:var(--text)" id="${prefix}-p">0</b></span>
          <span style="font-size:0.78rem" id="${prefix}-kelas-count"></span>
        </div>
      </article>`;
  }

  function bindEvents() {
    $("pd-file")?.addEventListener("change", (e) => { const f = e.target.files[0]; if (f) processFile(f); });
    $("pd-export").addEventListener("click", exportData);
    $("pd-load-db")?.addEventListener("click", loadFromSupabase);
    $("pd-save-db")?.addEventListener("click", saveToSupabase);
    $("pd-clear-db")?.addEventListener("click", clearDb);
    $("pd-export-hadir")?.addEventListener("click", exportDaftarHadir);

    $("pd-ta-select").addEventListener("change", (e) => {
      activeTa = e.target.value;
      syncAllTaDropdowns("overview");
      updateStats();
    });

    $("pd-students-ta-select").addEventListener("change", (e) => {
      activeTa = e.target.value;
      syncAllTaDropdowns("students");
      populateClassFilter();
      renderStudents();
    });

    $("pd-search").addEventListener("input", renderStudents);
    $("pd-filter-grade").addEventListener("change", () => { populateClassFilter(); renderStudents(); });
    $("pd-filter-class").addEventListener("change", renderStudents);
    $("pd-filter-gender").addEventListener("change", renderStudents);

    $("pd-pagesize").addEventListener("change", (e) => {
      studentPageSize = parseInt(e.target.value);
      studentPage = 1;
      renderStudents();
    });
    $("pd-pageprev").addEventListener("click", () => {
      if (studentPage > 1) { studentPage--; renderStudents(); }
    });
    $("pd-pagenext").addEventListener("click", () => {
      if (studentPage < Math.ceil(getFiltered().length / studentPageSize)) { studentPage++; renderStudents(); }
    });

    $("pd-mut-ta-select").addEventListener("change", (e) => {
      mutTa = e.target.value;
      renderMutasi();
    });

    document.querySelectorAll("[data-mut-view]").forEach(b =>
      b.addEventListener("click", () => {
        mutView = b.dataset.mutView;
        document.querySelectorAll("[data-mut-view]").forEach(btn => btn.classList.toggle("active", btn.dataset.mutView === mutView));
        renderMutasi();
      }));

    document.querySelectorAll("[data-pd-tab]").forEach(b =>
      b.addEventListener("click", () => setActiveTab(b.dataset.pdTab)));

    $("pd-upload-btn")?.addEventListener("dragover", (e) => { e.preventDefault(); e.currentTarget.style.borderColor = "var(--accent)"; });
    $("pd-upload-btn")?.addEventListener("dragleave", (e) => { e.preventDefault(); e.currentTarget.style.borderColor = ""; });
    $("pd-upload-btn")?.addEventListener("drop", (e) => { e.preventDefault(); e.currentTarget.style.borderColor = ""; const f = e.dataTransfer.files[0]; if (f) processFile(f); });
  }

  function setActiveTab(tab) {
    activeTab = tab;
    document.querySelectorAll("[data-pd-tab]").forEach(b => b.classList.toggle("active", b.dataset.pdTab === tab));
    ["overview","students","mutasi"].forEach(t => {
      const el = $(`pd-sub-${t}`);
      if (el) el.hidden = t !== tab;
    });
    if (tab === "students")     renderStudents();
    else if (tab === "mutasi")  renderMutasi();
    else                        renderOverview();
  }

  function syncAllTaDropdowns(except) {
    const ids = ["pd-ta-select","pd-students-ta-select"];
    ids.forEach(id => { const el = $(id); if (el) el.value = activeTa; });
  }

  function processFile(file) {
    if (!window.XLSX) { toast("Excel parser not loaded."); return; }
    showLoading("Membaca file Excel\u2026", file.name);
    setLoadingProgress(20, "Membuka workbook\u2026");
    toast(`Parsing ${file.name}\u2026`);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        setLoadingProgress(50, "Mendeteksi kolom dan TA\u2026");
        const wb = window.XLSX.read(e.target.result, { type: "binary", cellDates: false });
        setLoadingProgress(70, "Parsing baris data\u2026");
        parseStudents(wb, file.name);
      } catch (err) {
        hideLoading();
        toast(`Parse error: ${err.message}`);
      }
    };
    reader.readAsBinaryString(file);
  }

  function parseStudents(wb, filename) {
    const taSheets = wb.SheetNames.filter(s => /^\d{4}$/.test(s.trim())).sort();
    if (!taSheets.length) { toast("No TA sheets found (expecting 4-digit names like 2223, 2324\u2026)."); hideLoading(); return; }
    detectedTas = taSheets;
    const studentMap = new Map();

    function normalizeHeaders(r) {
      return (r || []).map(h => String(h).trim().toUpperCase().replace(/[\s\/\-\.\n]+/g, "_"));
    }

    function findCol(headers, ...names) {
      for (const n of names) {
        const idx = headers.findIndex(h => h === n || h.includes(n));
        if (idx >= 0) return idx;
      }
      return -1;
    }

    taSheets.forEach(ta => {
      const rows = window.XLSX.utils.sheet_to_json(wb.Sheets[ta], { header: 1, defval: "" });
      let hr = 0;
      for (let i = 0; i < Math.min(5, rows.length); i++) {
        const t = rows[i].join(" ").toUpperCase();
        if (t.includes("NAMA") && (t.includes("KELAS") || t.includes("INDUK"))) { hr = i; break; }
      }
      const hdr = normalizeHeaders(rows[hr]);

      const ci = {
        code:    findCol(hdr, "STUDENT_CODE", "STUDENTCODE"),
        name:    findCol(hdr, "NAMA"),
        nisn:    findCol(hdr, "NISN"),
        noInduk: findCol(hdr, "NO_INDUK", "NOINDUK", "INDUK"),
        kelas:   findCol(hdr, "KELAS"),
        gender:  findCol(hdr, "JK", "J_K", "L_P", "GENDER", "JENIS_KELAMIN"),
        noSeq:   findCol(hdr, "NO"),
      };

      for (let i = hr + 1; i < rows.length; i++) {
        const r = rows[i];
        const name = String(r[ci.name] || "").trim();
        if (!name) continue;
        const code = String(r[ci.code] || "").trim();
        if (!code) continue;

        const kls   = normalizeClass(r[ci.kelas]);
        const noSeq = String(r[ci.noSeq] || "").trim();
        const gen   = String(r[ci.gender] || "").trim().toUpperCase();

        let st = studentMap.get(code);
        if (!st) {
          st = {
            code, name,
            nickname: "", nisn: String(r[ci.nisn] || "").trim(), nik: "",
            noInduk: String(r[ci.noInduk] || "").trim(), status: "",
            tahunMasuk: "", yearKeluar: "",
            birthPlace: "", dob: "", gender: gen,
            religion: "", address: "", phone: "", email: "",
            originSchool: "", blood: "", health: "", kelainan: "",
            fatherName: "", taData: {}, class: "",
          };
          studentMap.set(code, st);
        } else {
          if (!st.nisn)    st.nisn = String(r[ci.nisn] || "").trim();
          if (!st.noInduk) st.noInduk = String(r[ci.noInduk] || "").trim();
          if (!st.gender)  st.gender = gen;
        }
        st.taData[ta] = { kls: isValidClass(kls) ? kls : "", no: noSeq };
        if (kls && isValidClass(kls)) st.class = kls;
      }
    });

    studentsData = Array.from(studentMap.values());
    activeTa = detectedTas[detectedTas.length - 1] || "";

    $("pd-upload-label").textContent = `${filename} (${studentsData.length})`;
    const saveBtn = $("pd-save-db");
    if (saveBtn) { saveBtn.hidden = false; }
    const clearBtn = $("pd-clear-db");
    if (clearBtn) clearBtn.hidden = true;

    setLoadingProgress(90, "Merender tampilan\u2026");
    buildTaDropdowns();
    populateClassFilter();
    updateStats();
    renderAll();

    setLoadingProgress(100, "Selesai!");
    setTimeout(hideLoading, 400);

    window.auditLog?.("INSERT", "students", "upload_bulk", null, { count: studentsData.length, file: filename, tas: detectedTas });
    toast(`${studentsData.length} siswa dimuat dari ${taSheets.length} sheet (${detectedTas[0]}\u2013${detectedTas[detectedTas.length-1]}) \u2014 TA ${taLabel(activeTa)} terpilih.`);
  }

  function buildTaDropdowns() {
    const ids = ["pd-ta-select","pd-students-ta-select","pd-mut-ta-select"];
    ids.forEach(id => {
      const sel = $(id);
      if (!sel) return;
      const cur = sel.value;
      const taForDropdown = id === "pd-mut-ta-select" ? (mutTa || activeTa) : activeTa;
      sel.innerHTML = "";
      // Mutation: always show, no "All Years" option
      if (id !== "pd-mut-ta-select") {
        const all = document.createElement("option");
        all.value = "";
        all.textContent = T("allYears");
        sel.appendChild(all);
      }
      detectedTas.forEach(ta => {
        const opt = document.createElement("option");
        opt.value = ta;
        opt.textContent = taLabel(ta);
        sel.appendChild(opt);
      });
      sel.value = detectedTas.includes(cur) ? cur : taForDropdown;
    });

    const show = detectedTas.length > 0;
    ["pd-ta-bar","pd-students-ta-bar","pd-mut-ta-bar"].forEach(id => {
      const el = $(id);
      if (el) el.style.display = show ? "flex" : "none";
    });
  }

  function getFiltered() {
    const base  = activeStudents();
    const q     = ($("pd-search")?.value || "").trim().toLowerCase();
    const grade = $("pd-filter-grade")?.value || "";
    const cls   = $("pd-filter-class")?.value || "";
    const gen   = $("pd-filter-gender")?.value || "";
    return base.filter(s => {
      const c = effectiveClass(s);
      if (q && !`${s.name} ${s.noInduk} ${s.code} ${s.nickname} ${c}`.toLowerCase().includes(q)) return false;
      if (grade && !c.startsWith(grade)) return false;
      if (cls   && c !== cls)            return false;
      if (gen   && !matchesGenderFilter(s, gen)) return false;
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

  /* ── Tab 1: Overview ─────────────────────────────── */

  function renderOverview() {
    const empty = $("pd-rekap-empty");
    if (!studentsData.length) {
      if (empty) empty.style.display = "";
      return;
    }
    if (empty) empty.style.display = "none";
    updateStats();
    drawCharts();
  }

  function updateStats() {
    const data    = activeStudents();
    const classes = allClassesForTa();

    $("pd-s-total").textContent   = data.length;
    $("pd-s-ta-label").textContent = activeTa ? taLabel(activeTa) : T("allYears");
    $("pd-s-classes").textContent = classes.length;

    const cntX   = classes.filter(c => c.startsWith("X-")  || c === "X").length;
    const cntXI  = classes.filter(c => c.startsWith("XI-") || c === "XI").length;
    const cntXII = classes.filter(c => c.startsWith("XII-")|| c === "XII").length;
    $("pd-s-class-detail").textContent = `X: ${cntX} / XI: ${cntXI} / XII: ${cntXII}`;

    const male   = data.filter(s => isMale(s)).length;
    const female = data.length - male;
    $("pd-s-male").textContent   = male;
    $("pd-s-female").textContent = female;

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
      const l = gradeStudents.filter(s => isMale(s)).length;
      const p = gradeStudents.length - l;
      const kelasCount = [...new Set(gradeStudents.map(s => effectiveClass(s)).filter(Boolean))].length;
      const t = $(`${prefix}-total`); if (t) t.textContent = gradeStudents.length;
      const le = $(`${prefix}-l`);    if (le) le.textContent = l;
      const pe = $(`${prefix}-p`);    if (pe) pe.textContent = p;
      const ke = $(`${prefix}-kelas-count`); if (ke) ke.textContent = kelasCount ? `${kelasCount} kelas` : "";
    });
  }

  function drawCharts() {
    if (!detectedTas.length) return;
    drawYearChart();
    drawGenderChart();
  }

  function countForTa(ta) {
    return studentsData.filter(s => {
      const kls = s.taData?.[ta]?.kls;
      return kls && isValidClass(kls);
    }).length;
  }

  function genderCountForTa(ta) {
    const students = studentsData.filter(s => {
      const kls = s.taData?.[ta]?.kls;
      return kls && isValidClass(kls);
    });
    return {
      male:   students.filter(s => isMale(s)).length,
      female: students.filter(s => !isMale(s)).length,
    };
  }

  function drawYearChart() {
    const canvas = $("pd-chart-year");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    if (!w || !h) return;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const pad = { top: 20, bottom: 28, left: 40, right: 16 };
    const chartW = w - pad.left - pad.right;
    const chartH = h - pad.top - pad.bottom;

    ctx.clearRect(0, 0, w, h);

    const tas = detectedTas;
    const counts = tas.map(countForTa);
    const maxVal = Math.max(...counts, 1);

    const barGap = 8;
    const barW = Math.min((chartW - barGap * (tas.length - 1)) / tas.length, 50);

    // Y-axis
    ctx.strokeStyle = "var(--line)";
    ctx.lineWidth = 1;
    ctx.fillStyle = "var(--muted)";
    ctx.font = "11px Manrope, sans-serif";
    ctx.textAlign = "right";
    const ySteps = 4;
    for (let i = 0; i <= ySteps; i++) {
      const v = Math.round((maxVal / ySteps) * i);
      const y = pad.top + chartH - (v / maxVal) * chartH;
      if (i > 0) {
        ctx.beginPath();
        ctx.setLineDash([2, 3]);
        ctx.moveTo(pad.left, y);
        ctx.lineTo(w - pad.right, y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.fillText(String(v), pad.left - 6, y + 4);
    }

    // Bars
    tas.forEach((ta, i) => {
      const x = pad.left + i * (barW + barGap) + (chartW - tas.length * (barW + barGap)) / 2;
      const barH = (counts[i] / maxVal) * chartH;
      const y = pad.top + chartH - barH;

      const grad = ctx.createLinearGradient(x, y, x, pad.top + chartH);
      grad.addColorStop(0, "#13bbb2");
      grad.addColorStop(1, "#0f756f");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, [3, 3, 0, 0]);
      ctx.fill();

      // Value
      ctx.fillStyle = "var(--text)";
      ctx.font = "bold 12px Manrope, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(String(counts[i]), x + barW / 2, y - 5);

      // Label
      ctx.fillStyle = "var(--muted)";
      ctx.font = "10px Manrope, sans-serif";
      ctx.fillText(taLabel(ta), x + barW / 2, pad.top + chartH + 16);
    });
  }

  function drawGenderChart() {
    const canvas = $("pd-chart-gender");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    if (!w || !h) return;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const pad = { top: 20, bottom: 28, left: 40, right: 16 };
    const chartW = w - pad.left - pad.right;
    const chartH = h - pad.top - pad.bottom;

    ctx.clearRect(0, 0, w, h);

    const tas = detectedTas;
    const data = tas.map(genderCountForTa);
    const maxVal = Math.max(...data.map(d => d.male + d.female), 1);

    const barGap = 8;
    const barW = Math.min((chartW - barGap * (tas.length - 1)) / tas.length, 50);

    // Y-axis
    ctx.strokeStyle = "var(--line)";
    ctx.lineWidth = 1;
    ctx.fillStyle = "var(--muted)";
    ctx.font = "11px Manrope, sans-serif";
    ctx.textAlign = "right";
    const ySteps = 4;
    for (let i = 0; i <= ySteps; i++) {
      const v = Math.round((maxVal / ySteps) * i);
      const y = pad.top + chartH - (v / maxVal) * chartH;
      if (i > 0) {
        ctx.beginPath();
        ctx.setLineDash([2, 3]);
        ctx.moveTo(pad.left, y);
        ctx.lineTo(w - pad.right, y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.fillText(String(v), pad.left - 6, y + 4);
    }

    // Stacked bars
    tas.forEach((ta, i) => {
      const x = pad.left + i * (barW + barGap) + (chartW - tas.length * (barW + barGap)) / 2;

      const maleH   = (data[i].male / maxVal) * chartH;
      const femaleH = (data[i].female / maxVal) * chartH;
      const totalH  = maleH + femaleH;
      const yBase   = pad.top + chartH;

      // Female (top)
      const yF = yBase - totalH;
      ctx.fillStyle = "#f65aa0";
      ctx.beginPath();
      ctx.roundRect(x, yF, barW, femaleH, [3, 3, 0, 0]);
      ctx.fill();

      // Male (bottom)
      const yM = yBase - maleH;
      ctx.fillStyle = "#3ecf8e";
      ctx.beginPath();
      ctx.roundRect(x, yM, barW, maleH, [3, 3, 0, 0]);
      ctx.fill();

      // Total value
      ctx.fillStyle = "var(--text)";
      ctx.font = "bold 12px Manrope, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(String(data[i].male + data[i].female), x + barW / 2, yF - 5);

      // Label
      ctx.fillStyle = "var(--muted)";
      ctx.font = "10px Manrope, sans-serif";
      ctx.fillText(taLabel(ta), x + barW / 2, pad.top + chartH + 16);
    });

    // Legend
    const legendX = w - pad.right - 80;
    const legendY = pad.top + 4;
    ctx.fillStyle = "#3ecf8e";
    ctx.fillRect(legendX, legendY, 10, 10);
    ctx.fillStyle = "var(--text)";
    ctx.font = "10px Manrope, sans-serif";
    ctx.textAlign = "left";
    const mLbl = lang() === "id" ? "L" : "M";
    const pLbl = lang() === "id" ? "P" : "F";
    ctx.fillText(`\u2642 ${mLbl}`, legendX + 14, legendY + 9);

    ctx.fillStyle = "#f65aa0";
    ctx.fillRect(legendX, legendY + 16, 10, 10);
    ctx.fillStyle = "var(--text)";
    ctx.fillText(`\u2640 ${pLbl}`, legendX + 14, legendY + 25);
  }

  /* ── Tab 2: Students ─────────────────────────────── */

  function renderStudents() {
    if (!studentsData.length) {
      $("pd-empty").hidden  = false;
      $("pd-empty2-title").textContent = T("noData");
      $("pd-empty2-hint").textContent  = T("noDataHint");
      $("pd-table-wrap").hidden = true;
      $("pd-pagination").style.display = "none";
      return;
    }
    const rows = getFiltered();
    const total = rows.length;

    // Update stats bar
    const data = activeStudents();
    const male   = data.filter(s => isMale(s)).length;
    const female = data.length - male;
    $("pd-st-total").textContent = data.length;
    $("pd-st-x").textContent     = data.filter(s => { const c = effectiveClass(s); return c === "X" || c.startsWith("X-"); }).length;
    $("pd-st-xi").textContent    = data.filter(s => { const c = effectiveClass(s); return c === "XI" || c.startsWith("XI-"); }).length;
    $("pd-st-xii").textContent   = data.filter(s => { const c = effectiveClass(s); return c === "XII" || c.startsWith("XII-"); }).length;
    $("pd-st-l").textContent     = male;
    $("pd-st-p").textContent     = female;

    // Pagination
    const pages = Math.ceil(total / studentPageSize) || 1;
    if (studentPage > pages) studentPage = pages;
    const start = (studentPage - 1) * studentPageSize;
    const pageRows = rows.slice(start, start + studentPageSize);

    $("pd-count").textContent = total;
    $("pd-pageinfo").textContent = `${studentPage}/${pages}`;
    $("pd-pagination").style.display = "flex";
    $("pd-pageprev").disabled = studentPage <= 1;
    $("pd-pagenext").disabled = studentPage >= pages;

    if (!total) {
      $("pd-empty").hidden  = false;
      $("pd-empty2-title").textContent = T("noMatch");
      $("pd-empty2-hint").textContent  = "";
      $("pd-table-wrap").hidden = true;
      return;
    }
    $("pd-empty").hidden  = true;
    $("pd-table-wrap").hidden = false;

    $("pd-thead").innerHTML = `<tr>
      <th>${T("colNo")}</th><th>${T("colInduk")}</th><th>${T("colNisn")}</th>
      <th>${T("colStudentCode")}</th><th>${T("colClass")}</th>
      <th>${T("colName")}</th><th>${T("colGender")}</th>
    </tr>`;

    $("pd-tbody").innerHTML = pageRows.map((s,i) => {
      const c = effectiveClass(s);
      return `<tr>
        <td data-label="${T("colNo")}">${start + i + 1}</td>
        <td data-label="${T("colInduk")}" style="font-family:monospace;font-size:0.78rem">${escH(s.noInduk)}</td>
        <td data-label="${T("colNisn")}" style="font-family:monospace;font-size:0.78rem">${escH(s.nisn)}</td>
        <td data-label="${T("colStudentCode")}" style="font-family:monospace;font-size:0.78rem">${escH(s.code)}</td>
        <td data-label="${T("colClass")}"><span class="module-pill neutral">${escH(c||"\u2014")}</span></td>
        <td data-label="${T("colName")}"><strong>${escH(s.name)}</strong></td>
        <td data-label="${T("colGender")}">${genderLabel(s)}</td>
      </tr>`;
    }).join("");
  }

  /* ── Tab 3: Mutation ─────────────────────────────── */

  function renderMutasi() {
    if (!studentsData.length || detectedTas.length < 2) {
      $("pd-mutasi-body").innerHTML = `<div class="att-empty"><strong>${T("noData")}</strong></div>`;
      $("pd-mut-count").textContent = "0";
      return;
    }

    if (!mutTa || !detectedTas.includes(mutTa)) mutTa = detectedTas[detectedTas.length - 1];
    const taIdx = detectedTas.indexOf(mutTa);
    if (taIdx < 1) {
      $("pd-mutasi-body").innerHTML = `<div class="att-empty"><strong>Pilih tahun ajaran untuk melihat mutasi.</strong></div>`;
      $("pd-mut-count").textContent = "0";
      return;
    }

    const prevTa = detectedTas[taIdx - 1];
    const curTa  = mutTa;

    const prevStudents = studentsData.filter(s => s.taData[prevTa]?.kls && isValidClass(s.taData[prevTa].kls));
    const curStudents  = studentsData.filter(s => s.taData[curTa]?.kls  && isValidClass(s.taData[curTa].kls));

    const newStudents  = curStudents.filter(s => !s.taData[prevTa]?.kls);
    const leftStudents = prevStudents.filter(s => !s.taData[curTa]?.kls);

    let rows = [], label = "", useTa = curTa;

    if (mutView === "in") {
      rows = newStudents.filter(s => {
        const cls = s.taData[curTa]?.kls;
        return cls && !cls.startsWith("X-") && cls !== "X";
      });
      label = `${T("mutasiMasuk")} ${taLabel(prevTa)} \u2192 ${taLabel(curTa)}`;
      useTa = curTa;
    } else if (mutView === "out") {
      rows = leftStudents.filter(s => {
        const cls = s.taData[prevTa]?.kls;
        return cls && !cls.startsWith("XII-") && cls !== "XII";
      });
      label = `${T("mutasiKeluar")} ${taLabel(prevTa)} \u2192 ${taLabel(curTa)}`;
      useTa = prevTa;
    } else {
      rows = leftStudents.filter(s => {
        const cls = s.taData[prevTa]?.kls;
        return cls && (cls.startsWith("XII-") || cls === "XII");
      });
      label = `${T("mutasiGraduated")} ${taLabel(prevTa)} \u2192 ${taLabel(curTa)}`;
      useTa = prevTa;
    }

    $("pd-mutasi-title").textContent = label;
    $("pd-mutasi-sub").textContent = `${taLabel(prevTa)} \u2192 ${taLabel(curTa)}`;
    $("pd-mut-count").textContent = `${rows.length} siswa`;

    rows.sort((a, b) => {
      const cA = studentClassForTa(a, useTa);
      const cB = studentClassForTa(b, useTa);
      return sortClasses(cA, cB) || (Number(studentNoForTa(a, useTa))||999) - (Number(studentNoForTa(b, useTa))||999);
    });

    $("pd-mutasi-body").innerHTML = buildMutasiTable(rows, useTa);
  }

  function buildMutasiTable(rows, ta) {
    if (!rows.length) {
      return `<div style="border:1px solid var(--line);border-radius:.5rem;padding:1rem;text-align:center;color:var(--muted);font-size:0.82rem">\u2014</div>`;
    }
    const sorted = [...rows].sort((a,b) => {
      const cA = studentClassForTa(a, ta);
      const cB = studentClassForTa(b, ta);
      return sortClasses(cA, cB) || (Number(studentNoForTa(a, ta))||999) - (Number(studentNoForTa(b, ta))||999);
    });
    return `<div style="overflow-x:auto;border:1px solid var(--line);border-radius:.5rem">
      <table class="module-table" style="min-width:36rem" id="pd-mutation-table">
        <thead><tr>
          <th>${T("colNo")}</th><th>${T("colInduk")}</th><th>${T("colNisn")}</th>
          <th>${T("colStudentCode")}</th><th>${T("colClass")}</th>
          <th>${T("colName")}</th><th>${T("colGender")}</th>
        </tr></thead>
        <tbody>${sorted.map((s,i) => {
          const cls = studentClassForTa(s, ta);
          return `<tr>
            <td data-label="${T("colNo")}">${i+1}</td>
            <td data-label="${T("colInduk")}" style="font-family:monospace;font-size:0.78rem">${escH(s.noInduk)}</td>
            <td data-label="${T("colNisn")}" style="font-family:monospace;font-size:0.78rem">${escH(s.nisn)}</td>
            <td data-label="${T("colStudentCode")}" style="font-family:monospace;font-size:0.78rem">${escH(s.code)}</td>
            <td data-label="${T("colClass")}"><span class="module-pill neutral">${escH(cls)}</span></td>
            <td data-label="${T("colName")}"><strong>${escH(s.name)}</strong></td>
            <td data-label="${T("colGender")}">${genderLabel(s)}</td>
          </tr>`;
        }).join("")}</tbody>
      </table>
    </div>`;
  }

  /* ── Loading overlay ─────────────────────────────── */

  function showLoading(title = "Memuat data\u2026", sub = "Mohon tunggu sebentar") {
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

  function setLoadBtn(loading) {
    const btn = $("pd-load-db");
    if (!btn) return;
    btn.disabled = loading;
    btn.textContent = loading ? "Loading\u2026" : "Load DB";
  }

  /* ── DB operations ───────────────────────────────── */

  async function clearDb() {
    if (!window.confirm("Hapus semua data peserta didik dari database?\nData harus diupload ulang dari Excel setelahnya.")) return;
    const sb = getSb();
    if (!sb) { toast("Database tidak terhubung."); return; }

    const btn = $("pd-clear-db");
    if (btn) { btn.disabled = true; btn.textContent = "Menghapus\u2026"; }

    try {
      const { error } = await sb.from("pd_students").delete().neq("id", 0);
      if (error) throw error;

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
      toast("\u2713 Data peserta didik dihapus. Silakan upload Excel baru.");
    } catch (err) {
      toast(`Gagal menghapus: ${err.message}`);
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = "Clear DB"; }
    }
  }

  async function saveToSupabase() {
    const sb = getSb();
    if (!sb) { toast("Database tidak terhubung."); return; }
    if (!studentsData.length) { toast("Tidak ada data untuk disimpan."); return; }

    const saveBtn = $("pd-save-db");
    if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = "Menyimpan\u2026"; }
    showLoading("Menyimpan ke database\u2026", `Mempersiapkan ${studentsData.length} siswa`);

    try {
      const rows = studentsData.map(s => ({
        student_code:   s.code    || null,
        no_induk:       s.noInduk || null,
        nisn:           s.nisn    || null,
        name:           s.name,
        gender:         s.gender  || null,
        ta_data: Object.fromEntries(
          Object.entries(s.taData || {}).map(([ta, v]) => [ta, {
            kls: isValidClass(v?.kls) ? v.kls : "",
            no:  v?.no || ""
          }])
        ),
        class:          effectiveClass(s) || null,
        detected_tas:   detectedTas,
      }));

      setLoadingProgress(10, "Menghapus data lama\u2026");
      const { error: delError } = await sb.from("pd_students").delete().neq("id", 0);
      if (delError) throw delError;

      const batchSize = 200;
      const totalBatches = Math.ceil(rows.length / batchSize);
      for (let i = 0; i < rows.length; i += batchSize) {
        const batchNum = Math.floor(i / batchSize) + 1;
        const pct = 15 + Math.round((batchNum / totalBatches) * 80);
        setLoadingProgress(pct, `Menyimpan batch ${batchNum}/${totalBatches} (${Math.min(i + batchSize, rows.length)} siswa)\u2026`);
        const { error } = await sb.from("pd_students").insert(rows.slice(i, i + batchSize));
        if (error) throw error;
        await new Promise(r => setTimeout(r, 80));
      }

      setLoadingProgress(100, "Selesai!");
      await new Promise(r => setTimeout(r, 500));

      updateLastUpdated(new Date().toISOString());
      window.auditLog?.("INSERT", "students", "save_db", null, { count: rows.length, tas: detectedTas });
      toast(`\u2713 ${rows.length} siswa berhasil disimpan ke database.`);
      if (saveBtn) { saveBtn.hidden = true; }

    } catch (err) {
      toast(`Gagal menyimpan: ${err.message}`);
    } finally {
      hideLoading();
      if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = "Save to DB"; }
    }
  }

  async function loadFromSupabase(silent = false) {
    const sb = getSb();
    if (!sb) { if (!silent) toast("Database tidak terhubung."); return; }

    setLoadBtn(true);
    if (!silent) showLoading("Memuat data peserta didik\u2026", "Menghubungi database");

    try {
      let all = [];
      let from = 0;
      let page = 1;
      while (true) {
        if (!silent) setLoadingProgress(10 + page * 15, `Mengambil halaman ${page}\u2026`);
        const { data, error } = await sb
          .from("pd_students")
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
        if (!silent) toast("Belum ada data peserta didik di database. Upload Excel terlebih dahulu.");
        return;
      }

      if (!silent) setLoadingProgress(70, `Memproses ${all.length} siswa\u2026`);

      const firstRow = all[0];
      detectedTas = firstRow.detected_tas || [];

      studentsData = all.map(r => {
        const rawTaData = r.ta_data || {};
        const cleanTaData = Object.fromEntries(
          Object.entries(rawTaData).map(([ta, v]) => [ta, {
            kls: isValidClass(v?.kls) ? v.kls : "",
            no:  v?.no || ""
          }])
        );
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

      if (!silent) setLoadingProgress(90, "Membangun tampilan\u2026");
      const lbl = $("pd-upload-label");
      if (lbl) lbl.textContent = `Database (${studentsData.length})`;
      const saveBtn = $("pd-save-db");
      if (saveBtn) saveBtn.hidden = true;
      const clearBtn = $("pd-clear-db");
      if (clearBtn) clearBtn.hidden = false;

      buildTaDropdowns();
      populateClassFilter();
      updateStats();
      renderAll();

      if (!silent) {
        setLoadingProgress(100, "Selesai!");
        await new Promise(r => setTimeout(r, 400));
      }

      window.auditLog?.("VIEW", "students", "load_db", null, { count: studentsData.length });
      if (!silent) toast(`\u2713 ${studentsData.length} siswa dimuat dari database \u2014 TA ${taLabel(activeTa)}.`);

    } catch (err) {
      if (!silent) {
        if (err.message?.includes("does not exist") || err.message?.includes("relation")) {
          toast("Tabel pd_students belum ada. Buat tabel di Supabase dulu (lihat dokumentasi).");
        } else {
          toast(`Gagal memuat: ${err.message}`);
        }
      }
    } finally {
      hideLoading();
      setLoadBtn(false);
    }
  }

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

  /* ── Export Daftar Hadir ─────────────────────────── */

  function exportDaftarHadir() {
    if (!window.XLSX) { toast("Excel library not loaded."); return; }
    if (!studentsData.length) { toast("No data to export."); return; }

    const base  = activeStudents();
    if (!base.length) { toast("No students for selected TA."); return; }
    const taStr = activeTa ? taLabel(activeTa) : "All";
    const wb    = window.XLSX.utils.book_new();

    // Build recap rows
    const recapRows = base.map(s => [
      studentNoForTa(s, activeTa) || "",
      s.noInduk || "",
      s.nisn || "",
      s.code || "",
      effectiveClass(s) || "",
      s.name || "",
      genderLabel(s)
    ]);
    recapRows.sort((a, b) => sortClasses(a[4], b[4]) || (Number(a[0])||999) - (Number(b[0])||999));

    const wsRecap = window.XLSX.utils.aoa_to_sheet([
      ["NO", "NO INDUK", "NISN", "STUDENT CODE", "KELAS", "NAMA", "JK"],
      ...recapRows
    ]);
    window.XLSX.utils.book_append_sheet(wb, wsRecap, "Recap");

    // Per-class sheets
    const classes = [...new Set(base.map(s => effectiveClass(s)).filter(Boolean))].sort(sortClasses);
    classes.forEach(cls => {
      const students = base.filter(s => effectiveClass(s) === cls);
      const rows = students.map(s => [
        studentNoForTa(s, activeTa) || "",
        s.noInduk || "",
        s.nisn || "",
        s.code || "",
        cls,
        s.name || "",
        genderLabel(s)
      ]);
      rows.sort((a, b) => (Number(a[0])||999) - (Number(b[0])||999));

      const ws = window.XLSX.utils.aoa_to_sheet([
        ["NO", "NO INDUK", "NISN", "STUDENT CODE", "KELAS", "NAMA", "JK"],
        ...rows
      ]);
      window.XLSX.utils.book_append_sheet(wb, ws, cls.slice(0, 31));
    });

    window.XLSX.writeFile(wb, `Daftar_Hadir_${taStr.replace(/\//g,"-")}.xlsx`);
    window.auditLog?.("EXPORT", "students", "daftar_hadir", null, { count: base.length, ta: taStr });
    toast("Daftar hadir exported.");
  }

  /* ── Original export ─────────────────────────────── */

  function exportData() {
    if (!window.XLSX) { toast("Excel export library not loaded."); return; }
    if (!studentsData.length) { toast("No data to export."); return; }
    const base  = activeStudents();
    const taStr = activeTa ? taLabel(activeTa) : "All";
    const wb    = window.XLSX.utils.book_new();

    const rows = base.map(s => [
      studentNoForTa(s, activeTa) || "",
      s.noInduk || "",
      s.nisn || "",
      s.code || "",
      effectiveClass(s) || "",
      s.name || "",
      genderLabel(s)
    ]);
    rows.sort((a, b) => sortClasses(a[4], b[4]) || (Number(a[0])||999) - (Number(b[0])||999));

    const ws = window.XLSX.utils.aoa_to_sheet([
      ["NO", "NO INDUK", "NISN", "STUDENT CODE", "KELAS", "NAMA", "JK"],
      ...rows
    ]);
    window.XLSX.utils.book_append_sheet(wb, ws, `Data Siswa ${taStr.slice(0,20)}`.replace(/[\/\\\?\*\[\]]/g, ""));

    window.XLSX.writeFile(wb, `Data_PD_${taStr.replace(/\//g,"-")}.xlsx`);
    window.auditLog?.("EXPORT", "students", `Data_PD_${taStr}`, null, { count: base.length, ta: taStr });
    toast("Exported successfully.");
  }

  /* ── Language & re-render ────────────────────────── */

  function updateLanguage() {
    if (!$("students-app")) return;
    const u = (id, key) => { const el=$(id); if(el) el.textContent=T(key); };
    u("pd-eyebrow","eyebrow"); u("pd-title","title"); u("pd-subtitle","subtitle");
    u("pd-subnav-overview","tabOverview"); u("pd-subnav-students","tabStudents"); u("pd-subnav-mutasi","tabMutasi");
    u("pd-lbl-total","statTotal"); u("pd-lbl-classes","statClasses");
    u("pd-lbl-gender","statGender"); u("pd-mutasi-title","mutasiTitle");
    if($("pd-search")) $("pd-search").placeholder = T("searchPlaceholder");
    buildTaDropdowns();
    renderAll();
  }

  function renderAll() {
    if (activeTab === "students")      renderStudents();
    else if (activeTab === "mutasi")    renderMutasi();
    else                                renderOverview();
    updateStats();
  }

  /* ── Utilities ───────────────────────────────────── */

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
