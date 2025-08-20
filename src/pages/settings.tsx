import { useState } from "react"
import { useTranslation } from 'react-i18next'
import { User, Lock, Save, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export default function SettingsPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Form states
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch('${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('veeqai_token')}`
        },
        body: JSON.stringify({ name, email })
      })

      if (response.ok) {
        setSuccess(t('settings.profileUpdateSuccess'))
        // Update local storage
        const userData = JSON.parse(localStorage.getItem('veeqai_user') || '{}')
        userData.name = name
        userData.email = email
        localStorage.setItem('veeqai_user', JSON.stringify(userData))
      } else {
        const errorData = await response.json()
        setError(errorData.error || t('settings.profileUpdateError'))
      }
    } catch (error) {
      setError(t('settings.profileUpdateError'))
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    if (newPassword !== confirmPassword) {
      setError(t('auth.passwordsDontMatch'))
      setIsLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setError(t('auth.passwordTooShort'))
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('veeqai_token')}`
        },
        body: JSON.stringify({ 
          currentPassword, 
          newPassword 
        })
      })

      if (response.ok) {
        setSuccess(t('settings.passwordChangeSuccess'))
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        const errorData = await response.json()
        setError(errorData.error || t('settings.passwordChangeError'))
      }
    } catch (error) {
      setError(t('settings.passwordChangeError'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight mb-2">{t('settings.title')}</h1>
        <p className="font-medium tracking-wide text-gray-600 dark:text-gray-400 leading-relaxed">{t('settings.subtitle')}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="bg-[#fefefe] dark:bg-black/80 dark:backdrop-blur-xl border border-gray-200/80 dark:border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white leading-snug">{t('settings.profileSettings')}</h2>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium tracking-wide text-gray-700 dark:text-gray-300 leading-relaxed mb-2">{t('common.name')}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary transition-colors font-normal tracking-normal text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium tracking-wide text-gray-700 dark:text-gray-300 leading-relaxed mb-2">{t('common.email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:border-primary transition-colors font-normal tracking-normal text-gray-900 dark:text-white"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 font-semibold tracking-wide"
            >
              <Save className="h-4 w-4" />
              {isLoading ? t('common.loading') : t('settings.updateProfile')}
            </button>
          </form>
        </div>

        {/* Password Change */}
        <div className="bg-[#fefefe] dark:bg-black/80 dark:backdrop-blur-xl border border-gray-200/80 dark:border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white leading-snug">{t('settings.passwordSettings')}</h2>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium tracking-wide text-gray-700 dark:text-gray-300 leading-relaxed mb-2">{t('settings.currentPassword')}</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-border rounded-lg focus:outline-none focus:border-primary transition-colors font-normal tracking-normal text-gray-900 dark:text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md p-1 transition-colors"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium tracking-wide text-gray-700 dark:text-gray-300 leading-relaxed mb-2">{t('settings.newPassword')}</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-border rounded-lg focus:outline-none focus:border-primary transition-colors font-normal tracking-normal text-gray-900 dark:text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md p-1 transition-colors"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium tracking-wide text-gray-700 dark:text-gray-300 leading-relaxed mb-2">{t('settings.confirmNewPassword')}</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-border rounded-lg focus:outline-none focus:border-primary transition-colors font-normal tracking-normal text-gray-900 dark:text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md p-1 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 font-semibold tracking-wide"
            >
              <Lock className="h-4 w-4" />
              {isLoading ? t('common.loading') : t('settings.changePassword')}
            </button>
          </form>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm font-medium tracking-wide leading-relaxed">{error}</p>
        </div>
      )}

      {success && (
        <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-600 text-sm font-medium tracking-wide leading-relaxed">{success}</p>
        </div>
      )}
    </div>
  )
}