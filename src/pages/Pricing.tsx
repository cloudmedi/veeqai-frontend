import { useState, useEffect } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api-client'

interface Plan {
  _id?: string
  id?: string  // Backend sends 'id' instead of '_id'
  name: string
  displayName: string
  description: string
  pricing: {
    monthly: { amount: number; currency: string }
    yearly?: { amount: number; currency: string; discount?: number }
  }
  credits?: {
    monthly: number
    rates?: {
      tts: number
      music: { per30Seconds: number; per60Seconds: number }
      voiceClone: { creation: number; usage: number }
      voiceIsolator: { perMinute: number }
    }
  }
  features?: { [key: string]: boolean }
  display?: {  // Optional since backend doesn't always send it
    order?: number
    featured?: boolean
    popular?: boolean
    badge?: string
    color?: string
    icon?: string
  }
  isPopular?: boolean  // Backend sends this directly
  status?: 'active' | 'inactive' | 'deprecated'
  target?: 'individual' | 'team' | 'enterprise' | 'all'
}

export default function PricingPage() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const [plans, setPlans] = useState<Plan[]>([])
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  // Clean, enterprise-grade payment modal
  const openPaymentModal = (token: string) => {
    // Clean up existing modal
    document.querySelector('.veeq-payment-modal')?.remove()

    // Create modal
    const modal = document.createElement('div')
    modal.className = 'veeq-payment-modal'
    modal.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal-content">
          <div class="modal-header">
            <div class="modal-title">
              <span class="veeq-logo">VeeqAI</span>
              <span>Güvenli Ödeme</span>
            </div>
            <button class="close-btn">✕</button>
          </div>
          <div id="iyzico-form-container" class="form-container"></div>
        </div>
      </div>
    `

    // Add styles
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      z-index: 9999; display: flex; align-items: center; justify-content: center;
      background: rgba(0,0,0,0.75); backdrop-filter: blur(8px);
      opacity: 0; transition: opacity 0.3s ease;
    `
    
    const content = modal.querySelector('.modal-content') as HTMLElement
    content.style.cssText = `
      background: white; border-radius: 16px; max-width: 600px; width: 90%;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
      transform: scale(0.95) translateY(20px); transition: all 0.3s ease;
    `

    const header = modal.querySelector('.modal-header') as HTMLElement  
    header.style.cssText = `
      padding: 24px; border-bottom: 1px solid #f1f5f9;
      display: flex; justify-content: space-between; align-items: center;
    `

    const title = modal.querySelector('.modal-title') as HTMLElement
    title.style.cssText = `
      display: flex; align-items: center; gap: 8px;
      font-weight: 600; font-size: 18px; color: #1e293b;
    `

    const logo = modal.querySelector('.veeq-logo') as HTMLElement
    logo.style.cssText = `
      font-size: 16px; font-weight: 700; color: #6366f1;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    `

    const closeBtn = modal.querySelector('.close-btn') as HTMLElement
    closeBtn.style.cssText = `
      background: none; border: none; font-size: 20px; color: #64748b;
      cursor: pointer; padding: 8px; border-radius: 8px;
      width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
    `

    const container = modal.querySelector('#iyzico-form-container') as HTMLElement
    container.style.cssText = `padding: 0; min-height: 400px;`

    // Close function
    const closeModal = () => {
      modal.style.opacity = '0'
      content.style.transform = 'scale(0.95) translateY(20px)'
      setTimeout(() => modal.remove(), 300)
    }

    // Event listeners  
    closeBtn.addEventListener('click', closeModal)
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal()
    })
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal()
    })

    document.body.appendChild(modal)

    // Animate in
    setTimeout(() => {
      modal.style.opacity = '1' 
      content.style.transform = 'scale(1) translateY(0)'
    }, 10)

    // Initialize Iyzico form with API token
    console.log('🔑 Initializing payment with token:', token.substring(0, 20) + '...')
    loadIyzicoSDK(() => {
      console.log('📦 Iyzico SDK loaded, initializing form')
      try {
        (window as any).iyzipay.checkoutForm.init({
          token: token,
          containerId: 'iyzico-form-container',
          callbackName: 'iyzicoCallback'
        })
        console.log('✅ Iyzico form initialized successfully')
      } catch (error) {
        console.error('❌ Iyzico initialization failed:', error)
        alert('Ödeme formu yüklenemedi: ' + error.message)
      }
    })
  }

  // Load Iyzico SDK
  const loadIyzicoSDK = (callback: () => void) => {
    console.log('🚀 Loading Iyzico SDK...')
    
    if ((window as any).iyzipay) {
      console.log('✅ Iyzico SDK already loaded')
      callback()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://static.iyzipay.com/checkoutform/api/js/iyzipay-checkout-form-1.0.0.js'
    script.onload = () => {
      console.log('✅ Iyzico SDK loaded from CDN')
      callback()
    }
    script.onerror = () => {
      console.error('❌ Failed to load Iyzico SDK')
      alert('Ödeme sistemi yüklenemedi. Lütfen sayfayı yenileyin.')
    }
    document.head.appendChild(script)

    // Global callback for payment result
    ;(window as any).iyzicoCallback = (result: any) => {
      console.log('💳 Payment callback received:', result)
      if (result.status === 'success') {
        console.log('✅ Payment successful, reloading page')
        window.location.reload()
      } else {
        console.error('❌ Payment failed:', result.errorMessage)
        alert('Ödeme başarısız: ' + result.errorMessage)
      }
    }
  }


  useEffect(() => {
    fetchPlans()
    // WebSocket connection removed - not needed for pricing page
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await apiClient.get('/payment/plans')
      // apiClient already extracts data.data, so response IS the data object
      const plansData = (response as any)?.plans || []
      setPlans(plansData)
    } catch (error) {
      console.error('Failed to fetch plans:', error)
    } finally {
      // Loading state removed for instant display
    }
  }

  const formatUsage = (credits: number, planName: string) => {
    // Convert credits to service package names
    if (planName.toLowerCase() === 'free') {
      return t('common.limited') || 'Limited'
    } else if (credits >= 1000000) {
      return t('common.unlimited') || 'Unlimited'
    } else if (credits >= 500000) {
      return i18n.language === 'tr' ? 'Geniş Paket' : 'Premium Package'
    } else if (credits >= 100000) {
      return i18n.language === 'tr' ? 'İleri Paket' : 'Advanced Package'
    } else if (credits >= 10000) {
      return i18n.language === 'tr' ? 'Standart Paket' : 'Standard Package'
    } else if (credits >= 1000) {
      return i18n.language === 'tr' ? 'Başlangıç Paketi' : 'Starter Package'
    }
    return i18n.language === 'tr' ? 'Sınırlı Paket' : 'Limited Package'
  }

  // Translate plan names based on current language
  const translatePlanName = (name: string) => {
    const planTranslations: { [key: string]: string } = {
      'Free': t('pricing.plans.free'),
      'Starter': t('pricing.plans.starter'),
      'Creator': t('pricing.plans.creator'),
      'Pro': t('pricing.plans.pro'),
      'Enterprise': t('pricing.plans.enterprise')
    }
    return planTranslations[name] || name
  }

  // Translate feature names
  const translateFeature = (feature: string) => {
    const featureTranslations: { [key: string]: string } = {
      'Lifelike Text-to-Speech': t('pricing.features.textToSpeech'),
      'AI Music Generation': t('pricing.features.musicGeneration'),
      'Voice Cloning': t('pricing.features.voiceCloning'),
      'Voice Isolator': t('pricing.features.voiceIsolator'),
      'API Access': t('pricing.features.apiAccess'),
      'Commercial License': t('pricing.features.commercialLicense')
    }
    return featureTranslations[feature] || feature
  }

  // Translate service descriptions using i18n
  const translateServiceDesc = (service: string, _plan: Plan) => {
    if (service.includes('text-to-speech')) {
      return t('pricing.features.textToSpeechDesc')
    } else if (service.includes('music-generation')) {
      return t('pricing.features.musicGenerationDesc')
    } else if (service.includes('voice-cloning')) {
      return t('pricing.features.voiceCloningDesc')
    } else if (service.includes('voice-isolator')) {
      return t('pricing.features.voiceIsolatorDesc')
    } else if (service.includes('api-access')) {
      return t('pricing.features.apiAccessDesc')
    } else if (service.includes('commercial')) {
      return t('pricing.features.commercialLicenseDesc')
    }
    return service
  }

  // const getPlanIcon = (planName: string) => {
  //   switch (planName.toLowerCase()) {
  //     case 'free':
  //       return Star
  //     case 'starter':
  //       return Zap
  //     case 'creator':
  //       return Crown
  //     case 'pro':
  //       return Shield
  //     default:
  //       return Star
  //   }
  // }

  const handleSubscribe = async (planId: string) => {
    try {
      // Check if user is logged in
      if (!user) {
        // Redirect to login page
        window.location.href = '/login'
        return
      }

      console.log('Initiating payment for plan:', planId)
      
      // Call payment initiate API
      const response = await apiClient.post('/payment/initiate', {
        planId,
        billingInfo: {
          contactName: user.name,
          city: 'Istanbul',
          country: 'Turkey',
          address: 'Address',
          zipCode: '34000'
        }
      }) as any

      console.log('Payment API Response:', response)

      // Use token with clean modal approach
      if (response.token) {
        console.log('Opening payment modal with token')
        openPaymentModal(response.token)
      } else if (response.paymentPageUrl) {
        console.log('Redirecting to payment page:', response.paymentPageUrl)
        window.location.href = response.paymentPageUrl
      } else {
        console.error('Payment data not found in response:', response)
        throw new Error('Payment initialization failed - no payment data')
      }

    } catch (error: any) {
      console.error('Payment initiation failed:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      alert(`Payment could not be initiated. Error: ${error.message || 'Unknown error'}`)
    }
  }

  const getFaqs = () => {
    if (i18n.language === 'tr') {
      return [
        {
          question: 'Kredi nedir ve nasıl çalışır?',
          answer: 'Krediler kullanım tabanlı para birimizdir. Her AI özelliği kredi tüketir: Metin Seslendirme karakter başına 1 kredi, Müzik Üretimi 30 saniye başına 200 kredi, Ses Klonlama bir ses modeli oluşturmak için 2.000 kredi ve Ses Ayırıcı dakika başına 100 kredi kullanır.'
        },
        {
          question: 'Kullanılmayan krediler sonraki aya devredilir mi?',
          answer: 'Evet! Kullanılmayan krediler otomatik olarak sonraki faturalama dönemine devredilir. 3 aya kadar kredi biriktirebilirsiniz, bu da VeeqAI\'ı nasıl kullandığınızda esneklik sağlar.'
        },
        {
          question: 'Aboneliğimi istediğim zaman iptal edebilir miyim?',
          answer: 'Kesinlikle! Aboneliğinizi hesap ayarlarından istediğiniz zaman iptal edebilirsiniz. Planınız mevcut faturalama döneminin sonuna kadar aktif kalacak ve kullanılmayan tüm kredilerinizi saklayacaksınız.'
        },
        {
          question: 'Aylık ve yıllık faturalama arasındaki fark nedir?',
          answer: 'Yıllık faturalama size %20 indirim sağlar ve yılda bir kez faturalandırılır. Aylık faturalama her ay tahsil edilir. Her iki seçenek de aynı özellikleri ve kredi tahsislerini içerir.'
        },
        {
          question: 'İade sunuyor musunuz?',
          answer: 'Tüm ücretli planlar için 14 günlük para iade garantisi sunuyoruz. İlk 14 gün içinde VeeqAI\'dan memnun kalmazsanız, tam para iadesi için destek ekibimizle iletişime geçin.'
        },
        {
          question: 'Planımı yükseltebilir veya düşürebilir miyim?',
          answer: 'Evet, planınızı istediğiniz zaman değiştirebilirsiniz. Yükseltmeler orantılı faturalandırma ile anında yürürlüğe girer. Düşürmeler bir sonraki faturalama döneminin başında yürürlüğe girer.'
        },
        {
          question: 'API mevcut mu?',
          answer: 'Evet! API erişimi Başlangıç planından itibaren mevcuttur. Profesyonel plan, kurumsal uygulamalar için özel uç noktalar ve daha yüksek hız limitleri içerir.'
        },
        {
          question: 'Üretilen içerikleri ticari amaçla kullanabilir miyim?',
          answer: 'Ticari kullanım Başlangıç, İçerik Üretici ve Profesyonel planlarında dahildir. Ücretsiz plan kullanıcıları üretilen içerikleri yalnızca kişisel, ticari olmayan amaçlarla kullanabilir.'
        }
      ]
    } else {
      return [
        {
          question: 'What services are included in each plan?',
          answer: 'Each plan includes different AI services: Text-to-Speech service for converting text to natural speech, Music Generation for creating custom tracks, Voice Cloning for replicating voices, and Voice Isolator for separating vocals from audio. Usage limits vary by plan.'
        },
        {
          question: 'Do unused services roll over to the next month?',
          answer: 'Yes! Unused service allowances automatically roll over to the next billing cycle. You can accumulate up to 3 months of usage, giving you flexibility in how you use VeeqAI.'
        },
        {
          question: 'Can I cancel my subscription anytime?',
          answer: 'Absolutely! You can cancel your subscription at any time from your account settings. Your plan will remain active until the end of your current billing period, and you\'ll keep all unused service allowances.'
        },
        {
          question: 'What\'s the difference between monthly and yearly billing?',
          answer: 'Yearly billing gives you a 20% discount and is billed once per year. Monthly billing is charged every month. Both options include the same features and service allowances.'
        },
        {
          question: 'Do you offer refunds?',
          answer: 'We offer a 14-day money-back guarantee for all paid plans. If you\'re not satisfied with VeeqAI within the first 14 days, contact our support team for a full refund.'
        },
        {
          question: 'Can I upgrade or downgrade my plan?',
          answer: 'Yes, you can change your plan at any time. Upgrades take effect immediately with prorated billing. Downgrades take effect at the start of your next billing cycle.'
        },
        {
          question: 'Is there an API available?',
          answer: 'Yes! API access is available starting from the Starter plan. The Professional plan includes dedicated endpoints and higher rate limits for enterprise applications.'
        },
        {
          question: 'Can I use generated content commercially?',
          answer: 'Commercial usage is included in Starter, Creator, and Professional plans. Free plan users can use generated content for personal, non-commercial purposes only.'
        }
      ]
    }
  }

  // Loading state removed - instant display with empty plans array

  // Backend doesn't send status field, so assume all returned plans are active
  const activePlans = plans.sort((a, b) => (a.display?.order || 0) - (b.display?.order || 0))

  return (
    <div className="min-h-screen bg-background dark:bg-transparent overflow-y-auto">
      <div className="container mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight mb-4">
            {t('pricing.title')}
          </h1>
          <p className="text-xl font-medium tracking-wide text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto">
            {t('pricing.subtitle')}
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center mt-8">
            <div className="bg-[#fefefe] dark:bg-black/80 dark:backdrop-blur-xl p-1 rounded-lg shadow-sm border border-gray-200 dark:border-white/10">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md text-sm font-semibold tracking-wide transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {t('pricing.monthly')}
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-md text-sm font-semibold tracking-wide transition-colors ${
                  billingCycle === 'yearly'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {t('pricing.yearly')}
                <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 text-xs font-semibold tracking-wide rounded-full">
                  {t('pricing.save20')}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {activePlans.map((plan) => {
            // const IconComponent = getPlanIcon(plan.name)
            // Check if this is the current plan - compare with plan display name or name variations
            const isCurrentPlan = user?.subscription && (
              user.subscription.toLowerCase() === plan.name.toLowerCase() ||
              user.subscription.toLowerCase() === plan.displayName.toLowerCase() ||
              user.subscription.toLowerCase().replace(' plan', '') === plan.name.toLowerCase() ||
              (user.subscription === 'Free Plan' && plan.name === 'free') ||
              (user.subscription === 'Free' && plan.name === 'free')
            )
            const isFree = plan.pricing.monthly.amount === 0
            const price = billingCycle === 'yearly' && plan.pricing.yearly 
              ? plan.pricing.yearly.amount 
              : plan.pricing.monthly.amount

            return (
              <div
                key={plan._id || plan.id}
                className={`relative bg-[#fefefe] dark:bg-black/80 dark:backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border flex flex-col ${
                  plan.display?.popular || plan.isPopular
                    ? 'border-purple-500'
                    : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                }`}
              >
                {/* Badge from Database or Auto-generated for Popular */}
                {((plan.display?.badge && plan.display.badge.trim()) || (plan.display?.popular || plan.isPopular)) && (
                  <div className="absolute -top-2 right-4 z-10">
                    <div className={`text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wide shadow-lg ${
                      plan.display?.popular || plan.isPopular 
                        ? 'bg-gradient-to-r from-primary to-purple-600 dark:from-gray-950 dark:to-purple-900' 
                        : 'bg-blue-500'
                    }`}>
                      {plan.display?.badge && plan.display.badge.trim() 
                        ? plan.display.badge 
                        : (plan.display?.popular || plan.isPopular) 
                        ? (i18n.language === 'tr' ? 'EN POPÜLER' : 'MOST POPULAR')
                        : ''
                      }
                    </div>
                  </div>
                )}

                <div className="p-8 flex flex-col flex-grow">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight mb-2">
                      {i18n.language === 'tr' ? translatePlanName(plan.displayName) : plan.displayName}
                    </h3>
                    <div className="h-5 flex items-center justify-center">
                      {plan.pricing.monthly.amount === 0 ? (
                        <p className="text-sm font-medium tracking-wide text-gray-500 dark:text-gray-400 leading-relaxed">
                          {t('pricing.limitedTime')}
                        </p>
                      ) : billingCycle === 'yearly' && plan.pricing.yearly && (
                        <p className="text-sm font-medium tracking-wide text-gray-500 dark:text-gray-400 leading-relaxed">
                          ${(plan.pricing.yearly.amount / 12).toFixed(1)}/{t('pricing.monthBilledAnnually')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="text-center mb-8">
                    <div className="flex items-baseline justify-center mb-2">
                      <span className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                        ${price}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 font-medium tracking-wide ml-2">
                        /{billingCycle === 'yearly' ? t('pricing.year') : t('pricing.month')}
                      </span>
                    </div>
                    <div className="h-6 flex items-center justify-center mt-1">
                      {billingCycle === 'yearly' && plan.pricing.yearly?.discount && (
                        <div className="text-sm font-semibold tracking-wide text-green-600 dark:text-green-400">
                          {t('pricing.saveAnnually', { discount: plan.pricing.yearly.discount })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Credits */}
                  <div className="text-center mb-8 h-24 flex items-center justify-center">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 w-full flex flex-col justify-center min-h-[80px]">
                      <div className="text-3xl font-bold tracking-tight text-primary mb-1 min-w-[60px] flex items-center justify-center">
                        {formatUsage(plan.credits?.monthly || 0, plan.name)}
                      </div>
                      <div className="text-sm font-medium tracking-wide text-gray-600 dark:text-gray-400 leading-relaxed">
                        {billingCycle === 'yearly' ? (i18n.language === 'tr' ? 'Yıllık Hizmetler' : 'Yearly Services') : (i18n.language === 'tr' ? 'Aylık Hizmetler' : 'Monthly Services')}
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-8 flex-grow">
                    {plan.features?.textToSpeech && (
                      <div className="flex items-start">
                        <Check className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-gray-900 dark:text-white text-sm font-semibold tracking-wide">
                            {translateFeature('Lifelike Text-to-Speech')}
                          </div>
                          <div className="text-gray-600 dark:text-gray-400 text-xs font-medium tracking-wide leading-relaxed">
                            {translateServiceDesc('text-to-speech', plan)}
                          </div>
                        </div>
                      </div>
                    )}
                    {plan.features?.musicGeneration && (
                      <div className="flex items-start">
                        <Check className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-gray-900 dark:text-white text-sm font-semibold tracking-wide">
                            {translateFeature('AI Music Generation')}
                          </div>
                          <div className="text-gray-600 dark:text-gray-400 text-xs font-medium tracking-wide leading-relaxed">
                            {translateServiceDesc('music-generation', plan)}
                          </div>
                        </div>
                      </div>
                    )}
                    {plan.features?.voiceCloning && (
                      <div className="flex items-start">
                        <Check className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-gray-900 dark:text-white text-sm font-semibold tracking-wide">
                            {translateFeature('Voice Cloning')}
                          </div>
                          <div className="text-gray-600 dark:text-gray-400 text-xs font-medium tracking-wide leading-relaxed">
                            {translateServiceDesc('voice-cloning', plan)}
                          </div>
                        </div>
                      </div>
                    )}
                    {plan.features?.voiceIsolator && (
                      <div className="flex items-start">
                        <Check className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-gray-900 dark:text-white text-sm font-semibold tracking-wide">
                            {translateFeature('Voice Isolator')}
                          </div>
                          <div className="text-gray-600 dark:text-gray-400 text-xs font-medium tracking-wide leading-relaxed">
                            {translateServiceDesc('voice-isolator', plan)}
                          </div>
                        </div>
                      </div>
                    )}
                    {plan.features?.apiAccess && (
                      <div className="flex items-start">
                        <Check className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-gray-900 dark:text-white text-sm font-semibold tracking-wide">
                            {translateFeature('API Access')}
                          </div>
                          <div className="text-gray-600 dark:text-gray-400 text-xs font-medium tracking-wide leading-relaxed">
                            {translateServiceDesc('api-access', plan)}
                          </div>
                        </div>
                      </div>
                    )}
                    {plan.features?.commercialLicense && (
                      <div className="flex items-start">
                        <Check className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-gray-900 dark:text-white text-sm font-semibold tracking-wide">
                            {translateFeature('Commercial License')}
                          </div>
                          <div className="text-gray-600 dark:text-gray-400 text-xs font-medium tracking-wide leading-relaxed">
                            {translateServiceDesc('commercial', plan)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <div className="mt-auto">
                    <button
                    onClick={() => handleSubscribe(plan._id || plan.id || '')}
                    disabled={!!isCurrentPlan}
                    className={`w-full py-4 px-6 rounded-xl font-semibold tracking-wide text-sm transition-all duration-300 ${
                      isCurrentPlan
                        ? 'bg-background dark:bg-white/10 text-foreground border-2 border-border dark:border-white/30 cursor-not-allowed opacity-50'
                        : (plan.display?.popular || plan.isPopular)
                        ? 'bg-gradient-to-r from-primary to-purple-600 dark:from-gray-950 dark:to-purple-900 hover:from-primary/90 hover:to-purple-600/90 dark:hover:from-gray-900 dark:hover:to-purple-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 dark:before:via-white/20 before:to-transparent before:w-12 before:h-full before:transform before:-translate-x-full before:animate-[shimmer_5s_infinite] before:skew-x-12'
                        : isFree
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                        : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                    }`}
                  >
                    {isCurrentPlan ? (
                      t('pricing.currentPlan')
                    ) : user && !isFree ? (
                      t('pricing.upgradeTo', { plan: i18n.language === 'tr' ? translatePlanName(plan.displayName) : plan.displayName })
                    ) : isFree ? (
                      t('pricing.getStartedFree')
                    ) : (
                      t('pricing.upgradeTo', { plan: i18n.language === 'tr' ? translatePlanName(plan.displayName) : plan.displayName })
                    )}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight mb-4">
              {i18n.language === 'tr' ? 'Sık Sorulan Sorular' : 'Frequently Asked Questions'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 font-medium tracking-wide leading-relaxed max-w-2xl mx-auto">
              {i18n.language === 'tr' ? 'Fiyatlandırmamız hakkında sorularınız mı var? Size yardımcı olmak için buradayız.' : 'Have questions about our pricing? We\'re here to help.'}
            </p>
          </div>

          <div className="space-y-4">
            {getFaqs().map((faq, index) => (
              <div key={index} className="border border-gray-200 dark:border-white/10 rounded-lg bg-[#fefefe] dark:bg-black/80 dark:backdrop-blur-xl">
                <button
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/10 transition-colors rounded-lg font-medium tracking-wide"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-semibold tracking-wide text-gray-900 dark:text-white leading-snug">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-700 dark:text-gray-300 font-medium tracking-wide leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 dark:text-gray-400 font-medium tracking-wide leading-relaxed mb-4">
              {i18n.language === 'tr' ? 'Hâlâ sorularınız mı var?' : 'Still have questions?'}
            </p>
            <button 
              onClick={() => {
                const contactUrl = i18n.language === 'tr' 
                  ? 'http://localhost:5175/tr/contact' 
                  : 'http://localhost:5175/contact'
                window.open(contactUrl, '_blank')
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-semibold tracking-wide transition-colors"
            >
              {i18n.language === 'tr' ? 'Destek Ekibiyle İletişim' : 'Contact Support'}
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}