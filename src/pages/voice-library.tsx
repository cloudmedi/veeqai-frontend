import { useState, useEffect } from "react"
import { Play, Pause, MoreHorizontal, BookmarkPlus, ChevronRight } from "lucide-react"
import { Dropdown } from "@/components/dropdown"
import { usePlayer } from "@/components/layout"
import { usePreferencesStore } from "@/stores/preferences-store"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"

export default function VoiceLibraryPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("library")
  const { setPlayingVoice, playingVoice, isPlaying, togglePlay } = usePlayer()
  const { preferences, setSelectedVoice } = usePreferencesStore()
  const [selectedLanguage, setSelectedLanguage] = useState(t('voice.filters.language'))
  const [selectedAccent, setSelectedAccent] = useState(t('voice.filters.accent'))
  const [selectedGender, setSelectedGender] = useState(t('voice.filters.gender'))
  const [selectedAge, setSelectedAge] = useState(t('voice.filters.age'))
  const [voices, setVoices] = useState<any[]>([])
  const [, setLoading] = useState(true)

  // Get selected voice from preferences
  const selectedVoiceId = preferences?.voice.selectedVoiceId

  const languages = [t('voice.filters.language'), "English", "Spanish", "French", "German", "Chinese", "Japanese"]
  const accents = [t('voice.filters.accent'), "American", "British", "Australian", "Indian"]
  const genders = [t('voice.filters.gender'), t('voice.filters.male'), t('voice.filters.female'), t('voice.filters.neutral')]
  const ages = [t('voice.filters.age'), t('voice.filters.young'), t('voice.filters.adult'), t('voice.filters.senior')]

  // Fetch voices from backend
  useEffect(() => {
    fetchVoices()
  }, [])

  const fetchVoices = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/voices/list-grouped')
      const data = await response.json()
      
      if (data.success && data.voices) {
        // Format backend data to match mockup structure
        const formattedVoices = data.voices.map((voice: any) => ({
          id: voice._id || voice.name,
          _id: voice._id || voice.name,
          name: voice.name,
          description: voice.description,
          type: "Audiobook",
          level: "+4",
          avatar: voice.artwork || (voice.gender === 'male' ? "🌊" : voice.gender === 'female' ? "🌸" : "💎"),
          previewUrl: voice.previewUrl,
          audioFile: voice.audioFile,
          artwork: voice.artwork,
          isGroup: voice.isGroup,
          moods: voice.moods || [],
          groupId: voice.groupId
        }))
        setVoices(formattedVoices)
      } else {
        // Fallback to mockup data
        setVoices(mockupVoices)
      }
    } catch (error) {
      // If backend fails, use mockup data
      setVoices(mockupVoices)
    } finally {
      setLoading(false)
    }
  }

  const playPreview = async (voice: any) => {
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
        const response = await fetch(`http://localhost:5000/api/voices/preview/${firstMood._id}`, {
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
        const response = await fetch(`http://localhost:5000/api/voices/preview/${voice._id}`, {
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

  const handleVoiceSelect = (voice: any) => {
    // Set global selected voice using preferences store
    const voiceId = voice._id || voice.id
    setSelectedVoice(voiceId, voice)
    
    // Navigate to Text-to-Speech with the selected voice
    navigate(`/text-to-speech?voiceId=${voiceId}`)
  }

  // Mockup data as fallback
  const mockupVoices = [
    {
      name: "Trustworthy Man",
      description: "A trustworthy and resonant adult male voice with a general American accent.",
      type: "Audiobook",
      level: "+4",
      avatar: "🌊"
    },
    {
      name: "Captivating Storyteller", 
      description: "A captivating senior male storyteller with a cold, detached tone and mid-Atlantic accent.",
      type: "Audiobook",
      level: "+4",
      avatar: "🌳"
    },
    {
      name: "Man With Deep Voice",
      description: "An adult male with a deep, commanding voice and a general American accent.",
      type: "Audiobook",
      level: "+4",
      avatar: "🔥"
    },
    {
      name: "Graceful Lady",
      description: "A graceful and elegant middle-aged female voice with a classic British accent.",
      type: "Audiobook",
      level: "+4",
      avatar: "🌸"
    },
    {
      name: "Insightful Speaker",
      description: "A deliberate and authoritative male voice with a scholarly tone. Its strong pace demands attention.",
      type: "Infomative",
      level: "+4",
      avatar: "💜"
    },
    {
      name: "Whispering girl",
      description: "A young adult female voice delivering a soft whisper, perfect for ASMR content.",
      type: "Characters",
      level: "+4",
      avatar: "💎"
    },
    {
      name: "Patient Man",
      description: "An adult male voice with a gentle, soft-spoken delivery. The calm and patient tone.",
      type: "Audiobook",
      level: "+4",
      avatar: "🌿"
    }
  ]

  return (
    <div>
      {/* Header Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-[#fefefe] dark:bg-black/80 dark:backdrop-blur-xl border border-gray-200/80 dark:border-white/10 rounded-2xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🎵</div>
            <div>
              <h3 className="text-xl font-semibold mb-1">{t('voice.design')}</h3>
              <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">{t('common.new')}</span>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="bg-[#fefefe] dark:bg-black/80 dark:backdrop-blur-xl border border-gray-200/80 dark:border-white/10 rounded-2xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🎭</div>
            <div>
              <h3 className="text-xl font-semibold">{t('voice.instantClone')}</h3>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      {/* Voice slots remaining */}
      <div className="text-right mb-4">
        <span className="text-sm text-muted-foreground">{t('voice.slotsRemaining', { current: 2, total: 3 })}</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-border mb-6">
        <button
          onClick={() => setActiveTab("library")}
          className={`pb-3 text-sm font-medium transition-colors relative ${
            activeTab === "library"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t('voice.tabs.library')}
          {activeTab === "library" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("my-voices")}
          className={`pb-3 text-sm font-medium transition-colors relative ${
            activeTab === "my-voices"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t('voice.tabs.myVoices')}
        </button>
        <button
          onClick={() => setActiveTab("collected")}
          className={`pb-3 text-sm font-medium transition-colors relative ${
            activeTab === "collected"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t('voice.tabs.collectedVoices')}
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Dropdown
          value={selectedLanguage}
          options={languages}
          onChange={setSelectedLanguage}
        />
        <Dropdown
          value={selectedAccent}
          options={accents}
          onChange={setSelectedAccent}
        />
        <Dropdown
          value={selectedGender}
          options={genders}
          onChange={setSelectedGender}
        />
        <Dropdown
          value={selectedAge}
          options={ages}
          onChange={setSelectedAge}
        />
      </div>

      {/* Voice List */}
      <div className="space-y-3">
        {voices
          .sort((a, b) => {
            // Seçili voice her zaman en başta
            const aSelected = selectedVoiceId === a.id || selectedVoiceId === a._id
            const bSelected = selectedVoiceId === b.id || selectedVoiceId === b._id
            if (aSelected && !bSelected) return -1
            if (!aSelected && bSelected) return 1
            return 0
          })
          .map((voice, index) => {
          const isSelected = selectedVoiceId === voice.id || selectedVoiceId === voice._id
          return (
          <div 
            key={index} 
            className={`bg-[#fefefe] dark:bg-black/80 dark:backdrop-blur-xl border border-gray-200/80 dark:border-white/10 rounded-2xl p-4 flex items-center gap-4 ${
              isSelected ? 'border-primary' : ''
            }`}
          >
            {/* Avatar */}
            <div 
              className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center text-2xl relative group cursor-pointer overflow-hidden"
              onClick={() => playPreview(voice)}
            >
              {voice.artwork ? (
                <img 
                  src={voice.artwork} 
                  alt={voice.name}
                  className={`w-full h-full object-cover rounded-lg transition-all duration-300 group-hover:blur-sm ${
                    playingVoice?.name === voice.name && isPlaying ? 'blur-sm' : ''
                  }`}
                />
              ) : (
                voice.avatar
              )}
              <div className={`absolute inset-0 rounded-lg flex items-center justify-center transition-opacity ${
                playingVoice?.name === voice.name ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}>
                {playingVoice?.name === voice.name && isPlaying ? (
                  <Pause className="h-6 w-6 text-white" />
                ) : (
                  <Play className="h-6 w-6 text-white" />
                )}
              </div>
            </div>

            {/* Voice Info */}
            <div className="flex-1">
              <h3 className="text-sm font-medium mb-0.5">{voice.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-1">{voice.description}</p>
            </div>

            {/* Type */}
            <span className="text-xs text-muted-foreground">{voice.type}</span>

            {/* Multi-mood Badge */}
            {voice.isGroup && voice.moods && voice.moods.length > 0 && (
              <span className="px-2 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-xs font-medium">
                {voice.moods.length} Moods
              </span>
            )}

            {/* Level */}
            <span className="text-sm font-medium">{voice.level}</span>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {isSelected ? (
                <button 
                  onClick={() => navigate('/text-to-speech')}
                  className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Selected
                </button>
              ) : (
                <button 
                  onClick={() => handleVoiceSelect(voice)}
                  className="px-4 py-1.5 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors"
                >
                  Use
                </button>
              )}
              <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                <BookmarkPlus className="h-4 w-4" />
              </button>
              <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
          )
        })}
      </div>

    </div>
  )
}