import { createContext, useContext, useState, ReactNode } from 'react'

interface VoiceSelectionContextType {
  selectedVoiceId: string | null
  setSelectedVoiceId: (voiceId: string | null) => void
  selectedVoice: any | null
  setSelectedVoice: (voice: any | null) => void
}

const VoiceSelectionContext = createContext<VoiceSelectionContextType | undefined>(undefined)

export const useVoiceSelection = () => {
  const context = useContext(VoiceSelectionContext)
  if (!context) {
    throw new Error('useVoiceSelection must be used within VoiceSelectionProvider')
  }
  return context
}

export const VoiceSelectionProvider = ({ children }: { children: ReactNode }) => {
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null)
  const [selectedVoice, setSelectedVoice] = useState<any | null>(null)

  return (
    <VoiceSelectionContext.Provider
      value={{
        selectedVoiceId,
        setSelectedVoiceId,
        selectedVoice,
        setSelectedVoice
      }}
    >
      {children}
    </VoiceSelectionContext.Provider>
  )
}