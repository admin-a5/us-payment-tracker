// session-manager.js - Session timeout & re-validation
// Handles security-critical session management

class SessionManager {
  constructor(authModule, timeoutMinutes = 15) {
    this.auth = authModule;
    this.timeoutMs = timeoutMinutes * 60 * 1000;
    this.lastActivityTime = Date.now();
    this.timeoutId = null;
    this.revalidateIntervalId = null;
    this._listeners = [];
    
    this.initializeListeners();
    this.startRevalidation();
  }

  initializeListeners() {
    ['click', 'keypress', 'mousemove', 'touchstart'].forEach(event => {
      const handler = () => this.resetTimeout();
      document.addEventListener(event, handler, { passive: true });
      this._listeners.push({ event, handler });
    });
  }

  resetTimeout() {
    if (Date.now() - this.lastActivityTime < 5000) return;
    
    this.lastActivityTime = Date.now();
    clearTimeout(this.timeoutId);

    this.timeoutId = setTimeout(async () => {
      console.warn('Session timeout triggered');
      await this.logout('Session expired due to inactivity');
    }, this.timeoutMs);
  }

  startRevalidation() {
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
    
    alert(`Logged out: ${reason}`);
    window.location.reload();
  }

  destroy() {
    clearTimeout(this.timeoutId);
    clearInterval(this.revalidateIntervalId);
    this._listeners.forEach(({ event, handler }) => {
      document.removeEventListener(event, handler);
    });
    this._listeners = [];
  }
}

window.SessionManager = SessionManager;
