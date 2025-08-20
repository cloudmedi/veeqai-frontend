import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { useLocation } from "react-router-dom"
import { Play, Pause, Download, Loader2, RotateCcw, Copy, Check, Mic2, Upload, X, History, Search, Trash2, Calendar } from "lucide-react"
import { usePlayer } from "@/components/layout"
import { usePreferencesStore } from "@/stores/preferences-store"
import { useAuth } from "@/contexts/AuthContext"
import { useTranslation } from "react-i18next"

export default function TextToSpeechPage() {
  const { t } = useTranslation()
  const location = useLocation()
  const { setPlayingVoice, playingVoice, isPlaying, togglePlay } = usePlayer()
  
  const { token } = useAuth()
  const { 
    preferences, 
    setSelectedVoice, 
 
  } = usePreferencesStore()
  
  const [text, setText] = useState("")
  const [voices, setVoices] = useState<any[]>([])
  const [generating, setGenerating] = useState(false)
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null)
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [, setSearchQuery] = useState("")
  const [selectedTab, setSelectedTab] = useState("")
  const [filterLanguage, setFilterLanguage] = useState("")
  const [filterAccent, setFilterAccent] = useState("")
  const [filterGender, setFilterGender] = useState("")
  const [filterAge, setFilterAge] = useState("")
  const [showCopyTooltip, setShowCopyTooltip] = useState(false)
  const [copiedVoiceId, setCopiedVoiceId] = useState<string | null>(null)
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [availableMoods, setAvailableMoods] = useState<any[]>([])
  const [showMoodDropdown, setShowMoodDropdown] = useState(false)
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)
  const [showAccentDropdown, setShowAccentDropdown] = useState(false)
  const [showGenderDropdown, setShowGenderDropdown] = useState(false)
  const [showAgeDropdown, setShowAgeDropdown] = useState(false)
  const [speedValue, setSpeedValue] = useState(1)
  const [pitchValue, setPitchValue] = useState(0)
  const [volumeValue, setVolumeValue] = useState(1)
  const [selectedLanguage, setSelectedLanguage] = useState('tr')
  const [showTTSLanguageDropdown, setShowTTSLanguageDropdown] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [historySearch, setHistorySearch] = useState("")
  
  // Sample history data
  const historyData = [
    {
      id: 1,
      text: "Bu metin VeeqAI ile üretilmiş örnek bir konuşma metnidir. Türkçe seslendirilmiştir.",
      voice: "Süper Annem",
      language: "Türkçe",
      time: "2 saat önce",
      characters: 45,
      color: "bg-purple-500"
    },
    {
      id: 2,
      text: "This is an English text sample generated with VeeqAI's advanced text-to-speech technology.",
      voice: "Professional Voice",
      language: "English",
      time: "5 saat önce",
      characters: 92,
      color: "bg-blue-500"
    },
    {
      id: 3,
      text: "Voici un exemple de texte français généré avec la technologie de synthèse vocale de VeeqAI.",
      voice: "Elegant Lady",
      language: "Français",
      time: "Dün",
      characters: 96,
      color: "bg-green-500"
    }
  ]
  
  // Filter history based on search
  const filteredHistory = historyData.filter(item =>
    item.text.toLowerCase().includes(historySearch.toLowerCase()) ||
    item.voice.toLowerCase().includes(historySearch.toLowerCase()) ||
    item.language.toLowerCase().includes(historySearch.toLowerCase())
  )

  // Initialize filter values with translations
  useEffect(() => {
    if (filterLanguage === "") {
      setFilterLanguage(t('voice.filters.language'))
      setFilterAccent(t('voice.filters.accent'))
      setFilterGender(t('voice.filters.gender'))
      setFilterAge(t('voice.filters.age'))
      setSelectedTab(t('voice.tabs.library'))
    }
  }, [t, filterLanguage])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('[data-dropdown]')) {
        setShowLanguageDropdown(false)
        setShowAccentDropdown(false)
        setShowGenderDropdown(false)
        setShowAgeDropdown(false)
        setShowMoodDropdown(false)
        setShowTTSLanguageDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Get current voice from preferences
  const selectedVoice = preferences?.voice.selectedVoice
  const selectedVoiceId = preferences?.voice.selectedVoiceId

  // Language mapping
  const getLanguageDisplay = (langCode: string) => {
    const languageMap: { [key: string]: string } = {
      'tr': 'Türkçe',
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese',
      'ar': 'Arabic'
    }
    return languageMap[langCode] || langCode
  }

  // Mood translation mapping
  const getMoodDisplay = (mood: string) => {
    const moodMap: { [key: string]: string } = {
      'calm': t('voice.moods.calm'),
      'excited': t('voice.moods.excited'),
      'sad': t('voice.moods.sad'),
      'angry': t('voice.moods.angry'),
      'neutral': t('voice.moods.neutral'),
      'happy': t('voice.moods.happy')
    }
    return moodMap[mood.toLowerCase()] || mood.charAt(0).toUpperCase() + mood.slice(1)
  }

  // TTS Language options
  const ttsLanguages = [
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' }
  ]

  const getSelectedLanguage = () => {
    return ttsLanguages.find(lang => lang.code === selectedLanguage) || ttsLanguages[0]
  }

  useEffect(() => {
    fetchVoices()
  }, [])

  // Check for voice selection from URL params (from Voice Library navigation)
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const voiceIdParam = urlParams.get('voiceId')
    
    if (voiceIdParam && voices.length > 0) {
      const voiceFromUrl = voices.find(v => v._id === voiceIdParam)
      if (voiceFromUrl) {
        setSelectedVoice(voiceFromUrl._id, voiceFromUrl)
        // Clear URL params
        window.history.replaceState({}, '', window.location.pathname)
      }
    }
  }, [location.search, voices, setSelectedVoice])

  // Sync with preferences when voices are loaded but no voice selected
  useEffect(() => {
    if (selectedVoiceId && voices.length > 0 && !selectedVoice) {
      const preferencesVoice = voices.find(v => v._id === selectedVoiceId)
      if (preferencesVoice) {
        setSelectedVoice(preferencesVoice._id, preferencesVoice)
      }
    }
  }, [selectedVoiceId, voices, selectedVoice, setSelectedVoice])

  // Fetch moods when voice changes
  useEffect(() => {
    if (selectedVoice && selectedVoice.isGroup) {
      setAvailableMoods(selectedVoice.moods || [])
      setSelectedMood(selectedVoice.moods?.[0]?.mood || null)
    } else {
      setAvailableMoods([])
      setSelectedMood(null)
    }
  }, [selectedVoice])

  const fetchVoices = async () => {
    try {
      // Grouped voices API kullan
      const response = await fetch('${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/voices/list-grouped', {
        method: 'GET',
        credentials: 'omit', // CSRF token gereksinimini bypass et
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      const data = await response.json()
      console.log('Fetched voices:', data) // Debug için
      
      if (data.success && data.voices) {
        setVoices(data.voices)
        console.log('Total voices fetched:', data.voices.length)
        
        // İlk voice'u seç sadece hiçbir seçim yoksa
        if (data.voices.length > 0 && !selectedVoice) {
          console.log('Setting first voice as default:', data.voices[0])
          setSelectedVoice(data.voices[0]._id, data.voices[0])
        }
      } else {
        console.error('Backend response error:', data)
      }
    } catch (error) {
      console.error('Voice fetch network error:', error)
    }
  }

  const generateSpeech = async () => {
    if (!text || !selectedVoice) {
      alert(t('textToSpeech.pleaseEnterTextAndSelectVoice'))
      return
    }

    setGenerating(true)
    try {
      const response = await fetch('${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/voices/generate-tts', {
        method: 'POST',
        credentials: 'omit', // CSRF bypass
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          text: text,
          voiceId: selectedVoice.isGroup ? selectedVoice.name : (selectedVoice._id || selectedVoice.name),
          mood: selectedMood
        })
      })

      const data = await response.json()
      if (data.success && data.audioUrl) {
        setGeneratedAudio(data.audioUrl)
        // Auto play
        setPlayingVoice({
          name: selectedVoice.name,
          audioUrl: data.audioUrl,
          displayName: `${selectedVoice.name} - TTS`,
          artworkUrl: selectedVoice.artwork
        })
      } else {
        alert(data.error || t('textToSpeech.speechGenerationFailed'))
      }
    } catch (error) {
      alert(t('common.error'))
    } finally {
      setGenerating(false)
    }
  }

  const playVoicePreview = async (voice: any) => {
    // Check if this voice is already playing
    if (playingVoice?.name === voice.name && isPlaying) {
      // Pause current voice
      togglePlay()
      return
    }
    
    if (playingVoice?.name === voice.name && !isPlaying) {
      // Resume current voice
      togglePlay()
      return
    }

    // For multi-mood groups, play first available mood
    if (voice.isGroup && voice.moods && voice.moods.length > 0) {
      const firstMood = voice.moods[0]
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/voices/preview/${firstMood._id}`, {
          credentials: 'omit'
        })
        const data = await response.json()
        if (data.success && data.previewUrl) {
          setPlayingVoice({
            name: data.name,
            audioUrl: data.previewUrl,
            displayName: data.name,
            artworkUrl: voice.artwork
          })
          return
        }
      } catch (error) {
        // Fallback to direct audio
        setPlayingVoice({
          name: voice.name,
          audioUrl: firstMood.audioFile,
          displayName: voice.name,
          artworkUrl: voice.artwork
        })
        return
      }
    }

    // For single voices
    if (voice._id) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/voices/preview/${voice._id}`, {
          credentials: 'omit'
        })
        const data = await response.json()
        if (data.success && data.previewUrl) {
          setPlayingVoice({
            name: data.name,
            audioUrl: data.previewUrl,
            displayName: data.name,
            artworkUrl: voice.artwork
          })
          return
        }
      } catch (error) {
        // Fallback to direct audio
        setPlayingVoice({
          name: voice.name,
          audioUrl: voice.audioFile || voice.previewUrl || '',
          displayName: voice.name,
          artworkUrl: voice.artwork
        })
      }
    }
  }

  return (
    <>
      <style>{`
        /* Text-to-speech sayfasında scroll kapat */
        main {
          overflow: hidden !important;
        }
        .slider-custom::-webkit-slider-track {
          background: transparent;
        }
        .slider-custom::-webkit-slider-thumb {
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: black;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
        .dark .slider-custom::-webkit-slider-thumb {
          background: white;
        }
        /* Voice Selection Modal - Remove blue focus */
        select:focus, select:focus-visible, select:active {
          outline: none !important;
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2) !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
        }
        select option {
          background: hsl(var(--background)) !important;
          color: hsl(var(--foreground)) !important;
        }
        select option:checked {
          background: rgba(255, 255, 255, 0.1) !important;
          color: white !important;
        }
      `}</style>
      <div className="h-[calc(100%-160px)] flex gap-6">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Text Input Area */}
        <div className={`bg-[#fefefe] dark:bg-black/80 dark:backdrop-blur-xl border border-gray-200/80 dark:border-white/10 rounded-2xl p-6 flex flex-col relative ${playingVoice ? 'h-[calc(100vh-200px)]' : 'h-[calc(100vh-110px)]'}`}>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white leading-tight mb-6">{t('textToSpeech.title')}</h1>
          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center justify-center p-2 border border-border rounded-lg hover:bg-accent transition-colors"
              title="Upload Document"
            >
              <Upload className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowHistoryModal(true)}
              className="flex items-center justify-center p-2 border border-border rounded-lg hover:bg-accent transition-colors"
              title="History"
            >
              <History className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('textToSpeech.placeholder')}
              className="w-full h-full bg-transparent resize-none focus:outline-none text-lg font-normal leading-relaxed tracking-normal placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white pr-16"
              maxLength={5000}
            />
          </div>
          
          {/* Bottom Controls */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-3">
              <button
                onClick={generateSpeech}
                disabled={generating || !text || !selectedVoice}
                className="flex items-center gap-2 px-6 py-2 bg-foreground text-background rounded-lg font-semibold tracking-wide hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('textToSpeech.generating')}
                  </>
                ) : (
                  <>{t('common.create')}</>
                )}
              </button>
              
              {generatedAudio && (
                <a
                  href={generatedAudio}
                  download
                  className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/80 rounded-lg font-medium tracking-wide transition-colors"
                >
                  <Download className="h-4 w-4" />
                  {t('common.download')}
                </a>
              )}
              
              {text && (
                <button
                  onClick={() => {
                    setText("")
                    setGeneratedAudio(null)
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-border hover:bg-accent rounded-lg font-medium tracking-wide transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  {t('common.clear')}
                </button>
              )}
            </div>
            
            <div className="text-sm font-medium tracking-wide text-gray-600 dark:text-gray-400 flex items-center gap-4">
              <span>{text.length} / 5,000 {t('textToSpeech.characters')}</span>
              <span>{text.trim().split(/\s+/).filter(word => word.length > 0).length} {t('common.words')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      <div className="w-96">
        <div className={`bg-[#fefefe] dark:bg-black/80 dark:backdrop-blur-xl border border-gray-200/80 dark:border-white/10 rounded-2xl p-6 ${playingVoice ? 'h-[calc(100vh-200px)]' : 'h-[calc(100vh-110px)]'}`}>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white leading-tight mb-6">{t('textToSpeech.settings')}</h1>
          {/* Voice Selection */}
          <div className="space-y-3 mb-6">
            <label className="text-sm font-medium tracking-wide text-gray-700 dark:text-gray-300 leading-relaxed">{t('textToSpeech.model')}</label>
            {selectedVoice && (
              <div 
                onClick={() => setShowVoiceModal(true)}
                className="w-full flex items-center gap-3 p-3 bg-background border border-border rounded-lg hover:bg-accent transition-colors cursor-pointer">
                <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-purple-600/20 relative group cursor-pointer">
                  {selectedVoice.artwork ? (
                    <img 
                      src={selectedVoice.artwork} 
                      alt={selectedVoice.name}
                      className={`w-full h-full object-cover transition-all duration-300 group-hover:blur-sm ${
                        playingVoice?.name === selectedVoice.name && isPlaying ? 'blur-sm' : ''
                      }`}
                    />
                  ) : (
                    <div className="text-lg">
                      {selectedVoice.gender === 'male' ? '🌊' : selectedVoice.gender === 'female' ? '🌸' : '💎'}
                    </div>
                  )}
                  
                  {/* Play/Pause Overlay */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      playVoicePreview(selectedVoice)
                    }}
                    className={`absolute inset-0 rounded-lg flex items-center justify-center transition-opacity ${
                      playingVoice?.name === selectedVoice.name ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    {playingVoice?.name === selectedVoice.name && isPlaying ? (
                      <Pause className="h-4 w-4 text-white" />
                    ) : (
                      <Play className="h-4 w-4 text-white" />
                    )}
                  </button>
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-semibold tracking-wide leading-snug text-gray-900 dark:text-white">{selectedVoice.name}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-foreground text-background rounded-full text-xs">
                    {selectedVoice.language ? getLanguageDisplay(selectedVoice.language) : 'Türkçe'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigator.clipboard.writeText(selectedVoice._id)
                      setShowCopyTooltip(true)
                      setTimeout(() => setShowCopyTooltip(false), 2000)
                    }}
                    className="p-1 hover:bg-accent rounded relative group"
                  >
                    {showCopyTooltip ? (
                      <Check className="h-4 w-4 text-foreground" strokeWidth={3} />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    )}
                    {/* Tooltip - sadece copy modunda */}
                    {!showCopyTooltip && (
                      <div className="absolute bottom-full right-0 mb-2 px-2 py-1 border rounded text-xs whitespace-nowrap transition-all z-50 shadow-md max-w-none opacity-0 group-hover:opacity-100 bg-background dark:bg-black/80 dark:backdrop-blur-xl border-border dark:border-white/10 text-foreground">
                        {`ID: ${selectedVoice._id}`}
                      </div>
                    )}
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowVoiceModal(true)
                    }}
                    className="p-1 hover:bg-accent rounded relative group"
                  >
                    <Mic2 className="h-4 w-4 text-muted-foreground" />
                    {/* Change Voice Tooltip */}
                    <div className="absolute bottom-full right-0 mb-2 px-2 py-1 border rounded text-xs whitespace-nowrap transition-all z-50 shadow-md max-w-none opacity-0 group-hover:opacity-100 bg-background dark:bg-black/80 dark:backdrop-blur-xl border-border dark:border-white/10 text-foreground">
                      {t('voice.selection.changeVoice')}
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mood Selector for Multi-mood voices */}
          {selectedVoice && selectedVoice.isGroup && availableMoods.length > 0 && (
            <div className="space-y-3 mb-6">
              <label className="text-sm font-medium tracking-wide text-gray-700 dark:text-gray-300 leading-relaxed">{t('voice.selection.mood')}</label>
              <div className="relative" data-dropdown>
                <button
                  onClick={() => setShowMoodDropdown(!showMoodDropdown)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent text-left flex items-center justify-between"
                >
                  <span>
                    {selectedMood ? getMoodDisplay(selectedMood) : t('voice.selection.selectMood')}
                  </span>
                  <svg className={`w-4 h-4 transition-transform ${showMoodDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showMoodDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                    {availableMoods.map((moodObj) => (
                      <button
                        key={moodObj.mood}
                        onClick={() => {
                          setSelectedMood(moodObj.mood)
                          setShowMoodDropdown(false)
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors first:rounded-t-lg last:rounded-b-lg"
                      >
                        {getMoodDisplay(moodObj.mood)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TTS Language */}
          <div className="space-y-3 mb-6">
            <label className="text-sm font-medium tracking-wide text-gray-700 dark:text-gray-300 leading-relaxed">Language</label>
            <div className="relative" data-dropdown>
              <button
                onClick={() => setShowTTSLanguageDropdown(!showTTSLanguageDropdown)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent text-left flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span>{getSelectedLanguage().flag}</span>
                  <span>{getSelectedLanguage().name}</span>
                </div>
                <svg className={`w-4 h-4 transition-transform ${showTTSLanguageDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showTTSLanguageDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background dark:bg-black/80 dark:backdrop-blur-xl border border-border dark:border-white/10 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                  {ttsLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSelectedLanguage(lang.code)
                        setShowTTSLanguageDropdown(false)
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Emotion */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium tracking-wide text-gray-700 dark:text-gray-300 leading-relaxed">{t('voice.selection.emotion')}</label>
              <span className="text-xs text-primary dark:text-white">{t('voice.selection.limitedTimeFree')}</span>
            </div>
            <div className="text-sm font-medium tracking-wide text-gray-600 dark:text-gray-400 leading-relaxed">{t('voice.selection.auto')}</div>
          </div>

          {/* Speed */}
          <div className="space-y-3 mb-6">
            <label className="text-sm font-medium tracking-wide text-gray-700 dark:text-gray-300 leading-relaxed">{t('voice.selection.speed')}</label>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium tracking-wide text-gray-900 dark:text-white">{speedValue}</span>
              <input 
                type="range" 
                min="0.5" 
                max="2" 
                step="0.1" 
                value={speedValue}
                onChange={(e) => setSpeedValue(parseFloat(e.target.value))}
                className="flex-1 h-1 bg-gray-200 dark:bg-white/10 rounded-full appearance-none slider-custom"
              />
            </div>
          </div>

          {/* Pitch */}
          <div className="space-y-3 mb-6">
            <label className="text-sm font-medium tracking-wide text-gray-700 dark:text-gray-300 leading-relaxed">{t('voice.selection.pitch')}</label>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium tracking-wide text-gray-900 dark:text-white">{pitchValue}</span>
              <input 
                type="range" 
                min="-1" 
                max="1" 
                step="0.1" 
                value={pitchValue}
                onChange={(e) => setPitchValue(parseFloat(e.target.value))}
                className="flex-1 h-1 bg-gray-200 dark:bg-white/10 rounded-full appearance-none slider-custom"
              />
            </div>
          </div>

          {/* Volume */}
          <div className="space-y-3 mb-6">
            <label className="text-sm font-medium tracking-wide text-gray-700 dark:text-gray-300 leading-relaxed">{t('voice.selection.volume')}</label>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium tracking-wide text-gray-900 dark:text-white">{volumeValue}</span>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={volumeValue}
                onChange={(e) => setVolumeValue(parseFloat(e.target.value))}
                className="flex-1 h-1 bg-gray-200 dark:bg-white/10 rounded-full appearance-none slider-custom"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Voice Selection Modal */}
      {showVoiceModal && createPortal(
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-300"
          onClick={() => {
            setShowVoiceModal(false)
            setSearchQuery("")
          }}
        >
          <div 
            className="bg-[#fefefe] dark:bg-black/80 dark:backdrop-blur-xl border border-gray-200/80 dark:border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-border dark:border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">{t('voice.selection.title')}</h2>
                <button 
                  onClick={() => {
                    setShowVoiceModal(false)
                    setSearchQuery("")
                  }}
                  className="text-xl text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-6 pt-4">
              <div className="flex space-x-8 border-b border-border dark:border-white/10">
                {[t('voice.tabs.library'), t('voice.tabs.myVoices'), t('voice.tabs.collectedVoices')].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className={`pb-2 text-sm font-semibold tracking-wide transition-colors ${
                      selectedTab === tab
                        ? 'text-foreground border-b-2 border-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="p-6 grid grid-cols-4 gap-4">
              <div className="relative" data-dropdown>
                <button
                  onClick={() => {
                    setShowLanguageDropdown(!showLanguageDropdown)
                    setShowAccentDropdown(false)
                    setShowGenderDropdown(false) 
                    setShowAgeDropdown(false)
                  }}
                  className="w-full px-3 py-2 bg-background dark:bg-black/80 border border-border dark:border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent text-left flex items-center justify-between"
                >
                  <span>{filterLanguage}</span>
                  <svg className={`w-4 h-4 transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showLanguageDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-background dark:bg-black/80 dark:backdrop-blur-xl border border-border dark:border-white/10 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                    {[t('voice.filters.language'), t('voice.selection.filterOptions.turkish'), t('voice.selection.filterOptions.english')].map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setFilterLanguage(option)
                          setShowLanguageDropdown(false)
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors first:rounded-t-lg last:rounded-b-lg"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="relative" data-dropdown>
                <button
                  onClick={() => {
                    setShowAccentDropdown(!showAccentDropdown)
                    setShowLanguageDropdown(false)
                    setShowGenderDropdown(false)
                    setShowAgeDropdown(false)
                  }}
                  className="w-full px-3 py-2 bg-background dark:bg-black/80 border border-border dark:border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent text-left flex items-center justify-between"
                >
                  <span>{filterAccent}</span>
                  <svg className={`w-4 h-4 transition-transform ${showAccentDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showAccentDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-background dark:bg-black/80 dark:backdrop-blur-xl border border-border dark:border-white/10 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                    {[t('voice.filters.accent'), t('voice.selection.filterOptions.standard'), t('voice.selection.filterOptions.regional')].map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setFilterAccent(option)
                          setShowAccentDropdown(false)
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors first:rounded-t-lg last:rounded-b-lg"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="relative" data-dropdown>
                <button
                  onClick={() => {
                    setShowGenderDropdown(!showGenderDropdown)
                    setShowLanguageDropdown(false)
                    setShowAccentDropdown(false)
                    setShowAgeDropdown(false)
                  }}
                  className="w-full px-3 py-2 bg-background dark:bg-black/80 border border-border dark:border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent text-left flex items-center justify-between"
                >
                  <span>{filterGender}</span>
                  <svg className={`w-4 h-4 transition-transform ${showGenderDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showGenderDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-background dark:bg-black/80 dark:backdrop-blur-xl border border-border dark:border-white/10 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                    {[t('voice.filters.gender'), t('voice.filters.male'), t('voice.filters.female'), t('voice.filters.neutral')].map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setFilterGender(option)
                          setShowGenderDropdown(false)
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors first:rounded-t-lg last:rounded-b-lg"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="relative" data-dropdown>
                <button
                  onClick={() => {
                    setShowAgeDropdown(!showAgeDropdown)
                    setShowLanguageDropdown(false)
                    setShowAccentDropdown(false)
                    setShowGenderDropdown(false)
                  }}
                  className="w-full px-3 py-2 bg-background dark:bg-black/80 border border-border dark:border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent text-left flex items-center justify-between"
                >
                  <span>{filterAge}</span>
                  <svg className={`w-4 h-4 transition-transform ${showAgeDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {showAgeDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-background dark:bg-black/80 dark:backdrop-blur-xl border border-border dark:border-white/10 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                    {[t('voice.filters.age'), t('voice.filters.child'), t('voice.filters.young'), t('voice.filters.adult'), t('voice.filters.senior')].map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setFilterAge(option)
                          setShowAgeDropdown(false)
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors first:rounded-t-lg last:rounded-b-lg"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Voice List */}
            <div className="px-6 pb-6 overflow-y-auto max-h-[50vh]">
              <div className="space-y-3">
                {voices
                  .sort((a, b) => {
                    // Seçili voice her zaman en başta
                    if (selectedVoice?._id === a._id) return -1;
                    if (selectedVoice?._id === b._id) return 1;
                    return 0;
                  })
                  .map((voice) => (
                  <div
                    key={voice._id}
                    className="flex items-center gap-4 p-4 rounded-lg border border-border dark:border-white/10 hover:border-primary/50 transition-colors"
                  >
                    {/* Avatar */}
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex-shrink-0 group cursor-pointer">
                      {voice.artwork ? (
                        <img 
                          src={voice.artwork} 
                          alt={voice.name}
                          className={`w-full h-full object-cover transition-all duration-300 group-hover:blur-sm ${
                            playingVoice?.name === voice.name && isPlaying ? 'blur-sm' : ''
                          }`}
                        />
                      ) : (
                        <div className="text-2xl">
                          {voice.gender === 'male' ? '🌊' : voice.gender === 'female' ? '🌸' : '💎'}
                        </div>
                      )}
                      
                      {/* Play/Pause Overlay */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          playVoicePreview(voice)
                        }}
                        className={`absolute inset-0 rounded-lg flex items-center justify-center transition-opacity ${
                          playingVoice?.name === voice.name ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        {playingVoice?.name === voice.name && isPlaying ? (
                          <Pause className="h-5 w-5 text-white" />
                        ) : (
                          <Play className="h-5 w-5 text-white" />
                        )}
                      </button>
                    </div>

                    {/* Voice Info */}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg tracking-tight text-gray-900 dark:text-white leading-snug">{voice.name}</h3>
                      <p className="text-sm font-medium tracking-wide text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-1">
                        {voice.description || t('voice.selection.professionalModel')}
                      </p>
                    </div>

                    {/* Type Badge */}
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-xs font-semibold tracking-wide">
                        {voice.age === 'child' ? t('voice.filters.child') : voice.age === 'young' ? t('voice.filters.young') : voice.age === 'adult' ? t('voice.filters.adult') : t('voice.filters.senior')}
                      </span>
                      <span className="text-sm font-medium tracking-wide text-gray-600 dark:text-gray-400">+4</span>
                    </div>

                    {/* Action Button */}
                    <div>
                      {(selectedVoice?._id || selectedVoice?.id || selectedVoice?.name) === (voice._id || voice.id || voice.name) ? (
                        <button className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-semibold tracking-wide">
                          {t('voice.tabs.selected')}
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            console.log('Voice selected:', voice)
                            setSelectedVoice(voice._id || voice.id || voice.name, voice)
                            setShowVoiceModal(false)
                            setSearchQuery("")
                            // Reset filters
                            setFilterLanguage(t('voice.filters.language'))
                            setFilterAccent(t('voice.filters.accent'))
                            setFilterGender(t('voice.filters.gender'))
                            setFilterAge(t('voice.filters.age'))
                          }}
                          className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-semibold tracking-wide hover:bg-foreground/90 transition-colors"
                        >
                          {t('home.use')}
                        </button>
                      )}
                    </div>

                    {/* Copy ID */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        const voiceId = voice._id || voice.id || voice.name
                        navigator.clipboard.writeText(voiceId)
                        setCopiedVoiceId(voiceId)
                        setTimeout(() => setCopiedVoiceId(null), 2000)
                      }}
                      className="p-2 hover:bg-accent rounded-lg group relative"
                    >
                      {copiedVoiceId === (voice._id || voice.id || voice.name) ? (
                        <Check className="h-4 w-4 text-foreground" strokeWidth={3} />
                      ) : (
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      )}
                      {/* Tooltip - sadece copy modunda */}
                      {copiedVoiceId !== (voice._id || voice.id || voice.name) && (
                        <div className="absolute bottom-full right-0 mb-3 px-3 py-2 border rounded text-xs whitespace-nowrap transition-all z-[100] shadow-lg opacity-0 group-hover:opacity-100 bg-background dark:bg-black/80 dark:backdrop-blur-xl border-border dark:border-white/10 text-foreground" style={{ minWidth: 'max-content' }}>
                          {`ID: ${voice._id || voice.id || voice.name}`}
                        </div>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Upload Modal */}
      {showUploadModal && createPortal(
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300"
          onClick={() => setShowUploadModal(false)}
        >
          <div 
            className="bg-background dark:bg-black/90 dark:backdrop-blur-xl border border-gray-200/80 dark:border-white/10 rounded-2xl p-6 w-full max-w-lg mx-4 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">{t('textToSpeech.fileUpload')}</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Upload Area */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold tracking-wide text-gray-900 dark:text-white leading-snug mb-3">{t('textToSpeech.uploadDocument')}</h3>
              <div 
                className="border-2 border-dashed border-border dark:border-white/20 rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer min-h-[200px] flex items-center justify-center"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-base font-semibold tracking-wide text-gray-900 dark:text-white leading-snug">{t('textToSpeech.clickOrDragUpload')}</p>
                    <p className="text-sm font-medium tracking-wide text-gray-600 dark:text-gray-400 leading-relaxed mt-2">
                      {t('textToSpeech.fileFormats')}
                    </p>
                  </div>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.txt,.html,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setUploadedFile(file)
                      // Handle file upload logic here
                      console.log('File selected:', file.name)
                    }
                  }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 border border-border rounded-lg font-medium tracking-wide hover:bg-accent transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => {
                  // Handle create action
                  setShowUploadModal(false)
                }}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold tracking-wide hover:bg-primary/90 transition-colors"
                disabled={!uploadedFile}
              >
                {t('common.create')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* History Modal */}
      {showHistoryModal && createPortal(
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300"
          onClick={() => setShowHistoryModal(false)}
        >
          <div 
            className="bg-background dark:bg-black/90 dark:backdrop-blur-xl border border-gray-200/80 dark:border-white/10 rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <History className="h-5 w-5" />
                <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">{t('textToSpeech.speechHistory')}</h2>
                <span className="px-2 py-1 bg-accent rounded-full text-xs font-medium tracking-wide text-gray-600 dark:text-gray-400">{historyData.length} {t('textToSpeech.items')}</span>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1 hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('textToSpeech.searchHistory')}
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 font-normal tracking-normal text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-4">
              <button className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-semibold tracking-wide">{t('textToSpeech.all')}</button>
              <button className="px-3 py-1 bg-accent hover:bg-accent/80 rounded-full text-xs font-medium tracking-wide">{t('textToSpeech.today')}</button>
              <button className="px-3 py-1 bg-accent hover:bg-accent/80 rounded-full text-xs font-medium tracking-wide">{t('textToSpeech.thisWeek')}</button>
              <button className="px-3 py-1 bg-accent hover:bg-accent/80 rounded-full text-xs font-medium tracking-wide">{t('textToSpeech.thisMonth')}</button>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto space-y-3">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((item) => (
                  <div key={item.id} className="group p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-semibold tracking-wide text-gray-900 dark:text-white leading-snug mb-2 line-clamp-2">{item.text}</p>
                        <div className="flex items-center gap-4 text-xs font-medium tracking-wide text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <div className={`w-2 h-2 ${item.color} rounded-full`}></div>
                            {item.voice}
                          </span>
                          <span>{item.language}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {item.time}
                          </span>
                          <span>{item.characters} characters</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 hover:bg-accent rounded" title="Play">
                          <Play className="h-3 w-3" />
                        </button>
                        <button className="p-1 hover:bg-accent rounded" title="Download">
                          <Download className="h-3 w-3" />
                        </button>
                        <button className="p-1 hover:bg-accent rounded text-red-500" title="Delete">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                  <p className="font-medium tracking-wide text-gray-600 dark:text-gray-400 leading-relaxed">Arama sonucu bulunamadı</p>
                  <p className="text-sm font-medium tracking-wide text-gray-500 dark:text-gray-500 leading-relaxed mt-1">Farklı kelimeler deneyebilirsiniz</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
              <div className="text-sm font-medium tracking-wide text-gray-600 dark:text-gray-400">
                {t('textToSpeech.showing')} {filteredHistory.length} {t('textToSpeech.of')} {historyData.length} {t('textToSpeech.items')}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="px-4 py-2 border border-border rounded-lg font-medium tracking-wide hover:bg-accent transition-colors"
                >
                  {t('common.close')}
                </button>
                <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg font-semibold tracking-wide hover:bg-destructive/90 transition-colors">
                  {t('textToSpeech.clearAll')}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
      </div>
    </>
  )
}