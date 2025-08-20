import { Upload } from "lucide-react"
import { useTranslation } from 'react-i18next'

export default function VoiceIsolatorPage() {
  const { t } = useTranslation()
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="mb-2">{t('voice.isolator')}</h1>
        <p className="text-muted-foreground">{t('voiceIsolator.subtitle')}</p>
      </div>

      {/* Upload Section */}
      <div className="bg-[#fefefe] dark:bg-black/80 dark:backdrop-blur-xl border-2 border-dashed border-border dark:border-white/10 rounded-xl p-16 text-center">
        <Upload className="h-16 w-16 mx-auto mb-4 text-primary" />
        <p className="text-lg font-medium mb-2">{t('voiceIsolator.uploadDescription')}</p>
        
        <div className="flex items-center justify-center gap-4 mt-6">
          <button className="px-6 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors">
            {t('voiceIsolator.uploadAudio')}
          </button>
          <button className="px-6 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors">
            {t('voice.record')}
          </button>
        </div>
      </div>
    </div>
  )
}