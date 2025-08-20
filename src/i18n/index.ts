import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import tr from './locales/tr.json'

const resources = {
  en: {
    translation: en
  },
  tr: {
    translation: tr
  }
}

// Geographic and browser-based language detection
const detectUserLanguage = (): string => {
  // 1. Check URL path for language prefix (/tr, /en)
  const pathLang = window.location.pathname.split('/')[1]
  if (pathLang === 'tr' || pathLang === 'en') {
    return pathLang
  }

  // 2. Check saved user preference
  const savedLang = localStorage.getItem('language')
  if (savedLang && (savedLang === 'tr' || savedLang === 'en')) {
    return savedLang
  }

  // 3. Browser language detection
  const browserLang = navigator.language.toLowerCase()
  if (browserLang.startsWith('tr')) {
    return 'tr'
  }

  // 4. Geographic detection via timezone (Turkey -> Turkish)
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (timezone === 'Europe/Istanbul' || timezone === 'Asia/Istanbul') {
      return 'tr'
    }
  } catch (error) {
    console.warn('Timezone detection failed:', error)
  }

  // Default: English
  return 'en'
}

const initialLanguage = detectUserLanguage()

// Function to update URL based on language
const updateUrlForLanguage = (lng: string) => {
  const currentPath = window.location.pathname
  const pathParts = currentPath.split('/')
  
  // Remove existing language prefix if present
  if (pathParts[1] === 'tr' || pathParts[1] === 'en') {
    pathParts.splice(1, 1)
  }
  
  // Add Turkish prefix for Turkish language
  if (lng === 'tr') {
    pathParts.splice(1, 0, 'tr')
  }
  
  const newPath = pathParts.join('/') || '/'
  
  // Update URL without page reload
  if (window.location.pathname !== newPath) {
    window.history.replaceState(null, '', newPath)
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage,
    fallbackLng: 'en',
    debug: false, // Disable i18n debug logs
    
    interpolation: {
      escapeValue: false
    },
    
    react: {
      useSuspense: false
    }
  })

// Update URL for initial language if it's not already in URL
if (initialLanguage === 'tr' && !window.location.pathname.startsWith('/tr')) {
  updateUrlForLanguage(initialLanguage)
}

// Handle language changes and URL updates
i18n.on('languageChanged', (lng) => {
  updateUrlForLanguage(lng)
  // Save language preference
  localStorage.setItem('language', lng)
})

export default i18n