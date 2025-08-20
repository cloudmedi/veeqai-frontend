import { Settings, LogOut, User, CreditCard, Crown } from "lucide-react"
import { useTranslation } from 'react-i18next'
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import { UserDropdown } from "./user-dropdown"
import LanguageSwitcher from "./language-switcher"
import ThemeSwitcher from "./theme-switcher"
import { useTheme } from "./theme-provider"
import Logo from "./Logo"
import { InstallButton } from "./InstallButton"

export default function Header() {
  const { user, logout } = useAuth()
  const { t, i18n } = useTranslation()
  const { actualTheme } = useTheme()
  const navigate = useNavigate()
  const [showCreditModal, setShowCreditModal] = useState(false)
  const creditDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (creditDropdownRef.current && !creditDropdownRef.current.contains(event.target as Node)) {
        setShowCreditModal(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Helper function to get correct path based on language
  const getPath = (path: string) => {
    if (i18n.language === 'tr') {
      return path === '/' ? '/tr' : `/tr${path}`
    }
    return path
  }

  const handleLogout = () => {
    logout()
    navigate(getPath("/login"))
  }

  return (
    <div className="relative">
    <header className="h-16 border-b border-border dark:border-white/10 bg-card dark:bg-black/80 dark:backdrop-blur-xl flex items-center justify-between px-6 flex-shrink-0 relative z-50">
      <div className="flex items-center gap-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Logo 
            variant={actualTheme === 'dark' ? 'white' : 'black'} 
            width={105} 
            height={35} 
          />
          <div className="h-6 w-px bg-border"></div>
          <span className="text-sm font-medium tracking-wide text-gray-600 dark:text-gray-400 leading-relaxed">
            {i18n.language === 'tr' ? 'Ses Stüdyosu' : 'Sound Studio'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Install Button */}
        <InstallButton />

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Theme Switcher */}
        <ThemeSwitcher />

        {/* Credits */}
        <div className="relative" ref={creditDropdownRef}>
          <button 
            onClick={() => setShowCreditModal(!showCreditModal)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer relative z-50"
          >
            <CreditCard className="h-4 w-4 text-foreground" />
            <span className="text-sm font-semibold tracking-wide text-gray-900 dark:text-white">{user?.credits || 0}</span>
          </button>

          {/* Credit Dropdown */}
          {showCreditModal && (
            <>
              <div 
                className="fixed inset-0 z-40 pointer-events-auto" 
                onClick={() => setShowCreditModal(false)}
              />
              <div className="absolute top-full right-0 mt-2 z-50">
                <div className="bg-[#fefefe] dark:bg-black/90 dark:backdrop-blur-xl border border-gray-200/80 dark:border-white/10 rounded-2xl p-4 w-72 shadow-xl">
                {/* Header */}
                <div className="mb-3">
                  <h3 className="text-sm font-semibold tracking-wide text-gray-900 dark:text-white leading-snug">
                    {i18n.language === 'tr' ? 'Kredi Bilgileri' : 'Credit Information'}
                  </h3>
                </div>

                {/* Credit Summary */}
                <div className="space-y-3">
                  {/* Current Balance */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium tracking-wide text-gray-600 dark:text-gray-400">
                        {i18n.language === 'tr' ? 'Mevcut Bakiye' : 'Current Balance'}
                      </span>
                      <span className="text-lg font-bold tracking-tight text-primary">{user?.credits || 0}</span>
                    </div>
                  </div>

                  {/* This Month Usage */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-accent/50 rounded-lg p-2">
                      <div className="text-sm font-medium tracking-wide text-gray-600 dark:text-gray-400">
                        {i18n.language === 'tr' ? 'Bu Ay' : 'This Month'}
                      </div>
                      <div className="text-sm font-semibold tracking-wide text-gray-900 dark:text-white">1,250</div>
                    </div>
                    <div className="bg-accent/50 rounded-lg p-2">
                      <div className="text-sm font-medium tracking-wide text-gray-600 dark:text-gray-400">
                        {i18n.language === 'tr' ? 'Kalan' : 'Remaining'}
                      </div>
                      <div className="text-sm font-semibold tracking-wide text-gray-900 dark:text-white">{((user?.credits || 0) - 1250 < 0) ? 0 : (user?.credits || 0) - 1250}</div>
                    </div>
                  </div>

                  {/* Recent Transactions */}
                  <div>
                    <h4 className="text-sm font-semibold tracking-wide text-gray-900 dark:text-white leading-snug mb-2">
                      {i18n.language === 'tr' ? 'Son İşlemler' : 'Recent Transactions'}
                    </h4>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between py-1 text-sm">
                        <span>{i18n.language === 'tr' ? 'Metin Seslendirme' : 'Text-to-Speech'}</span>
                        <span className="font-semibold tracking-wide text-red-600">-45</span>
                      </div>
                      <div className="flex items-center justify-between py-1 text-sm">
                        <span>{i18n.language === 'tr' ? 'Ses Klonlama' : 'Voice Cloning'}</span>
                        <span className="font-semibold tracking-wide text-red-600">-2000</span>
                      </div>
                      <div className="flex items-center justify-between py-1 text-sm">
                        <span>{i18n.language === 'tr' ? 'Plan Yenileme' : 'Plan Renewal'}</span>
                        <span className="font-semibold tracking-wide text-green-600">+5000</span>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Upgrade Button */}
        <button 
          onClick={() => navigate(getPath('/pricing'))}
          className="px-4 py-1.5 bg-foreground text-background rounded-md text-sm font-semibold tracking-wide hover:bg-foreground/90 transition-colors"
        >
          {t('header.upgrade')}
        </button>



        {/* User Avatar Dropdown */}
        <UserDropdown
          trigger={
            <button className="w-9 h-9 rounded-full bg-foreground flex items-center justify-center hover:ring-2 hover:ring-primary/20 transition-all">
              <span className="text-background text-sm font-medium">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </button>
          }
          items={[
            { 
              label: user?.name || "User", 
              icon: User,
              onClick: () => {}, 
              disabled: true,
              className: "text-muted-foreground font-medium"
            },
            { 
              label: `${user?.credits || 0} ${t('common.credits')}`, 
              icon: CreditCard,
              onClick: () => {},
              disabled: true,
              className: "text-muted-foreground"
            },
            { 
              label: user?.subscription || 'Free Plan', 
              icon: Crown,
              onClick: () => {},
              disabled: true,
              className: "text-muted-foreground"
            },
            "separator",
            { 
              label: t('settings.title'), 
              icon: Settings,
              onClick: () => navigate(getPath('/settings'))
            },
            { 
              label: t('common.logout'), 
              icon: LogOut,
              onClick: handleLogout,
              className: "text-red-600 hover:text-red-700"
            },
          ]}
        />

      </div>

    </header>
    </div>
  )
}