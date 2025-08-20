import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }
  
  return (
    <div className="relative group">
      <button
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Change language"
      >
        <Globe className="w-5 h-5" />
        <span className="text-sm font-medium">
          {i18n.language === 'tr' ? 'TR' : 'EN'}
        </span>
      </button>
      
      <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        <button
          onClick={() => changeLanguage('en')}
          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors rounded-t-lg ${
            i18n.language === 'en' ? 'bg-gray-100 text-black font-medium' : 'text-gray-700'
          }`}
        >
          English
        </button>
        <button
          onClick={() => changeLanguage('tr')}
          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors rounded-b-lg ${
            i18n.language === 'tr' ? 'bg-gray-100 text-black font-medium' : 'text-gray-700'
          }`}
        >
          Türkçe
        </button>
      </div>
    </div>
  )
}