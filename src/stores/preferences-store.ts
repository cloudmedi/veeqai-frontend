import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

/**
 * 🏢 ENTERPRISE PREFERENCES STORE
 * Zustand store for managing user preferences with persistence
 * Follows ElevenLabs/OpenAI architecture patterns
 */

export interface VoicePreferences {
  selectedVoiceId: string | null
  selectedVoice: any | null
  recentVoices: Array<{
    voiceId: string
    voice: any
    lastUsed: Date
  }>
  favoriteVoices: string[]
  voiceSettings: {
    speed: number
    pitch: number
    volume: number
  }
}

export interface UIPreferences {
  theme: 'light' | 'dark' | 'auto'
  sidebarCollapsed: boolean
  defaultPage: 'dashboard' | 'text-to-speech' | 'voice-library' | 'my-music'
}

export interface NotificationPreferences {
  browserNotifications: boolean
  soundEffects: boolean
}

export interface UserPreferences {
  voice: VoicePreferences
  ui: UIPreferences
  notifications: NotificationPreferences
}

interface PreferencesStore {
  // State
  preferences: UserPreferences | null
  loading: boolean
  error: string | null
  
  // Actions
  initializePreferences: () => Promise<void>
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>
  
  // Voice specific actions
  setSelectedVoice: (voiceId: string, voice: any) => Promise<void>
  addToRecentVoices: (voiceId: string, voice: any) => void
  toggleFavoriteVoice: (voiceId: string) => Promise<void>
  updateVoiceSettings: (settings: Partial<VoicePreferences['voiceSettings']>) => Promise<void>
  
  // UI specific actions
  setTheme: (theme: UIPreferences['theme']) => Promise<void>
  toggleSidebar: () => Promise<void>
  setDefaultPage: (page: UIPreferences['defaultPage']) => Promise<void>
  
  // Utility actions
  resetPreferences: () => void
  clearError: () => void
}

const defaultPreferences: UserPreferences = {
  voice: {
    selectedVoiceId: null,
    selectedVoice: null,
    recentVoices: [],
    favoriteVoices: [],
    voiceSettings: {
      speed: 1.0,
      pitch: 0,
      volume: 1.0
    }
  },
  ui: {
    theme: 'auto',
    sidebarCollapsed: false,
    defaultPage: 'text-to-speech'
  },
  notifications: {
    browserNotifications: true,
    soundEffects: true
  }
}

const API_BASE = 'http://localhost:5000/api/preferences'

// Helper function for API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token')
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
    credentials: 'omit'
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }
  
  return response.json()
}

export const usePreferencesStore = create<PreferencesStore>()(
  devtools(
    persist(
      (set, get) => ({
        preferences: null,
        loading: false,
        error: null,

        // Initialize preferences (localStorage only)
        initializePreferences: async () => {
          set({ loading: false, error: null })
          console.log('✅ [PREFERENCES] Using persisted localStorage data')
        },

        // Update preferences on backend
        updatePreferences: async (updates: Partial<UserPreferences>) => {
          try {
            set({ loading: true, error: null })
            
            const currentPreferences = get().preferences || defaultPreferences
            const newPreferences = {
              ...currentPreferences,
              ...updates,
              voice: { ...currentPreferences.voice, ...updates.voice },
              ui: { ...currentPreferences.ui, ...updates.ui },
              notifications: { ...currentPreferences.notifications, ...updates.notifications }
            }

            await apiCall('/', {
              method: 'PUT',
              body: JSON.stringify({ preferences: newPreferences })
            })

            set({ 
              preferences: newPreferences,
              loading: false 
            })
            
            console.log('✅ [PREFERENCES] Updated successfully')
          } catch (error) {
            console.error('❌ [PREFERENCES] Update error:', error)
            set({ 
              loading: false,
              error: error instanceof Error ? error.message : 'Failed to update preferences'
            })
          }
        },

        // Set selected voice (optimized endpoint)
        setSelectedVoice: async (voiceId: string, voice: any) => {
          try {
            set({ loading: true, error: null })
            
            // Optimistic update
            const currentPreferences = get().preferences || defaultPreferences
            const newPreferences = {
              ...currentPreferences,
              voice: {
                ...currentPreferences.voice,
                selectedVoiceId: voiceId,
                selectedVoice: voice
              }
            }
            
            set({ preferences: newPreferences })

            // Backend sync
            await apiCall('/voice/selected', {
              method: 'PUT',
              body: JSON.stringify({ voiceId })
            })

            // Add to recent voices locally
            get().addToRecentVoices(voiceId, voice)
            
            set({ loading: false })
            console.log('✅ [PREFERENCES] Selected voice updated')
          } catch (error) {
            console.error('❌ [PREFERENCES] Voice selection error:', error)
            set({ 
              loading: false,
              error: error instanceof Error ? error.message : 'Failed to select voice'
            })
          }
        },

        // Add to recent voices (local only)
        addToRecentVoices: (voiceId: string, voice: any) => {
          const currentPreferences = get().preferences || defaultPreferences
          const recentVoices = currentPreferences.voice.recentVoices.filter(
            recent => recent.voiceId !== voiceId
          )
          
          recentVoices.unshift({
            voiceId,
            voice,
            lastUsed: new Date()
          })

          // Keep only last 10
          recentVoices.splice(10)

          set({
            preferences: {
              ...currentPreferences,
              voice: {
                ...currentPreferences.voice,
                recentVoices
              }
            }
          })
        },

        // Toggle favorite voice
        toggleFavoriteVoice: async (voiceId: string) => {
          try {
            const currentPreferences = get().preferences || defaultPreferences
            const isFavorite = currentPreferences.voice.favoriteVoices.includes(voiceId)
            const action = isFavorite ? 'remove' : 'add'

            // Optimistic update
            const favoriteVoices = isFavorite
              ? currentPreferences.voice.favoriteVoices.filter(id => id !== voiceId)
              : [...currentPreferences.voice.favoriteVoices, voiceId]

            set({
              preferences: {
                ...currentPreferences,
                voice: {
                  ...currentPreferences.voice,
                  favoriteVoices
                }
              }
            })

            // Backend sync
            await apiCall('/voice/favorite', {
              method: 'POST',
              body: JSON.stringify({ voiceId, action })
            })

            console.log(`✅ [PREFERENCES] Voice ${action}ed to favorites`)
          } catch (error) {
            console.error('❌ [PREFERENCES] Favorite toggle error:', error)
            set({ 
              error: error instanceof Error ? error.message : 'Failed to update favorites'
            })
          }
        },

        // Update voice settings
        updateVoiceSettings: async (settings: Partial<VoicePreferences['voiceSettings']>) => {
          try {
            const currentPreferences = get().preferences || defaultPreferences
            const newSettings = {
              ...currentPreferences.voice.voiceSettings,
              ...settings
            }

            // Optimistic update
            set({
              preferences: {
                ...currentPreferences,
                voice: {
                  ...currentPreferences.voice,
                  voiceSettings: newSettings
                }
              }
            })

            // Backend sync
            await apiCall('/voice/settings', {
              method: 'PUT',
              body: JSON.stringify(settings)
            })

            console.log('✅ [PREFERENCES] Voice settings updated')
          } catch (error) {
            console.error('❌ [PREFERENCES] Settings update error:', error)
            set({ 
              error: error instanceof Error ? error.message : 'Failed to update settings'
            })
          }
        },

        // UI Actions
        setTheme: async (theme: UIPreferences['theme']) => {
          const currentUI = get().preferences?.ui || { theme: 'auto' as const, sidebarCollapsed: false, defaultPage: 'dashboard' as const }
          await get().updatePreferences({ ui: { ...currentUI, theme } })
        },

        toggleSidebar: async () => {
          const current = get().preferences?.ui?.sidebarCollapsed || false
          const currentUI = get().preferences?.ui || { theme: 'auto' as const, sidebarCollapsed: false, defaultPage: 'dashboard' as const }
          await get().updatePreferences({ ui: { ...currentUI, sidebarCollapsed: !current } })
        },

        setDefaultPage: async (defaultPage: UIPreferences['defaultPage']) => {
          const currentUI = get().preferences?.ui || { theme: 'auto' as const, sidebarCollapsed: false, defaultPage: 'dashboard' as const }
          await get().updatePreferences({ ui: { ...currentUI, defaultPage } })
        },

        // Utility actions
        resetPreferences: () => {
          set({ preferences: defaultPreferences, error: null })
        },

        clearError: () => {
          set({ error: null })
        }
      }),
      {
        name: 'veeqai-preferences', // localStorage key
        partialize: (state) => ({ 
          preferences: state.preferences // Only persist preferences
        })
      }
    ),
    { name: 'PreferencesStore' }
  )
)