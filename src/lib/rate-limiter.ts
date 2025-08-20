/**
 * ✅ CLIENT-SIDE RATE LIMITING
 * Prevents brute force attacks and API abuse
 */

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number; // Time window in milliseconds
  blockDurationMs: number; // How long to block after exceeding limit
}

interface RateLimitState {
  attempts: number;
  firstAttempt: number;
  blockedUntil: number;
}

export class RateLimiter {
  private static instances = new Map<string, RateLimitState>();
  private static defaultConfigs: Record<string, RateLimitConfig> = {
    login: {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
      blockDurationMs: 15 * 60 * 1000, // 15 minutes
    },
    register: {
      maxAttempts: 3,
      windowMs: 60 * 60 * 1000, // 1 hour
      blockDurationMs: 60 * 60 * 1000, // 1 hour
    },
    api: {
      maxAttempts: 100,
      windowMs: 60 * 1000, // 1 minute
      blockDurationMs: 60 * 1000, // 1 minute
    },
  };

  /**
   * ✅ Check if action is allowed
   */
  static canAttempt(key: string, config?: RateLimitConfig): boolean {
    const now = Date.now();
    const rateLimitConfig = config || this.defaultConfigs[key] || this.defaultConfigs.api;
    const state = this.instances.get(key);

    // No previous attempts
    if (!state) {
      this.instances.set(key, {
        attempts: 0,
        firstAttempt: now,
        blockedUntil: 0,
      });
      return true;
    }

    // Check if still blocked
    if (state.blockedUntil > now) {
      return false;
    }

    // Reset if window has passed
    if (now - state.firstAttempt > rateLimitConfig.windowMs) {
      this.instances.set(key, {
        attempts: 0,
        firstAttempt: now,
        blockedUntil: 0,
      });
      return true;
    }

    // Check if under limit
    return state.attempts < rateLimitConfig.maxAttempts;
  }

  /**
   * ✅ Record an attempt
   */
  static recordAttempt(key: string, config?: RateLimitConfig): void {
    const now = Date.now();
    const rateLimitConfig = config || this.defaultConfigs[key] || this.defaultConfigs.api;
    const state = this.instances.get(key);

    if (!state) {
      this.instances.set(key, {
        attempts: 1,
        firstAttempt: now,
        blockedUntil: 0,
      });
      return;
    }

    state.attempts++;

    // Block if exceeded limit
    if (state.attempts >= rateLimitConfig.maxAttempts) {
      state.blockedUntil = now + rateLimitConfig.blockDurationMs;
    }

    this.instances.set(key, state);
  }

  /**
   * ✅ Get remaining attempts
   */
  static getRemainingAttempts(key: string, config?: RateLimitConfig): number {
    const rateLimitConfig = config || this.defaultConfigs[key] || this.defaultConfigs.api;
    const state = this.instances.get(key);

    if (!state) {
      return rateLimitConfig.maxAttempts;
    }

    const now = Date.now();
    
    // Reset if window has passed
    if (now - state.firstAttempt > rateLimitConfig.windowMs) {
      return rateLimitConfig.maxAttempts;
    }

    return Math.max(0, rateLimitConfig.maxAttempts - state.attempts);
  }

  /**
   * ✅ Get time until unblocked (in milliseconds)
   */
  static getTimeUntilUnblocked(key: string): number {
    const state = this.instances.get(key);
    
    if (!state || state.blockedUntil === 0) {
      return 0;
    }

    const now = Date.now();
    return Math.max(0, state.blockedUntil - now);
  }

  /**
   * ✅ Reset rate limit for a key (admin/success action)
   */
  static reset(key: string): void {
    this.instances.delete(key);
  }

  /**
   * ✅ Get human-readable time remaining
   */
  static getTimeRemainingText(key: string): string {
    const timeMs = this.getTimeUntilUnblocked(key);
    
    if (timeMs === 0) {
      return '';
    }

    const minutes = Math.ceil(timeMs / 60000);
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }

    const hours = Math.ceil(minutes / 60);
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }

  /**
   * ✅ Clear old entries (cleanup)
   */
  static cleanup(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [key, state] of this.instances.entries()) {
      if (now - state.firstAttempt > maxAge && state.blockedUntil < now) {
        this.instances.delete(key);
      }
    }
  }
}

// Cleanup every hour
if (typeof window !== 'undefined') {
  setInterval(() => RateLimiter.cleanup(), 60 * 60 * 1000);
}