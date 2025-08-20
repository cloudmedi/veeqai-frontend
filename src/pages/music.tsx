import { useState, useEffect } from "react"
import { useTranslation } from 'react-i18next'
import { Play, Sparkles, Download, MoreHorizontal, Copy, Share2, Pause } from "lucide-react"
// import { cn } from "@/lib/utils"
import { Dropdown } from "@/components/dropdown"
import { usePlayer } from "@/components/layout"
import { useAuth } from "@/contexts/AuthContext"
import { UserDropdown } from "@/components/user-dropdown"
import { musicAPI, ApiClientError } from "@/lib/api-client"
import { io } from 'socket.io-client'

export default function MusicPage() {
  const { t } = useTranslation()
  const [text, setText] = useState("Jazzy, male, smooth, expressive, soulful")
  const [selectedModel, setSelectedModel] = useState("")
  const [selectedDuration, setSelectedDuration] = useState("60")
  const { playingVoice, setPlayingVoice, isPlaying, togglePlay, setPlaylist } = usePlayer()
  const { user, token, updateUserCredits } = useAuth()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedMusics, setGeneratedMusics] = useState<any[]>([])
  const [error, setError] = useState("")
  const [isAdvanced, setIsAdvanced] = useState(false)
  const [lyrics, setLyrics] = useState("")
  const [availableModels, setAvailableModels] = useState<any[]>([])
  const [loadingModels, setLoadingModels] = useState(true)
  const [creditCost, setCreditCost] = useState(0)
  const [loadingCreditCost, setLoadingCreditCost] = useState(false)
  
  // Featured music states
  const [activeTab, setActiveTab] = useState("myWork") // "myWork" or "featured"
  const [featuredMusic, setFeaturedMusic] = useState<any[]>([])
  const [featuredCategories, setFeaturedCategories] = useState<any>({})
  const [selectedCategory, setSelectedCategory] = useState("mood")
  const [selectedSubcategory, setSelectedSubcategory] = useState("chill")
  const [loadingFeatured, setLoadingFeatured] = useState(false)
  // const [socket, setSocket] = useState<Socket | null>(null)
  // const durationOptions = ["30", "60", "120", "180", "240"]

  // Google Lyria-2 official prompt examples
  const lyria2Prompts = [
    "A cinematic orchestral piece with epic brass swells, thunderous timpani rolls and soaring string melodies",
    "Futuristic country music, steel guitar, huge 808s, synth wave elements space western cosmic twang soaring vocals",
    "An energetic electronic dance track with a fast tempo and a driving beat, featuring prominent synthesizers and electronic drums. High-quality production.",
    "Ambient music with synthesizers.",
    "A calm and dreamy ambient soundscape featuring layered synthesizers and soft, evolving pads. Slow tempo with a spacious reverb. Starts with a simple synth melody, then adds layers of atmospheric pads.",
    "A cinematic orchestral piece in a heroic, fantasy adventure style, with a grand, sweeping melody.",
    "A peaceful and serene acoustic guitar piece, featuring a fingerpicked style, perfect for meditation.",
    "A tense, suspenseful underscore with a very slow, creeping tempo and a sparse, irregular rhythm. Primarily uses low strings and subtle percussion.",
    "A calm, relaxing piano piece for studying."
  ]

  const getRandomPrompt = () => {
    const randomIndex = Math.floor(Math.random() * lyria2Prompts.length)
    setText(lyria2Prompts[randomIndex])
  }

  // Refresh user credits
  const refreshUserCredits = async () => {
    try {
      const response = await fetch('${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.user && data.user.credits !== undefined) {
          updateUserCredits(data.user.credits)
          console.log(`💳 Credits updated: ${data.user.credits}`)
        }
      }
    } catch (error) {
      console.error('Failed to refresh user credits:', error)
    }
  }

  // Calculate credit cost dynamically
  const calculateCreditCost = async () => {
    if (!token) return
    
    try {
      setLoadingCreditCost(true)
      const response = await fetch('${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/music/credits/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          service: 'music',
          duration: parseInt(selectedDuration)
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setCreditCost(data.data.cost)
      }
    } catch (error) {
      console.error('Failed to calculate credit cost:', error)
    } finally {
      setLoadingCreditCost(false)
    }
  }

  // Load user's generated music and available models on component mount
  useEffect(() => {
    console.log('🎵 Music useEffect triggered, token:', !!token)
    if (token) {
      console.log('🎵 Token exists, fetching data...')
      fetchUserMusic()
      fetchAvailableModels()
      calculateCreditCost()
    } else {
      console.log('🎵 No token found')
    }
    
    // Always fetch featured music and categories (no auth needed)
    fetchFeaturedCategories()
    if (activeTab === "featured") {
      fetchFeaturedMusic()
    }
  }, [token, activeTab, selectedCategory, selectedSubcategory])

  // Recalculate credit cost when duration changes
  useEffect(() => {
    if (token) {
      calculateCreditCost()
    }
  }, [selectedDuration, token])

  // WebSocket connection for real-time featured music updates
  useEffect(() => {
    console.log('🔌 [FEATURED-WEBSOCKET] Connecting to WebSocket...')
    
    // Use production API URL
    const featuredSocket = io(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}`, {
      transports: ['websocket', 'polling']  
    })

    // Connection events
    featuredSocket.on('connect', () => {
      console.log('✅ [FEATURED-WEBSOCKET] Connected for featured music updates')
    })

    featuredSocket.on('disconnect', () => {
      console.log('🔌 [FEATURED-WEBSOCKET] Disconnected')
    })

    // Listen for featured music updates
    featuredSocket.on('featured_music_added', (data) => {
      console.log('🌟 [FEATURED-WEBSOCKET] Featured music added:', data)
      if (activeTab === "featured") {
        fetchFeaturedMusic() // Refresh featured music list
      }
    })

    featuredSocket.on('featured_music_removed', (data) => {
      console.log('🗑️ [FEATURED-WEBSOCKET] Featured music removed:', data)
      if (activeTab === "featured") {
        fetchFeaturedMusic() // Refresh featured music list
      }
    })

    featuredSocket.on('featured_artwork_updated', (data) => {
      console.log('🎨 [FEATURED-WEBSOCKET] Featured artwork updated:', data)
      if (activeTab === "featured") {
        fetchFeaturedMusic() // Refresh to get new artwork
      }
    })

    featuredSocket.on('featured_order_changed', (data) => {
      console.log('📊 [FEATURED-WEBSOCKET] Featured order changed:', data)
      if (activeTab === "featured") {
        fetchFeaturedMusic() // Refresh to get new order
      }
    })

    // Error handling
    featuredSocket.on('connect_error', (error) => {
      console.error('❌ [FEATURED-WEBSOCKET] Connection error:', error)
    })

    // Cleanup on unmount
    return () => {
      console.log('🔌 [FEATURED-WEBSOCKET] Cleaning up featured music connection')
      featuredSocket.close()
    }
  }, [activeTab]) // Re-connect when tab changes

  const fetchUserMusic = async () => {
    try {
      const data = await musicAPI.getMyMusic()
      console.log('🎵 Music data:', data)
      // Handle new API response format with items array
      const musicList = data.items || data || []
      setGeneratedMusics(Array.isArray(musicList) ? musicList : [])
      
      // Start polling for any processing music
      musicList.forEach((music: any) => {
        if (music.status === 'processing') {
          startPollingForMusic(music._id)
        }
      })
    } catch (error) {
      console.error('Failed to fetch user music:', error)
      if (error instanceof ApiClientError) {
        setError(`Failed to load music: ${error.message}`)
      }
    }
  }

  const fetchAvailableModels = async () => {
    try {
      setLoadingModels(true)
      const models = await musicAPI.getModels()
      console.log('🎵 Available models:', models)
      setAvailableModels(models)
      // Set first model as default
      if (models.length > 0 && !selectedModel) {
        setSelectedModel(models[0]._id)
      }
    } catch (error) {
      console.error('Failed to fetch available models:', error)
      if (error instanceof ApiClientError) {
        setError(`Failed to load models: ${error.message}`)
      }
    } finally {
      setLoadingModels(false)
    }
  }

  // Fetch featured music categories
  const fetchFeaturedCategories = async () => {
    try {
      const response = await fetch('${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/music/featured/categories')
      if (response.ok) {
        const data = await response.json()
        setFeaturedCategories(data.data || {})
        console.log('🎭 Featured categories:', data.data)
      }
    } catch (error) {
      console.error('Failed to fetch featured categories:', error)
    }
  }

  // Fetch featured music
  const fetchFeaturedMusic = async () => {
    try {
      setLoadingFeatured(true)
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/music/featured?category=${selectedCategory}&subcategory=${selectedSubcategory}&limit=6`
      )
      if (response.ok) {
        const data = await response.json()
        setFeaturedMusic(data.data || [])
        console.log('🌟 Featured music request:', {category: selectedCategory, subcategory: selectedSubcategory})
        console.log('🌟 Featured music response:', data.data)
      } else {
        console.error('Featured music API error:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Failed to fetch featured music:', error)
    } finally {
      setLoadingFeatured(false)
    }
  }

  // Track engagement
  const trackEngagement = async (musicId: string, action: string) => {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/music/featured/${musicId}/engage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      })
    } catch (error) {
      console.error('Failed to track engagement:', error)
    }
  }

  const generateMusic = async () => {
    if (!text.trim()) {
      setError(t('music.errorPromptRequired'))
      return
    }

    setError("")

    try {
      // First check credits without showing loading state
      const newMusic = await musicAPI.generateMusic({
        prompt: text,
        modelId: selectedModel,
        duration: parseInt(selectedDuration),
        lyrics: lyrics.trim() || "",
      })
      
      // If we get here, credits are sufficient - now show loading
      setIsGenerating(true)
      setGeneratedMusics(prev => [newMusic, ...prev])
      
      // Start polling for this music if it's still processing
      if (newMusic.status === 'processing') {
        startPollingForMusic(newMusic._id)
      }
      
    } catch (error) {
      console.error('Music generation error:', error)
      if (error instanceof ApiClientError) {
        // Check for insufficient credits error - redirect immediately
        if (error.code === 'INSUFFICIENT_CREDITS' || 
            (error.details?.error === 'INSUFFICIENT_CREDITS' && error.details?.redirectUrl)) {
          // Redirect to pricing page immediately, no loading shown
          window.location.href = error.details?.redirectUrl || '/pricing';
          return;
        }
        setError(error.message)
      } else {
        setError(t('music.errorGeneratingMusic'))
      }
      setIsGenerating(false)
    }
  }

  // Polling function to check music status
  const startPollingForMusic = (musicId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/api/music/${musicId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const updatedMusic = await response.json()
          
          // Update the music in the list
          setGeneratedMusics(prev => 
            prev.map(music => 
              music._id === musicId ? updatedMusic.data : music
            )
          )
          
          // Stop polling if music is completed or failed
          if (updatedMusic.data.status === 'completed' || updatedMusic.data.status === 'failed') {
            clearInterval(pollInterval)
            
            // Refresh credit after completion
            if (updatedMusic.data.status === 'completed') {
              refreshUserCredits()
            }
          }
        }
      } catch (error) {
        console.error('Polling error:', error)
        // Stop polling on error
        clearInterval(pollInterval)
      }
    }, 3000) // Poll every 3 seconds

    // Clean up interval after 5 minutes to prevent infinite polling
    setTimeout(() => {
      clearInterval(pollInterval)
    }, 300000)
  }

  // const musicTracks = [
  //   {
  //     title: "Quiet Rhythms",
  //     tags: ["Lo-fi hip hop", "Chill", "Relaxing"],
  //     duration: "01:34",
  //     thumbnail: "bg-gradient-to-br from-purple-600 to-pink-600"
  //   },
  //   {
  //     title: "Quiet Corners", 
  //     tags: ["Lo-fi hip hop", "Calm", "Relaxing"],
  //     duration: "00:54",
  //     thumbnail: "bg-gradient-to-br from-gray-600 to-gray-800"
  //   },
  //   {
  //     title: "Morning Breeze",
  //     tags: ["Ambient", "Peaceful", "Soft"],
  //     duration: "02:15",
  //     thumbnail: "bg-gradient-to-br from-blue-400 to-teal-600"
  //   },
  //   {
  //     title: "Jazz Vibes",
  //     tags: ["Jazz", "Smooth", "Saxophone"],
  //     duration: "03:22",
  //     thumbnail: "bg-gradient-to-br from-orange-500 to-yellow-600"
  //   },
  //   {
  //     title: "Electric Dreams",
  //     tags: ["Electronic", "Synth", "Upbeat"],
  //     duration: "02:45",
  //     thumbnail: "bg-gradient-to-br from-purple-500 to-pink-500"
  //   },
  //   {
  //     title: "Acoustic Soul",
  //     tags: ["Acoustic", "Guitar", "Emotional"],
  //     duration: "04:10",
  //     thumbnail: "bg-gradient-to-br from-green-500 to-emerald-600"
  //   }
  // ]

  return (
    <div>
      {/* Header Cards - Same structure as Voice Library */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-[#fefefe] dark:bg-black/80 dark:backdrop-blur-xl border border-gray-200/80 dark:border-white/10 rounded-2xl p-6">
          <h1 className="text-xl font-semibold">{t('music.title')}</h1>
        </div>
        <div className="bg-[#fefefe] dark:bg-black/80 dark:backdrop-blur-xl border border-gray-200/80 dark:border-white/10 rounded-2xl p-6 flex items-center justify-end">
          {loadingModels ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              Loading models...
            </div>
          ) : availableModels.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No models available
            </div>
          ) : (
            <Dropdown
              value={availableModels.find(m => m._id === selectedModel)?.displayName || 'Select Model'}
              options={availableModels.map(model => model.displayName)}
              onChange={(displayName) => {
                const model = availableModels.find(m => m.displayName === displayName)
                if (model) setSelectedModel(model._id)
              }}
            />
          )}
        </div>
      </div>

      {/* Tabs - My Work vs Featured Music */}
      <div className="flex gap-6 border-b border-border mb-6">
        <button 
          onClick={() => setActiveTab("myWork")}
          className={`pb-3 text-sm font-medium relative ${
            activeTab === "myWork" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t('music.myWork')}
          {activeTab === "myWork" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button 
          onClick={() => setActiveTab("featured")}
          className={`pb-3 text-sm font-medium relative ${
            activeTab === "featured" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Projenize uygun müzikleri keşfedin
          {activeTab === "featured" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {/* Main Content - Conditional Layout */}
      {activeTab === "featured" ? (
        /* Featured Music - Full Width Grid */
        <div className="w-full">
          {/* Category and Subcategory Selectors */}
          <div className="flex gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg bg-card text-sm"
              >
                {Object.keys(featuredCategories).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Subcategory
              </label>
              <select
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg bg-card text-sm"
              >
                {(featuredCategories[selectedCategory] || []).map((subcat: string) => (
                  <option key={subcat} value={subcat}>{subcat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Featured Music Grid - 6 items */}
          {loadingFeatured ? (
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
                  <div className="w-full h-40 bg-muted rounded-lg mb-4"></div>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {featuredMusic.map((music, index) => (
                <div key={music._id || index} className="bg-[#fefefe] dark:bg-black/80 dark:backdrop-blur-xl border border-gray-200/80 dark:border-white/10 rounded-2xl p-4 hover:shadow-lg transition-shadow">
                  {/* Artwork */}
                  <div 
                    className="w-full h-40 rounded-lg relative group cursor-pointer overflow-hidden mb-4"
                    style={{
                      backgroundImage: music.featured?.artwork?.cdnUrl 
                        ? `url(${music.featured.artwork.cdnUrl})` 
                        : 'linear-gradient(to bottom right, rgb(147 51 234), rgb(219 39 119))',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                    onClick={() => {
                      if (music.cdnUrl || music.audioUrl) {
                        trackEngagement(music._id, 'view')
                        
                        const currentMusicTitle = `${music.title} - Featured`
                        
                        // Create playlist from featured music
                        const playlist = featuredMusic
                          .filter(m => m.cdnUrl || m.audioUrl)
                          .map((m) => ({
                            name: `${m.title} - Featured`,
                            audioUrl: m.cdnUrl || m.audioUrl,
                            displayName: m.title || "Featured Music",
                            artworkUrl: m.featured?.artwork?.cdnUrl || m.artworkUrl,
                            artworkData: m.artworkData
                          }))
                        
                        setPlaylist(playlist)
                        
                        if (playingVoice?.name === currentMusicTitle) {
                          togglePlay()
                        } else {
                          setPlayingVoice({
                            name: currentMusicTitle,
                            audioUrl: music.cdnUrl || music.audioUrl,
                            displayName: music.title || "Featured Music",
                            artworkUrl: music.featured?.artwork?.cdnUrl || music.artworkUrl,
                            artworkData: music.artworkData
                          })
                          trackEngagement(music._id, 'play')
                        }
                      }
                    }}
                  >
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors rounded-lg flex items-center justify-center">
                      {(music.cdnUrl || music.audioUrl) ? (
                        (() => {
                          const currentMusicTitle = `${music.title} - Featured`
                          
                          if (playingVoice?.name === currentMusicTitle && isPlaying) {
                            return <Pause className="h-8 w-8 text-white opacity-100" />
                          } else if (playingVoice?.name === currentMusicTitle) {
                            return <Play className="h-8 w-8 text-white opacity-100" />
                          } else {
                            return <Play className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          }
                        })()
                      ) : (
                        <Sparkles className="h-8 w-8 text-white" />
                      )}
                    </div>
                  </div>

                  {/* Music Info */}
                  <h3 className="font-medium text-base mb-2 truncate">{music.title}</h3>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {music.prompt?.split(',').filter((tag: string) => tag.trim()).slice(0, 2).map((tag: string, tagIndex: number) => (
                      <span 
                        key={tagIndex} 
                        className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {music.duration ? `${Math.floor(music.duration / 60)}:${(music.duration % 60).toString().padStart(2, '0')}` : '2:30'}
                    </span>
                    
                    <div className="flex gap-2">
                      <button 
                        className="p-1 hover:bg-accent rounded transition-colors"
                        onClick={() => trackEngagement(music._id, 'download')}
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button 
                        className="p-1 hover:bg-accent rounded transition-colors"
                        title="Share"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* My Work - Split Layout for Music Generation */
        <div className="grid grid-cols-2 gap-6" style={{ height: '520px', position: 'relative' }}>
        {/* Left Side - Input Area - Fixed Height */}
        <div className="flex flex-col" style={{ height: '520px' }}>
          {/* Tab Selector */}
          <div className="flex gap-2 mb-4">
            <button 
              onClick={() => setIsAdvanced(false)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium ${
                !isAdvanced 
                  ? "bg-foreground text-background" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t('music.simple')}
            </button>
            <button 
              onClick={() => setIsAdvanced(true)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium ${
                isAdvanced 
                  ? "bg-foreground text-background" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t('music.advanced')} ⚙
            </button>
          </div>

          {/* Text Input Area - Takes remaining space */}
          <div className="bg-[#fefefe] dark:bg-black/80 dark:backdrop-blur-xl border border-gray-200/80 dark:border-white/10 rounded-2xl p-6 flex-1 flex flex-col">
            {/* Header with random prompt button */}
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-muted-foreground">
                {!isAdvanced ? t('music.prompt') : t('music.musicDescription')}
              </span>
              <button
                onClick={getRandomPrompt}
                className="px-3 py-1.5 text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md transition-colors flex items-center gap-1"
                title="Get random Lyria-2 prompt"
              >
                🎲 Random
              </button>
            </div>
            
            {/* Simple Mode - Only Prompt */}
            {!isAdvanced ? (
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t('music.prompt')}
                className="w-full flex-1 bg-transparent resize-none outline-none text-foreground text-sm min-h-0"
              />
            ) : (
              /* Advanced Mode - Prompt + Lyrics */
              <div className="flex flex-col flex-1 gap-4">
                <div className="flex-1">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={t('music.stylePrompt')}
                    className="w-full h-full bg-transparent resize-none outline-none text-foreground text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-muted-foreground mb-2">{t('music.lyrics')}</label>
                  <textarea
                    value={lyrics}
                    onChange={(e) => setLyrics(e.target.value)}
                    placeholder={t('music.lyricsPlaceholder')}
                    className="w-full h-full bg-transparent resize-none outline-none text-foreground text-sm"
                  />
                </div>
              </div>
            )}
            
            <div className="pt-4 border-t border-border mt-auto">
              {/* Error Message - Fixed Height Space */}
              <div className="h-12 mb-4 flex items-center">
                {error && (
                  <div className="p-2 bg-destructive/10 border border-destructive/20 rounded-lg w-full">
                    <p className="text-destructive text-xs">{error}</p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>40 / 300 {t('music.characters')}</span>
                  <span>📷</span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {t('music.quantity')}: 1 ({loadingCreditCost ? '...' : creditCost} {t('common.credits').toLowerCase()}) • {t('common.credits')}: {user?.credits || 0}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Duration Selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{t('common.duration')}:</span>
                    <select 
                      value={selectedDuration}
                      onChange={(e) => setSelectedDuration(e.target.value)}
                      className="px-3 py-1 border border-border rounded-md bg-card text-sm"
                    >
                      <option value="30">{t('music.duration.30s', '30s')}</option>
                      <option value="60">{t('music.duration.1min', '1min')}</option>
                      <option value="120">{t('music.duration.2min', '2min')}</option>
                      <option value="180">{t('music.duration.3min', '3min')}</option>
                      <option value="240">{t('music.duration.4min', '4min')}</option>
                    </select>
                  </div>
                  
                  <button 
                    onClick={generateMusic}
                    disabled={isGenerating || !token}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  >
                    <span>{isGenerating ? t('music.creating') : t('common.create')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Track List - Fixed Height with Scroll */}
        <div className="flex flex-col" style={{ height: '520px' }}>
          <div className="bg-[#fefefe] dark:bg-black/80 dark:backdrop-blur-xl border border-gray-200/80 dark:border-white/10 rounded-2xl flex-1 flex flex-col" style={{ height: '464px' }}>
            <div 
              className="flex-1 overflow-y-auto pl-6 pr-3 py-6" 
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'hsl(var(--border)) transparent'
              }}
            >
              <div className="space-y-4 pr-3">
              {/* Show all generated music with scroll - all statuses */}
              {(generatedMusics || []).map((music, index) => (
                <div key={`generated-${music._id || index}`} className="bg-background border border-border rounded-xl p-4 flex items-center gap-4">
                  {/* Thumbnail - Artwork or Gradient */}
                  <div 
                    className={`w-16 h-16 rounded-lg relative group flex items-center justify-center flex-shrink-0 overflow-hidden ${
                      music.status === 'failed' ? 'opacity-50' : 
                      music.status === 'processing' || music.status === 'generating' ? 'animate-pulse' : 
                      'cursor-pointer'
                    }`}
                    style={{
                      background: music.status === 'failed' 
                        ? 'linear-gradient(to bottom right, rgb(239 68 68), rgb(220 38 38))' // Red gradient for failed
                        : music.status === 'processing' || music.status === 'generating'
                          ? 'linear-gradient(to bottom right, rgb(147 51 234 / 0.5), rgb(219 39 119 / 0.5))' // Faded gradient for processing
                          : music.artworkUrl && music.artworkUrl.startsWith('http') 
                            ? `url(${music.artworkUrl})` 
                            : music.artworkUrl || 'linear-gradient(to bottom right, rgb(147 51 234), rgb(219 39 119))',
                      backgroundSize: music.artworkUrl && music.artworkUrl.startsWith('http') ? 'cover' : 'cover',
                      backgroundPosition: 'center'
                    }}
                    onClick={() => {
                      if (music.status === 'completed' && (music.cdnUrl || music.audioUrl)) {
                        const currentMusicId = music._id || `music-${index}`;
                        const currentMusicTitle = `${music.title || "Generated Music"} - ${currentMusicId}`;
                        
                        // Create playlist from all completed music
                        const completedMusic = (generatedMusics || []).filter(m => m.status === 'completed' && (m.cdnUrl || m.audioUrl));
                        const playlist = completedMusic.map((m, i) => ({
                          name: `${m.title || "Generated Music"} - ${m._id || `music-${i}`}`,
                          audioUrl: m.cdnUrl || m.audioUrl,
                          displayName: m.title || "Generated Music",
                          artworkUrl: m.artworkUrl,
                          artworkData: m.artworkData
                        }));
                        
                        setPlaylist(playlist);
                        
                        if (playingVoice?.name === currentMusicTitle) {
                          // Same track playing, toggle play/pause
                          togglePlay();
                        } else {
                          // Different track, start playing
                          setPlayingVoice({
                            name: currentMusicTitle, // Unique identifier
                            audioUrl: music.cdnUrl || music.audioUrl,
                            displayName: music.title || "Generated Music", // What user sees
                            artworkUrl: music.artworkUrl,
                            artworkData: music.artworkData
                          });
                        }
                      }
                    }}
                  >
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors rounded-lg flex items-center justify-center">
                      {music.status === 'failed' ? (
                        // Show X icon for failed music
                        <div className="text-white text-2xl font-bold">✕</div>
                      ) : music.status === 'processing' || music.status === 'generating' ? (
                        // Show loading icon for processing music
                        <Sparkles className="h-6 w-6 text-white animate-spin" />
                      ) : music.status === 'completed' && (music.cdnUrl || music.audioUrl) ? (
                        // Show play/pause based on current state - always visible when playing
                        (() => {
                          const currentMusicId = music._id || `music-${index}`;
                          const currentMusicTitle = `${music.title || "Generated Music"} - ${currentMusicId}`;
                          
                          if (playingVoice?.name === currentMusicTitle && isPlaying) {
                            return <Pause className="h-6 w-6 text-white opacity-100 transition-opacity" />;
                          } else if (playingVoice?.name === currentMusicTitle) {
                            return <Play className="h-6 w-6 text-white opacity-100 transition-opacity" />;
                          } else {
                            return <Play className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />;
                          }
                        })()
                      ) : (
                        <Sparkles className="h-6 w-6 text-white" />
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate text-base">{music.title || "Generated Music"}</h3>
                    {/* Show status message */}
                    {music.status === 'failed' && (
                      <p className="text-xs text-red-500 mt-1">
                        {music.error || "Prompt was rejected. Please try with a different prompt."}
                      </p>
                    )}
                    {(music.status === 'processing' || music.status === 'generating') && (
                      <p className="text-xs text-blue-500 mt-1">
                        {music.status === 'generating' ? 'Starting generation...' : 'Processing audio...'}
                      </p>
                    )}
                    {/* Tags - Mockup Style */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {music.prompt?.split(',').filter((tag: string) => tag.trim()).slice(0, 3).map((tag: string, tagIndex: number) => (
                        <span 
                          key={tagIndex} 
                          className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons + Duration - Exact Mockup Order */}
                  <div className="flex items-center gap-3">
                    {/* Duration first */}
                    <span className="text-sm text-muted-foreground font-mono">
                      {music.duration ? `${Math.floor(music.duration / 60)}:${(music.duration % 60).toString().padStart(2, '0')}` : '01:34'}
                    </span>

                    <button 
                      className="p-2 hover:bg-accent rounded-lg transition-colors"
                      title={t('music.copyPrompt')}
                      onClick={() => {
                        navigator.clipboard.writeText(music.prompt || "")
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </button>

                    <button 
                      className="p-2 hover:bg-accent rounded-lg transition-colors"
                      title={t('common.download')}
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    
                    <button 
                      className="p-2 hover:bg-accent rounded-lg transition-colors"
                      title={t('common.share')}
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                    
                    <UserDropdown
                      trigger={
                        <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      }
                      items={[
                        { label: t('common.delete'), icon: MoreHorizontal, onClick: () => {} },
                      ]}
                    />
                  </div>
                </div>
              ))}
              </div>
            </div>
            
          </div>
        </div>
      </div>
      )}
    </div>
  )
}