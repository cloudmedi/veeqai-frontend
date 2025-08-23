import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { RateLimiter } from '@/lib/rate-limiter'
import { sessionManager } from '@/lib/session-manager'
import { activityMonitor } from '@/lib/activity-monitor'

interface User {
  id: string
  name: string
  email: string
  credits: number
  subscription: string
  voiceSlots: number
}

interface AuthContextType {
  user: User | null
  token: string | null
  refreshToken: string | null
  login: (email: string, password: string, rememberMe?: boolean, turnstileToken?: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  refreshAccessToken: () => Promise<boolean>
  logout: () => void
  isLoading: boolean
  updateUserCredits: (credits: number) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // ✅ Environment-based API URL
  const API_URL = import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api'


  // ✅ Client-side token expiry validation
  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      return true; // Treat invalid tokens as expired
    }
  }

  useEffect(() => {
    const validateToken = async () => {
      const savedToken = localStorage.getItem('veeqai_token') || sessionStorage.getItem('veeqai_token')
      const savedRefreshToken = localStorage.getItem('veeqai_refresh_token') || sessionStorage.getItem('veeqai_refresh_token')
      const savedUser = localStorage.getItem('veeqai_user') || sessionStorage.getItem('veeqai_user')
      
      if (savedToken && savedUser) {
        // ✅ First check if token is expired client-side
        if (isTokenExpired(savedToken)) {
          // Try to refresh token if refresh token exists
          if (savedRefreshToken) {
            console.log('🔄 Access token expired, attempting refresh...')
            const refreshSuccess = await refreshAccessTokenWithSavedToken(savedRefreshToken)
            if (refreshSuccess) {
              setIsLoading(false)
              return
            }
          }
          
          // If refresh failed or no refresh token, clear everything
          localStorage.removeItem('veeqai_token')
          localStorage.removeItem('veeqai_user')
          localStorage.removeItem('veeqai_refresh_token')
          sessionStorage.removeItem('veeqai_token')
          sessionStorage.removeItem('veeqai_user')
          sessionStorage.removeItem('veeqai_refresh_token')
          setToken(null)
          setRefreshToken(null)
          setUser(null)
          setIsLoading(false)
          return
        }

        try {
          // ✅ Validate token with backend
          const response = await fetch(`${API_URL}/auth/validate`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${savedToken}`,
              'Content-Type': 'application/json',
            },
          })

          if (response.ok) {
            const data = await response.json()
            setToken(savedToken)
            setRefreshToken(savedRefreshToken)
            setUser(data.user) // Use fresh user data from backend
            if (localStorage.getItem('veeqai_token')) {
              localStorage.setItem('veeqai_user', JSON.stringify(data.user))
            } else {
              sessionStorage.setItem('veeqai_user', JSON.stringify(data.user))
            }
            
            // 🔐 Start session management and activity monitoring for existing valid session
            sessionManager.start()
            activityMonitor.start(data.user.id)
            console.log('✅ [AUTH] Session management and activity monitoring started for existing session:', data.user.email)
            
          } else if (response.status === 401 || response.status === 403) {
            // ✅ Token is definitely invalid (unauthorized/forbidden)
            localStorage.removeItem('veeqai_token')
            localStorage.removeItem('veeqai_refresh_token')
            localStorage.removeItem('veeqai_user')
            sessionStorage.removeItem('veeqai_token')
            sessionStorage.removeItem('veeqai_refresh_token')
            sessionStorage.removeItem('veeqai_user')
            setToken(null)
            setRefreshToken(null)
            setUser(null)
          } else {
            // ✅ For server errors, try to use cached user data temporarily
            console.warn('⚠️ [AUTH] Token validation failed with status:', response.status)
            
            // If it's a 5xx error, keep the session but warn
            if (response.status >= 500) {
              console.log('🔄 [AUTH] Server error, keeping session temporarily')
              setToken(savedToken)
              setRefreshToken(savedRefreshToken)
              setUser(JSON.parse(savedUser))
              
              // Retry validation after 5 seconds
              setTimeout(() => {
                validateToken()
              }, 5000)
            } else {
              // For other errors, clear session
              localStorage.removeItem('veeqai_token')
              localStorage.removeItem('veeqai_refresh_token')
              localStorage.removeItem('veeqai_user')
              sessionStorage.removeItem('veeqai_token')
              sessionStorage.removeItem('veeqai_refresh_token')
              sessionStorage.removeItem('veeqai_user')
              setToken(null)
              setRefreshToken(null)
              setUser(null)
            }
          }
        } catch (error) {
          // ✅ On network error, try to use cached data
          console.warn('⚠️ [AUTH] Network error during validation:', error)
          
          // Keep the session data temporarily
          setToken(savedToken)
          setRefreshToken(savedRefreshToken)
          setUser(JSON.parse(savedUser))
          
          // Start session management anyway
          sessionManager.start()
          activityMonitor.start(JSON.parse(savedUser).id)
          
          // Retry validation after 3 seconds
          setTimeout(() => {
            validateToken()
          }, 3000)
        }
      }
      setIsLoading(false)
    }

    validateToken()
  }, [])

  // Helper function to refresh token with saved refresh token
  const refreshAccessTokenWithSavedToken = async (savedRefreshToken: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: savedRefreshToken }),
      })

      if (response.ok) {
        const data = await response.json()
        setToken(data.accessToken)
        setUser(data.user)
        
        // Update storage with new access token
        if (localStorage.getItem('veeqai_refresh_token')) {
          localStorage.setItem('veeqai_token', data.accessToken)
          localStorage.setItem('veeqai_user', JSON.stringify(data.user))
        } else {
          sessionStorage.setItem('veeqai_token', data.accessToken)
          sessionStorage.setItem('veeqai_user', JSON.stringify(data.user))
        }
        
        
        console.log('✅ Token refreshed successfully')
        return true
      }
      
      console.log('❌ Token refresh failed')
      return false
    } catch (error) {
      console.error('Token refresh error:', error)
      return false
    }
  }

  // Public refresh function
  const refreshAccessToken = async (): Promise<boolean> => {
    const savedRefreshToken = localStorage.getItem('veeqai_refresh_token') || sessionStorage.getItem('veeqai_refresh_token')
    if (!savedRefreshToken) {
      return false
    }
    
    return refreshAccessTokenWithSavedToken(savedRefreshToken)
  }

  const login = async (email: string, password: string, rememberMe: boolean = false, turnstileToken?: string): Promise<boolean> => {
    const rateLimitKey = `login_${email}`;
    
    // ✅ Check rate limiting
    if (!RateLimiter.canAttempt(rateLimitKey)) {
      const timeRemaining = RateLimiter.getTimeRemainingText(rateLimitKey);
      throw new Error(`Too many login attempts. Please try again in ${timeRemaining}.`);
    }

    try {
      // ✅ Record attempt for rate limiting
      RateLimiter.recordAttempt(rateLimitKey);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, turnstileToken }),
        // ✅ Add security headers
        credentials: 'same-origin',
      })

      if (response.ok) {
        const data = await response.json()
        
        // ✅ Reset rate limit on successful login
        RateLimiter.reset(rateLimitKey);
        
        setToken(data.accessToken)
        setRefreshToken(data.refreshToken)
        setUser(data.user)
        
        if (rememberMe) {
          localStorage.setItem('veeqai_token', data.accessToken)
          localStorage.setItem('veeqai_refresh_token', data.refreshToken)
          localStorage.setItem('veeqai_user', JSON.stringify(data.user))
        } else {
          sessionStorage.setItem('veeqai_token', data.accessToken)
          sessionStorage.setItem('veeqai_refresh_token', data.refreshToken)
          sessionStorage.setItem('veeqai_user', JSON.stringify(data.user))
        }
        
        // 🔐 Start session management and activity monitoring
        sessionManager.start()
        activityMonitor.start(data.user.id)
        console.log('✅ [AUTH] Session management and activity monitoring started for user:', data.user.email)
        
        return true
      }
      
      return false
    } catch (error) {
      return false
    }
  }

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    const rateLimitKey = `register_${email}`;
    
    // ✅ Check rate limiting
    if (!RateLimiter.canAttempt(rateLimitKey)) {
      const timeRemaining = RateLimiter.getTimeRemainingText(rateLimitKey);
      throw new Error(`Too many registration attempts. Please try again in ${timeRemaining}.`);
    }

    try {
      // ✅ Record attempt for rate limiting
      RateLimiter.recordAttempt(rateLimitKey);

      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
        // ✅ Add security headers
        credentials: 'same-origin',
      })

      if (response.ok) {
        const data = await response.json()
        
        // ✅ Reset rate limit on successful registration
        RateLimiter.reset(rateLimitKey);
        
        setToken(data.accessToken)
        setRefreshToken(data.refreshToken)
        setUser(data.user)
        
        localStorage.setItem('veeqai_token', data.accessToken)
        localStorage.setItem('veeqai_refresh_token', data.refreshToken)
        localStorage.setItem('veeqai_user', JSON.stringify(data.user))
        
        
        return true
      }
      
      return false
    } catch (error) {
      return false
    }
  }

  const logout = async () => {
    try {
      // ✅ Revoke session on server (if we have a token)
      if (token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      // Continue with local logout
    } finally {
      // ✅ Always clear local state
      setUser(null)
      setToken(null)
      setRefreshToken(null)
      localStorage.removeItem('veeqai_token')
      localStorage.removeItem('veeqai_refresh_token')
      localStorage.removeItem('veeqai_user')
      sessionStorage.removeItem('veeqai_token')
      sessionStorage.removeItem('veeqai_refresh_token')
      sessionStorage.removeItem('veeqai_user')
      
      // 🛑 Stop session management and activity monitoring
      sessionManager.stop()
      activityMonitor.stop()
      console.log('🛑 [AUTH] Session management and activity monitoring stopped')
      
      // Don't remove remembered email on logout
    }
  }

  const updateUserCredits = (credits: number) => {
    if (user) {
      setUser(prevUser => prevUser ? { ...prevUser, credits } : null)
    }
  }


  return (
    <AuthContext.Provider value={{
      user,
      token,
      refreshToken,
      login,
      register,
      refreshAccessToken,
      logout,
      isLoading,
      updateUserCredits
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}