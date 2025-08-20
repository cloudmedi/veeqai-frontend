/**
 * STANDARDIZED API CLIENT
 * Centralized HTTP client with error handling and auth
 */

import { CSRFProtection } from './csrf-protection';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

interface ApiError {
  success: false;
  error: {
    message: string;
    code: string;
    status: number;
    timestamp: string;
    details?: any;
  };
}

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;
  private enableLogging: boolean;
  private refreshTokenPromise: Promise<boolean> | null = null;

  constructor(baseURL?: string) {
    // ✅ Environment-based configuration
    this.baseURL = baseURL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    this.timeout = parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000;
    this.enableLogging = import.meta.env.VITE_ENABLE_CONSOLE_LOGS === 'true';
    
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };

    // ✅ Validate HTTPS in production
    if (import.meta.env.VITE_ENVIRONMENT === 'production' && !this.baseURL.startsWith('https://')) {
      console.error('⚠️ SECURITY WARNING: API URL must use HTTPS in production');
    }
  }

  /**
   * ✅ Secure logging that respects environment
   */
  private secureLog(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    if (!this.enableLogging) return;

    const sanitizedData = data ? this.sanitizeLogData(data) : undefined;
    const timestamp = new Date().toISOString();
    
    switch (level) {
      case 'info':
        console.log(`[${timestamp}] ${message}`, sanitizedData);
        break;
      case 'warn':
        console.warn(`[${timestamp}] ${message}`, sanitizedData);
        break;
      case 'error':
        console.error(`[${timestamp}] ${message}`, sanitizedData);
        break;
    }
  }

  /**
   * ✅ Sanitize sensitive data from logs
   */
  private sanitizeLogData(data: any): any {
    if (typeof data !== 'object' || data === null) return data;
    
    const sensitiveKeys = ['token', 'password', 'authorization', 'auth', 'secret', 'key'];
    const sanitized = { ...data };
    
    Object.keys(sanitized).forEach(key => {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }

  /**
   * Get auth token from localStorage or sessionStorage
   */
  private getAuthToken(): string | null {
    return localStorage.getItem('veeqai_token') || sessionStorage.getItem('veeqai_token');
  }

  /**
   * Get refresh token from localStorage or sessionStorage
   */
  private getRefreshToken(): string | null {
    return localStorage.getItem('veeqai_refresh_token') || sessionStorage.getItem('veeqai_refresh_token');
  }

  /**
   * Refresh access token
   */
  private async refreshAccessToken(): Promise<boolean> {
    // Prevent multiple concurrent refresh attempts
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    this.refreshTokenPromise = this.performTokenRefresh();
    const result = await this.refreshTokenPromise;
    this.refreshTokenPromise = null;
    return result;
  }

  /**
   * Perform the actual token refresh
   */
  private async performTokenRefresh(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    try {
      this.secureLog('info', '🔄 [API] Refreshing access token...');
      
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update tokens in storage
        if (localStorage.getItem('veeqai_refresh_token')) {
          localStorage.setItem('veeqai_token', data.accessToken);
          localStorage.setItem('veeqai_user', JSON.stringify(data.user));
        } else {
          sessionStorage.setItem('veeqai_token', data.accessToken);
          sessionStorage.setItem('veeqai_user', JSON.stringify(data.user));
        }
        
        this.secureLog('info', '✅ [API] Token refreshed successfully');
        return true;
      } else {
        this.secureLog('warn', '❌ [API] Token refresh failed');
        return false;
      }
    } catch (error) {
      this.secureLog('error', '❌ [API] Token refresh error', error);
      return false;
    }
  }

  /**
   * Get auth headers
   */
  private getAuthHeaders(): Record<string, string> {
    const token = this.getAuthToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  /**
   * Build full URL
   */
  private buildURL(endpoint: string): string {
    return `${this.baseURL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  }

  /**
   * Handle response
   */
  private async handleResponse<T>(response: Response, originalRequest?: () => Promise<Response>): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    let data: ApiResponse<T> | ApiError;
    
    try {
      data = isJson ? await response.json() : { success: false, error: { message: await response.text(), code: 'NON_JSON_RESPONSE', status: response.status, timestamp: new Date().toISOString() } };
    } catch (parseError) {
      throw new Error(`Failed to parse response: ${parseError}`);
    }

    if (!response.ok) {
      // Handle new error format from CreditLimitMiddleware
      if ('error' in data && typeof data.error === 'string' && data.error === 'INSUFFICIENT_CREDITS') {
        const customError = {
          message: (data as any).message || 'Insufficient credits',
          code: data.error,
          status: response.status,
          timestamp: new Date().toISOString(),
          details: data // Store the entire response as details
        };
        this.secureLog('error', `❌ [API] ${customError.status} ${customError.code}: ${customError.message}`);
        throw new ApiClientError(customError.message, customError.code, customError.status, customError.details);
      }
      
      const error = 'error' in data ? data.error : { 
        message: 'Request failed', 
        code: 'REQUEST_FAILED', 
        status: response.status,
        timestamp: new Date().toISOString()
      };
      
      // If 401 and we have originalRequest, try to refresh token and retry
      if (error.status === 401 && originalRequest) {
        this.secureLog('warn', '🔄 [API] 401 Unauthorized - attempting token refresh');
        
        // Check if it's a session revocation (session versioning)
        if (error.code === 'SESSION_REVOKED') {
          this.secureLog('error', '🚫 [API] Session revoked - redirecting to login');
          this.clearAuthData();
          window.location.href = '/login';
          throw error;
        }
        
        const refreshSuccess = await this.refreshAccessToken();
        if (refreshSuccess) {
          this.secureLog('info', '✅ [API] Token refreshed, retrying original request');
          const retryResponse = await originalRequest();
          return this.handleResponse<T>(retryResponse); // Recursive call without originalRequest to prevent infinite loops
        }
      }
      
      this.secureLog('error', `❌ [API] ${error.status} ${error.code}: ${error.message}`);
      throw new ApiClientError(error.message, error.code, error.status, error.details);
    }

    if ('success' in data && data.success) {
      return data.data;
    }

    throw new Error('Unexpected response format');
  }

  /**
   * Generic request method
   */
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = this.buildURL(endpoint);
    
    const makeRequest = () => {
      const headers = {
        ...this.defaultHeaders,
        ...this.getAuthHeaders(), // Get fresh headers each time
        ...CSRFProtection.getHeaders(), // Add CSRF protection
        ...options.headers,
      };

      // ✅ Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      return fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
        // ✅ Security: Prevent credentials in cross-origin requests
        credentials: 'same-origin',
      }).then(response => {
        clearTimeout(timeoutId);
        return response;
      });
    };

    this.secureLog('info', `🌐 [API] ${options.method || 'GET'} ${endpoint}`);

    try {
      const response = await makeRequest();
      return await this.handleResponse<T>(response, makeRequest);
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }

      // ✅ Handle timeout errors specifically
      if (error instanceof DOMException && error.name === 'AbortError') {
        this.secureLog('error', 'Request timeout');
        throw new ApiClientError('Request timeout', 'TIMEOUT_ERROR', 408);
      }
      
      this.secureLog('error', 'Network error', { endpoint, error: error instanceof Error ? error.message : 'Unknown error' });
      throw new ApiClientError('Network request failed', 'NETWORK_ERROR', 0);
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let url = endpoint;
    
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
      url += `?${searchParams.toString()}`;
    }

    return this.request<T>(url, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Clear authentication data
   */
  private clearAuthData(): void {
    localStorage.removeItem('veeqai_token');
    localStorage.removeItem('veeqai_refresh_token');
    localStorage.removeItem('veeqai_user');
    sessionStorage.removeItem('veeqai_token');
    sessionStorage.removeItem('veeqai_refresh_token');
    sessionStorage.removeItem('veeqai_user');
  }
}

/**
 * Custom API Error class
 */
class ApiClientError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export { ApiClientError };

// Export typed service methods
export const musicAPI = {
  getModels: () => apiClient.get<any[]>('/music/models'),
  getMyMusic: (page?: number, limit?: number) => 
    apiClient.get<{items: any[], pagination: any}>('/music/my-music', { page, limit }),
  generateMusic: (data: any) => apiClient.post<any>('/music/generate', data),
};

export const authAPI = {
  login: (email: string, password: string) => 
    apiClient.post<{accessToken: string, refreshToken: string, user: any}>('/auth/login', { email, password }),
  register: (name: string, email: string, password: string) => 
    apiClient.post<{accessToken: string, refreshToken: string, user: any}>('/auth/register', { name, email, password }),
  refresh: (refreshToken: string) =>
    apiClient.post<{accessToken: string, user: any}>('/auth/refresh', { refreshToken }),
};