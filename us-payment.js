const usPayment = (() => {
  const DENDA_PER_STEP = 10000;
  const DENDA_CUTOFF_DAY = 25;
  const DENDA_START_PERIOD = "2026/07";
  const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const MONTH_FULL = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  const now = new Date();
  const currentPeriod = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;
  let sb = null;
  let studentsData = [];
  let paymentsData = [];
  let mergedData = [];
  let allMonths = [];
  let allClasses = [];
  let activeMonthIdx = 0;
  let sourceTimestamps = { students: null, payments: null };

  const $ = (id) => document.getElementById(id);

  function getSupabaseClient() {
    return window.authModule?.getSupabaseClient?.() || window.schoolAuth?.sb || window._sb || null;
  }

  function getAuthRole() {
    return window.authModule?.getRole?.() || window.schoolAuth?.role || null;
  }

  function getAssignedClass() {
    return window.authModule?.getAssignedClass?.() || window.schoolAuth?.assignedClass || null;
  }

  function init() {
    if (!$("finance")) return;
    sb = getSupabaseClient();

    $("us-file-students").addEventListener("change", (event) => onFileSelect(event, "students"));
    $("us-file-payments").addEventListener("change", (event) => onFileSelect(event, "payments"));
    $("us-load-db").addEventListener("click", loadFromSupabase);
    $("us-export").addEventListener("click", exportReport);
    $("us-search").addEventListener("input", renderTable);
    $("us-grade").addEventListener("change", renderTable);
    $("us-class").addEventListener("change", renderTable);
    $("us-status").addEventListener("change", renderTable);
    $("us-view").addEventListener("change", renderTable);
    $("us-prev-month").addEventListener("click", () => shiftMonth(-1));
    $("us-next-month").addEventListener("click", () => shiftMonth(1));
    $("us-current-month").addEventListener("click", goToCurrentMonth);
    $("us-popup").addEventListener("click", (event) => {
      if (event.target === $("us-popup")) closePopup();
    });
    $("us-popup-close").addEventListener("click", closePopup);
    $("us-open-today").addEventListener("click", showTodayList);
    $("us-open-outstanding").addEventListener("click", showOutstandingList);

    ["students", "payments"].forEach((type) => {
      const card = $(`us-card-${type}`);
      if (!card) return;
      card.addEventListener("dragover", (event) => {
        event.preventDefault();
        card.classList.add("dragover");
      });
      card.addEventListener("dragleave", () => card.classList.remove("dragover"));
      card.addEventListener("drop", (event) => {
        event.preventDefault();
        card.classList.remove("dragover");
        const file = event.dataTransfer.files[0];
        if (file) processFile(file, type);
      });
    });
  }

  function monthLabel(period) {
    const [year, rawMonth] = String(period || "").split("/");
    const monthIndex = Number(rawMonth) - 1;
    return {
      short: `${MONTH_NAMES[monthIndex] || rawMonth} ${year || ""}`,
      full: `${MONTH_FULL[monthIndex] || rawMonth} ${year || ""}`
    };
  }

  function fmtIDR(value) {
    const number = Number(value || 0);
    if (!number) return "Rp 0";
    return `Rp ${number.toLocaleString("id-ID")}`;
  }

  function calcDenda(count) {
    let total = 0;
    for (let i = 1; i <= count; i += 1) total += i * DENDA_PER_STEP;
    return total;
  }

  function getOverdueCount(student, targetMonth) {
    const currentIndex = allMonths.indexOf(currentPeriod);
    const targetIndex = allMonths.indexOf(targetMonth);
    const cutoffMonth =
      now.getDate() >= DENDA_CUTOFF_DAY ? targetMonth : currentIndex > 0 ? allMonths[currentIndex - 1] : "0000/00";
    let streak = 0;

    for (const month of allMonths) {
      if (month < DENDA_START_PERIOD || month > cutoffMonth || month > targetMonth || allMonths.indexOf(month) > targetIndex) {
        continue;
      }
      const payment = student.payments[month];
      if (payment) {
        if (payment.xoutstanding > 0) streak += 1;
        else streak = 0;
      }
    }
    return streak;
  }

  async function loadFromSupabase() {
    // super_admin: both cards visible; admin: payments card only; wali_kelas: hidden
    const role = getAuthRole();
    const assignedClass = getAssignedClass();
    const uploadGrid = $("us-upload-grid");
    const cardStudents = $("us-card-students");
    const cardPayments = $("us-card-payments");
    if (uploadGrid) {
      if (role === "super_admin") {
        uploadGrid.hidden = false;
        uploadGrid.style.display = "";
        if (cardStudents) cardStudents.style.display = "";
        if (cardPayments) cardPayments.style.display = "";
      } else if (role === "admin") {
        uploadGrid.hidden = false;
        uploadGrid.style.display = "";
        if (cardStudents) cardStudents.style.display = "none";
        if (cardPayments) cardPayments.style.display = "";
      } else {
        uploadGrid.hidden = true;
        uploadGrid.style.display = "none";
        if (cardStudents) cardStudents.style.display = "none";
        if (cardPayments) cardPayments.style.display = "none";
      }
    }

    // Use shared supabase instance from auth if available
    sb = sb || getSupabaseClient();
    if (!sb) {
      showToast("Supabase library is not loaded. Check your internet connection.");
      return;
    }

    showToast("Loading database...");
    try {
      // wali_kelas: only fetch students in their assigned class
      let studentQuery = sb.from("students").select("id, no_induk, name, class, va_bca, va_mandiri, ket");
      if (role === "wali_kelas" && assignedClass) {
        studentQuery = studentQuery.eq("class", assignedClass);
      }
      const { data: students, error: studentError } = await studentQuery;
      if (studentError) throw studentError;

      let payments = [];
      let from = 0;
      while (true) {
        const { data: chunk, error: paymentError } = await sb
          .from("payments")
          .select("*")
          .gte("monthly_period", DENDA_START_PERIOD)
          .range(from, from + 999);
        if (paymentError) throw paymentError;
        payments = payments.concat(chunk || []);
        if (!chunk || chunk.length < 1000) break;
        from += 1000;
      }

      studentsData = (students || []).map((student) => ({
        id: String(student.id),
        no_induk: student.no_induk || "",
        name: student.name || "",
        class: student.class || "",
        va_bca: student.va_bca || "",
        va_mandiri: student.va_mandiri || "",
        ket: student.ket || ""
      }));

      paymentsData = payments.map((payment) => normalizePayment(payment));
      markLoaded("students", "Database", `${studentsData.length} students`);
      markLoaded("payments", "Database", `${paymentsData.length} records`);
      setSourceTimestamp("students", extractLatestTimestamp(students || []));
      setSourceTimestamp("payments", extractLatestTimestamp(payments));
      
      mergeData();
      showToast("Database loaded.");
      // Audit: log DB load action
      window.auditLog?.("VIEW", "finance", "load_db", null, { students: studentsData.length, payments: paymentsData.length });
    } catch (error) {
      showToast(`Database error: ${error.message}`);
    }
  }

  function onFileSelect(event, type) {
    const file = event.target.files[0];
    if (file) processFile(file, type);
  }

  function processFile(file, type) {
    if (!window.XLSX) {
      showToast("Excel parser is not loaded. Check your internet connection.");
      return;
    }

    showToast(`Parsing ${file.name}...`);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const workbook = window.XLSX.read(event.target.result, { type: "binary", cellDates: true });
        if (type === "students") parseStudents(workbook, file.name);
        else parsePayments(workbook, file.name);
      } catch (error) {
        showToast(`Parse error: ${error.message}`);
      }
    };
    reader.readAsBinaryString(file);
  }

  function parseStudents(workbook, filename) {
    const sheetName = workbook.SheetNames.includes("2526") ? "2526" : workbook.SheetNames[0];
    const rows = window.XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: "" });
    let headerRow = 0;
    for (let i = 0; i < Math.min(6, rows.length); i += 1) {
      const rowText = rows[i].join(" ").toUpperCase();
      if (rowText.includes("NAMA") && (rowText.includes("KELAS") || rowText.includes("INDUK"))) {
        headerRow = i;
        break;
      }
    }

    const headers = rows[headerRow].map((header) => String(header).trim().toUpperCase().replace(/[\.\s\-\/]+/g, "_"));
    const findColumn = (...names) => {
      for (const name of names) {
        const index = headers.findIndex((header) => header === name || header.includes(name));
        if (index >= 0) return index;
      }
      return -1;
    };

    const indexes = {
      code: findColumn("STUDENT_CODE", "STUDENTCODE", "NISN"),
      induk: findColumn("INDUK", "NO_INDUK", "NOINDUK"),
      name: findColumn("NAMA"),
      class: findColumn("KELAS"),
      vaBca: findColumn("VA_BCA", "VABCA"),
      vaMandiri: findColumn("VA_MANDIRI", "VAMANDIRI"),
      ket: findColumn("KET", "KETERANGAN")
    };

    const parsed = [];
    for (let i = headerRow + 1; i < rows.length; i += 1) {
      const row = rows[i];
      const name = String(row[indexes.name] || "").trim();
      if (!name) continue;
      const code = Number(String(row[indexes.code] || "").replace(/[^0-9]/g, "")) || 0;
      const induk = Number(String(row[indexes.induk] || "").replace(/[^0-9]/g, "")) || 0;
      parsed.push({
        id: String(code || induk || name),
        no_induk: induk,
        name,
        class: normalizeClass(row[indexes.class]),
        va_bca: String(row[indexes.vaBca] || ""),
        va_mandiri: String(row[indexes.vaMandiri] || ""),
        ket: String(row[indexes.ket] || "")
      });
    }

    studentsData = parsed;
    markLoaded("students", filename, `${parsed.length} students`);
    saveStudentsToSupabase(parsed);
    mergeData();
  }

  function parsePayments(workbook, filename) {
    const rows = window.XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1, defval: "" });
    let headerRow = 0;
    for (let i = 0; i < Math.min(5, rows.length); i += 1) {
      const rowText = rows[i].join(" ").toLowerCase();
      if (rowText.includes("student_code") || rowText.includes("monthly_period")) {
        headerRow = i;
        break;
      }
    }

    const headers = rows[headerRow].map((header) => String(header).trim().toLowerCase().replace(/\s+/g, "_"));
    const findColumn = (...names) => {
      for (const name of names) {
        const index = headers.findIndex((header) => header.includes(name));
        if (index >= 0) return index;
      }
      return -1;
    };

    const indexes = {
      studentCode: findColumn("student_code"),
      monthlyPeriod: findColumn("monthly_period"),
      fee: findColumn("xfee"),
      paymentAmount: findColumn("payment_amount"),
      used: findColumn("xused"),
      outstanding: findColumn("xoutstanding"),
      studentName: findColumn("student_name"),
      orgCode: findColumn("organization_code", "org_code"),
      classroom: findColumn("classroom_description", "classroom"),
      paymentDate: findColumn("payment_date"),
      description: findColumn("payment_description")
    };

    const parsed = [];
    for (let i = headerRow + 1; i < rows.length; i += 1) {
      const row = rows[i];
      const studentCode = Number(String(row[indexes.studentCode] || "").replace(/[^0-9]/g, ""));
      if (!studentCode) continue;
      parsed.push(
        normalizePayment({
          student_code: studentCode,
          monthly_period: String(row[indexes.monthlyPeriod] || "").trim(),
          xfee: Number(row[indexes.fee]) || 0,
          payment_amount: Number(row[indexes.paymentAmount]) || 0,
          xused: Number(row[indexes.used]) || 0,
          xoutstanding: Number(row[indexes.outstanding]) || 0,
          student_name: row[indexes.studentName] || "",
          org_code: row[indexes.orgCode] || "",
          classroom: row[indexes.classroom] || "",
          payment_date: indexes.paymentDate >= 0 ? String(row[indexes.paymentDate] || "").trim() : "",
          payment_description: indexes.description >= 0 ? String(row[indexes.description] || "").trim() : ""
        })
      );
    }

    paymentsData = parsed;
    markLoaded("payments", filename, `${parsed.length} records`);
    savePaymentsToSupabase(parsed);
    mergeData();
  }

  function normalizePayment(payment) {
    return {
      student_code: String(payment.student_code || ""),
      monthly_period: payment.monthly_period || "",
      xfee: Number(payment.xfee) || 0,
      payment_amount: Number(payment.payment_amount) || 0,
      xused: Number(payment.xused) || 0,
      xoutstanding: Number(payment.xoutstanding) || 0,
      student_name: payment.student_name || "",
      org_code: payment.org_code || "",
      classroom: payment.classroom || "",
      payment_date: payment.payment_date || "",
      payment_description: payment.payment_description || "",
      created_at: payment.created_at || null
    };
  }

  async function saveStudentsToSupabase(rows) {
    if (!sb || !rows.length) return;
    try {
      const savedAt = new Date().toISOString();
      await sb.from("students").delete().neq("id", 0);
      for (let i = 0; i < rows.length; i += 500) {
        const { error } = await sb.from("students").insert(rows.slice(i, i + 500));
        if (error) throw error;
      }
      setSourceTimestamp("students", savedAt);
      showToast("Student data saved to database.");
      // Audit: log bulk student upload
      window.auditLog?.("INSERT", "finance", "students_bulk", null, { count: rows.length, timestamp: savedAt });
    } catch (error) {
      showToast(`Students parsed locally, DB save failed: ${error.message}`);
    }
  }

  async function savePaymentsToSupabase(rows) {
    if (!sb || !rows.length) return;
    try {
      const timestamp = new Date().toISOString();
      await sb.from("payments").delete().neq("id", 0);
      for (let i = 0; i < rows.length; i += 500) {
        const batch = rows.slice(i, i + 500).map(row => ({
          ...row,
          created_at: timestamp
        }));
        const { error } = await sb.from("payments").insert(batch);
        if (error) throw error;
      }
      paymentsData = rows.map((row) => ({ ...row, created_at: timestamp }));
      setSourceTimestamp("payments", timestamp);
      showToast("Payment data saved to database.");
      // Audit: log bulk payment upload
      window.auditLog?.("INSERT", "finance", "payments_bulk", null, { count: rows.length, timestamp });
    } catch (error) {
      showToast(`Payments parsed locally, DB save failed: ${error.message}`);
    }
  }

  function mergeData() {
    if (!studentsData.length || !paymentsData.length) {
      updateEmptyState();
      return;
    }

    const monthSet = new Set();
    const paymentMap = {};
    paymentsData.forEach((payment) => {
      if (payment.monthly_period) monthSet.add(payment.monthly_period);
      if (!paymentMap[payment.student_code]) paymentMap[payment.student_code] = {};
      paymentMap[payment.student_code][payment.monthly_period] = payment;
    });

    // Generate complete month range from DENDA_START_PERIOD to latest payment
    const latestFromPayments = [...monthSet].sort().pop();
    const latestPeriod = latestFromPayments && latestFromPayments > currentPeriod ? latestFromPayments : currentPeriod;
    allMonths = [];
    const startD = new Date(DENDA_START_PERIOD + "/01");
    const endD = new Date(latestPeriod + "/01");
    const d = new Date(startD);
    while (d <= endD) {
      allMonths.push(`${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}`);
      d.setMonth(d.getMonth() + 1);
    }
    if (!allMonths.length) allMonths = [DENDA_START_PERIOD];

    allClasses = Array.from(new Set(studentsData.map((student) => student.class).filter(Boolean))).sort(sortClasses);
    mergedData = studentsData.map((student) => ({
      ...student,
      payments: paymentMap[String(student.id)] || {}
    }));

    const currentIndex = allMonths.indexOf(currentPeriod);
    activeMonthIdx = currentIndex >= 0 ? currentIndex : Math.max(0, allMonths.length - 1);
    populateClasses();
    updateEmptyState();
    renderTable();
  }

  function populateClasses() {
    const role = getAuthRole();
    const assignedClass = getAssignedClass();
    const currentValue = $("us-class").value;
    $("us-class").innerHTML = '<option value="">All Classes</option>';
    allClasses.forEach((className) => {
      const option = document.createElement("option");
      option.value = className;
      option.textContent = className;
      $("us-class").appendChild(option);
    });

    // wali_kelas: lock to their assigned class, hide grade filter
    if (role === "wali_kelas" && assignedClass) {
      $("us-class").value = assignedClass;
      $("us-class").disabled = true;
      const gradeEl = $("us-grade");
      if (gradeEl) gradeEl.style.display = "none";
    } else {
      $("us-class").disabled = false;
      $("us-class").value = allClasses.includes(currentValue) ? currentValue : "";
    }
  }

  function renderTable() {
    if (!mergedData.length || !allMonths.length) {
      updateStats([]);
      return;
    }

    const currentMonth = allMonths[activeMonthIdx];
    const visibleMonths = getVisibleMonths(currentMonth);

    const query = $("us-search").value.trim().toLowerCase();
    const grade = $("us-grade").value;
    const classFilter = $("us-class").value;
    const status = $("us-status").value;

    const filtered = mergedData
      .filter((student) => {
        const haystack = `${student.name} ${student.no_induk} ${student.class} ${student.va_bca} ${student.va_mandiri}`.toLowerCase();
        if (query && !haystack.includes(query)) return false;
        if (grade && String(student.class).split("-")[0] !== grade) return false;
        if (classFilter && student.class !== classFilter) return false;
        if (status === "outstanding") return visibleMonths.some((month) => !student.payments[month] || student.payments[month].xoutstanding > 0);
        if (status === "paid") return visibleMonths.every((month) => student.payments[month] && student.payments[month].xoutstanding === 0);
        return true;
      })
      .sort((a, b) => sortClasses(a.class, b.class) || a.name.localeCompare(b.name));

    const hasKet = studentsData.some((student) => student.ket);
    const monthHeaders = visibleMonths.map((month) => `<th class="col-month">${monthLabel(month).short}</th>`).join("");
    const ketHeader = hasKet ? "<th>Ket</th>" : "";

    let html = `
      <thead>
        <tr>
          <th class="col-name">Student</th>
          ${ketHeader}
          ${monthHeaders}
          <th class="col-num">Denda</th>
          <th class="col-num">Outstanding</th>
        </tr>
      </thead>
      <tbody>
    `;

    if (!filtered.length) {
      html += `<tr><td colspan="${3 + visibleMonths.length + (hasKet ? 1 : 0)}" style="text-align:center;padding:3rem;color:var(--muted)">No students match the current filters.</td></tr>`;
    } else {
      const grouped = groupByClass(filtered);
      Object.keys(grouped)
        .sort(sortClasses)
        .forEach((className) => {
          const classStats = getClassStats(grouped[className], currentMonth);
          html += `<tr class="us-class-row"><td colspan="${3 + visibleMonths.length + (hasKet ? 1 : 0)}">
            <div class="us-class-line">
              <span class="us-class-name">Class ${escapeHtml(className || "No Class")}</span>
              <span class="us-class-count">${grouped[className].length}</span>
              <span class="us-class-paid">${classStats.paid} Paid</span>
              <span class="us-class-due">${classStats.due} Due</span>
            </div>
          </td></tr>`;
          grouped[className].forEach((student) => {
            const overdue = getOverdueCount(student, currentMonth);
            const denda = calcDenda(overdue);
            const totalOutstanding = allMonths
              .filter((month) => month <= currentMonth)
              .reduce((total, month) => total + (student.payments[month] ? student.payments[month].xoutstanding : 0), 0);
            const ketCell = hasKet ? `<td>${student.ket || "-"}</td>` : "";
            const monthCells = visibleMonths
              .map((month) => {
                const payment = student.payments[month];
                const statusInfo = getPaymentStatus(payment);
                const currentClass = month === currentMonth ? " current" : "";
                return `<td class="col-month us-month-cell" data-student="${escapeAttr(student.id)}" data-month="${month}">
                  <span class="us-badge ${statusInfo.className}${currentClass}">${statusInfo.label}</span>
                </td>`;
              })
              .join("");

            const currentStatus = getPaymentStatus(student.payments[currentMonth]);
            html += `
              <tr>
                <td class="col-name">
                  <div class="us-student-name">
                    <strong>${escapeHtml(student.name)}</strong>
                    <span>${escapeHtml(String(student.no_induk || student.id))} - ${escapeHtml(student.class || "-")}</span>
                  </div>
                  <span class="us-badge us-mobile-status ${currentStatus.className}" data-student="${escapeAttr(student.id)}" data-month="${currentMonth}">${currentStatus.label}</span>
                </td>
                ${ketCell}
                ${monthCells}
                <td class="col-num ${denda ? "us-money-warn" : ""}">${denda ? fmtIDR(denda) : "-"}</td>
                <td class="col-num ${totalOutstanding ? "us-money-warn" : ""}">${totalOutstanding ? fmtIDR(totalOutstanding) : "-"}</td>
              </tr>
            `;
          });
        });
    }

    html += "</tbody>";
    $("us-table").innerHTML = html;
    document.querySelectorAll(".us-month-cell").forEach((cell) => {
      cell.addEventListener("click", () => showDetail(cell.dataset.student, cell.dataset.month));
    });
    document.querySelectorAll(".us-mobile-status").forEach((badge) => {
      badge.addEventListener("click", () => showDetail(badge.dataset.student, badge.dataset.month));
    });

    updateStats(filtered);
    updateMonthLabel();
  }

  function getPaymentStatus(payment) {
    if (!payment) return { label: "Unpaid", className: "unpaid" };
    if (payment.xoutstanding === 0) return { label: "Paid", className: "paid" };
    if (payment.xused > 0 || payment.payment_amount > 0) return { label: "Partial", className: "partial" };
    return { label: "Unpaid", className: "unpaid" };
  }

  function getVisibleMonths(currentMonth) {
    const view = $("us-view").value;
    if (view === "current") return [currentMonth];
    if (view === "all") return allMonths.slice();
    if (view === "ytd") {
      const year = String(currentMonth).split("/")[0];
      return allMonths.filter((month) => month.startsWith(`${year}/`) && month <= currentMonth);
    }
    return [currentMonth];
  }

  function getClassStats(rows, currentMonth) {
    return rows.reduce(
      (stats, student) => {
        const payment = student.payments[currentMonth];
        if (payment && payment.xoutstanding === 0) stats.paid += 1;
        else stats.due += 1;
        return stats;
      },
      { paid: 0, due: 0 }
    );
  }

  function updateStats(rows = mergedData) {
    const currentMonth = allMonths[activeMonthIdx] || currentPeriod;
    const total = rows.length;
    let paid = 0;
    let outstanding = 0;
    let outstandingTotal = 0;
    let dendaTotal = 0;
    let paidToday = 0;
    const today = new Date().toISOString().slice(0, 10);

    rows.forEach((student) => {
      const payment = student.payments[currentMonth];
      if (payment && payment.xoutstanding === 0) paid += 1;
      else outstanding += 1;
      outstandingTotal += allMonths
        .filter((month) => month <= currentMonth)
        .reduce((totalOut, month) => totalOut + (student.payments[month] ? student.payments[month].xoutstanding : 0), 0);
      dendaTotal += calcDenda(getOverdueCount(student, currentMonth));
      if (Object.values(student.payments).some((item) => item.payment_date && String(item.payment_date).slice(0, 10) === today)) paidToday += 1;
    });

    $("us-s-total").textContent = total;
    $("us-s-month").textContent = monthLabel(currentMonth).full;
    $("us-s-paid").textContent = paid;
    $("us-s-paid-pct").textContent = total ? `${Math.round((paid / total) * 100)}% of students` : "0%";
    $("us-s-out").textContent = outstanding;
    $("us-s-out-pct").textContent = total ? `${Math.round((outstanding / total) * 100)}% of students` : "0%";
    $("us-s-out-total").textContent = fmtIDR(outstandingTotal);
    $("us-s-denda").textContent = fmtIDR(dendaTotal);
    $("us-s-today").textContent = paidToday;
  }

  function showDetail(studentId, month) {
    const student = mergedData.find((item) => String(item.id) === String(studentId));
    if (!student) return;

    const payment = student.payments[month];
    const currentMonth = allMonths[activeMonthIdx] || month;
    const totalOutstanding = allMonths
      .filter((item) => item <= currentMonth)
      .reduce((total, item) => total + (student.payments[item] ? student.payments[item].xoutstanding : 0), 0);
    const overdue = getOverdueCount(student, currentMonth);
    const denda = calcDenda(overdue);
    const status = getPaymentStatus(payment);

    // Build denda breakdown
    const ci = allMonths.indexOf(currentPeriod);
    const cutM = now.getDate() >= DENDA_CUTOFF_DAY
      ? currentMonth
      : ci > 0 ? allMonths[ci - 1] : "0000/00";
    const steps = [];
    let streakC = 0;
    for (const m of allMonths) {
      if (m < DENDA_START_PERIOD || m > cutM || m > currentMonth) continue;
      const p = student.payments[m];
      if (p && p.xoutstanding > 0) {
        streakC++;
        steps.push({ month: m, step: streakC });
      } else {
        streakC = 0;
      }
    }
    let dendaHtml;
    if (steps.length) {
      const fl = monthLabel(steps[0].month).short;
      const ll = monthLabel(steps[steps.length - 1].month).short;
      dendaHtml = `
        ${detailRow("Denda", fmtIDR(denda))}
        <div class="us-denda-bd">
          <div class="us-denda-info">Streak: <strong>${steps.length}</strong> bulan (${fl}–${ll})</div>
          <div class="us-denda-list">
            <div class="us-denda-row us-denda-hd"><span>Bulan</span><span>Denda</span></div>
            ${steps.map(s => `<div class="us-denda-row"><span>${monthLabel(s.month).short}</span><span>${fmtIDR(s.step * DENDA_PER_STEP)}</span></div>`).join('')}
            <div class="us-denda-row us-denda-total"><span>Total Denda</span><span>${fmtIDR(denda)}</span></div>
          </div>
        </div>`;
    } else {
      dendaHtml = detailRow("Denda", "Rp 0");
    }

    $("us-popup-title").textContent = student.name;
    $("us-popup-meta").textContent = `${student.class || "-"} - ${monthLabel(month).full}`;
    $("us-popup-body").innerHTML = `
      ${detailRow("Status", `<span class="us-badge ${status.className}">${status.label}</span>`)}
      ${detailRow("Fee", payment ? fmtIDR(payment.xfee) : "No record")}
      ${detailRow("Payment Amount", payment ? fmtIDR(payment.payment_amount) : "Rp 0")}
      ${detailRow("Outstanding", fmtIDR(totalOutstanding))}
      ${dendaHtml}
      ${detailRow("VA BCA", student.va_bca || "-")}
      ${detailRow("VA Mandiri", student.va_mandiri || "-")}
      ${payment && payment.payment_date ? detailRow("Payment Date", String(payment.payment_date).slice(0, 16).replace("T", " ")) : ""}
      ${student.ket && /^PEG/i.test(student.ket) ? "" : '<button class="us-copy" type="button" id="us-copy-bill">Copy Tagihan</button>'}
    `;
    var copyBtn = $("us-copy-bill");
    if (copyBtn) copyBtn.addEventListener("click", function () { copyTagihan(student, currentMonth); });
    $("us-popup").hidden = false;
  }

  function detailRow(label, value) {
    return `<div class="us-detail-row"><span>${label}</span><strong>${value}</strong></div>`;
  }

  function closePopup() {
    $("us-popup").hidden = true;
  }

  function copyTagihan(student, month) {
    const overdue = getOverdueCount(student, month);
    const denda = calcDenda(overdue);
    const totalOutstanding = allMonths
      .filter((item) => item <= month)
      .reduce((total, item) => total + (student.payments[item] ? student.payments[item].xoutstanding : 0), 0);
    const monthsDue = allMonths.filter((item) => item <= month && student.payments[item] && student.payments[item].xoutstanding > 0).length;
    let text = `Mohon segera melakukan pembayaran Uang Sekolah atas nama ${student.name} dengan detail sebagai berikut:\n`;
    text += `1. Total Tagihan : ${fmtIDR(totalOutstanding)}\n`;
    text += `2. Jumlah Bulan : ${monthsDue} bulan\n`;
    if (denda > 0) text += `3. Denda : ${fmtIDR(denda)}\n`;
    text += `Total tagihan : ${fmtIDR(totalOutstanding + denda)} + biaya admin\n`;
    if (student.va_bca) text += `VA BCA : ${student.va_bca}\n`;
    if (student.va_mandiri) text += `VA Mandiri : ${student.va_mandiri}\n`;
    text += "\nMohon Perhatian :\n1. Apabila pembayaran melewati tanggal 25 bulan berjalan maka akan dikenakan denda.\n2. Apabila sudah melakukan pembayaran mohon dikonfirmasi dengan bukti pembayaran untuk kami update.\nTerima kasih. Tuhan memberkati";
    copyText(text, "Tagihan copied.");
  }

  function showTodayList() {
    const today = new Date().toISOString().slice(0, 10);
    const rows = mergedData
      .filter((student) => Object.values(student.payments).some((payment) => payment.payment_date && String(payment.payment_date).slice(0, 10) === today))
      .sort((a, b) => sortClasses(a.class, b.class) || a.name.localeCompare(b.name));
    const text = rows.length
      ? rows.map((student, index) => `${index + 1}. ${student.class} - ${student.name}`).join("\n")
      : "Belum ada pembayaran hari ini";
    showListPopup("Pembayaran Hari Ini", `${rows.length} students`, text);
  }

  function showOutstandingList() {
    const currentMonth = allMonths[activeMonthIdx] || currentPeriod;
    const rows = mergedData
      .filter((student) => {
        if (student.ket && /^PEG/i.test(student.ket)) return false;
        const payment = student.payments[currentMonth];
        return !payment || payment.xoutstanding > 0;
      })
      .sort((a, b) => sortClasses(a.class, b.class) || a.name.localeCompare(b.name));
    const text = rows.length ? rows.map((student, index) => `${index + 1}. ${student.class} - ${student.name}`).join("\n") : "Tidak ada tagihan bulan ini";
    showListPopup(`Tagihan US - ${monthLabel(currentMonth).full}`, `${rows.length} students`, text);
  }

  function showListPopup(title, meta, text) {
    $("us-popup-title").textContent = title;
    $("us-popup-meta").textContent = meta;
    $("us-popup-body").innerHTML = `<pre style="white-space:pre-wrap;color:var(--text);font:inherit;line-height:1.7">${escapeHtml(text)}</pre><button class="us-copy" type="button" id="us-copy-list">Copy List</button>`;
    $("us-copy-list").addEventListener("click", () => copyText(text, "List copied."));
    $("us-popup").hidden = false;
  }

  function copyText(text, successMessage) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => showToast(successMessage));
      return;
    }
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    showToast(successMessage);
  }

  function exportReport() {
    if (!window.XLSX) {
      showToast("Excel export library is not loaded.");
      return;
    }
    if (!mergedData.length) {
      showToast("No data to export.");
      return;
    }

    const currentMonth = allMonths[activeMonthIdx] || currentPeriod;
    const monthName = monthLabel(currentMonth).short;
    const rows = [["Class", "Student Name", "NO Induk", monthName, "Months Due", "Denda (IDR)", "Outstanding (IDR)"]];
    
    mergedData
      .sort((a, b) => sortClasses(a.class, b.class) || a.name.localeCompare(b.name))
      .forEach((student) => {
        const payment = student.payments[currentMonth];
        const totalOutstanding = allMonths
          .filter((month) => month <= currentMonth)
          .reduce((total, month) => total + (student.payments[month] ? student.payments[month].xoutstanding : 0), 0);
        
        const monthsDue = allMonths.filter((month) => {
          return month <= currentMonth && student.payments[month] && student.payments[month].xoutstanding > 0;
        }).length;
        
        const overdue = getOverdueCount(student, currentMonth);
        const denda = calcDenda(overdue);
        
        // Build status string with payment details
        let statusText = "";
        if (payment && payment.xoutstanding === 0) {
          // Paid - show payment date and method
          const paymentDate = payment.payment_date ? String(payment.payment_date).slice(0, 16).replace("T", " ") : "";
          const paymentDesc = payment.payment_description || "";
          const parts = [];
          parts.push("Paid");
          if (paymentDate) parts.push(paymentDate);
          if (paymentDesc) parts.push(paymentDesc);
          statusText = parts.join(" | ");
        } else if (payment && payment.xused > 0) {
          statusText = "Partial";
        } else {
          statusText = "Unpaid";
        }
        
        rows.push([
          student.class,
          student.name,
          student.no_induk,
          statusText,
          totalOutstanding > 0 ? monthsDue : null,
          totalOutstanding > 0 ? denda : null,
          totalOutstanding > 0 ? totalOutstanding : null
        ]);
      });

    const workbook = window.XLSX.utils.book_new();
    const sheet = window.XLSX.utils.aoa_to_sheet(rows);
    window.XLSX.utils.book_append_sheet(workbook, sheet, "US Payment");
    window.XLSX.writeFile(workbook, "SPP_Payment_Report.xlsx");
    // Audit: log finance export
    window.auditLog?.("EXPORT", "finance", "SPP_Payment_Report", null, { month: monthName, rows: rows.length - 1 });
    showToast("Exported successfully.");
  }

  function shiftMonth(direction) {
    if (!allMonths.length) return;
    activeMonthIdx = Math.max(0, Math.min(allMonths.length - 1, activeMonthIdx + direction));
    renderTable();
  }

  function goToCurrentMonth() {
    if (!allMonths.length) return;
    const currentIndex = allMonths.indexOf(currentPeriod);
    activeMonthIdx = currentIndex >= 0 ? currentIndex : allMonths.length - 1;
    renderTable();
  }

  function updateMonthLabel() {
    $("us-month-label").textContent = monthLabel(allMonths[activeMonthIdx] || currentPeriod).short;
  }

  function updateEmptyState() {
    const ready = Boolean(studentsData.length && paymentsData.length && mergedData.length);
    // Restore table shell (auth.js hides it initially to prevent blank space before load)
    const shell = document.querySelector(".us-table-shell");
    if (shell) shell.style.display = "";
    // Clear inline style set by auth.js, then use hidden attribute
    const emptyEl = $("us-empty");
    if (emptyEl) {
      emptyEl.style.display = ready ? "none" : "";
      emptyEl.hidden = ready;
    }
    const scrollEl = $("us-table-scroll");
    if (scrollEl) {
      scrollEl.style.display = ready ? "" : "none";
      scrollEl.hidden = !ready;
    }
  }

  function markLoaded(type, filename, info) {
    const card = $(`us-card-${type}`);
    const label = $(`us-${type}-filename`);
    if (!card || card.style.display === "none") return;
    card.classList.add("loaded");
    if (label) label.textContent = `${filename} - ${info}`;
  }

  function normalizeTimestamp(value) {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  function extractLatestTimestamp(rows) {
    return rows.reduce((latest, row) => {
      const candidate = normalizeTimestamp(row?.created_at);
      if (!candidate) return latest;
      if (!latest || candidate > latest) return candidate;
      return latest;
    }, null);
  }

  function formatTimestamp(value) {
    const normalized = normalizeTimestamp(value);
    if (!normalized) return "-";
    return new Date(normalized).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function setSourceTimestamp(type, timestamp) {
    sourceTimestamps[type] = normalizeTimestamp(timestamp);
    updateTimestampUi();
  }

  function getLatestSourceTimestamp() {
    const values = Object.values(sourceTimestamps).filter(Boolean).sort();
    return values.length ? values[values.length - 1] : null;
  }

  function updateTimestampUi() {
    const header = $("us-last-updated");
    const studentsEl = $("us-students-uploaded");
    const paymentsEl = $("us-payments-uploaded");
    const latest = getLatestSourceTimestamp();

    if (header) header.textContent = `Updated: ${formatTimestamp(latest)}`;
    if (studentsEl) studentsEl.textContent = `Students uploaded: ${formatTimestamp(sourceTimestamps.students)}`;
    if (paymentsEl) paymentsEl.textContent = `Payments uploaded: ${formatTimestamp(sourceTimestamps.payments)}`;
  }

  function groupByClass(rows) {
    return rows.reduce((groups, student) => {
      const className = student.class || "No Class";
      if (!groups[className]) groups[className] = [];
      groups[className].push(student);
      return groups;
    }, {});
  }

  function normalizeClass(value) {
    return String(value || "")
      .trim()
      .replace(/\s+/g, "-")
      .toUpperCase();
  }

  function sortClasses(a = "", b = "") {
    const gradeOrder = { X: 0, XI: 1, XII: 2 };
    const [gradeA, roomA = ""] = String(a).split("-");
    const [gradeB, roomB = ""] = String(b).split("-");
    const gradeCompare = (gradeOrder[gradeA] ?? 9) - (gradeOrder[gradeB] ?? 9);
    return gradeCompare || roomA.localeCompare(roomB, undefined, { numeric: true }) || String(a).localeCompare(String(b));
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, "&#096;");
  }

  function updateLastUpdated(timestamp) {
    setSourceTimestamp("payments", timestamp);
  }

  function showToast(message) {
    const toast = $("us-toast");
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 3600);
  }

  return { init, loadFromSupabase };
})();

// Expose globally so auth.js can call window.usPayment.loadFromSupabase()
window.usPayment = usPayment;
window.addEventListener("load", usPayment.init);
