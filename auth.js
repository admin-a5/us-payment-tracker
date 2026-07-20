window.authModule = (() => {
  const runtimeConfig = window.__CONFIG__ || {};
  const SUPABASE_URL = runtimeConfig.SUPABASE_URL || "";
  const SUPABASE_ANON = runtimeConfig.SUPABASE_ANON_KEY || "";

  if (!SUPABASE_URL || !SUPABASE_ANON) {
    console.error("CRITICAL: Credentials not found. Add them to config.js.");
  }

  const ROLE_NAV = {
    super_admin: ["dashboard", "students", "finance", "staff", "inventory", "letters", "users", "audit", "diagnostics"],
    admin: ["dashboard", "students", "finance", "audit", "diagnostics"],
    sarpras: ["dashboard", "students", "inventory", "audit", "diagnostics"],
    kurikulum: ["dashboard", "students", "audit", "diagnostics"],
    wali_kelas: ["dashboard", "students", "finance", "audit", "diagnostics"],
    client: ["client"],
    tu: ["dashboard", "students", "letters", "audit"],
    user: ["dashboard", "staff", "audit"]
  };

  const ROLE_LABELS = {
    super_admin: "Super Admin",
    admin: "US/PSB",
    sarpras: "Sarpras",
    kurikulum: "Kurikulum",
    wali_kelas: "Wali Kelas",
    client: "Client",
    tu: "TU Staff",
    user: "User"
  };

  const FINANCE_ROLES = ["super_admin", "admin", "wali_kelas"];
  const STUDENT_ROLES = ["super_admin", "admin", "sarpras", "kurikulum", "wali_kelas", "tu"];
  const ATTENDANCE_ROLES = ["super_admin", "user"];

  let sb = null;
  let currentUser = null;
  let currentRole = null;
  let currentClass = null;
  let sessionManager = null;
  const $ = (id) => document.getElementById(id);

  function syncGlobalAuthState() {
    const user = currentUser ? { id: currentUser.id, email: currentUser.email } : null;
    window._sb = sb;
    window.schoolAuth = {
      sb,
      role: currentRole,
      assignedClass: currentClass,
      userId: user?.id || null,
      userEmail: user?.email || null
    };
  }

  function clearGlobalAuthState() {
    window.schoolAuth = {
      sb: null,
      role: null,
      assignedClass: null,
      userId: null,
      userEmail: null
    };
  }

  function getAvatarInitials(fullName, email) {
    const words = String(fullName || "").trim().split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
    }
    if (words.length === 1 && words[0].length >= 2) {
      return words[0].slice(0, 2).toUpperCase();
    }
    const userPart = String(email || "").split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
    if (userPart.length >= 2) return userPart.slice(0, 2).toUpperCase();
    if (userPart.length === 1) return `${userPart}${userPart}`.toUpperCase();
    return "??";
  }

  async function init() {
    if (!window.supabase) {
      console.error("Supabase library not loaded.");
      return;
    }
    if (!SUPABASE_URL || !SUPABASE_ANON) return;

    sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
    syncGlobalAuthState();

    $("app-shell").style.display = "none";
    $("login-screen").hidden = false;

    $("login-btn").addEventListener("click", doLogin);
    $("login-password").addEventListener("keydown", (event) => {
      if (event.key === "Enter") doLogin();
    });
    $("logout-btn").addEventListener("click", doLogout);

    const { data: { session } } = await sb.auth.getSession();
    if (session) {
      await onLoggedIn(session.user);
    }
  }

  async function doLogin() {
    const email = $("login-email").value.trim();
    const password = $("login-password").value;
    const errEl = $("login-error");
    const btn = $("login-btn");
    errEl.textContent = "";

    if (!email || !password) {
      errEl.textContent = "Please enter email and password.";
      return;
    }

    btn.disabled = true;
    btn.textContent = "Signing in...";

    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      errEl.textContent = error.message;
      btn.disabled = false;
      btn.textContent = "Sign In";
      return;
    }

    await onLoggedIn(data.user);
    btn.disabled = false;
    btn.textContent = "Sign In";
  }

  async function onLoggedIn(user) {
    currentUser = user;

    const { data: roleData, error } = await sb.rpc("get_my_role").single();
    if (error || !roleData?.role) {
      await sb.auth.signOut();
      currentUser = null;
      clearGlobalAuthState();
      $("login-screen").hidden = false;
      $("login-error").textContent = "Access denied. Contact your administrator.";
      return;
    }

    currentRole = roleData.role;
    currentClass = roleData.assigned_class || null;
    syncGlobalAuthState();

    $("login-screen").hidden = true;
    $("app-shell").style.display = "";
    $("app-shell").removeAttribute("hidden");

    window.auditLog?.("LOGIN", "auth", null, null, { email: user.email, role: currentRole });

    const displayName = roleData.full_name || user.email.split("@")[0];
    $("profile-name").textContent = displayName;
    $("profile-email").textContent = user.email;
    $("profile-role-badge").textContent = ROLE_LABELS[currentRole] || currentRole;
    $("profile-avatar").textContent = getAvatarInitials(displayName, user.email);
    if (typeof APP_VERSION !== "undefined") $("sidebar-version").textContent = APP_VERSION;

    if (window.SessionManager) {
      sessionManager = new window.SessionManager(window.authModule, 15);
    }

    applyNavAccess();
    hideFinanceShellUntilLoaded();

    const allowed = ROLE_NAV[currentRole] || ["dashboard"];
    navigateTo(allowed[0]);

    if (FINANCE_ROLES.includes(currentRole)) {
      await autoLoadFinanceDB();
    }
    if (ATTENDANCE_ROLES.includes(currentRole)) {
      autoLoadAttendanceDB();
    }
    if (STUDENT_ROLES.includes(currentRole)) {
      autoLoadStudentsDB();
    }

    setTimeout(() => { if (typeof renderDashboard === "function") renderDashboard(); }, 100);

    /* Re-run page enhancements now that role is known (avoids dummy data flash) */
    if (typeof enhanceLettersPage === "function") enhanceLettersPage();
    if (typeof enhanceInventoryPage === "function" && !document.querySelector("#inventory .module-page .module-subnav")) {
      enhanceInventoryPage();
    }
  }

  function hideFinanceShellUntilLoaded() {
    const usEmpty = $("us-empty");
    const usTableShell = document.querySelector(".us-table-shell");
    const usTableScroll = $("us-table-scroll");
    if (usEmpty) {
      usEmpty.style.display = "none";
      usEmpty.hidden = true;
    }
    if (usTableShell) usTableShell.style.display = "none";
    if (usTableScroll) {
      usTableScroll.style.display = "none";
      usTableScroll.hidden = true;
    }
  }

  async function autoLoadStudentsDB() {
    await new Promise((resolve) => setTimeout(resolve, 600));
    if (window.studentsModule?.loadFromSupabase) {
      window.studentsModule.loadFromSupabase(true);
    }
  }

  function applyNavAccess() {
    const allowed = ROLE_NAV[currentRole] || [];
    document.querySelectorAll(".nav-item").forEach((btn) => {
      const page = btn.dataset.page;
      btn.style.display = allowed.includes(page) ? "" : "none";
    });
  }

  function navigateTo(pageId) {
    document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".page").forEach((page) => page.classList.remove("active"));

    const pageEl = document.querySelector(`#${pageId}`);
    const navEl = document.querySelector(`.nav-item[data-page="${pageId}"]`);
    if (pageEl) pageEl.classList.add("active");
    if (navEl) navEl.classList.add("active");
  }

  async function autoLoadFinanceDB() {
    await new Promise((resolve) => setTimeout(resolve, 200));
    if (window.usPayment?.loadFromSupabase) {
      window.usPayment.loadFromSupabase();
    } else {
      const loadBtn = $("us-load-db");
      if (loadBtn) loadBtn.click();
    }
  }

  async function autoLoadAttendanceDB() {
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (window.attendanceModule?.loadFromSupabase) {
      window.attendanceModule.loadFromSupabase();
    }
  }

  async function doLogout() {
    window.auditLog?.("LOGOUT", "auth");

    if (sessionManager) {
      sessionManager.destroy();
      sessionManager = null;
    }

    await sb.auth.signOut();
    currentUser = null;
    currentRole = null;
    currentClass = null;
    clearGlobalAuthState();

    $("app-shell").style.display = "none";
    $("login-screen").hidden = false;
    $("login-email").value = "";
    $("login-password").value = "";
    $("login-error").textContent = "";
  }

  function getRole() {
    return currentRole;
  }

  function getClass() {
    return currentClass;
  }

  function getAssignedClass() {
    return currentClass;
  }

  function getSupabaseClient() {
    return sb;
  }

  function getUser() {
    return currentUser ? { id: currentUser.id, email: currentUser.email } : null;
  }

  async function validateSession() {
    if (!sb) return false;
    try {
      const { data: { session } } = await sb.auth.getSession();
      if (!session) return false;
    } catch { return false; }
    /* Re-fetch role to detect demotions / access revocation */
    try {
      const { data: roleData, error } = await sb.rpc("get_my_role").single();
      if (error || !roleData?.role) {
        /* Transient RPC failure — don't log out, retry next interval */
        return true;
      }
      if (roleData.role !== currentRole) return false;
    } catch (e) {
      return true;
    }
    return true;
  }

  clearGlobalAuthState();

  return {
    init,
    getRole,
    getClass,
    getAssignedClass,
    getSupabaseClient,
    getUser,
    validateSession
  };
})();

window.addEventListener("load", () => window.authModule.init());
