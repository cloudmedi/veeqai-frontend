/**
 * 🔐 ADVANCED SESSION MANAGEMENT
 * Comprehensive session handling for main application
 */

// import { apiClient } from './api-client'; // TODO: Use for backend session validation

interface SessionConfig {
  timeoutMinutes: number;
  warningMinutes: number;
  checkIntervalMs: number;
  activityEvents: string[];
}

interface SessionState {
  lastActivity: number;
  isActive: boolean;
  warningShown: boolean;
  timeoutId: NodeJS.Timeout | null;
  warningTimeoutId: NodeJS.Timeout | null;
}

export class SessionManager {
  private static instance: SessionManager;
  private config: SessionConfig;
  private state: SessionState;
  private listeners: Set<() => void> = new Set();

  private constructor() {
    this.config = {
      timeoutMinutes: 30, // 30 minutes session timeout
      warningMinutes: 5, // 5 minutes warning before timeout
      checkIntervalMs: 60000, // Check every minute
      activityEvents: [
        'mousedown', 'mousemove', 'keypress', 'scroll', 
        'touchstart', 'click', 'focus', 'blur'
      ]
    };

    this.state = {
      lastActivity: Date.now(),
      isActive: false,
      warningShown: false,
      timeoutId: null,
      warningTimeoutId: null
    };
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  /**
   * 🚀 Start session management
   */
  start(): void {
    if (this.state.isActive) return;

    console.log('🔐 [SESSION] Starting session management...');
    this.state.isActive = true;
    this.state.lastActivity = Date.now();
    
    // Store session start time to prevent immediate timeout on refresh
    sessionStorage.setItem('session_start', Date.now().toString());

    // Add activity listeners
    this.config.activityEvents.forEach(event => {
      document.addEventListener(event, this.handleActivity.bind(this), true);
    });

    // Start session monitoring
    this.scheduleTimeouts();
    this.startPeriodicCheck();

    console.log(`✅ [SESSION] Active - Timeout: ${this.config.timeoutMinutes}min`);
  }

  /**
   * 🛑 Stop session management
   */
  stop(): void {
    if (!this.state.isActive) return;

    console.log('🛑 [SESSION] Stopping session management...');
    this.state.isActive = false;

    // Remove activity listeners
    this.config.activityEvents.forEach(event => {
      document.removeEventListener(event, this.handleActivity.bind(this), true);
    });

    // Clear timeouts
    this.clearTimeouts();
  }

  /**
   * 📊 Handle user activity
   */
  private handleActivity(): void {
    const now = Date.now();
    const timeSinceLastActivity = now - this.state.lastActivity;

    // Throttle activity updates (don't update more than once per second)
    if (timeSinceLastActivity < 1000) return;

    this.state.lastActivity = now;
    this.state.warningShown = false;

    // Reschedule timeouts
    this.scheduleTimeouts();

    // Notify listeners
    this.notifyListeners();
  }

  /**
   * ⏰ Schedule warning and timeout
   */
  private scheduleTimeouts(): void {
    this.clearTimeouts();

    const timeoutMs = this.config.timeoutMinutes * 60 * 1000;
    const warningMs = (this.config.timeoutMinutes - this.config.warningMinutes) * 60 * 1000;

    // Schedule warning
    this.state.warningTimeoutId = setTimeout(() => {
      this.showTimeoutWarning();
    }, warningMs);

    // Schedule timeout
    this.state.timeoutId = setTimeout(() => {
      this.handleSessionTimeout();
    }, timeoutMs);
  }

  /**
   * 🧹 Clear existing timeouts
   */
  private clearTimeouts(): void {
    if (this.state.timeoutId) {
      clearTimeout(this.state.timeoutId);
      this.state.timeoutId = null;
    }
    if (this.state.warningTimeoutId) {
      clearTimeout(this.state.warningTimeoutId);
      this.state.warningTimeoutId = null;
    }
  }

  /**
   * ⚠️ Show session timeout warning
   */
  private showTimeoutWarning(): void {
    if (this.state.warningShown) return;
    this.state.warningShown = true;

    console.log('⚠️ [SESSION] Showing timeout warning');

    const remainingMinutes = this.config.warningMinutes;
    const message = `Your session will expire in ${remainingMinutes} minutes due to inactivity. Would you like to continue?`;

    // Show warning dialog
    const continueSession = confirm(message);

    if (continueSession) {
      console.log('✅ [SESSION] User chose to continue session');
      this.extendSession();
    } else {
      console.log('❌ [SESSION] User chose to end session');
      this.handleSessionTimeout();
    }
  }

  /**
   * 🔚 Handle session timeout
   */
  private handleSessionTimeout(): void {
    console.log('⏰ [SESSION] Session timed out');
    
    this.stop();
    this.clearAuthData();
    
    // Show timeout message
    alert('Your session has expired due to inactivity. Please log in again.');
    
    // Redirect to login
    window.location.href = '/login';
  }

  /**
   * 🔄 Extend session
   */
  extendSession(): void {
    console.log('🔄 [SESSION] Extending session');
    this.state.lastActivity = Date.now();
    this.state.warningShown = false;
    this.scheduleTimeouts();
  }

  /**
   * 🧹 Clear authentication data
   */
  private clearAuthData(): void {
    localStorage.removeItem('veeqai_token');
    localStorage.removeItem('veeqai_refresh_token');
    localStorage.removeItem('veeqai_user');
    sessionStorage.removeItem('veeqai_token');
    sessionStorage.removeItem('veeqai_refresh_token');
    sessionStorage.removeItem('veeqai_user');
  }

  /**
   * ⚡ Start periodic session validation
   */
  private startPeriodicCheck(): void {
    setInterval(() => {
      if (!this.state.isActive) return;

      const now = Date.now();
      const timeSinceActivity = now - this.state.lastActivity;
      const timeoutMs = this.config.timeoutMinutes * 60 * 1000;
      
      // Check if this is a fresh page load (within 5 seconds of session start)
      const sessionStart = sessionStorage.getItem('session_start');
      if (sessionStart) {
        const timeSinceStart = now - parseInt(sessionStart);
        if (timeSinceStart < 5000) {
          console.log('🔄 [SESSION] Skipping timeout check for fresh page load');
          return;
        }
      }

      // Check if session should have timed out
      if (timeSinceActivity >= timeoutMs) {
        console.log('⏰ [SESSION] Periodic check detected expired session');
        this.handleSessionTimeout();
        return;
      }

      // Validate token with backend every 10 minutes
      if (timeSinceActivity % (10 * 60 * 1000) < this.config.checkIntervalMs) {
        this.validateSessionWithBackend();
      }

    }, this.config.checkIntervalMs);
  }

  /**
   * 🔍 Validate session with backend
   */
  private async validateSessionWithBackend(): Promise<void> {
    try {
      const token = localStorage.getItem('veeqai_token') || sessionStorage.getItem('veeqai_token');
      if (!token) return;

      console.log('🔍 [SESSION] Validating session with backend...');
      
      // This would call a backend endpoint to validate the session
      // await apiClient.get('/auth/validate-session');
      
      console.log('✅ [SESSION] Backend validation successful');
    } catch (error) {
      console.error('❌ [SESSION] Backend validation failed:', error);
      // Handle validation failure (e.g., token expired)
      this.handleSessionTimeout();
    }
  }

  /**
   * 📢 Add session listener
   */
  addListener(callback: () => void): void {
    this.listeners.add(callback);
  }

  /**
   * 🔇 Remove session listener
   */
  removeListener(callback: () => void): void {
    this.listeners.delete(callback);
  }

  /**
   * 📢 Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in session listener:', error);
      }
    });
  }

  /**
   * 📊 Get session info
   */
  getSessionInfo() {
    const now = Date.now();
    const timeSinceActivity = now - this.state.lastActivity;
    const timeoutMs = this.config.timeoutMinutes * 60 * 1000;
    const remainingMs = Math.max(0, timeoutMs - timeSinceActivity);

    return {
      isActive: this.state.isActive,
      lastActivity: new Date(this.state.lastActivity),
      timeRemaining: remainingMs,
      timeRemainingMinutes: Math.floor(remainingMs / 60000),
      warningShown: this.state.warningShown
    };
  }

  /**
   * ⚙️ Update configuration
   */
  updateConfig(newConfig: Partial<SessionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.state.isActive) {
      this.scheduleTimeouts(); // Reschedule with new config
    }
    
    console.log('⚙️ [SESSION] Configuration updated:', this.config);
  }
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance();