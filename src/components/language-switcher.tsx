import { useTranslation } from 'react-i18next'
import { Languages, Check } from 'lucide-react'
import { UserDropdown } from './user-dropdown'

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' }
]

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0]

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode)
    localStorage.setItem('language', langCode)
  }

  return (
    <UserDropdown
      trigger={
        <button className="p-2 hover:bg-accent rounded-lg transition-colors flex items-center gap-2">
          <Languages className="h-4 w-4" />
          <span className="text-sm">{currentLanguage.flag}</span>
        </button>
      }
      items={languages.map(lang => ({
        label: `${lang.flag} ${lang.name}`,
        onClick: () => changeLanguage(lang.code),
        icon: i18n.language === lang.code ? Check : undefined
      }))}
    />
  )
}