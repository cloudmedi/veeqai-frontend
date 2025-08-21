import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/AuthContext"
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import Layout from "@/components/layout"
import ProtectedRoute from "@/components/ProtectedRoute"
import HomePage from "@/pages/home"
import MusicPage from "@/pages/music"
import VoiceDesignPage from "@/pages/voice-design"
import VoiceClonePage from "@/pages/voice-clone"
import VoiceIsolatorPage from "@/pages/voice-isolator"
import VoiceLibraryPage from "@/pages/voice-library"
import SettingsPage from "@/pages/settings"
import LoginPage from "@/pages/Login"
import RegisterPage from "@/pages/Register"
import TextToSpeechPage from "@/pages/text-to-speech"
import PricingPage from "@/pages/Pricing"
import PaymentSuccess from "@/pages/payment/PaymentSuccess"
import PaymentFailed from "@/pages/payment/PaymentFailed"

// Language router component to sync URL with i18n language
function LanguageRouter() {
  const location = useLocation()
  const { i18n } = useTranslation()

  useEffect(() => {
    const pathLang = location.pathname.split('/')[1]
    
    if (pathLang === 'tr' && i18n.language !== 'tr') {
      i18n.changeLanguage('tr')
    } else if (pathLang !== 'tr' && pathLang !== 'en' && i18n.language !== 'en') {
      i18n.changeLanguage('en')
    } else if (pathLang === 'en' && i18n.language !== 'en') {
      i18n.changeLanguage('en')
    }
  }, [location.pathname, i18n])

  return null
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="veeqai-theme">
      <AuthProvider>
        <BrowserRouter>
          <LanguageRouter />
          <Routes>
            {/* Auth Routes - No Layout (English) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Payment Routes - No Layout (English) */}
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/failed" element={<PaymentFailed />} />
            
            {/* Auth Routes - No Layout (Turkish) */}
            <Route path="/tr/login" element={<LoginPage />} />
            <Route path="/tr/register" element={<RegisterPage />} />
            
            {/* Payment Routes - No Layout (Turkish) */}
            <Route path="/tr/payment/success" element={<PaymentSuccess />} />
            <Route path="/tr/payment/failed" element={<PaymentFailed />} />
            
            {/* App Routes - With Layout (English - Default) - PROTECTED */}
            <Route element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route path="/" element={<HomePage />} />
              <Route path="/text-to-speech" element={<TextToSpeechPage />} />
              <Route path="/music" element={<MusicPage />} />
              <Route path="/voice-design" element={<VoiceDesignPage />} />
              <Route path="/voice-clone" element={<VoiceClonePage />} />
              <Route path="/voice-isolator" element={<VoiceIsolatorPage />} />
              <Route path="/voice-library" element={<VoiceLibraryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/pricing" element={<PricingPage />} />
            </Route>

            {/* App Routes - With Layout (Turkish) - PROTECTED */}
            <Route element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route path="/tr" element={
                <>
                  {console.log('🔥 /tr route matched!')}
                  <HomePage />
                </>
              } />
              <Route path="/tr/text-to-speech" element={<TextToSpeechPage />} />
              <Route path="/tr/music" element={<MusicPage />} />
              <Route path="/tr/voice-design" element={<VoiceDesignPage />} />
              <Route path="/tr/voice-clone" element={<VoiceClonePage />} />
              <Route path="/tr/voice-isolator" element={<VoiceIsolatorPage />} />
              <Route path="/tr/voice-library" element={<VoiceLibraryPage />} />
              <Route path="/tr/settings" element={<SettingsPage />} />
              <Route path="/tr/pricing" element={<PricingPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App