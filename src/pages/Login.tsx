import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import { Mail, Lock, Volume2, Mic, Headphones } from "lucide-react"
// Google icon as inline SVG component
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

import { useAuth } from "@/contexts/AuthContext"
import { InputValidator, ValidationError } from "@/lib/validation"
import { RateLimiter } from "@/lib/rate-limiter"
import Logo from "@/components/Logo"
import { OAUTH_CONFIG } from "@/config/oauth"

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, user, isLoading: authLoading } = useAuth()
  const { t, i18n } = useTranslation()
  
  // ✅ TÜM HOOK'LAR EN BAŞTA OLMALI
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [turnstileToken, setTurnstileToken] = useState("")

  // Turnstile callback fonksiyonları ve manuel render
  useEffect(() => {
    // Global callback fonksiyonlarını tanımla
    (window as any).onTurnstileSuccess = (token: string) => {
      setTurnstileToken(token)
      console.log('✅ Turnstile completed:', token)
    }

    (window as any).onTurnstileExpired = () => {
      setTurnstileToken("")
      console.log('⏰ Turnstile expired')
    }

    // Manuel render için biraz bekle
    const timer = setTimeout(() => {
      const widget = document.querySelector('.cf-turnstile');
      if (widget && (window as any).turnstile) {
        console.log('🔧 Manual Turnstile render...');
        try {
          (window as any).turnstile.render('.cf-turnstile', {
            sitekey: '0x4AAAAAABuWBK_QlgGuxtvd',
            callback: (token: string) => {
              setTurnstileToken(token)
              console.log('✅ Turnstile completed (invisible):', token)
            },
            'expired-callback': () => {
              setTurnstileToken("")
              console.log('⏰ Turnstile expired')
            },
            theme: 'auto',
            size: 'invisible'
          });
        } catch (error) {
          console.log('❌ Turnstile render error:', error);
        }
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      // Cleanup
      delete (window as any).onTurnstileSuccess
      delete (window as any).onTurnstileExpired
    }
  }, [])

  // Load remembered email on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('veeqai_remembered_email')
    if (rememberedEmail) {
      setEmail(rememberedEmail)
      setRememberMe(true)
    }
    
  }, [])

  // Helper function to get correct path based on language
  const getPath = (path: string) => {
    if (i18n.language === 'tr') {
      return path === '/' ? '/tr' : `/tr${path}`
    }
    return path
  }

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      // Always redirect to home page for better UX
      navigate(getPath('/'), { replace: true })
    }
  }, [user, authLoading, navigate, i18n.language])

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const handleGoogleLogin = () => {
    // Center popup on screen
    const width = 500;
    const height = 600;
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);
    
    const popup = window.open(
      OAUTH_CONFIG.google.authUrl,
      'google-login',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,toolbar=no,location=no,status=no,menubar=no`
    );

    // Listen for messages from popup
    const messageListener = (event: MessageEvent) => {
      if (event.origin !== OAUTH_CONFIG.google.origin) return;

      if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        const { accessToken, refreshToken } = event.data.tokens;
        const userData = event.data.user;
        
        // Store tokens and user data
        localStorage.setItem('veeqai_token', accessToken);
        localStorage.setItem('veeqai_refresh_token', refreshToken);
        localStorage.setItem('veeqai_user', JSON.stringify(userData));
        
        // Force reload to trigger AuthContext validation
        window.location.reload();
        
        // Cleanup listener
        window.removeEventListener('message', messageListener);
      } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
        popup?.close();
        setError('Google login failed. Please try again.');
        
        // Cleanup listener
        window.removeEventListener('message', messageListener);
      }
    };

    window.addEventListener('message', messageListener);

    // Cleanup if popup is closed manually
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        window.removeEventListener('message', messageListener);
        clearInterval(checkClosed);
      }
    }, 1000);
  };



  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // ✅ Client-side validation
      const validatedEmail = InputValidator.validateEmail(email)
      
      // ✅ Basic password check (don't validate strength for login)
      if (!password || password.length < 1) {
        throw new ValidationError('Password is required', 'password')
      }

      // ✅ Check rate limiting
      const rateLimitKey = `login_${validatedEmail}`;
      if (!RateLimiter.canAttempt(rateLimitKey)) {
        const timeRemaining = RateLimiter.getTimeRemainingText(rateLimitKey);
        throw new Error(`Too many login attempts. Please try again in ${timeRemaining}.`);
      }

      // Invisible Turnstile - trigger and wait for token
      if (!turnstileToken && (window as any).turnstile) {
        // Trigger invisible challenge
        try {
          const widget = document.querySelector('.cf-turnstile');
          if (widget) {
            (window as any).turnstile.execute(widget);
            // Wait briefly for token
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error) {
          console.log('Turnstile execute error:', error);
        }
      }

      // If still no token after triggering, proceed anyway (fallback)
      const success = await login(validatedEmail, password, rememberMe, turnstileToken || '')
      if (success) {
        // Save email if remember me is checked
        if (rememberMe) {
          localStorage.setItem('veeqai_remembered_email', validatedEmail)
        } else {
          localStorage.removeItem('veeqai_remembered_email')
        }
        
        // Always redirect to home page after login for better UX
        navigate(getPath('/'), { replace: true })
      } else {
        const remaining = RateLimiter.getRemainingAttempts(rateLimitKey);
        if (remaining <= 2 && remaining > 0) {
          setError(`${t('auth.invalidCredentials')} (${remaining} attempts remaining)`)
        } else {
          setError(t('auth.invalidCredentials'))
        }
      }
    } catch (err) {
      if (err instanceof ValidationError) {
        setError(err.message)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError(t('auth.loginFailed'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <Logo variant="black" width={120} height={40} />
          </div>
          
          {/* Welcome Text */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">{t('auth.welcomeBack')}</h1>
          </div>

          {/* Google Login Button - Top Position */}
          <div className="mb-6">
            <button 
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-border rounded-lg hover:bg-accent transition-colors font-medium"
            >
              <GoogleIcon />
              {t('auth.google')}
            </button>
            
            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-background text-muted-foreground">{t('auth.orContinueWith')}</span>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium mb-2">{t('common.email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.emailPlaceholder')}
                  className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:border-primary transition-colors"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium mb-2">{t('common.password')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.passwordPlaceholder')}
                  className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:border-primary transition-colors"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-border" 
                />
                <span className="text-sm">{t('auth.rememberMe')}</span>
              </label>
              <a href="#" className="text-sm text-primary hover:underline">
                {t('auth.forgotPassword')}
              </a>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Cloudflare Turnstile - Invisible Mode */}
            <div 
              className="cf-turnstile" 
              data-sitekey="0x4AAAAAABuWBK_QlgGuxtvd"
              data-callback="onTurnstileSuccess"
              data-expired-callback="onTurnstileExpired"
              data-theme="auto"
              data-size="invisible"
            ></div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
            >
              {isLoading ? t('auth.signingIn') : t('common.login')}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {t('auth.dontHaveAccount')}{" "}
            <Link to="/register" className="text-primary hover:underline font-medium">
              {t('common.register')}
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Feature Showcase */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-purple-600/10 to-pink-600/10 items-center justify-center relative overflow-hidden">
        <div className="relative z-10 text-center px-8">
          <div className="mb-8">
            {/* Audio Wave Animation */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="w-2 h-16 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-24 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-20 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
              <div className="w-2 h-28 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: "450ms" }} />
              <div className="w-2 h-16 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: "600ms" }} />
              <div className="w-2 h-24 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: "750ms" }} />
              <div className="w-2 h-20 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: "900ms" }} />
            </div>
          </div>

          <h2 className="text-3xl font-bold mb-4">{t('auth.heroTitle')}</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            {t('auth.heroSubtitle')}
          </p>

          {/* Feature Icons */}
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Volume2 className="h-6 w-6 text-purple-500" />
              </div>
              <span className="text-xs text-muted-foreground">{t('auth.feature1')}</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Mic className="h-6 w-6 text-purple-500" />
              </div>
              <span className="text-xs text-muted-foreground">{t('auth.feature2')}</span>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Headphones className="h-6 w-6 text-purple-500" />
              </div>
              <span className="text-xs text-muted-foreground">{t('auth.feature3')}</span>
            </div>
          </div>
        </div>

        {/* Background Decoration */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-64 h-64 bg-purple-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-pink-500 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  )
}