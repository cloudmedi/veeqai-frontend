/**
 * 🛡️ CSRF TOKEN PROTECTION
 * Cross-Site Request Forgery protection implementation
 */

export class CSRFProtection {
  private static token: string | null = null;
  private static readonly TOKEN_HEADER = 'X-CSRF-Token';
  private static readonly TOKEN_STORAGE_KEY = 'veeqai_csrf_token';

  /**
   * 🔄 Initialize CSRF protection
   */
  static async initialize(): Promise<void> {
    try {
      // Try to get existing token from storage
      this.token = sessionStorage.getItem(this.TOKEN_STORAGE_KEY);
      
      if (!this.token || this.isTokenExpired()) {
        // Fetch new token from server
        await this.fetchNewToken();
      }
      
      console.log('🛡️ [CSRF] Protection initialized');
    } catch (error) {
      console.error('❌ [CSRF] Failed to initialize protection:', error);
    }
  }

  /**
   * 🆕 Fetch new CSRF token from server
   */
  private static async fetchNewToken(): Promise<void> {
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/auth/csrf-token`, {
        method: 'GET',
        credentials: 'same-origin',
      });

      if (response.ok) {
        const data = await response.json();
        this.token = data.token;
        sessionStorage.setItem(this.TOKEN_STORAGE_KEY, this.token!);
        console.log('✅ [CSRF] New token fetched');
      } else {
        throw new Error('Failed to fetch CSRF token');
      }
    } catch (error) {
      console.error('❌ [CSRF] Error fetching token:', error);
      // Generate client-side token as fallback
      this.token = this.generateClientToken();
      sessionStorage.setItem(this.TOKEN_STORAGE_KEY, this.token);
    }
  }

  /**
   * 🔑 Generate client-side token (fallback)
   */
  private static generateClientToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * ⏰ Check if token is expired (tokens expire after 1 hour)
   */
  private static isTokenExpired(): boolean {
    const tokenTimestamp = sessionStorage.getItem(`${this.TOKEN_STORAGE_KEY}_timestamp`);
    if (!tokenTimestamp) return true;
    
    const oneHour = 60 * 60 * 1000;
    return Date.now() - parseInt(tokenTimestamp) > oneHour;
  }

  /**
   * 📋 Get CSRF token for requests
   */
  static getToken(): string | null {
    return this.token;
  }

  /**
   * 📤 Get CSRF headers for API requests
   */
  static getHeaders(): Record<string, string> {
    if (!this.token) return {};
    
    return {
      [this.TOKEN_HEADER]: this.token
    };
  }

  /**
   * ✅ Validate CSRF token in form submissions
   */
  static validateFormToken(formToken: string): boolean {
    return this.token !== null && formToken === this.token;
  }

  /**
   * 🧹 Clear CSRF token
   */
  static clearToken(): void {
    this.token = null;
    sessionStorage.removeItem(this.TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(`${this.TOKEN_STORAGE_KEY}_timestamp`);
    console.log('🧹 [CSRF] Token cleared');
  }

  /**
   * 🔄 Refresh CSRF token
   */
  static async refreshToken(): Promise<void> {
    await this.fetchNewToken();
  }

  /**
   * 📝 Add CSRF token to form
   */
  static addTokenToForm(form: HTMLFormElement): void {
    if (!this.token) return;

    // Remove existing CSRF input if any
    const existingInput = form.querySelector('input[name="csrf_token"]');
    if (existingInput) {
      existingInput.remove();
    }

    // Add new CSRF input
    const csrfInput = document.createElement('input');
    csrfInput.type = 'hidden';
    csrfInput.name = 'csrf_token';
    csrfInput.value = this.token;
    form.appendChild(csrfInput);
  }

  /**
   * 🔍 Setup automatic form protection
   */
  static setupFormProtection(): void {
    // Intercept all form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      if (form && form.method.toLowerCase() === 'post') {
        this.addTokenToForm(form);
      }
    });

    console.log('🔍 [CSRF] Form protection setup complete');
  }

  /**
   * 🌐 Integrate with fetch API
   */
  static enhanceFetch(): void {
    const originalFetch = window.fetch;
    
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      // Add CSRF token to POST, PUT, PATCH, DELETE requests
      if (init?.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(init.method.toUpperCase())) {
        init.headers = {
          ...init.headers,
          ...this.getHeaders()
        };
      }
      
      return originalFetch(input, init);
    };

    console.log('🌐 [CSRF] Fetch API enhanced');
  }

  /**
   * 📊 Get CSRF protection status
   */
  static getStatus() {
    return {
      hasToken: !!this.token,
      token: this.token ? `${this.token.substring(0, 8)}...` : null,
      isExpired: this.isTokenExpired(),
      timestamp: sessionStorage.getItem(`${this.TOKEN_STORAGE_KEY}_timestamp`)
    };
  }
}

// Auto-initialize when module loads
if (typeof window !== 'undefined') {
  CSRFProtection.initialize();
}