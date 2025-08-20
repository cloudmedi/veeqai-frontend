import { Link, useLocation } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import { 
  Home, 
  Library, 
  Mic, 
  Music, 
  AudioWaveform, 
  Copy, 
  Volume2,
  Linkedin,
  Twitter,
  Youtube,
  TrendingUp,
  Instagram,
  FileText
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function Sidebar() {
  const location = useLocation()
  const { t, i18n } = useTranslation()

  // Helper function to get correct path based on language
  const getPath = (path: string) => {
    if (i18n.language === 'tr') {
      return path === '/' ? '/tr' : `/tr${path}`
    }
    return path
  }

  const menuItems = [
    { icon: Home, label: t('nav.home'), href: getPath("/") },
    { icon: Library, label: t('nav.voiceLibrary'), href: getPath("/voice-library") },
  ]

  const aiGenerationItems = [
    { icon: Mic, label: t('home.textToSpeech'), href: getPath("/text-to-speech") },
    { icon: Music, label: t('nav.music'), href: getPath("/music"), badge: t('sidebar.beta'), badgeColor: "bg-primary" },
  ]

  const aiToolsItems = [
    { icon: AudioWaveform, label: t('nav.voiceDesign'), href: getPath("/voice-design"), badge: t('sidebar.new'), badgeColor: "bg-green-500" },
    { icon: Copy, label: t('nav.voiceClone'), href: getPath("/voice-clone") },
    { icon: Volume2, label: t('nav.voiceIsolator'), href: getPath("/voice-isolator") },
  ]

  const socialItems = [
    { icon: FileText, href: "#" },
    { icon: Linkedin, href: "#" },
    { icon: Twitter, href: "#" },
    { icon: Youtube, href: "#" },
    { icon: TrendingUp, href: "#" },
    { icon: Instagram, href: "#" }
  ]

  const renderMenuItem = (item: any) => {
    // Check if current path matches item href (considering language prefix)
    const currentPath = location.pathname
    const isActive = currentPath === item.href
    
    return (
      <Link
        key={item.href}
        to={item.href}
        className={cn(
          "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          isActive
            ? "bg-background text-foreground"
            : "text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/10"
        )}
      >
        <div className="flex items-center gap-3">
          <item.icon className="h-5 w-5" />
          <span>{item.label}</span>
        </div>
        {item.badge && (
          <span className={cn(
            "px-2 py-0.5 text-xs font-medium rounded-full",
            item.badgeColor === "bg-primary" 
              ? "bg-primary text-primary-foreground" 
              : `${item.badgeColor} text-white`
          )}>
            {item.badge}
          </span>
        )}
      </Link>
    )
  }

  return (
    <aside className="w-64 bg-white dark:bg-black/80 dark:backdrop-blur-xl border-r border-gray-200 dark:border-white/10 flex flex-col flex-shrink-0">
      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Main Menu */}
        <div className="space-y-1">
          {menuItems.map(renderMenuItem)}
        </div>

        {/* AI Generation */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2">
            {t('sidebar.aiGeneration')}
          </p>
          {aiGenerationItems.map(renderMenuItem)}
        </div>

        {/* AI Tools */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2">
            {t('sidebar.aiTools')}
          </p>
          {aiToolsItems.map(renderMenuItem)}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-200 dark:border-white/10 space-y-4">
        <Link 
          to={getPath("/pricing")}
          className="w-full py-2 px-4 border border-black dark:border-white text-black dark:text-white rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-sm font-medium inline-block text-center"
        >
          {t('sidebar.subscribe')}
        </Link>
        
        <div className="text-center">
          <Link to="/api" className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
            {t('sidebar.accessAPI')}
          </Link>
        </div>

        {/* Social Icons */}
        <div className="flex items-center justify-center gap-2">
          {socialItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="p-1.5 hover:bg-gray-50 dark:hover:bg-white/10 rounded-md transition-colors"
            >
              <item.icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </a>
          ))}
        </div>

        {/* Footer Links */}
        <div className="text-center space-y-1">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {t('sidebar.aboutVeeqAI')} • {t('auth.termsOfService')}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {t('auth.privacyPolicy')} • @VeeqAI 2025
          </div>
        </div>
      </div>
    </aside>
  )
}