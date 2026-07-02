// audit-logger.js - Security audit logging
// ⚠️ CRITICAL: Records all sensitive operations

class AuditLogger {
  constructor(supabaseClient) {
    this.sb = supabaseClient;
  }

  async log(action, module, details = {}, severity = 'info') {
    if (!this.sb) return;

    try {
      const { data: { user } } = await this.sb.auth.getUser();
      const timestamp = new Date().toISOString();

      // Log to Supabase
      const { error } = await this.sb.from('audit_logs').insert({
        user_id: user?.id || 'unknown',
        user_email: user?.email || null,
        action,
        module,
        record_id: null,
        old_data: null,
        new_data: {
          ...details,
          severity,
          user_agent: navigator.userAgent,
          origin: window.location.origin
        },
        created_at: timestamp
      });

      if (error) {
        console.error('❌ Audit log insert error:', error);
      } else {
        console.log(`✓ Audit: ${action} (${module})`);
      }
    } catch (err) {
      console.error('Audit logger error:', err);
    }
  }

  // Sensitive actions - always log
  async logSensitiveAction(action, module, details) {
    await this.log(action, module, details, 'warning');
  }

  // High-priority security events
  async logSecurityEvent(action, module, details) {
    await this.log(action, module, details, 'critical');
    console.warn('🚨 SECURITY EVENT:', action, details);
  }

  async logLogin(email, role, ipAddress = '') {
    await this.logSecurityEvent('LOGIN', 'auth', {
      email,
      role,
      ip_address: ipAddress,
      timestamp: new Date().toISOString()
    });
  }

  async logLogout(reason = '') {
    await this.logSecurityEvent('LOGOUT', 'auth', { reason });
  }

  async logUserCreated(creatorId, newUserId, role) {
    await this.logSensitiveAction('USER_CREATED', 'users', {
      created_by: creatorId,
      new_user_id: newUserId,
      role
    });
  }

  async logUserDeleted(userId, email) {
    await this.logSecurityEvent('USER_DELETED', 'users', {
      deleted_user_id: userId,
      email
    });
  }

  async logRoleChanged(targetUserId, oldRole, newRole) {
    await this.logSecurityEvent('ROLE_CHANGED', 'users', {
      target_user_id: targetUserId,
      old_role: oldRole,
      new_role: newRole
    });
  }

  async logDataExported(module, recordCount, filters = {}) {
    await this.logSensitiveAction('DATA_EXPORTED', module, {
      record_count: recordCount,
      filters
    });
  }

  async logUnauthorizedAccess(targetModule, deniedRole) {
    await this.logSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPTED', targetModule, {
      denied_role: deniedRole
    });
  }
}

// Export for use in modules
window.AuditLogger = AuditLogger;
