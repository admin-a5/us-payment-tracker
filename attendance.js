window.attendanceModule = (() => {
  const state = {
    parsedJpayroll: null,
    parsedKet: null,
    dbData: {},
    dailyData: {},       // period -> employee_id -> [{work_date, finger_in, codes}]
    periodConfigs: {},   // period -> {er_guru, er_karyawan, er_satpam, cutoff_time}
    periods: [],
    activePeriodIdx: 0,
    activeTab: "rekap"
  };

  const $ = (id) => document.getElementById(id);

  function init() {
    if (!$("attendance-app") || $("attendance-app").dataset.ready) return;
    $("attendance-app").dataset.ready = "true";

    const role = window.authModule?.getRole?.() || window.schoolAuth?.role || null;

    // Hide upload section and ER panel for non-super_admin
    const uploadGrid = $("att-upload-grid");
    const erPanel = $("att-er-panel");
    if (uploadGrid && role !== "super_admin") {
      uploadGrid.hidden = true;
      if (erPanel) erPanel.hidden = true;
    } else {
      bindUpload("jpayroll");
      bindUpload("ket");
      ["att-er-guru", "att-er-karyawan", "att-er-satpam"].forEach((id) =>
        $(id).addEventListener("input", onErChange)
      );
    }

    ["att-search", "att-unit", "att-stat", "att-status"].forEach((id) =>
      $(id).addEventListener("input", render)
    );
    $("att-prev-period").addEventListener("click", () => shiftPeriod(-1));
    $("att-next-period").addEventListener("click", () => shiftPeriod(1));
    $("att-latest-period").addEventListener("click", goLatest);
    $("att-export").addEventListener("click", exportExcel);
    
    // Add save button handler
    const saveBtn = $("att-save-btn");
    if (saveBtn && role === "super_admin") {
      saveBtn.addEventListener("click", saveToSupabase);
    }

    // Save ER config button — available whenever periods are loaded
    const erSaveBtn = $("att-er-save-btn");
    if (erSaveBtn) {
      erSaveBtn.addEventListener("click", saveErToSupabase);
    }

    // PD cutoff input (in alert tab bar)
    const pdInput = $("att-pd-cutoff");
    if (pdInput) pdInput.addEventListener("input", onPdCutoffChange);

    document.querySelectorAll("[data-att-tab]").forEach((button) => {
      button.addEventListener("click", () => switchTab(button.dataset.attTab));
    });

    // Auto-load from DB (RLS handles row filtering per role)
    if (["super_admin", "user"].includes(role)) {
      loadFromSupabase();
    }
  }

  // ── UPLOAD BINDINGS ──────────────────────────────────────────────────────────
  function bindUpload(type) {
    const card = $(`att-card-${type}`);
    const input = $(`att-file-${type}`);
    input.addEventListener("change", (e) => { const f = e.target.files[0]; if (f) processFile(f, type); });
    card.addEventListener("dragover", (e) => { e.preventDefault(); card.classList.add("dragover"); });
    card.addEventListener("dragleave", () => card.classList.remove("dragover"));
    card.addEventListener("drop", (e) => {
      e.preventDefault(); card.classList.remove("dragover");
      const f = e.dataTransfer.files[0]; if (f) processFile(f, type);
    });
  }

  function processFile(file, type) {
    if (!window.XLSX) { toast("Excel parser is not loaded."); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = window.XLSX.read(e.target.result, { type: "binary", cellDates: false });
        if (type === "jpayroll") parseJpayroll(wb, file.name);
        else parseKet(wb, file.name);
      } catch (err) { toast(`Parse error: ${err.message}`); }
    };
    reader.readAsBinaryString(file);
  }

  // ── PARSE JPAYROLL ───────────────────────────────────────────────────────────
  function parseJpayroll(workbook, filename) {
    const rows = window.XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1, defval: "" });
    let startDate = "", endDate = "", effKaryawan = 18, effGuru = 18;

    for (let i = 0; i < Math.min(10, rows.length); i++) {
      const row = rows[i];
      for (let c = 0; c < row.length; c++) {
        const v = String(row[c] || "").trim();
        if (/start.date/i.test(v) && row[c + 2]) startDate = String(row[c + 2]).replace(/[\s:]/g, "").trim();
        if (/end.date/i.test(v) && row[c + 2]) endDate = String(row[c + 2]).replace(/[\s:]/g, "").trim();
        if (/hari.efektif.karyawan/i.test(v)) effKaryawan = findNextNumber(row, c, effKaryawan);
        if (/hari.efektif.guru/i.test(v)) effGuru = findNextNumber(row, c, effGuru);
      }
    }

    let headerRow = 0;
    for (let i = 0; i < Math.min(14, rows.length); i++) {
      const text = rows[i].join(" ").toLowerCase();
      if (text.includes("employee id") && text.includes("attendance status")) { headerRow = i; break; }
    }

    const empMap = {};
    let lastId = "", lastName = "", lastOrg = "";

    for (let i = headerRow + 1; i < rows.length; i++) {
      const row = rows[i];
      const rawId = String(row[1] || "").trim().replace(/[^0-9]/g, "");
      const rawName = String(row[2] || "").trim();
      const rawOrg = String(row[3] || "").trim();
      const rawDate = String(row[4] || "").trim();
      const rawStatus = String(row[5] || "").trim().toUpperCase();

      if (rawId) { lastId = rawId; if (rawName) lastName = rawName; if (rawOrg) lastOrg = rawOrg; }
      if (!lastId || !rawDate || !rawStatus) continue;

      const codes = rawStatus.split(",").map((s) => s.trim()).filter(Boolean);
      if (codes.length === 1 && codes[0] === "WS") continue;

      const rawTime = i >= headerRow + 10 ? String(row[21] || "").trim() : "";
      const fingerIn = normalizeTime(rawTime);

      if (!empMap[lastId]) empMap[lastId] = { id: lastId, name: lastName, org: lastOrg, days: [], daily: [] };
      else { if (rawName && !empMap[lastId].name) empMap[lastId].name = rawName; if (rawOrg && !empMap[lastId].org) empMap[lastId].org = rawOrg; }
      empMap[lastId].days.push(codes);
      empMap[lastId].daily.push({ date: rawDate, codes: codes.join(","), finger_in: fingerIn });
    }

    // Second pass — fill stat from right-side summary col AS/AT
    for (let i = headerRow + 1; i < rows.length; i++) {
      const row = rows[i];
      const id = String(row[43] || "").trim().replace(/[^0-9]/g, "");
      const name = String(row[44] || "").trim();
      const stat = String(row[45] || "").trim().toUpperCase();
      if (!id || !empMap[id]) continue;
      if (name && !empMap[id].name) empMap[id].name = name;
      if (/^(GT|GK|KT|PT)$/.test(stat)) empMap[id].stat = stat;
    }

    const employees = {};
    Object.values(empMap).forEach((emp) => {
      let hadir_r = 0, tidak_hadir = 0, terlambat = 0, terlambat_minutes = 0, icc = 0, er = 0;
      emp.days.forEach((codes, idx) => {
        const hasPRS = codes.includes("PRS"), hasICC = codes.includes("ICC"), hasABS = codes.includes("ABS");
        if (hasABS) tidak_hadir++;
        else if (hasICC) icc++;
        else if (hasPRS) {
          hadir_r++;
          if (codes.includes("LT")) {
            terlambat++;
            const fi = emp.daily[idx]?.finger_in;
            if (fi) { const late = timeToMinutes(fi) - timeToMinutes("06:30"); if (late > 0) terlambat_minutes += late; }
          }
          if (codes.includes("ER")) er++;
        }
      });
      employees[emp.id] = {
        id: emp.id, name: emp.name || emp.id, org: emp.org || "", stat: emp.stat || "",
        eff_days: emp.stat === "PT" ? 24 : emp.stat === "GT" ? effGuru : effKaryawan,
        hadir_r, tidak_hadir, terlambat, terlambat_minutes, icc, er, daily: emp.daily
      };
    });

    const pKey = periodKey(endDate) || "0000/00";
    const pLabel = makePeriodLabel(startDate, endDate);

    state.parsedJpayroll = {
      meta: { startDate, endDate, pKey, pLabel, effGuru, effKaryawan },
      employees
    };
    markLoaded("jpayroll", filename, `${Object.keys(employees).length} employees`);
    tryMerge();
  }

  // ── PARSE KETERANGAN ─────────────────────────────────────────────────────────
  function parseKet(workbook, filename) {
    const rows = window.XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1, defval: "" });
    let headerRow = 0;
    for (let i = 0; i < Math.min(5, rows.length); i++) {
      const text = rows[i].join(" ").toLowerCase();
      if (text.includes("peg") || text.includes("add") || text.includes("ket")) { headerRow = i; break; }
    }
    const headers = rows[headerRow].map((h) => String(h).trim().toLowerCase());
    const idx = {
      peg: headers.findIndex((h) => h.includes("peg") || h.includes("id")),
      add: headers.findIndex((h) => h.includes("add")),
      izin: headers.findIndex((h) => h.includes("izin")),
      sakit: headers.findIndex((h) => h.includes("sakit")),
      cuti: headers.findIndex((h) => h.includes("cuti")),
      ket: headers.findIndex((h) => h.includes("ket"))
    };
    const result = {};
    for (let i = headerRow + 1; i < rows.length; i++) {
      const row = rows[i];
      const id = String(row[idx.peg >= 0 ? idx.peg : 0] || "").trim().replace(/[^0-9]/g, "");
      if (!id) continue;
      result[id] = {
        add: idx.add >= 0 ? Number(row[idx.add]) || 0 : 0,
        izin: idx.izin >= 0 ? Number(row[idx.izin]) || 0 : 0,
        sakit: idx.sakit >= 0 ? Number(row[idx.sakit]) || 0 : 0,
        cuti: idx.cuti >= 0 ? Number(row[idx.cuti]) || 0 : 0,
        keterangan: idx.ket >= 0 ? String(row[idx.ket] || "").trim() : ""
      };
    }
    state.parsedKet = result;
    markLoaded("ket", filename, `${Object.keys(result).length} entries`);
    tryMerge();
  }

  // ── MERGE AFTER PARSE ────────────────────────────────────────────────────────
  function tryMerge() {
    if (!state.parsedJpayroll) return;
    const { meta, employees } = state.parsedJpayroll;
    const ket = state.parsedKet || {};

    const summaries = Object.values(employees).map((emp) => {
      const k = ket[emp.id] || { add: 0, izin: 0, sakit: 0, cuti: 0, keterangan: "" };
      const add = k.add || 0;
      const effDays = getER(emp.org, emp.stat);
      return {
        employee_id: emp.id, employee_name: emp.name, org: emp.org, stat: emp.stat,
        period: meta.pKey, start_date: meta.startDate, end_date: meta.endDate, period_label: meta.pLabel,
        eff_days: effDays, hadir_r: emp.hadir_r, hadir_add: add, hadir_totr: emp.hadir_r + add,
        tidak_hadir: emp.tidak_hadir, terlambat: emp.terlambat, terlambat_minutes: emp.terlambat_minutes || 0,
        icc: emp.icc, er: emp.er, izin: k.izin || 0, sakit: k.sakit || 0, cuti: k.cuti || 0,
        keterangan: k.keterangan || "", pd_count: 0, _daily: emp.daily || []
      };
    });

    const sorted = sortRows(summaries);
    state.dbData[meta.pKey] = sorted;
    if (!state.periods.includes(meta.pKey)) state.periods.push(meta.pKey);
    state.periods.sort();
    state.activePeriodIdx = state.periods.indexOf(meta.pKey);

    // Store daily for PD
    state.dailyData[meta.pKey] = {};
    summaries.forEach((r) => {
      state.dailyData[meta.pKey][r.employee_id] = r._daily || [];
    });

    buildUnitFilter();
    showDataUI();
    
    // Show save button after merge
    const saveBtn = $("att-save-btn");
    if (saveBtn) {
      saveBtn.hidden = false;
      saveBtn.style.display = "";
    }
    
    toast(`Merged ${summaries.length} employees. Click "Save to DB" to persist data.`);
  }

  // ── SAVE TO SUPABASE ─────────────────────────────────────────────────────────
  async function saveToSupabase() {
    const sb = window._sb || window.schoolAuth?.sb;
    if (!sb) { toast("Database not connected."); return; }
    
    if (!state.parsedJpayroll) { toast("No data to save. Upload files first."); return; }
    
    const { meta } = state.parsedJpayroll;
    const period = meta.pKey;
    const summaries = state.dbData[period] || [];
    const dailyRecords = [];
    
    // Collect all daily records for this period
    Object.keys(state.dailyData[period] || {}).forEach(empId => {
      const days = state.dailyData[period][empId] || [];
      days.forEach(d => {
        dailyRecords.push({
          employee_id: empId,
          period: period,
          work_date: d.date,
          finger_in: d.finger_in || null,
          codes: d.codes || ""
        });
      });
    });
    
    if (!summaries.length) { toast("No summary data to save."); return; }
    
    const saveBtn = $("att-save-btn");
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = "Saving...";
    }
    
    try {
      toast("Saving to database...");
      
      // 1. Save period config (ER values)
      const cfg = state.periodConfigs[period] || {};
      const periodConfig = {
        period: period,
        er_guru: Number($("att-er-guru")?.value) || 18,
        er_karyawan: Number($("att-er-karyawan")?.value) || 18,
        er_satpam: Number($("att-er-satpam")?.value) || 24,
        cutoff_time: $("att-pd-cutoff")?.value || ""
      };
      
      await sb.from("period_config").upsert(periodConfig, { onConflict: "period" });
      
      // 2. Delete existing records for this period
      await sb.from("attendance_summary").delete().eq("period", period);
      await sb.from("attendance_daily").delete().eq("period", period);
      
      // 3. Insert summary records in batches
      for (let i = 0; i < summaries.length; i += 100) {
        const batch = summaries.slice(i, i + 100).map(r => ({
          employee_id: r.employee_id,
          period: r.period,
          period_label: r.period_label,
          eff_days: r.eff_days,
          hadir_r: r.hadir_r,
          hadir_add: r.hadir_add,
          hadir_totr: r.hadir_totr,
          tidak_hadir: r.tidak_hadir,
          terlambat: r.terlambat,
          terlambat_minutes: r.terlambat_minutes,
          icc: r.icc,
          er: r.er,
          izin: r.izin,
          sakit: r.sakit,
          cuti: r.cuti,
          keterangan: r.keterangan,
          pd_count: r.pd_count || 0
        }));
        
        const { error: summaryError } = await sb.from("attendance_summary").insert(batch);
        if (summaryError) throw summaryError;
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // 4. Insert daily records in batches
      for (let i = 0; i < dailyRecords.length; i += 200) {
        const batch = dailyRecords.slice(i, i + 200);
        const { error: dailyError } = await sb.from("attendance_daily").insert(batch);
        if (dailyError) throw dailyError;
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Audit log
      window.auditLog?.("INSERT", "staff", period, null, { 
        period, 
        employees: summaries.length,
        daily_records: dailyRecords.length 
      });
      
      toast(`✓ Saved ${summaries.length} employees and ${dailyRecords.length} daily records to database.`);
      
      // Hide save button after successful save
      if (saveBtn) {
        saveBtn.hidden = true;
        saveBtn.style.display = "none";
      }
      
    } catch (err) {
      toast(`Save error: ${err.message}`);
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = "Save to DB";
      }
    }
  }

  // ── SAVE ONLY ER CONFIG ─────────────────────────────────────────────────────
  async function saveErToSupabase() {
    const sb = window._sb || window.schoolAuth?.sb;
    if (!sb) { toast("Database not connected."); return; }

    const pKey = state.periods[state.activePeriodIdx];
    if (!pKey) { toast("No period loaded yet."); return; }

    const erBtn = document.getElementById("att-er-save-btn");
    if (erBtn) { erBtn.disabled = true; erBtn.textContent = "Saving…"; }

    try {
      const periodConfig = {
        period:       pKey,
        er_guru:      Number(document.getElementById("att-er-guru")?.value)     || 18,
        er_karyawan:  Number(document.getElementById("att-er-karyawan")?.value) || 18,
        er_satpam:    Number(document.getElementById("att-er-satpam")?.value)   || 24,
        cutoff_time:  document.getElementById("att-pd-cutoff")?.value || ""
      };

      const { error } = await sb.from("period_config").upsert(periodConfig, { onConflict: "period" });
      if (error) throw error;

      // Update local state
      state.periodConfigs[pKey] = periodConfig;

      window.auditLog?.("UPDATE", "staff", pKey, null, { action: "save_er_config", ...periodConfig });
      toast(`✓ Hari Efektif saved for ${pKey}.`);
    } catch (err) {
      toast(`Save error: ${err.message}`);
    } finally {
      if (erBtn) { erBtn.disabled = false; erBtn.textContent = "Save ER"; }
    }
  }

  // ── LOAD FROM SUPABASE ───────────────────────────────────────────────────────
  async function loadFromSupabase() {
    const sb = window._sb || window.schoolAuth?.sb;
    if (!sb) { toast("Database not connected."); return; }
    toast("Loading attendance data...");
    try {
      // Load period ER configs
      const { data: cfgList } = await sb.from("period_config").select("*");
      state.periodConfigs = {};
      (cfgList || []).forEach((r) => {
        state.periodConfigs[r.period] = { er_guru: r.er_guru || 18, er_karyawan: r.er_karyawan || 18, er_satpam: r.er_satpam || 24, cutoff_time: r.cutoff_time || "" };
      });

      // Load daily data for PD counting
      const { data: dayList } = await sb.from("attendance_daily").select("employee_id,period,work_date,finger_in,codes").order("period").order("employee_id").order("work_date");
      state.dailyData = {};
      (dayList || []).forEach((d) => {
        if (!state.dailyData[d.period]) state.dailyData[d.period] = {};
        if (!state.dailyData[d.period][d.employee_id]) state.dailyData[d.period][d.employee_id] = [];
        state.dailyData[d.period][d.employee_id].push(d);
      });

      // Load attendance summary with employee details
      const { data, error } = await sb
        .from("attendance_summary")
        .select("*, employees(name, org, stat)")
        .order("period", { ascending: true });

      if (error) throw error;
      if (!data || !data.length) { toast("No attendance records found."); return; }

      state.dbData = {};
      state.periods = [];

      data.forEach((row) => {
        const p = row.period;
        if (!state.dbData[p]) { state.dbData[p] = []; state.periods.push(p); }
        const empName = row.employees?.name || row.employee_id;
        const org = row.employees?.org || row.org || "";
        const stat = row.employees?.stat || row.stat || "";
        state.dbData[p].push({
          employee_id: row.employee_id,
          employee_name: empName,
          org, stat,
          period: row.period,
          period_label: row.period_label || row.period,
          eff_days: row.eff_days || 0,
          hadir_r: row.hadir_r || 0,
          hadir_add: row.hadir_add || 0,
          hadir_totr: row.hadir_totr || 0,
          tidak_hadir: row.tidak_hadir || 0,
          terlambat: row.terlambat || 0,
          terlambat_minutes: row.terlambat_minutes || 0,
          icc: row.icc || 0,
          er: row.er || 0,
          izin: row.izin || 0,
          sakit: row.sakit || 0,
          cuti: row.cuti || 0,
          keterangan: row.keterangan || "",
          pd_count: row.pd_count || 0
        });
      });

      state.periods.sort();
      state.activePeriodIdx = state.periods.length - 1;

      // Apply saved ER per period and sort
      Object.keys(state.dbData).forEach((p) => {
        const cfg = state.periodConfigs[p];
        if (cfg) {
          state.dbData[p].forEach((r) => {
            if (erGroup(r.org) === "satpam") r.eff_days = cfg.er_satpam;
            else if (erGroup(r.org) === "karyawan") r.eff_days = cfg.er_karyawan;
            else r.eff_days = cfg.er_guru;
          });
        }
        state.dbData[p] = sortRows(state.dbData[p]);
      });

      buildUnitFilter();
      showDataUI();
      
      // Hide save button after loading from DB
      const saveBtn = $("att-save-btn");
      if (saveBtn) {
        saveBtn.hidden = true;
        saveBtn.style.display = "none";
      }
      
      toast(`Loaded ${data.length} attendance records.`);
    } catch (err) {
      toast(`DB error: ${err.message}`);
    }
  }

  // ── PERIOD LABEL GENERATION ─────────────────────────────────────────────────
  function makePeriodLabel(startDate, endDate) {
    if (!startDate || !endDate) return endDate || "Unknown period";
    
    // Parse dates (format: DD/MM/YYYY)
    const parseDate = (dateStr) => {
      const parts = dateStr.split("/");
      if (parts.length !== 3) return null;
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    };
    
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    
    if (!start || !end) return `${startDate} - ${endDate}`;
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const startMonth = monthNames[start.getMonth()];
    const endMonth = monthNames[end.getMonth()];
    const year = end.getFullYear();
    
    // If same month, just show "Apr 2026"
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${endMonth} ${year}`;
    }
    
    // If different months, show "Mar-Apr 2026"
    if (start.getFullYear() === end.getFullYear()) {
      return `${startMonth}-${endMonth} ${year}`;
    }
    
    // If different years, show "Dec 2025-Jan 2026"
    return `${startMonth} ${start.getFullYear()}-${endMonth} ${year}`;
  }

  // ── PD COUNTING ──────────────────────────────────────────────────────────────
  function getPdCount(employeeId) {
    const pKey = state.periods[state.activePeriodIdx];
    const cutoffEl = $("att-pd-cutoff");
    if (!cutoffEl || !cutoffEl.value) return 0;
    const cutoff = cutoffEl.value;

    // Prefer live dailyData (from attendance_daily table)
    const days = (state.dailyData[pKey] || {})[employeeId] || [];
    if (days.length) {
      return days.filter((d) => d.finger_in && d.finger_in > cutoff).length;
    }

    // Fall back to stored pd_count in attendance_summary
    // (only valid if the cutoff matches what was used when saving)
    const row = (state.dbData[pKey] || []).find((r) => r.employee_id === employeeId);
    return row?.pd_count || 0;
  }

  function onPdCutoffChange() {
    const pKey = state.periods[state.activePeriodIdx];
    if (state.periodConfigs[pKey]) state.periodConfigs[pKey].cutoff_time = $("att-pd-cutoff")?.value || "";
    if (state.activeTab === "alert") renderAlert();
  }

  function onErChange() {
    const pKey = state.periods[state.activePeriodIdx];
    // Keep periodConfigs in sync so save picks up latest ER values
    if (pKey) {
      if (!state.periodConfigs[pKey]) state.periodConfigs[pKey] = {};
      state.periodConfigs[pKey].er_guru     = Number(document.getElementById("att-er-guru")?.value)     || 18;
      state.periodConfigs[pKey].er_karyawan = Number(document.getElementById("att-er-karyawan")?.value) || 18;
      state.periodConfigs[pKey].er_satpam   = Number(document.getElementById("att-er-satpam")?.value)   || 24;
    }
    if (state.dbData[pKey]) state.dbData[pKey].forEach((r) => { r.eff_days = getER(r.org, r.stat); });
    updateStats();
    render();
  }

  // ── DATA UI ──────────────────────────────────────────────────────────────────
  function showDataUI() {
    $("att-stats").hidden = false;
    $("att-controls").hidden = false;
    $("att-empty").hidden = true;
    $("att-table-scroll").hidden = false;
    loadErForPeriod(state.periods[state.activePeriodIdx]);
    // Wire Save ER button (DOM may not exist during init if subpage wasn't open yet)
    const erSaveBtn = $("att-er-save-btn");
    if (erSaveBtn && !erSaveBtn._wired) {
      erSaveBtn.addEventListener("click", saveErToSupabase);
      erSaveBtn._wired = true;
    }
    // Show PD bar if any period has a cutoff configured
    const hasCutoff = Object.values(state.periodConfigs).some((c) => c.cutoff_time);
    const pdBar = $("att-pd-bar");
    if (pdBar) pdBar.hidden = !hasCutoff;
    updatePeriodLabel();
    updateStats();
    render();
  }

  function loadErForPeriod(pKey) {
    const cfg = state.periodConfigs[pKey];
    if (!cfg) return;
    const g = $("att-er-guru"), k = $("att-er-karyawan"), s = $("att-er-satpam");
    if (g) g.value = cfg.er_guru;
    if (k) k.value = cfg.er_karyawan;
    if (s) s.value = cfg.er_satpam;
    const ci = $("att-pd-cutoff");
    if (ci) ci.value = cfg.cutoff_time || "";
  }

  // ── RENDER ───────────────────────────────────────────────────────────────────
  function render() {
    if (state.activeTab === "unit") renderUnit();
    else if (state.activeTab === "alert") renderAlert();
    else if (state.activeTab === "icc") renderICC();
    else renderRekap();
    updateStats();
  }

  function renderRekap() {
    $("att-table-head").innerHTML = `<tr>
      <th>Karyawan</th><th>Unit</th><th>Stat.</th><th>ER</th><th>R</th><th>Add</th>
      <th style="color:var(--accent)">TotR</th>
      <th style="color:#7c4dff">Izin</th><th style="color:var(--danger)">Sakit</th><th style="color:#9c27b0">Cuti</th>
      <th style="color:var(--money-warn)">ICC</th><th>Terlambat</th><th>Keterangan</th><th>Status</th>
    </tr>`;
    const rows = getFiltered();
    if (!rows.length) { emptyRow(14); return; }
    $("att-table-body").innerHTML = rows.map(renderRekapRow).join("");
  }

  function renderRekapRow(r) {
    const hasICC = r.icc > 0;
    const isAlert = r.tidak_hadir >= 1 || r.terlambat >= 1;
    const rowCls = hasICC ? "att-row-icc" : isAlert ? "att-row-alert" : "";
    const pct = r.eff_days ? Math.round((r.hadir_totr / r.eff_days) * 100) : 0;
    const tClr = r.hadir_totr >= r.eff_days ? "good" : r.hadir_totr >= r.eff_days - 2 ? "warn" : "bad";
    const addH = r.hadir_add !== 0
      ? `<span class="att-num ${r.hadir_add > 0 ? "good" : "bad"}">${r.hadir_add > 0 ? "+" : ""}${r.hadir_add}</span>`
      : `<span class="att-num" style="color:var(--muted)">—</span>`;
    // ICC: orange+bold if icc>0 and no keterangan
    const iccNeedsKet = hasICC && !r.keterangan;
    const iccDisplay = hasICC
      ? `<span class="att-num orange" style="${iccNeedsKet ? "font-weight:900;text-decoration:underline" : ""}">⚠ ${r.icc}</span>`
      : `<span class="att-num" style="color:var(--muted)">—</span>`;
    const ketDisplay = r.keterangan
      ? `<span class="att-ket-chip">${escapeHtml(r.keterangan)}</span>`
      : `<span style="color:var(--muted);font-size:0.72rem">—</span>`;
    const status = (hasICC ? `<span class="att-icc-chip${iccNeedsKet ? " att-icc-urgent" : ""}">⚠ ICC:${r.icc}</span> ` : "")
      + (isAlert ? `<span class="module-pill warn">Perhatian</span> ` : "")
      + (!hasICC && !isAlert ? `<span class="module-pill good">✓ Normal</span>` : "")
      + (r.terlambat > 0 ? `<span class="module-pill warn" style="margin-left:2px">LT:${r.terlambat}</span>` : "");
    return `<tr class="${rowCls}">
      <td><div class="att-emp-cell"><strong>${escapeHtml(r.employee_name)}</strong><small>${escapeHtml(r.employee_id)}</small></div></td>
      <td><span class="att-org">${escapeHtml(r.org || "—")}</span></td>
      <td><span class="module-pill neutral">${escapeHtml(r.stat || "—")}</span></td>
      <td class="att-num-cell"><span class="att-num">${r.eff_days}</span></td>
      <td class="att-num-cell"><span class="att-num">${r.hadir_r}</span></td>
      <td class="att-num-cell">${addH}</td>
      <td class="att-num-cell"><span class="att-num ${tClr}" title="${pct}% hadir">${r.hadir_totr}</span></td>
      <td class="att-num-cell"><span class="att-num ${r.izin > 0 ? "att-blue" : ""}">${r.izin || "—"}</span></td>
      <td class="att-num-cell"><span class="att-num ${r.sakit > 0 ? "bad" : ""}">${r.sakit || "—"}</span></td>
      <td class="att-num-cell"><span class="att-num ${r.cuti > 0 ? "att-purple" : ""}">${r.cuti || "—"}</span></td>
      <td class="att-num-cell">${iccDisplay}</td>
      <td class="att-num-cell"><span class="att-num ${r.terlambat >= 3 ? "bad" : r.terlambat > 0 ? "warn" : ""}">${r.terlambat || "—"}</span></td>
      <td>${ketDisplay}</td>
      <td style="white-space:nowrap">${status}</td>
    </tr>`;
  }

  function renderUnit() {
    const groups = {};
    curRows().forEach((r) => {
      const unit = r.org || "No Unit";
      if (!groups[unit]) groups[unit] = { org: unit, count: 0, eff: 0, totr: 0, izin: 0, sakit: 0, cuti: 0, icc: 0, late: 0 };
      const g = groups[unit];
      g.count++; g.eff += r.eff_days; g.totr += r.hadir_totr;
      g.izin += r.izin || 0; g.sakit += r.sakit || 0; g.cuti += r.cuti || 0;
      g.icc += r.icc; g.late += r.terlambat;
    });
    $("att-table-head").innerHTML = `<tr>
      <th>Unit</th><th>Karyawan</th><th>ER</th><th style="color:var(--accent)">TotR</th>
      <th style="color:#7c4dff">Izin</th><th style="color:var(--danger)">Sakit</th><th style="color:#9c27b0">Cuti</th>
      <th style="color:var(--money-warn)">ICC</th><th>Terlambat</th><th>% Hadir</th>
    </tr>`;
    $("att-table-body").innerHTML = Object.values(groups)
      .sort((a, b) => unitOrder(a.org) - unitOrder(b.org))
      .map((u) => {
        const pct = u.eff ? Math.round((u.totr / u.eff) * 100) : 0;
        const pClr = pct >= 90 ? "good" : pct >= 75 ? "warn" : "bad";
        return `<tr>
          <td><strong>${escapeHtml(u.org)}</strong></td>
          <td class="att-num-cell"><span class="att-num">${u.count}</span></td>
          <td class="att-num-cell"><span class="att-num">${u.eff}</span></td>
          <td class="att-num-cell"><span class="att-num good">${u.totr}</span></td>
          <td class="att-num-cell"><span class="att-num ${u.izin > 0 ? "att-blue" : ""}">${u.izin || "—"}</span></td>
          <td class="att-num-cell"><span class="att-num ${u.sakit > 0 ? "bad" : ""}">${u.sakit || "—"}</span></td>
          <td class="att-num-cell"><span class="att-num ${u.cuti > 0 ? "att-purple" : ""}">${u.cuti || "—"}</span></td>
          <td class="att-num-cell"><span class="att-num ${u.icc > 0 ? "orange" : ""}">${u.icc || "—"}</span></td>
          <td class="att-num-cell"><span class="att-num ${u.late > 0 ? "warn" : ""}">${u.late || "—"}</span></td>
          <td class="att-num-cell"><span class="att-num ${pClr}">${pct}%</span></td>
        </tr>`;
      }).join("");
  }

  function renderAlert() {
    const cutoff = $("att-pd-cutoff")?.value || "";
    $("att-table-head").innerHTML = `<tr>
      <th>Karyawan</th>
      <th style="color:var(--accent)">TotR</th><th>ER</th>
      <th style="color:var(--danger)">Tdk Hadir</th>
      <th>Terlambat</th>
      <th style="color:var(--partial-text)">Menit</th>
      ${cutoff ? `<th style="color:var(--money-warn)">PD &gt;${cutoff}</th>` : ""}
      <th>Keterangan</th><th>Status</th>
    </tr>`;
    const rows = getFiltered().filter((r) => r.terlambat >= 1).sort((a, b) => b.terlambat - a.terlambat);
    if (!rows.length) { $("att-table-body").innerHTML = `<tr><td colspan="${cutoff ? 9 : 8}" style="text-align:center;padding:3rem;color:var(--muted)">✓ Tidak ada karyawan yang membutuhkan perhatian khusus</td></tr>`; return; }
    $("att-table-body").innerHTML = rows.map((r) => {
      const menit = r.terlambat_minutes || 0;
      const pdCount = cutoff ? getPdCount(r.employee_id) : 0;
      const tags = (r.tidak_hadir >= 1 ? `<span class="module-pill warn" style="margin:1px">Absen:${r.tidak_hadir}</span>` : "")
        + (r.terlambat >= 1 ? `<span class="module-pill warn" style="margin:1px">LT:${r.terlambat}x</span>` : "")
        + (pdCount > 0 ? `<span class="module-pill warn" style="margin:1px;color:var(--money-warn)">PD:${pdCount}</span>` : "");
      return `<tr class="att-row-alert">
        <td><div class="att-emp-cell"><strong>${escapeHtml(r.employee_name)}</strong><small>${escapeHtml(r.employee_id)}</small></div></td>
        <td class="att-num-cell"><span class="att-num good">${r.hadir_totr}</span></td>
        <td class="att-num-cell"><span class="att-num">${r.eff_days}</span></td>
        <td class="att-num-cell"><span class="att-num bad">${r.tidak_hadir || "—"}</span></td>
        <td class="att-num-cell"><span class="att-num ${r.terlambat >= 3 ? "bad" : "warn"}">${r.terlambat || "—"}</span></td>
        <td class="att-num-cell"><span class="att-num ${menit > 0 ? "warn" : ""}">${menit > 0 ? menit + "m" : "—"}</span></td>
        ${cutoff ? `<td class="att-num-cell"><span class="att-num ${pdCount > 0 ? "orange" : ""}">${pdCount || "—"}</span></td>` : ""}
        <td>${r.keterangan ? `<span class="att-ket-chip">${escapeHtml(r.keterangan)}</span>` : "—"}</td>
        <td style="white-space:nowrap">${tags}</td>
      </tr>`;
    }).join("");
  }

  function renderICC() {
    $("att-table-head").innerHTML = `<tr>
      <th>Karyawan</th><th>Unit</th><th>Stat.</th><th>R</th>
      <th style="color:var(--money-warn)">ICC</th>
      <th style="color:var(--accent)">TotR</th><th>ER</th>
      <th>Keterangan</th><th>Catatan</th>
    </tr>`;
    const rows = getFiltered().filter((r) => r.icc > 0).sort((a, b) => b.icc - a.icc);
    if (!rows.length) { $("att-table-body").innerHTML = `<tr><td colspan="9" style="text-align:center;padding:3rem;color:var(--muted)">✓ Tidak ada ICC yang perlu diklarifikasi</td></tr>`; return; }
    $("att-table-body").innerHTML = rows.map((r) => {
      const iccNeedsKet = !r.keterangan;
      return `<tr class="att-row-icc">
        <td><div class="att-emp-cell"><strong>${escapeHtml(r.employee_name)}</strong><small>${escapeHtml(r.employee_id)}</small></div></td>
        <td><span class="att-org">${escapeHtml(r.org || "—")}</span></td>
        <td><span class="module-pill neutral">${escapeHtml(r.stat || "—")}</span></td>
        <td class="att-num-cell"><span class="att-num">${r.hadir_r}</span></td>
        <td class="att-num-cell"><span class="att-icc-chip${iccNeedsKet ? " att-icc-urgent" : ""}">⚠ ${r.icc}</span></td>
        <td class="att-num-cell"><span class="att-num good">${r.hadir_totr}</span></td>
        <td class="att-num-cell"><span class="att-num">${r.eff_days}</span></td>
        <td>${r.keterangan ? `<span class="att-ket-chip">${escapeHtml(r.keterangan)}</span>` : `<span style="color:var(--danger);font-size:0.72rem;font-weight:700">Belum ada ket.</span>`}</td>
        <td style="font-size:0.72rem;color:var(--money-warn)">${r.icc} hari finger tidak lengkap — minta klarifikasi</td>
      </tr>`;
    }).join("");
  }

  // ── FILTER ───────────────────────────────────────────────────────────────────
  function getFiltered(forceStatus) {
    const query = $("att-search").value.toLowerCase();
    const unit = $("att-unit").value;
    const stat = $("att-stat").value;
    const status = forceStatus || $("att-status").value;
    return curRows().filter((r) => {
      if (query && !`${r.employee_name} ${r.employee_id}`.toLowerCase().includes(query)) return false;
      if (unit && r.org !== unit) return false;
      if (stat && r.stat !== stat) return false;
      if (status === "icc") return r.icc > 0;
      if (status === "alert") return r.tidak_hadir >= 1 || r.terlambat >= 3;
      if (status === "clean") return r.icc === 0 && r.tidak_hadir === 0 && r.terlambat < 3;
      return true;
    });
  }

  // ── STATS ────────────────────────────────────────────────────────────────────
  function updateStats() {
    const rows = getFiltered();
    const totalEff = rows.reduce((a, r) => a + r.eff_days, 0);
    const totalPresent = rows.reduce((a, r) => a + r.hadir_totr, 0);
    $("att-s-total").textContent = rows.length;
    $("att-s-pct").textContent = totalEff ? `${Math.round((totalPresent / totalEff) * 100)}%` : "0%";
    $("att-s-absen").textContent = rows.reduce((a, r) => a + r.tidak_hadir, 0);
    $("att-s-late").textContent = rows.reduce((a, r) => a + r.terlambat, 0);
    // ICC tab button — add urgent indicator if any ICC has no keterangan
    const iccCount = rows.filter((r) => r.icc > 0).length;
    const iccUrgent = rows.filter((r) => r.icc > 0 && !r.keterangan).length;
    $("att-s-icc").textContent = iccCount;
    $("att-s-alert").textContent = rows.filter((r) => r.tidak_hadir >= 1 || r.terlambat >= 3).length;

    // Add orange bold style to ICC tab button if any unresolved
    const iccTabBtn = document.querySelector("[data-att-tab='icc']");
    if (iccTabBtn) {
      if (iccUrgent > 0) {
        iccTabBtn.style.color = "var(--money-warn)";
        iccTabBtn.style.fontWeight = "900";
        iccTabBtn.textContent = `ICC Klarifikasi ⚠${iccUrgent}`;
      } else {
        iccTabBtn.style.color = "";
        iccTabBtn.style.fontWeight = "";
        iccTabBtn.textContent = "ICC Klarifikasi";
      }
    }
  }

  // ── EXPORT ───────────────────────────────────────────────────────────────────
  function exportExcel() {
    if (!window.XLSX) { toast("Excel export library is not loaded."); return; }
    const rows = getFiltered();
    if (!rows.length) { toast("No data to export."); return; }

    const pKey = state.periods[state.activePeriodIdx];
    const periodLabel = state.dbData[pKey]?.[0]?.period_label || pKey;
    // Sanitize for filename (keep readable)
    const fileLabel = periodLabel.replace(/[:\/\?\*\[\]]/g, "-").replace(/\s+/g, "_");
    // Sanitize for sheet name: max 31 chars, no special chars
    const sheetLabel = pKey.replace("/", "-"); // e.g. "2026-03"

    const H = ["Employee ID", "Nama", "Unit", "Stat", "ER", "R", "Add", "TotR", "Izin", "Sakit", "Cuti", "ICC", "Terlambat", "Menit Terlambat", "PD Count", "Keterangan"];
    const colWidths = [{ wch: 14 }, { wch: 30 }, { wch: 26 }, { wch: 5 }, { wch: 5 }, { wch: 5 }, { wch: 5 }, { wch: 6 }, { wch: 6 }, { wch: 7 }, { wch: 6 }, { wch: 5 }, { wch: 10 }, { wch: 16 }, { wch: 9 }, { wch: 28 }];
    const toRow = (r) => [
      r.employee_id, r.employee_name, r.org, r.stat, r.eff_days,
      r.hadir_r, r.hadir_add, r.hadir_totr, r.izin || 0, r.sakit || 0, r.cuti || 0,
      r.icc, r.terlambat, r.terlambat_minutes || 0, r.pd_count || 0, r.keterangan
    ];

    const wb = window.XLSX.utils.book_new();

    // Sheet 1: Rekap semua
    const ws1 = window.XLSX.utils.aoa_to_sheet([H, ...rows.map(toRow)]);
    ws1["!cols"] = colWidths;
    window.XLSX.utils.book_append_sheet(wb, ws1, `Rekap ${sheetLabel}`);

    // Sheet 2: ICC Klarifikasi (only ICC rows)
    const iccRows = rows.filter((r) => r.icc > 0);
    if (iccRows.length) {
      const ws2 = window.XLSX.utils.aoa_to_sheet([H, ...iccRows.map(toRow)]);
      ws2["!cols"] = colWidths;
      window.XLSX.utils.book_append_sheet(wb, ws2, "ICC Klarifikasi");
    }

    // Sheet 3: Perhatian Khusus (terlambat >= 1)
    const alertRows = rows.filter((r) => r.terlambat >= 1);
    if (alertRows.length) {
      const ws3 = window.XLSX.utils.aoa_to_sheet([H, ...alertRows.map(toRow)]);
      ws3["!cols"] = colWidths;
      window.XLSX.utils.book_append_sheet(wb, ws3, "Perhatian Khusus");
    }

    window.XLSX.writeFile(wb, `Rekap_Kehadiran_${fileLabel}.xlsx`);
    toast("Exported successfully.");
  }

  // ── PERIOD NAV ───────────────────────────────────────────────────────────────
  function shiftPeriod(delta) {
    state.activePeriodIdx = Math.max(0, Math.min(state.periods.length - 1, state.activePeriodIdx + delta));
    loadErForPeriod(state.periods[state.activePeriodIdx]);
    rerender();
  }

  function goLatest() {
    state.activePeriodIdx = state.periods.length - 1;
    loadErForPeriod(state.periods[state.activePeriodIdx]);
    rerender();
  }

  function rerender() {
    curRows().forEach((r) => { r.eff_days = getER(r.org, r.stat); r.hadir_totr = r.hadir_r + r.hadir_add; });
    updatePeriodLabel();
    updateStats();
    render();
  }

  function updatePeriodLabel() {
    const label = curRows()[0]?.period_label || state.periods[state.activePeriodIdx] || "-";
    $("att-period-label").textContent = label;
    $("att-period-er").textContent = label;
    $("att-s-period").textContent = label;
  }

  function switchTab(tab) {
    state.activeTab = tab;
    document.querySelectorAll("[data-att-tab]").forEach((btn) => btn.classList.toggle("active", btn.dataset.attTab === tab));
    // Show PD bar in alert tab if any cutoff is configured
    const pdBar = $("att-pd-bar");
    if (pdBar) {
      const hasCutoff = Object.values(state.periodConfigs).some((c) => c.cutoff_time);
      pdBar.hidden = tab !== "alert" || !hasCutoff;
    }
    render();
  }

  // ── HELPERS ──────────────────────────────────────────────────────────────────
  function curRows() { return state.dbData[state.periods[state.activePeriodIdx]] || []; }

  function getER(org, stat) {
    const text = String(org || "").toLowerCase();
    if (/satpam/.test(text) || stat === "PT") return Number($("att-er-satpam")?.value) || 24;
    if (/kepala.tata.usaha|tata.usaha|pesuruh|teknisi/.test(text)) return Number($("att-er-karyawan")?.value) || 18;
    return Number($("att-er-guru")?.value) || 18;
  }

  function erGroup(org) {
    const s = String(org || "").toLowerCase();
    if (/satpam/.test(s)) return "satpam";
    if (/kepala.tata.usaha|tata.usaha|pesuruh|teknisi/.test(s)) return "karyawan";
    return "guru";
  }

  function sortRows(rows) {
    return [...rows].sort((a, b) => unitOrder(a.org) - unitOrder(b.org) || (a.employee_name || "").localeCompare(b.employee_name || ""));
  }

  function unitOrder(org) {
    const s = String(org || "").toLowerCase();
    if (/wakasek/.test(s)) return 0;
    if (/guru|wali.kelas|koordinator.slo/.test(s)) return 1;
    if (/kepala.tata.usaha|tata.usaha|dokter|suster|pustakawan/.test(s)) return 2;
    if (/pesuruh/.test(s)) return 3;
    if (/satpam/.test(s)) return 4;
    return 5;
  }

  function buildUnitFilter() {
    const units = new Set();
    Object.values(state.dbData).forEach((rows) => rows.forEach((r) => r.org && units.add(r.org)));
    $("att-unit").innerHTML = '<option value="">All Units</option>';
    [...units].sort().forEach((unit) => {
      const opt = document.createElement("option");
      opt.value = unit; opt.textContent = unit;
      $("att-unit").appendChild(opt);
    });
  }

  function emptyRow(n) {
    $("att-table-body").innerHTML = `<tr><td colspan="${n}" style="text-align:center;padding:3rem;color:var(--muted)">No employees match the filters.</td></tr>`;
  }

  function periodKey(endDate) {
    const parts = String(endDate || "").split("/");
    if (parts.length < 3) return null;
    return `${parts[2]}/${parts[1].padStart(2, "0")}`;
  }

  function findNextNumber(row, col, fallback) {
    for (let i = col + 1; i < col + 5; i++) {
      const v = Number.parseInt(row[i], 10);
      if (!Number.isNaN(v) && v > 0) return v;
    }
    return fallback;
  }

  function normalizeTime(raw) {
    if (!raw) return "";
    if (/^\d+\.\d+$/.test(raw)) {
      const mins = Math.round(Number.parseFloat(raw) * 24 * 60);
      return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
    }
    if (/^\d{1,2}:\d{2}/.test(raw)) {
      const [h, m] = raw.split(":");
      return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
    }
    return "";
  }

  function timeToMinutes(time) {
    if (!time) return 0;
    const [h, m] = time.split(":");
    return Number(h) * 60 + Number(m);
  }

  function markLoaded(type, filename, info) {
    $(`att-card-${type}`).classList.add("loaded");
    $(`att-filename-${type}`).textContent = `${filename} - ${info}`;
  }

  function escapeHtml(v) {
    return String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function toast(message) {
    const el = $("att-toast");
    el.textContent = message;
    el.classList.add("show");
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(() => el.classList.remove("show"), 3200);
  }

  return { init, loadFromSupabase };
})();

document.addEventListener("click", (event) => {
  if (event.target?.dataset?.subpage === "staff-attendance") {
    window.setTimeout(window.attendanceModule.init, 0);
  }
});
