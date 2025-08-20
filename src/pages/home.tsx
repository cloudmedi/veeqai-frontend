import { useState, useEffect } from "react"
import { 
  Book, 
  Building2, 
  GraduationCap,
  Upload,
  Sparkles,
  Play,
  X,
  Bookmark,
  MoreHorizontal,
  Pause
} from "lucide-react"
import { useTranslation } from 'react-i18next'
import { cn } from "@/lib/utils"
import { Dropdown } from "@/components/dropdown"
import { io } from 'socket.io-client'

import { usePlayer } from "@/components/layout"

export default function HomePage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState("text-to-speech")
  const [selectedVoice, setSelectedVoice] = useState("Radiant Girl")
  const [text, setText] = useState("")
  const [selectedModel, setSelectedModel] = useState("speech-2.5-hd-preview")
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [voiceModalTab, setVoiceModalTab] = useState("Library")
  const { playingVoice, setPlayingVoice } = usePlayer()
  
  // Featured music state
  const [featuredMusic, setFeaturedMusic] = useState<any[]>([])
  const [loadingFeatured, setLoadingFeatured] = useState(false)

  // Define fetchFeaturedMusic before useEffect
  const fetchFeaturedMusic = async () => {
    try {
      setLoadingFeatured(true)
      console.log('🚀 Fetching featured music from API...')
      
      // Use environment variable or fallback to localhost
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
      const apiUrl = `${apiBaseUrl}/api/public/discover?category=mood&limit=6`
      
      const response = await fetch(apiUrl)
      console.log('📡 API Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📦 API Response data:', data)
        setFeaturedMusic(data.data || [])
        console.log('🏠 Home featured music array length:', (data.data || []).length)
      } else {
        console.error('Featured music API error:', response.status, response.statusText)
        // If API fails, keep showing fallback mockup cards
        setFeaturedMusic([])
      }
    } catch (error) {
      console.error('Failed to fetch featured music:', error)
      // On connection error, keep showing fallback mockup cards
      setFeaturedMusic([])
    } finally {
      setLoadingFeatured(false)
    }
  }

  // Fetch featured music on component mount and setup WebSocket
  useEffect(() => {
    fetchFeaturedMusic()

    // Setup WebSocket connection for real-time featured music updates
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
    console.log('🔗 Connecting to WebSocket:', apiBaseUrl)
    
    const socket = io(apiBaseUrl, {
      transports: ['polling', 'websocket'], // Polling first, then websocket
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000
    })

    // Listen for featured music updates
    socket.on('featured_music_updated', (data) => {
      console.log('🔄 Featured music updated via WebSocket:', data)
      // Refresh featured music list
      fetchFeaturedMusic()
    })

    socket.on('featured_artwork_updated', (data) => {
      console.log('🎨 Featured artwork updated via WebSocket:', data)
      // Refresh featured music list  
      fetchFeaturedMusic()
    })

    socket.on('featured_music_added', (data) => {
      console.log('➕ Featured music added via WebSocket:', data)
      // Refresh featured music list
      fetchFeaturedMusic()
    })

    socket.on('featured_music_removed', (data) => {
      console.log('➖ Featured music removed via WebSocket:', data)
      // Refresh featured music list
      fetchFeaturedMusic()
    })

    socket.on('connect', () => {
      console.log('🔌 WebSocket connected for featured music updates')
      console.log('🔌 Socket ID:', socket.id)
    })

    socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error)
    })

    // Test ALL possible events
    socket.onAny((eventName, ...args) => {
      console.log('📢 WebSocket event received:', eventName, args)
    })

    // Cleanup WebSocket on component unmount
    return () => {
      socket.disconnect()
      console.log('🔌 WebSocket disconnected')
    }
  }, [])

  const speechModels = [
    "speech-2.5-hd-preview",
    "speech-1.5-hd-preview"
  ]

  const modalVoices = [
    {
      name: "Trustworthy Man",
      description: "A trustworthy and resonant adult male voice with a general America...",
      type: "Audiobook",
      level: "+4",
      avatar: "bg-gradient-to-br from-purple-400 to-pink-500"
    },
    {
      name: "Captivating Storyteller", 
      description: "A captivating senior male storyteller with a cold, detached tone and...",
      type: "Audiobook",
      level: "+4",
      avatar: "bg-gradient-to-br from-yellow-400 to-orange-500"
    },
    {
      name: "Man With Deep Voice",
      description: "An adult male with a deep, commanding voice and a general Americ...",
      type: "Audiobook",
      level: "+4",
      avatar: "bg-gradient-to-br from-orange-400 to-red-500"
    },
    {
      name: "Graceful Lady",
      description: "A graceful and elegant middle-aged female voice with a classic Briti...",
      type: "Audiobook",
      level: "+4",
      avatar: "bg-gradient-to-br from-teal-400 to-cyan-500"
    },
    {
      name: "Insightful Speaker",
      description: "A deliberate and authoritative male voice with a scholarly tone. Its st...",
      type: "Infomative",
      level: "+4",
      avatar: "bg-gradient-to-br from-blue-400 to-indigo-500"
    },
    {
      name: "Whispering girl",
      description: "A young adult female voice delivering a soft whisper, perfect for AS...",
      type: "Characters",
      level: "+4",
      avatar: "bg-gradient-to-br from-cyan-400 to-teal-500"
    }
  ]

  const voiceCards = [
    {
      name: "Whisper to Sleep",
      language: "Japanese",
      type: "whisper",
      pattern: "bars"
    },
    {
      name: "A Tale of Terror", 
      language: "English",
      type: "Terror",
      pattern: "sun"
    },
    {
      name: "Goblin Bargain",
      language: "English",
      type: "Character",
      pattern: "dots"
    },
    {
      name: "Lecture Mode: On",
      language: "English",
      type: "Education",
      pattern: "radial"
    },
    {
      name: "Pitch the Vision",
      language: "English",
      type: "Presentation",
      pattern: "crown"
    },
    {
      name: "Get Sci-fied",
      language: "Robot",
      type: "Cyberpunk",
      pattern: "wave"
    }
  ]

  // Removed mock music cards - now showing "No content" message when no featured music

  const renderVoicePattern = (pattern: string) => {
    switch(pattern) {
      case 'bars':
        return (
          <div className="flex items-end gap-1.5">
            <div className="w-2.5 bg-purple-500 rounded-full h-6" />
            <div className="w-2.5 bg-purple-500 rounded-full h-8" />
            <div className="w-2.5 bg-purple-500 rounded-full h-12" />
            <div className="w-2.5 bg-purple-500 rounded-full h-16" />
            <div className="w-2.5 bg-purple-500 rounded-full h-12" />
            <div className="w-2.5 bg-purple-500 rounded-full h-8" />
            <div className="w-2.5 bg-purple-500 rounded-full h-6" />
          </div>
        )
      case 'sun':
        return (
          <div className="relative w-20 h-20 flex items-center justify-center">
            <div className="w-12 h-12 bg-purple-500 rounded-full" />
            <div className="absolute inset-0">
              {Array.from({length: 16}).map((_, i) => (
                <div 
                  key={i} 
                  className="absolute w-6 h-1 bg-purple-400 rounded-full"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) rotate(${i * 22.5}deg) translateX(24px)`,
                    transformOrigin: 'center'
                  }}
                />
              ))}
            </div>
          </div>
        )
      case 'dots':
        return (
          <div className="grid grid-cols-5 gap-1.5">
            {Array.from({length: 25}).map((_, i) => (
              <div 
                key={i} 
                className={`w-3 h-3 rounded-full ${
                  [4, 9, 12, 14, 19].includes(i) ? 'bg-purple-500' : 'bg-purple-300'
                }`} 
              />
            ))}
          </div>
        )
      case 'radial':
        return (
          <div className="relative w-20 h-20 flex items-center justify-center">
            <div className="w-6 h-6 bg-white rounded-full" />
            <div className="absolute inset-0">
              {Array.from({length: 20}).map((_, i) => (
                <div 
                  key={i} 
                  className="absolute w-8 h-1 bg-purple-500 rounded-full"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) rotate(${i * 18}deg) translateX(20px)`,
                    transformOrigin: 'center'
                  }}
                />
              ))}
            </div>
          </div>
        )
      case 'crown':
        return (
          <div className="relative w-16 h-12 flex items-center justify-center">
            <div className="w-14 h-8 border-2 border-purple-500 rounded-full" />
            <div className="absolute top-0 w-6 h-4 bg-purple-500 rounded-t" />
          </div>
        )
      case 'wave':
        return (
          <svg width="56" height="32" viewBox="0 0 56 32" className="text-purple-500">
            <path d="M0 16 C7 8 7 24 14 16 C21 8 21 24 28 16 C35 8 35 24 42 16 C49 8 49 24 56 16" stroke="currentColor" strokeWidth="3" fill="none" />
            <path d="M0 24 C7 16 7 32 14 24 C21 16 21 32 28 24 C35 16 35 32 42 24 C49 16 49 32 56 24" stroke="currentColor" strokeWidth="3" fill="none" />
          </svg>
        )
      default:
        return <div className="w-8 h-8 bg-purple-500 rounded" />
    }
  }

  return (
    <div>
      {/* Title */}
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight mb-8">{t('home.title')}</h1>

      {/* Tabs */}
      <div className="flex gap-3 mb-5">
        <button
          onClick={() => setActiveTab("text-to-speech")}
          className={cn(
            "px-6 py-2 rounded-full text-sm font-semibold tracking-wide transition-colors",
            activeTab === "text-to-speech"
              ? "bg-foreground text-background"
              : "border border-border text-muted-foreground hover:text-foreground"
          )}
        >
          {t('home.textToSpeech')}
        </button>
        <button
          onClick={() => setActiveTab("music-creation")}
          className={cn(
            "px-6 py-2 rounded-full text-sm font-semibold tracking-wide transition-colors",
            activeTab === "music-creation"
              ? "bg-foreground text-background"
              : "border border-border text-muted-foreground hover:text-foreground"
          )}
        >
          {t('home.musicCreation')}
        </button>
      </div>

      {/* Text Input Area */}
      <div className="bg-[#fefefe] dark:bg-black/80 dark:backdrop-blur-xl border border-gray-200/80 dark:border-white/10 rounded-2xl p-4 mb-5">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('home.placeholder')}
          className="w-full h-24 bg-transparent resize-none outline-none text-foreground placeholder:text-muted-foreground text-sm"
        />

        {/* Action Buttons */}
        <div className="flex gap-2 mt-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors">
            <Book className="h-4 w-4" />
            <span className="text-sm font-medium tracking-wide">{t('home.tellStory')}</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors">
            <Building2 className="h-4 w-4" />
            <span className="text-sm font-medium tracking-wide">{t('home.createCommercial')}</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors">
            <GraduationCap className="h-4 w-4" />
            <span className="text-sm font-medium tracking-wide">{t('home.buildTutor')}</span>
          </button>
        </div>

        {/* Voice Selector & Generate Button */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4">
            {/* Model selector with dropdown */}
            <Dropdown
              value={selectedModel}
              options={speechModels}
              onChange={setSelectedModel}
            />

            {/* Voice selector */}
            <button 
              onClick={() => setShowVoiceModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-accent rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                <span className="text-white text-xs">👧</span>
              </div>
              <span className="text-sm font-semibold tracking-wide text-gray-900 dark:text-white">{selectedVoice}</span>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-accent rounded-lg transition-colors">
              <Upload className="h-5 w-5" />
            </button>
            <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              <span className="font-semibold tracking-wide">{t('common.generate')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Voice Cards Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">{t('home.exploreVoices')}</h2>
          <button className="text-sm font-medium tracking-wide text-gray-600 dark:text-gray-400 hover:text-foreground transition-colors">
            {t('home.exploreMore')} →
          </button>
        </div>

        <div className="grid grid-cols-6 gap-4">
          {voiceCards.map((voice, index) => (
            <div key={index} className="relative group cursor-pointer">
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-8 aspect-square flex items-center justify-center relative overflow-hidden">
                <div className="flex items-center justify-center z-10">
                  {renderVoicePattern(voice.pattern)}
                </div>
                <button className="absolute bottom-3 right-3 w-8 h-8 bg-white/90 dark:bg-black/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="h-4 w-4 ml-0.5" />
                </button>
              </div>
              <div className="mt-3">
                <p className="text-sm font-bold tracking-tight text-gray-900 dark:text-white leading-snug mb-1">{voice.name}</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-blue-600 font-semibold tracking-wide">{voice.language}</span>
                  <span className="font-medium tracking-wide text-gray-600 dark:text-gray-400">{voice.type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Music Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">{t('home.discoverMusic')}</h2>
          <button className="text-sm font-medium tracking-wide text-gray-600 dark:text-gray-400 hover:text-foreground transition-colors">
            {t('home.exploreMore')} →
          </button>
        </div>

        <div className="grid grid-cols-6 gap-4">
          {loadingFeatured 
            ? Array.from({length: 6}).map((_, index) => (
                <div key={index} className="relative group cursor-pointer">
                  <div className="rounded-2xl aspect-square bg-muted animate-pulse"></div>
                  <div className="mt-2 h-4 bg-muted rounded animate-pulse w-3/4"></div>
                </div>
              ))
            : featuredMusic.length > 0 
              ? featuredMusic.slice(0, 6).map((music, index) => (
                  <div key={music._id || index} className="relative group cursor-pointer">
                    <div 
                      className="rounded-2xl aspect-square relative overflow-hidden"
                      style={{
                        backgroundImage: music.featured?.artwork?.cdnUrl 
                          ? `url(${music.featured.artwork.cdnUrl})` 
                          : 'linear-gradient(to bottom right, rgb(147 51 234), rgb(219 39 119))',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                      onClick={() => {
                        if (music.cdnUrl || music.audioUrl) {
                          setPlayingVoice({
                            name: music.title || "Featured Music",
                            audioUrl: music.cdnUrl || music.audioUrl,
                            displayName: music.title || "Featured Music"
                          });
                        }
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                        <button className="w-12 h-12 bg-white/90 dark:bg-black/90 rounded-full flex items-center justify-center">
                          <Play className="h-5 w-5 ml-0.5" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm font-semibold tracking-wide text-gray-900 dark:text-white leading-snug truncate">{music.title || "Featured Music"}</p>
                      {music.featured?.tags && music.featured.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {music.featured.tags.slice(0, 2).map((tag: string, tagIndex: number) => (
                            <span 
                              key={tagIndex}
                              className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium tracking-wide rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {music.featured.tags.length > 2 && (
                            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                              +{music.featured.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              : (
                  <div className="col-span-6 text-center py-16">
                    <div className="text-gray-400">
                      <svg 
                        className="w-16 h-16 mx-auto mb-4 text-gray-300"
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={1.5} 
                          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                        />
                      </svg>
                      <p className="text-lg font-bold tracking-tight text-gray-900 dark:text-white leading-snug mb-2">No featured music available</p>
                      <p className="text-sm font-medium tracking-wide text-gray-600 dark:text-gray-400 leading-relaxed">Check back later for new content</p>
                    </div>
                  </div>
                )
          }
        </div>
      </div>


      {/* Voice Selection Modal */}
      {showVoiceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-2xl w-[920px] h-[680px] flex flex-col max-w-[95vw] max-h-[95vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">{t('home.voiceSelection')}</h2>
              <button 
                onClick={() => setShowVoiceModal(false)}
                className="p-1 hover:bg-accent rounded-md transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-border px-6">
              {[t('home.library'), t('home.myVoices'), t('home.collectedVoices')].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setVoiceModalTab(tab)}
                  className={cn(
                    "px-4 py-3 text-sm font-semibold tracking-wide border-b-2 transition-colors mr-6",
                    voiceModalTab === tab
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex gap-4 p-6 border-b border-border">
              <Dropdown
                value={t('home.language')}
                options={[t('home.language'), t('home.english'), t('home.spanish'), t('home.french')]}
                onChange={() => {}}
              />
              <Dropdown
                value={t('home.accent')}
                options={[t('home.accent'), t('home.american'), t('home.british'), t('home.australian')]}
                onChange={() => {}}
              />
              <Dropdown
                value={t('home.gender')}
                options={[t('home.gender'), t('home.male'), t('home.female'), t('home.neutral')]}
                onChange={() => {}}
              />
              <Dropdown
                value={t('home.age')}
                options={[t('home.age'), t('home.young'), t('home.adult'), t('home.senior')]}
                onChange={() => {}}
              />
            </div>

            {/* Voice List */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {modalVoices.map((voice, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 hover:bg-accent rounded-lg transition-colors">
                    {/* Avatar with Play Button */}
                    <div className="relative">
                      <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", voice.avatar)}>
                        <span className="text-white text-lg">👤</span>
                      </div>
                      <button 
                        onClick={() => {
                          if (playingVoice?.name === voice.name) {
                            setPlayingVoice(null)
                          } else {
                            setPlayingVoice({
                              name: voice.name,
                              audioUrl: '',
                              displayName: voice.name
                            })
                          }
                        }}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 hover:opacity-100 transition-opacity"
                      >
                        {playingVoice?.name === voice.name ? (
                          <Pause className="h-4 w-4 text-white" />
                        ) : (
                          <Play className="h-4 w-4 text-white ml-0.5" />
                        )}
                      </button>
                      {/* Playing indicator */}
                      {playingVoice?.name === voice.name && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      )}
                    </div>
                    
                    {/* Voice Info */}
                    <div className="flex-1">
                      <h3 className="font-bold tracking-tight text-gray-900 dark:text-white leading-snug mb-1">{voice.name}</h3>
                      <p className="text-sm font-medium tracking-wide text-gray-600 dark:text-gray-400 leading-relaxed mb-2">{voice.description}</p>
                    </div>

                    {/* Voice Type & Level */}
                    <div className="text-center mr-4">
                      <div className="text-sm font-medium tracking-wide text-gray-600 dark:text-gray-400">{voice.type}</div>
                      <div className="text-sm font-semibold tracking-wide text-gray-900 dark:text-white">{voice.level}</div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setSelectedVoice(voice.name)
                          setShowVoiceModal(false)
                        }}
                        className="px-4 py-2 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors text-sm font-semibold tracking-wide"
                      >
                        {t('home.use')}
                      </button>
                      <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                        <Bookmark className="h-4 w-4" />
                      </button>
                      <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}