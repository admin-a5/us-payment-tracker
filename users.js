window.userManagementModule = (() => {
  let sb = null;
  let currentUserId = "";
  let passwordTarget = "";

  const $ = (id) => document.getElementById(id);

  function getSupabaseClient() {
    return window.authModule?.getSupabaseClient?.() || window.schoolAuth?.sb || window._sb || null;
  }

  function getEdgeFnUrl() {
    const baseUrl = window.__CONFIG__?.SUPABASE_URL || "";
    return baseUrl ? `${baseUrl}/functions/v1/manage-users` : "";
  }

  function mount() {
    const section = $("users");
    if (!section || section.querySelector(".users-page")) return;
    section.innerHTML = `
      <div class="users-page">
        <div class="page-heading module-heading">
          <div>
            <p class="eyebrow">Administration</p>
            <h1>Users</h1>
            <span>Add, remove, and manage user access levels.</span>
          </div>
          <div class="module-actions">
            <button class="primary-button secondary" type="button" id="users-refresh">Refresh</button>
          </div>
        </div>

        <div class="users-stat-grid">
          <article><span>Total Users</span><strong id="users-total">0</strong></article>
          <article><span>Super Admin</span><strong id="users-super">0</strong></article>
          <article><span>Admin</span><strong id="users-admin">0</strong></article>
          <article><span>Class Viewer</span><strong id="users-viewer">0</strong></article>
        </div>

        <div class="users-layout">
          <section class="users-card">
            <div class="users-card-header">
              <div>
                <h2>Add New User</h2>
                <span>Create a login account for a staff member.</span>
              </div>
            </div>
            <div class="users-form">
              <label>Full Name <input id="users-name" type="text" placeholder="e.g. John Doe" /></label>
              <label>Email <input id="users-email" type="email" placeholder="user@email.com" /></label>
              <label>Password <input id="users-password" type="password" placeholder="Min. 6 characters" /></label>
              <label>Role
                <select id="users-role">
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="wali_kelas">Wali Kelas</option>
                  <option value="sarpras">Sarpras</option>
                  <option value="kurikulum">Kurikulum</option>
                  <option value="user">User</option>
                </select>
              </label>
              <label id="users-class-field" hidden>Assigned Class
                <select id="users-class"><option value="">Select class</option></select>
              </label>
              <button class="primary-button" type="button" id="users-add">Add User</button>
              <div class="users-error" id="users-error"></div>
            </div>
          </section>

          <section class="users-card">
            <div class="users-card-header">
              <div>
                <h2>All Users</h2>
                <span>Manage existing accounts.</span>
              </div>
              <span class="module-count" id="users-count">0 users</span>
            </div>
            <div class="users-table-scroll">
              <table class="users-table">
                <thead>
                  <tr><th>Name / Email</th><th>Role</th><th>Class</th><th>Created</th><th>Actions</th></tr>
                </thead>
                <tbody id="users-list">
                  <tr><td colspan="5" class="users-empty">Loading users...</td></tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div class="users-modal" id="users-password-modal" hidden>
          <div class="users-modal-card">
            <button class="users-modal-close" type="button" id="users-password-close" aria-label="Close">x</button>
            <h2>Change Password</h2>
            <p id="users-password-email"></p>
            <label>New password <input id="users-new-password" type="password" placeholder="Min. 6 characters" /></label>
            <div class="users-error" id="users-password-error"></div>
            <button class="primary-button" type="button" id="users-password-submit">Update Password</button>
          </div>
        </div>
        <div class="users-toast" id="users-toast"></div>
      </div>
    `;

    sb = getSupabaseClient();
    bind();
    onRoleChange();
    loadClasses();
    loadCurrentUser();
    loadUsers();
  }

  function bind() {
    $("users-refresh").addEventListener("click", loadUsers);
    $("users-role").addEventListener("change", onRoleChange);
    $("users-add").addEventListener("click", addUser);
    $("users-password-close").addEventListener("click", closePasswordModal);
    $("users-password-modal").addEventListener("click", (event) => {
      if (event.target === $("users-password-modal")) closePasswordModal();
    });
    $("users-password-submit").addEventListener("click", submitChangePassword);
  }

  async function loadCurrentUser() {
    sb = getSupabaseClient();
    if (!sb) return;
    const { data } = await sb.auth.getSession();
    currentUserId = data?.session?.user?.id || "";
  }

  function onRoleChange() {
    const role = $("users-role").value;
    const show = role === "user" || role === "wali_kelas";
    $("users-class-field").style.display = show ? "" : "none";
  }

  async function loadClasses() {
    sb = getSupabaseClient();
    if (!sb) return;
    try {
      const { data } = await sb.from("students").select("class").not("class", "is", null);
      const classes = [...new Set((data || []).map((row) => row.class).filter(Boolean))].sort();
      $("users-class").innerHTML = '<option value="">Select class</option>';
      classes.forEach((className) => {
        const option = document.createElement("option");
        option.value = className;
        option.textContent = className;
        $("users-class").appendChild(option);
      });
    } catch {
      // Class assignment can still be filled later if student access is blocked by RLS.
    }
  }

  async function loadUsers() {
    sb = getSupabaseClient();
    if (!sb) {
      renderError("Supabase library is not loaded.");
      return;
    }
    $("users-list").innerHTML = '<tr><td colspan="5" class="users-empty">Loading users...</td></tr>';
    const { data, error } = await sb.from("user_roles").select("*").order("created_at");
    if (error) {
      renderError(error.message);
      return;
    }
    renderUsers(data || []);
  }

  function renderUsers(users) {
    $("users-count").textContent = `${users.length} users`;
    $("users-total").textContent = users.length;
    $("users-super").textContent = users.filter((user) => user.role === "super_admin").length;
    $("users-admin").textContent = users.filter((user) => user.role === "admin").length;
    $("users-viewer").textContent = users.filter((user) => user.role === "user").length;

    if (!users.length) {
      $("users-list").innerHTML = '<tr><td colspan="5" class="users-empty">No users yet.</td></tr>';
      return;
    }

    $("users-list").innerHTML = users
      .map((user) => {
        const isSelf = user.id === currentUserId;
        return `
          <tr>
            <td><strong>${escapeHtml(user.full_name || "-")}</strong><small>${escapeHtml(user.email || "-")}</small></td>
            <td>${rolePill(user.role)}</td>
            <td>${escapeHtml(user.assigned_class || "-")}</td>
            <td>${formatDate(user.created_at)}</td>
            <td>
              <div class="users-actions">
                <button type="button" data-pwd="${escapeAttr(user.id)}" data-email="${escapeAttr(user.email || "")}" ${isSelf ? "disabled" : ""}>Password</button>
                <button class="danger" type="button" data-delete="${escapeAttr(user.id)}" data-email="${escapeAttr(user.email || "")}" ${isSelf ? "disabled" : ""}>Remove</button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");

    document.querySelectorAll("[data-pwd]").forEach((button) => {
      button.addEventListener("click", () => openPasswordModal(button.dataset.pwd, button.dataset.email));
    });
    document.querySelectorAll("[data-delete]").forEach((button) => {
      button.addEventListener("click", () => deleteUser(button.dataset.delete, button.dataset.email));
    });
  }

  async function addUser() {
    const name = $("users-name").value.trim();
    const email = $("users-email").value.trim();
    const password = $("users-password").value;
    const role = $("users-role").value;
    const assignedClass = $("users-class").value;
    $("users-error").textContent = "";

    if (!name || !email || !password) {
      $("users-error").textContent = "Please fill in all required fields.";
      return;
    }
    if (password.length < 6) {
      $("users-error").textContent = "Password must be at least 6 characters.";
      return;
    }
    if ((role === "user" || role === "wali_kelas") && !assignedClass) {
      $("users-error").textContent = "Please select a class for this user.";
      return;
    }

    try {
      const session = await requireSession();
      $("users-add").disabled = true;
      $("users-add").textContent = "Creating...";
      const result = await callEdge(session.access_token, {
        action: "create",
        email,
        password,
        full_name: name,
        role,
        assigned_class: (role === "user" || role === "wali_kelas") ? assignedClass : null
      });
      if (!result.ok) throw new Error(result.body.error || "Failed to create user");
      $("users-name").value = "";
      $("users-email").value = "";
      $("users-password").value = "";
      // Audit: log new user creation
      window.auditLog?.("INSERT", "users", email, null, { email, role, assigned_class: role === "user" ? assignedClass : null });
      toast(`User ${email} created.`);
      loadUsers();
    } catch (error) {
      $("users-error").textContent = error.message;
    } finally {
      $("users-add").disabled = false;
      $("users-add").textContent = "Add User";
    }
  }

  async function deleteUser(uid, email) {
    if (!window.confirm(`Remove access for ${email}? This cannot be undone.`)) return;
    try {
      const session = await requireSession();
      const result = await callEdge(session.access_token, { action: "delete", uid });
      if (!result.ok) throw new Error(result.body.error || "Failed to delete user");
      // Audit: log user deletion
      window.auditLog?.("DELETE", "users", uid, { email }, null);
      toast("User removed.");
      loadUsers();
    } catch (error) {
      toast(error.message);
    }
  }

  function openPasswordModal(uid, email) {
    passwordTarget = uid;
    $("users-password-email").textContent = email;
    $("users-new-password").value = "";
    $("users-password-error").textContent = "";
    $("users-password-modal").hidden = false;
  }

  function closePasswordModal() {
    $("users-password-modal").hidden = true;
  }

  async function submitChangePassword() {
    const password = $("users-new-password").value;
    $("users-password-error").textContent = "";
    if (!password || password.length < 6) {
      $("users-password-error").textContent = "Password must be at least 6 characters.";
      return;
    }
    try {
      const session = await requireSession();
      const result = await callEdge(session.access_token, { action: "change_password", uid: passwordTarget, password });
      if (!result.ok) throw new Error(result.body.error || "Failed to change password");
      // Audit: log password change
      window.auditLog?.("UPDATE", "users", passwordTarget, null, { action: "password_changed" });
      closePasswordModal();
      toast("Password updated.");
    } catch (error) {
      $("users-password-error").textContent = error.message;
    }
  }

  async function requireSession() {
    sb = getSupabaseClient();
    if (!sb) throw new Error("Supabase library is not loaded.");
    const { data } = await sb.auth.getSession();
    const session = data?.session;
    if (!session) throw new Error("Please sign in with Supabase before managing users.");
    return session;
  }

  async function callEdge(token, payload) {
    const edgeFnUrl = getEdgeFnUrl();
    if (!edgeFnUrl) throw new Error("Supabase function URL is not configured.");
    const response = await fetch(edgeFnUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    let body = {};
    try {
      body = await response.json();
    } catch {
      body = {};
    }
    return { ok: response.ok, body };
  }

  function renderError(message) {
    $("users-list").innerHTML = `<tr><td colspan="5" class="users-empty">Error: ${escapeHtml(message)}</td></tr>`;
  }

  function rolePill(role) {
    const label = { super_admin: "Super Admin", admin: "Admin", user: "User" }[role] || role || "-";
    const cls = role === "super_admin" ? "super" : role === "admin" ? "admin" : "viewer";
    return `<span class="users-role ${cls}">${escapeHtml(label)}</span>`;
  }

  function formatDate(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  }

  function toast(message) {
    const toastEl = $("users-toast");
    toastEl.textContent = message;
    toastEl.classList.add("show");
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(() => toastEl.classList.remove("show"), 3200);
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, "&#096;");
  }

  return { mount, loadUsers };
})();

window.addEventListener("load", () => window.userManagementModule.mount());
