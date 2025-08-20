import { useState, useEffect } from "react"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import { Mail, Lock, Volume2, Mic, Headphones } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { InputValidator, ValidationError } from "@/lib/validation"
import { RateLimiter } from "@/lib/rate-limiter"
import Logo from "@/components/Logo"

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, user, isLoading: authLoading } = useAuth()
  const { t, i18n } = useTranslation()
  
  // ✅ TÜM HOOK'LAR EN BAŞTA OLMALI
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

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
      const from = (location.state as any)?.from?.pathname || getPath('/')
      navigate(from, { replace: true })
    }
  }, [user, authLoading, navigate, location.state, i18n.language])

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

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

      const success = await login(validatedEmail, password, rememberMe)
      if (success) {
        // Save email if remember me is checked
        if (rememberMe) {
          localStorage.setItem('veeqai_remembered_email', validatedEmail)
        } else {
          localStorage.removeItem('veeqai_remembered_email')
        }
        
        const from = (location.state as any)?.from?.pathname || getPath('/')
        navigate(from, { replace: true })
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
          {/* Welcome Text */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{t('auth.welcomeBack')}</h1>
            <p className="text-muted-foreground">
              {t('auth.signInSubtitle')}
            </p>
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
            >
              {isLoading ? t('auth.signingIn') : t('common.login')}
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

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <button className="py-2.5 border border-border rounded-lg hover:bg-accent transition-colors font-medium">
                {t('auth.google')}
              </button>
              <button className="py-2.5 border border-border rounded-lg hover:bg-accent transition-colors font-medium">
                {t('auth.github')}
              </button>
            </div>
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
          {/* Logo */}
          <div className="mb-8 text-center">
            <Logo variant="black" className="mx-auto" width={120} height={40} />
          </div>
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