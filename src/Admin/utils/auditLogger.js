/**
 * 🕵️‍♂️ Admin Activity Logger (Phase 4)
 * High-performance, resilient logging with automatic cleanup.
 */

const LOG_KEY = 'fenrir_admin_audit_logs';
const MAX_LOGS = 1000;

export const logActivity = (action, details, type = 'INFO') => {
  try {
    const logs = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
    
    const newLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      user: 'Jayesh (Admin)', // Hardcoded for now, real implementation would use auth context
      action,
      details,
      type, // INFO, WARNING, CRITICAL, SUCCESS
    };

    // Add to top of stack
    const updatedLogs = [newLog, ...logs].slice(0, MAX_LOGS);
    localStorage.setItem(LOG_KEY, JSON.stringify(updatedLogs));
    
    console.log(`[AUDIT] ${action}:`, details);
    return newLog;
  } catch (error) {
    console.error('Failed to log admin activity:', error);
  }
};

export const getAuditLogs = () => {
  try {
    return JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
  } catch (error) {
    return [];
  }
};

export const clearAuditLogs = () => {
  localStorage.removeItem(LOG_KEY);
};
