import { Sun, Moon, Monitor } from "lucide-react"
import { useTranslation } from 'react-i18next'
import { useTheme } from "./theme-provider"
import { UserDropdown } from "./user-dropdown"

export default function ThemeSwitcher() {
  const { theme, actualTheme, setTheme } = useTheme()
  const { t } = useTranslation()

  const getThemeIcon = () => {
    if (theme === "system") {
      return <Monitor className="h-4 w-4" />
    }
    return actualTheme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />
  }

  return (
    <UserDropdown
      trigger={
        <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-accent transition-colors">
          {getThemeIcon()}
        </button>
      }
      items={[
        {
          label: t('settings.light'),
          icon: Sun,
          onClick: () => setTheme("light"),
          className: theme === "light" ? "text-primary font-medium" : ""
        },
        {
          label: t('settings.dark'),
          icon: Moon,
          onClick: () => setTheme("dark"),
          className: theme === "dark" ? "text-primary font-medium" : ""
        },
        {
          label: t('settings.system'),
          icon: Monitor,
          onClick: () => setTheme("system"),
          className: theme === "system" ? "text-primary font-medium" : ""
        }
      ]}
    />
  )
}