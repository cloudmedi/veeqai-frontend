import { useState, useEffect } from "react"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import { Mail, Lock, User, Volume2, Music, FileAudio, Globe } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { InputValidator, ValidationError } from "@/lib/validation"
import { RateLimiter } from "@/lib/rate-limiter"
import { TermsModal } from "@/components/terms-modal"
import Logo from "@/components/Logo"

export default function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { register, user, isLoading: authLoading } = useAuth()
  const { t, i18n } = useTranslation()

  // ✅ TÜM HOOK'LAR EN BAŞTA OLMALI
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [modalType, setModalType] = useState<'terms' | 'privacy'>('terms')

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

  // ✅ Update password on change
  const handlePasswordChange = (value: string) => {
    setPassword(value)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // ✅ Client-side validation
      const validatedName = InputValidator.validateName(name)
      const validatedEmail = InputValidator.validateEmail(email)
      const validatedPassword = InputValidator.validatePassword(password)
      
      // ✅ Confirm password validation
      InputValidator.validatePasswordConfirmation(validatedPassword, confirmPassword)

      // ✅ Check rate limiting
      const rateLimitKey = `register_${validatedEmail}`;
      if (!RateLimiter.canAttempt(rateLimitKey)) {
        const timeRemaining = RateLimiter.getTimeRemainingText(rateLimitKey);
        throw new Error(`Too many registration attempts. Please try again in ${timeRemaining}.`);
      }

      const success = await register(validatedName, validatedEmail, validatedPassword)
      if (success) {
        const from = (location.state as any)?.from?.pathname || getPath('/')
        navigate(from, { replace: true })
      } else {
        const remaining = RateLimiter.getRemainingAttempts(rateLimitKey);
        if (remaining <= 2 && remaining > 0) {
          setError(`${t('auth.registrationFailed')} (${remaining} attempts remaining)`)
        } else {
          setError(t('auth.registrationFailed'))
        }
      }
    } catch (err) {
      if (err instanceof ValidationError) {
        setError(err.message)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError(t('auth.registrationError'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Feature Showcase */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-purple-600/10 to-pink-600/10 items-center justify-center relative overflow-hidden">
        <div className="relative z-10 px-8 text-center">
          {/* Logo */}
          <div className="mb-8 text-center">
            <Logo variant="black" className="mx-auto" width={120} height={40} />
          </div>
          <h2 className="text-3xl font-bold mb-6">{t('auth.journeyTitle')}</h2>
          <p className="text-muted-foreground mb-12 max-w-md">
            {t('auth.journeySubtitle')}
          </p>

          {/* Feature List */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Volume2 className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{t('auth.naturalVoicesTitle')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('auth.naturalVoicesDesc')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Music className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{t('auth.musicCreationTitle')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('auth.musicCreationDesc')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileAudio className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{t('auth.voiceCloningTitle')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('auth.voiceCloningDesc')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Globe className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{t('auth.multiLangTitle')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('auth.multiLangDesc')}
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-border/50">
            <div>
              <div className="text-2xl font-bold text-purple-500">1M+</div>
              <div className="text-xs text-muted-foreground">{t('auth.activeUsers')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-500">10M+</div>
              <div className="text-xs text-muted-foreground">{t('auth.audioCreated')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-500">50+</div>
              <div className="text-xs text-muted-foreground">{t('auth.languages')}</div>
            </div>
          </div>
        </div>

        {/* Background Decoration */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-32 left-10 w-64 h-64 bg-purple-500 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-32 w-64 h-64 bg-pink-500 rounded-full blur-3xl" />
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-md">
          {/* Welcome Text */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{t('auth.createAccount')}</h1>
            <p className="text-muted-foreground">
              {t('auth.startCreating')}
            </p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium mb-2">{t('auth.fullName')}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('auth.namePlaceholder')}
                  className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>
            </div>

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
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder={t('auth.createPassword')}
                  className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-medium mb-2">{t('auth.confirmPassword')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('auth.confirmPasswordPlaceholder')}
                  className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start gap-2">
              <input type="checkbox" className="w-4 h-4 rounded border-border mt-0.5" required />
              <span className="text-sm text-muted-foreground">
                {t('auth.agreeToTerms')}{" "}
                <button 
                  type="button"
                  onClick={() => {
                    setModalType('terms')
                    setShowTermsModal(true)
                  }}
                  className="text-primary hover:underline"
                >
                  {t('auth.termsOfService')}
                </button>
                {" "}{t('auth.and')}{" "}
                <button 
                  type="button"
                  onClick={() => {
                    setModalType('privacy')
                    setShowTermsModal(true)
                  }}
                  className="text-primary hover:underline"
                >
                  {t('auth.privacyPolicy')}
                </button>
              </span>
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
              {isLoading ? t('auth.creatingAccount') : t('auth.createAccount')}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-background text-muted-foreground">{t('auth.orSignUpWith')}</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <button type="button" className="py-2.5 border border-border rounded-lg hover:bg-accent transition-colors font-medium">
                {t('auth.google')}
              </button>
              <button type="button" className="py-2.5 border border-border rounded-lg hover:bg-accent transition-colors font-medium">
                {t('auth.github')}
              </button>
            </div>
          </form>

          {/* Sign In Link */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {t('auth.alreadyHaveAccount')}{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              {t('common.login')}
            </Link>
          </p>
        </div>
      </div>

      {/* Terms Modal */}
      <TermsModal 
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        type={modalType}
      />
    </div>
  )
}