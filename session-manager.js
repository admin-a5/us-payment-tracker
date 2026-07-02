// session-manager.js - Session timeout & re-validation
// ⚠️ CRITICAL: Handles security-critical session management

class SessionManager {
  constructor(authModule, timeoutMinutes = 15) {
    this.auth = authModule;
    this.timeoutMs = timeoutMinutes * 60 * 1000;
    this.lastActivityTime = Date.now();
    this.timeoutId = null;
    this.revalidateIntervalId = null;
    
    this.initializeListeners();
    this.startRevalidation();
  }

  initializeListeners() {
    // Reset timeout on user activity
    ['click', 'keypress', 'mousemove', 'touchstart'].forEach(event => {
      document.addEventListener(event, () => this.resetTimeout(), { passive: true });
    });
  }

  resetTimeout() {
    if (Date.now() - this.lastActivityTime < 5000) return; // Debounce
    
    this.lastActivityTime = Date.now();
    clearTimeout(this.timeoutId);

    this.timeoutId = setTimeout(async () => {
      console.warn('Session timeout triggered');
      await this.logout('Session expired due to inactivity');
    }, this.timeoutMs);
  }

  startRevalidation() {
    // Re-validate role every 5 minutes (independent of activity)
    this.revalidateIntervalId = setInterval(async () => {
      try {
        const isValid = await this.auth.validateSession();
        if (!isValid) {
          await this.logout('Session invalidated by server');
        }
      } catch (err) {
        console.error('Session revalidation error:', err);
      }
    }, 5 * 60 * 1000);
  }

  async logout(reason = 'Manual logout') {
    clearTimeout(this.timeoutId);
    clearInterval(this.revalidateIntervalId);
    
    try {
      const sb = window.authModule?.getSupabaseClient?.();
      if (sb) {
        await sb.auth.signOut();
      }
    } catch (err) {
      console.error('Logout error:', err);
    }

    window.schoolAuth = {
      sb: null,
      role: null,
      assignedClass: null,
      userId: null,
      userEmail: null
    };
    
    // Redirect to login
    alert(`Logged out: ${reason}`);
    window.location.reload();
  }

  destroy() {
    clearTimeout(this.timeoutId);
    clearInterval(this.revalidateIntervalId);
  }
}

// Export for use in auth.js
window.SessionManager = SessionManager;
