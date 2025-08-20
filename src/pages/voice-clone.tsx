import { useState } from "react"
import { useTranslation } from 'react-i18next'
import { Upload, Mic, Info, X } from "lucide-react"
import { Dropdown } from "@/components/dropdown"

export default function VoiceClonePage() {
  const { t } = useTranslation()
  const [uploadedSamples] = useState(0)
  const [removeBackground, setRemoveBackground] = useState(false)
  const [enableAccent, setEnableAccent] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState(t('home.english'))
  const [previewText, setPreviewText] = useState(
    t('voiceClone.defaultPreviewText')
  )

  const languages = [t('home.english'), t('home.spanish'), t('home.french'), t('voiceClone.german'), t('voiceClone.chinese'), t('voiceClone.japanese'), t('voiceClone.korean'), t('voiceClone.arabic')]

  return (
    <div>
      {/* Title */}
      <div className="text-center mb-2">
        <h1 className="mb-2">{t('voice.clone')}</h1>
        <p className="text-muted-foreground">{t('voiceClone.subtitle')}</p>
      </div>

      {/* Import Voice Section */}
      <div className="mb-8">
        <h3 className="text-sm font-medium mb-4">{t('voiceClone.importVoice')}</h3>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Upload File */}
          <div className="bg-[#fefefe] dark:bg-black/80 dark:backdrop-blur-xl border-2 border-dashed border-border dark:border-white/10 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
            <Upload className="h-12 w-12 mx-auto mb-3 text-primary" />
            <p className="font-medium mb-1">{t('voiceClone.addDropFile')}</p>
            <p className="text-xs text-muted-foreground">{t('voiceClone.fileSize')}</p>
          </div>

          {/* Record Audio */}
          <div className="bg-[#fefefe] dark:bg-black/80 dark:backdrop-blur-xl border-2 border-dashed border-border dark:border-white/10 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
            <Mic className="h-12 w-12 mx-auto mb-3 text-primary" />
            <p className="font-medium mb-1">{t('voice.record')}</p>
            <p className="text-xs text-muted-foreground">{t('voiceClone.recordDuration')}</p>
          </div>
        </div>

        {/* Uploaded Samples Counter */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{t('voiceClone.uploadedSamples')}</span>
            <span className="text-sm text-muted-foreground">{uploadedSamples}/10</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all"
              style={{ width: `${(uploadedSamples / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
          <div className="flex gap-3">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="text-sm text-muted-foreground space-y-2">
              <p>{t('voiceClone.infoText1')}</p>
              <p>{t('voiceClone.infoText2')}</p>
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="mt-6">
          <h3 className="text-sm font-medium mb-3">{t('voiceClone.advancedSettings')}</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={removeBackground}
                onChange={(e) => setRemoveBackground(e.target.checked)}
                className="w-4 h-4 rounded border-border"
              />
              <span className="text-sm">{t('voiceClone.removeBackgroundNoise')}</span>
              <Info className="h-3 w-3 text-muted-foreground" />
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={enableAccent}
                onChange={(e) => setEnableAccent(e.target.checked)}
                className="w-4 h-4 rounded border-border"
              />
              <span className="text-sm">{t('voiceClone.enableAccentOptimization')}</span>
              <Info className="h-3 w-3 text-muted-foreground" />
            </label>
          </div>
        </div>
      </div>

      {/* Text to Preview */}
      <div className="mb-8">
        <h3 className="text-sm font-medium mb-3">{t('voiceDesign.textToPreview')}</h3>
        <div className="bg-[#fefefe] dark:bg-black/80 dark:backdrop-blur-xl border border-gray-200/80 dark:border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <Dropdown
              value={selectedLanguage}
              options={languages}
              onChange={setSelectedLanguage}
            />
            <button className="ml-auto p-1">
              <X className="h-4 w-4" />
            </button>
          </div>
          <textarea
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            className="w-full h-20 bg-transparent resize-none outline-none text-foreground"
          />
          <div className="mt-3">
            <span className="text-xs text-muted-foreground">151 / 300 {t('music.characters')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}