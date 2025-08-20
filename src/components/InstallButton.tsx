import { Monitor } from 'lucide-react'
import { usePWA } from '@/hooks/usePWA'

export const InstallButton = () => {
  const { isInstalled, installApp } = usePWA()

  if (isInstalled) {
    return null
  }

  const handleInstall = async () => {
    const success = await installApp()
    if (success) {
      console.log('App installed successfully')
    }
  }

  return (
    <button
      onClick={handleInstall}
      className="p-2 hover:bg-accent rounded-lg transition-colors group relative"
      title="Uygulamayı İndir"
    >
      <Monitor className="h-4 w-4 text-foreground" />
    </button>
  )
}