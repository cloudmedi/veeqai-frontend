import { Outlet } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import Header from "./header" 
import Sidebar from "./sidebar"
import { Pause, SkipBack, SkipForward, Volume2, Heart, Download, Share2, Play, VolumeX, X } from "lucide-react"
import { useState, createContext, useContext, useRef, useEffect } from "react"
import { VoiceSelectionProvider } from "@/contexts/voice-selection-context"
import { usePreferencesStore } from "@/stores/preferences-store"

interface PlayingVoice {
  name: string
  audioUrl: string
  displayName: string
  artworkUrl?: string
  artworkData?: any
}

interface PlayerContextType {
  playingVoice: PlayingVoice | null
  setPlayingVoice: (voice: PlayingVoice | null) => void
  isPlaying: boolean
  togglePlay: () => void
  playlist: PlayingVoice[]
  setPlaylist: (playlist: PlayingVoice[]) => void
  currentIndex: number
  playNext: () => void
  playPrevious: () => void
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined)

export const usePlayer = () => {
  const context = useContext(PlayerContext)
  if (!context) {
    throw new Error("usePlayer must be used within PlayerProvider")
  }
  return context
}

export default function Layout() {
  const { t } = useTranslation()
  const { initializePreferences } = usePreferencesStore()
  const [playingVoice, setPlayingVoice] = useState<PlayingVoice | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playlist, setPlaylist] = useState<PlayingVoice[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  // Initialize preferences on mount
  useEffect(() => {
    initializePreferences()
  }, [])

  useEffect(() => {
    if (playingVoice && audioRef.current) {
      audioRef.current.src = playingVoice.audioUrl
      audioRef.current.volume = isMuted ? 0 : volume
      audioRef.current.play()
      setIsPlaying(true)
    }
  }, [playingVoice])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const playNext = () => {
    if (playlist.length > 0) {
      const nextIndex = (currentIndex + 1) % playlist.length
      setCurrentIndex(nextIndex)
      setPlayingVoice(playlist[nextIndex])
      setCurrentTime(0)
    }
  }

  const playPrevious = () => {
    if (playlist.length > 0) {
      const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1
      setCurrentIndex(prevIndex)
      setPlayingVoice(playlist[prevIndex])
      setCurrentTime(0)
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (newVolume > 0) {
      setIsMuted(false)
    }
  }

  const toggleLike = () => {
    setIsLiked(!isLiked)
    // TODO: API call to like/unlike music
  }

  const handleDownload = () => {
    if (playingVoice?.audioUrl) {
      const link = document.createElement('a')
      link.href = playingVoice.audioUrl
      link.download = `${playingVoice.displayName}.mp3`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleShare = async () => {
    if (playingVoice?.audioUrl) {
      if (navigator.share) {
        try {
          await navigator.share({
            title: playingVoice.displayName,
            text: `Check out this music: ${playingVoice.displayName}`,
            url: playingVoice.audioUrl
          })
        } catch (error) {
          console.log('Error sharing:', error)
        }
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(playingVoice.audioUrl)
        // TODO: Show toast notification
      }
    }
  }

  return (
    <VoiceSelectionProvider>
      <PlayerContext.Provider value={{ 
        playingVoice, 
        setPlayingVoice, 
        isPlaying, 
        togglePlay, 
        playlist, 
        setPlaylist, 
        currentIndex, 
        playNext, 
        playPrevious 
      }}>
        <div className="h-screen flex flex-col bg-background dark:bg-black/90">
        {/* Fixed Header */}
        <Header />
        
        {/* Main Layout Container */}
        <div className="flex flex-1 overflow-hidden">
          {/* Fixed Sidebar */}
          <Sidebar />
          
          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto bg-background dark:bg-transparent p-6 relative">
            <div className="max-w-full">
              <Outlet />
              
            </div>
          </main>
        </div>
      </div>
      
      {/* Global Audio Player */}
      {playingVoice && (
        <div className="fixed bottom-0 left-64 right-6 z-50 ml-6">
          <div className="bg-[#fefefe] dark:bg-black/80 dark:backdrop-blur-xl border border-gray-200/80 dark:border-white/10 rounded-2xl p-5 shadow-xl dark:shadow-2xl">
            <div className="flex items-center gap-4">
              {/* Current Voice/Track Info - Fixed Width */}
              <div className="flex items-center gap-3 w-64 flex-shrink-0">
                <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center">
                  {playingVoice.artworkUrl ? (
                    playingVoice.artworkUrl.startsWith('http') ? (
                      <img 
                        src={playingVoice.artworkUrl} 
                        alt={playingVoice.displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div 
                        className="w-full h-full"
                        style={{ background: playingVoice.artworkUrl }}
                      />
                    )
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center text-2xl">
                      🎵
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{playingVoice.displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{t('player.playing')}</p>
                </div>
              </div>

              {/* Player Controls - Fixed Width */}
              <div className="flex items-center justify-center gap-4 w-32 flex-shrink-0">
                <button 
                  className="p-2 hover:bg-accent rounded-full transition-colors"
                  onClick={playPrevious}
                  disabled={playlist.length <= 1}
                >
                  <SkipBack className="h-4 w-4" />
                </button>
                <button 
                  className="p-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
                  onClick={togglePlay}
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </button>
                <button 
                  className="p-2 hover:bg-accent rounded-full transition-colors"
                  onClick={playNext}
                  disabled={playlist.length <= 1}
                >
                  <SkipForward className="h-4 w-4" />
                </button>
              </div>

              {/* Progress Bar - Flexible */}
              <div className="flex-1 flex items-center gap-3 min-w-0">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {Math.floor(currentTime / 60)}:{(Math.floor(currentTime) % 60).toString().padStart(2, '0')}
                </span>
                <div 
                  className="flex-1 h-1 bg-secondary rounded-full overflow-hidden cursor-pointer"
                  onClick={(e) => {
                    if (audioRef.current && duration) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const percentage = x / rect.width;
                      const newTime = percentage * duration;
                      audioRef.current.currentTime = newTime;
                      setCurrentTime(newTime);
                    }
                  }}
                >
                  <div 
                    className="h-full bg-primary transition-all" 
                    style={{ 
                      width: duration ? `${(currentTime / duration) * 100}%` : '0%' 
                    }} 
                  />
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {Math.floor(duration / 60)}:{(Math.floor(duration) % 60).toString().padStart(2, '0')}
                </span>
              </div>

              {/* Right Actions - Fixed Width */}
              <div className="flex items-center gap-2 w-60 flex-shrink-0 justify-end">
                {/* Volume Control */}
                <div className="flex items-center gap-2">
                  <button 
                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                    onClick={toggleMute}
                    title={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 h-1 bg-secondary rounded-full appearance-none cursor-pointer slider"
                    title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                  />
                </div>

                {/* Like Button */}
                <button 
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                  onClick={toggleLike}
                  title={isLiked ? "Unlike" : "Like"}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                </button>

                {/* Download Button */}
                <button 
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                  onClick={handleDownload}
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </button>

                {/* Share Button */}
                <button 
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                  onClick={handleShare}
                  title="Share"
                >
                  <Share2 className="h-4 w-4" />
                </button>

                {/* Close Button */}
                <button 
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.pause()
                      audioRef.current.currentTime = 0
                    }
                    setIsPlaying(false)
                    setCurrentTime(0)
                    setPlayingVoice(null)
                  }}
                  title="Close Player"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => {
          setIsPlaying(false)
          setCurrentTime(0)
          // Auto play next track if playlist has more songs
          if (playlist.length > 1) {
            playNext()
          }
        }}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />
      
      </PlayerContext.Provider>
    </VoiceSelectionProvider>
  )
}