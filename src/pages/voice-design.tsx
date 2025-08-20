import { useState } from "react"
import { useTranslation } from 'react-i18next'

export default function VoiceDesignPage() {
  const { t } = useTranslation()
  const [prompt, setPrompt] = useState(t('voiceDesign.examplePrompt'))
  const [previewText, setPreviewText] = useState(t('voiceDesign.defaultPreviewText'))

  const voiceProfiles = [
    { name: t('voiceDesign.classicNarrator'), avatar: "🎭", bgColor: "bg-gray-900" },
    { name: t('voiceDesign.radioDJ'), avatar: "🎙️", bgColor: "bg-red-900" },
    { name: t('voiceDesign.audiobookReader'), avatar: "📚", bgColor: "bg-green-900" },
    { name: t('voiceDesign.gruffDetective'), avatar: "🕵️", bgColor: "bg-blue-900" },
    { name: t('voiceDesign.excitedReviewer'), avatar: "⭐", bgColor: "bg-purple-900" }
  ]

  return (
    <div>
      {/* Title */}
      <div className="text-center mb-2">
        <h1 className="mb-2">{t('voice.design')}</h1>
        <p className="text-muted-foreground">{t('voiceDesign.subtitle')}</p>
      </div>

      {/* Prompt Section */}
      <div className="mb-8">
        <h3 className="text-sm font-medium mb-3">{t('voiceDesign.prompt')}</h3>
        <div className="bg-[#fefefe] dark:bg-black/80 dark:backdrop-blur-xl border border-gray-200/80 dark:border-white/10 rounded-2xl p-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-24 bg-transparent resize-none outline-none text-foreground"
          />
          
          {/* Voice Profile Chips */}
          <div className="flex items-center gap-3 mt-4">
            {voiceProfiles.map((profile, index) => (
              <button
                key={index}
                className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-full hover:bg-secondary/80 transition-colors"
              >
                <div className={`w-6 h-6 rounded-full ${profile.bgColor} flex items-center justify-center text-xs`}>
                  {profile.avatar}
                </div>
                <span className="text-xs font-medium">{profile.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Text to Preview Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">{t('voiceDesign.textToPreview')}</h3>
          <button className="text-xs text-muted-foreground hover:text-foreground">
            {t('voiceDesign.autoGenerate')}
          </button>
        </div>
        <div className="bg-[#fefefe] dark:bg-black/80 dark:backdrop-blur-xl border border-gray-200/80 dark:border-white/10 rounded-2xl p-4">
          <textarea
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            className="w-full h-20 bg-transparent resize-none outline-none text-foreground"
          />
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-muted-foreground">0 / 300 {t('music.characters')}</span>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{t('voiceDesign.voiceSlotsRemaining')}: 2/3</span>
              <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                <span className="font-medium">{t('common.generate')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Results */}
      <div className="bg-[#fefefe]/50 dark:bg-black/40 dark:backdrop-blur-xl border border-dashed border-border dark:border-white/10 rounded-xl p-12 text-center">
        <p className="text-muted-foreground">{t('voiceDesign.resultsPlaceholder')}</p>
      </div>
    </div>
  )
}