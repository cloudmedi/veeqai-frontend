/**
 * 📊 USER ACTIVITY MONITORING
 * Comprehensive activity tracking for security and analytics
 */

// import { apiClient } from './api-client'; // TODO: Use for backend communication

interface ActivityEvent {
  timestamp: number;
  type: string;
  details: Record<string, any>;
  userId?: string;
  sessionId: string;
}

interface SecurityEvent {
  timestamp: number;
  type: 'suspicious_activity' | 'failed_auth' | 'rate_limit_hit' | 'token_expired' | 'concurrent_session';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  userId?: string;
  sessionId: string;
}

interface ActivityStats {
  totalEvents: number;
  sessionDuration: number;
  pageViews: number;
  apiCalls: number;
  errors: number;
  lastActivity: number;
}

export class ActivityMonitor {
  private static instance: ActivityMonitor;
  private isActive: boolean = false;
  private sessionId: string;
  private activities: ActivityEvent[] = [];
  private securityEvents: SecurityEvent[] = [];
  private stats: ActivityStats;
  private flushTimer: NodeJS.Timeout | null = null;
  private maxEvents: number = 100; // Max events to keep in memory
  private flushInterval: number = 30000; // Flush every 30 seconds

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.stats = {
      totalEvents: 0,
      sessionDuration: 0,
      pageViews: 0,
      apiCalls: 0,
      errors: 0,
      lastActivity: Date.now()
    };
  }

  static getInstance(): ActivityMonitor {
    if (!ActivityMonitor.instance) {
      ActivityMonitor.instance = new ActivityMonitor();
    }
    return ActivityMonitor.instance;
  }

  /**
   * 🚀 Start activity monitoring
   */
  start(userId?: string): void {
    if (this.isActive) return;

    console.log('📊 [ACTIVITY] Starting activity monitoring...');
    this.isActive = true;
    this.stats.lastActivity = Date.now();

    // Track page navigation
    this.trackPageView(window.location.pathname);

    // Setup event listeners
    this.setupEventListeners();

    // Start periodic flushing
    this.startPeriodicFlush();

    // Track session start
    this.trackActivity('session_start', {
      userId,
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language
    });

    console.log('✅ [ACTIVITY] Monitoring active - Session:', this.sessionId);
  }

  /**
   * 🛑 Stop activity monitoring
   */
  stop(): void {
    if (!this.isActive) return;

    console.log('🛑 [ACTIVITY] Stopping activity monitoring...');

    // Track session end
    this.trackActivity('session_end', {
      sessionDuration: Date.now() - (this.stats.lastActivity - this.stats.sessionDuration),
      totalEvents: this.stats.totalEvents
    });

    // Flush remaining events
    this.flushEvents();

    // Cleanup
    this.removeEventListeners();
    this.stopPeriodicFlush();
    this.isActive = false;

    console.log('🛑 [ACTIVITY] Monitoring stopped');
  }

  /**
   * 🆔 Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 👂 Setup event listeners
   */
  private setupEventListeners(): void {
    // Page visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

    // Navigation
    window.addEventListener('beforeunload', this.handlePageUnload.bind(this));
    window.addEventListener('popstate', this.handleNavigation.bind(this));

    // User interactions
    document.addEventListener('click', this.handleClick.bind(this), true);
    document.addEventListener('keydown', this.handleKeydown.bind(this), true);

    // Errors
    window.addEventListener('error', this.handleError.bind(this));
    window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));

    // Network status
    window.addEventListener('online', () => this.trackActivity('network_online', {}));
    window.addEventListener('offline', () => this.trackActivity('network_offline', {}));
  }

  /**
   * 🗑️ Remove event listeners
   */
  private removeEventListeners(): void {
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    window.removeEventListener('beforeunload', this.handlePageUnload.bind(this));
    window.removeEventListener('popstate', this.handleNavigation.bind(this));
    document.removeEventListener('click', this.handleClick.bind(this), true);
    document.removeEventListener('keydown', this.handleKeydown.bind(this), true);
    window.removeEventListener('error', this.handleError.bind(this));
    window.removeEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
  }

  /**
   * 📊 Track general activity
   */
  trackActivity(type: string, details: Record<string, any>): void {
    if (!this.isActive) return;

    const activity: ActivityEvent = {
      timestamp: Date.now(),
      type,
      details: this.sanitizeDetails(details),
      userId: this.getCurrentUserId(),
      sessionId: this.sessionId
    };

    this.activities.push(activity);
    this.stats.totalEvents++;
    this.stats.lastActivity = Date.now();

    // Trim activities if too many
    if (this.activities.length > this.maxEvents) {
      this.activities = this.activities.slice(-this.maxEvents);
    }

    console.log(`📊 [ACTIVITY] ${type}:`, details);
  }

  /**
   * 🚨 Track security events
   */
  trackSecurityEvent(
    type: SecurityEvent['type'], 
    severity: SecurityEvent['severity'], 
    details: Record<string, any>
  ): void {
    const securityEvent: SecurityEvent = {
      timestamp: Date.now(),
      type,
      severity,
      details: this.sanitizeDetails(details),
      userId: this.getCurrentUserId(),
      sessionId: this.sessionId
    };

    this.securityEvents.push(securityEvent);
    
    console.warn(`🚨 [SECURITY] ${severity.toUpperCase()} - ${type}:`, details);

    // Immediately flush critical security events
    if (severity === 'critical') {
      this.flushSecurityEvents();
    }
  }

  /**
   * 📄 Track page views
   */
  trackPageView(path: string): void {
    this.stats.pageViews++;
    this.trackActivity('page_view', {
      path,
      referrer: document.referrer,
      title: document.title
    });
  }

  /**
   * 🌐 Track API calls
   */
  trackApiCall(endpoint: string, method: string, status: number, duration: number): void {
    this.stats.apiCalls++;
    this.trackActivity('api_call', {
      endpoint,
      method,
      status,
      duration,
      success: status < 400
    });

    // Track API errors as security events
    if (status >= 400) {
      const severity = status >= 500 ? 'high' : status === 401 || status === 403 ? 'medium' : 'low';
      this.trackSecurityEvent('failed_auth', severity, {
        endpoint,
        method,
        status
      });
    }
  }

  /**
   * 👆 Handle click events
   */
  private handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target) return;

    // Track important clicks
    if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.getAttribute('role') === 'button') {
      this.trackActivity('user_click', {
        element: target.tagName,
        text: target.textContent?.slice(0, 50) || '',
        className: target.className,
        id: target.id
      });
    }
  }

  /**
   * ⌨️ Handle keyboard events
   */
  private handleKeydown(event: KeyboardEvent): void {
    // Track important key combinations
    if (event.ctrlKey || event.metaKey || event.altKey) {
      this.trackActivity('keyboard_shortcut', {
        key: event.key,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        altKey: event.altKey,
        shiftKey: event.shiftKey
      });
    }
  }

  /**
   * 👁️ Handle visibility changes
   */
  private handleVisibilityChange(): void {
    this.trackActivity('visibility_change', {
      hidden: document.hidden,
      visibilityState: document.visibilityState
    });
  }

  /**
   * 🚪 Handle page unload
   */
  private handlePageUnload(): void {
    this.trackActivity('page_unload', {
      sessionDuration: Date.now() - this.stats.lastActivity
    });
    this.flushEvents();
  }

  /**
   * 🧭 Handle navigation
   */
  private handleNavigation(): void {
    this.trackPageView(window.location.pathname);
  }

  /**
   * ❌ Handle JavaScript errors
   */
  private handleError(event: ErrorEvent): void {
    this.stats.errors++;
    this.trackSecurityEvent('suspicious_activity', 'medium', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack?.slice(0, 500) // Limit stack trace length
    });
  }

  /**
   * 🚫 Handle promise rejections
   */
  private handlePromiseRejection(event: PromiseRejectionEvent): void {
    this.stats.errors++;
    this.trackSecurityEvent('suspicious_activity', 'medium', {
      reason: event.reason?.toString?.() || 'Unknown promise rejection',
      type: 'unhandled_promise_rejection'
    });
  }

  /**
   * 🧹 Sanitize details to prevent sensitive data leakage
   */
  private sanitizeDetails(details: Record<string, any>): Record<string, any> {
    const sensitiveKeys = ['password', 'token', 'key', 'secret', 'auth', 'credit'];
    const sanitized = { ...details };

    Object.keys(sanitized).forEach(key => {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  /**
   * 👤 Get current user ID
   */
  private getCurrentUserId(): string | undefined {
    try {
      const userData = localStorage.getItem('veeqai_user') || sessionStorage.getItem('veeqai_user');
      return userData ? JSON.parse(userData).id : undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * 🔄 Start periodic flushing
   */
  private startPeriodicFlush(): void {
    this.flushTimer = setInterval(() => {
      this.flushEvents();
    }, this.flushInterval);
  }

  /**
   * 🛑 Stop periodic flushing
   */
  private stopPeriodicFlush(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * 💾 Flush events to backend
   */
  private async flushEvents(): Promise<void> {
    if (this.activities.length === 0 && this.securityEvents.length === 0) return;

    try {
      const payload = {
        sessionId: this.sessionId,
        activities: [...this.activities],
        securityEvents: [...this.securityEvents],
        stats: { ...this.stats },
        timestamp: Date.now()
      };

      // In a real implementation, this would send to backend
      console.log('💾 [ACTIVITY] Flushing events:', payload);

      // Simulate API call
      // await apiClient.post('/analytics/activity', payload);

      // Clear flushed events
      this.activities = [];
      this.securityEvents = [];

      console.log('✅ [ACTIVITY] Events flushed successfully');
    } catch (error) {
      console.error('❌ [ACTIVITY] Failed to flush events:', error);
    }
  }

  /**
   * 🚨 Flush security events immediately
   */
  private async flushSecurityEvents(): Promise<void> {
    if (this.securityEvents.length === 0) return;

    try {
      const payload = {
        sessionId: this.sessionId,
        securityEvents: [...this.securityEvents],
        timestamp: Date.now()
      };

      console.log('🚨 [SECURITY] Flushing security events:', payload);

      // In a real implementation, this would send to backend security endpoint
      // await apiClient.post('/security/events', payload);

      this.securityEvents = [];
      console.log('✅ [SECURITY] Security events flushed');
    } catch (error) {
      console.error('❌ [SECURITY] Failed to flush security events:', error);
    }
  }

  /**
   * 📊 Get current statistics
   */
  getStats(): ActivityStats {
    return {
      ...this.stats,
      sessionDuration: Date.now() - this.stats.lastActivity
    };
  }

  /**
   * 📋 Get recent activities
   */
  getRecentActivities(count: number = 10): ActivityEvent[] {
    return this.activities.slice(-count);
  }

  /**
   * 🚨 Get recent security events
   */
  getRecentSecurityEvents(count: number = 10): SecurityEvent[] {
    return this.securityEvents.slice(-count);
  }

  /**
   * ⚙️ Update configuration
   */
  updateConfig(config: Partial<{ maxEvents: number; flushInterval: number }>): void {
    if (config.maxEvents) this.maxEvents = config.maxEvents;
    if (config.flushInterval) {
      this.flushInterval = config.flushInterval;
      if (this.isActive) {
        this.stopPeriodicFlush();
        this.startPeriodicFlush();
      }
    }
    console.log('⚙️ [ACTIVITY] Configuration updated:', config);
  }
}

// Export singleton instance
export const activityMonitor = ActivityMonitor.getInstance();