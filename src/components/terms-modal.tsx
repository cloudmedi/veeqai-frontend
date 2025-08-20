import { X } from "lucide-react"
import { useTranslation } from 'react-i18next'

interface TermsModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'terms' | 'privacy'
}

export function TermsModal({ isOpen, onClose, type }: TermsModalProps) {
  const { t, i18n } = useTranslation()

  if (!isOpen) return null

  const getTermsContent = () => {
    return (
      <div className="space-y-6">
        <p className="text-gray-600 mb-6">
          <strong>{t('termsOfService.lastUpdated')}:</strong> {new Date().toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">1. {t('termsOfService.agreement.title')}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t('termsOfService.agreement.content')}
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">2. {t('termsOfService.services.title')}</h2>
          <p className="text-sm text-muted-foreground mb-3">
            {t('termsOfService.services.intro')}
          </p>
          <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
            <li>{t('termsOfService.services.tts')}</li>
            <li>{t('termsOfService.services.cloning')}</li>
            <li>{t('termsOfService.services.music')}</li>
            <li>{t('termsOfService.services.isolation')}</li>
            <li>{t('termsOfService.services.api')}</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">3. {t('termsOfService.account.title')}</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {t('termsOfService.account.responsibility')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('termsOfService.account.accuracy')}
            </p>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">4. {t('termsOfService.acceptableUse.title')}</h2>
          <p className="text-sm text-muted-foreground mb-3">{t('termsOfService.acceptableUse.intro')}</p>
          <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
            <li>{t('termsOfService.acceptableUse.laws')}</li>
            <li>{t('termsOfService.acceptableUse.consent')}</li>
            <li>{t('termsOfService.acceptableUse.misleading')}</li>
            <li>{t('termsOfService.acceptableUse.impersonate')}</li>
            <li>{t('termsOfService.acceptableUse.harassment')}</li>
            <li>{t('termsOfService.acceptableUse.intellectual')}</li>
            <li>{t('termsOfService.acceptableUse.reverse')}</li>
            <li>{t('termsOfService.acceptableUse.resell')}</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">5. {t('termsOfService.rights.title')}</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              <strong>{t('termsOfService.rights.yourContent.title')}:</strong> {t('termsOfService.rights.yourContent.content')}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>{t('termsOfService.rights.generated.title')}:</strong> {t('termsOfService.rights.generated.content')}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>{t('termsOfService.rights.voiceConsent.title')}:</strong> {t('termsOfService.rights.voiceConsent.content')}
            </p>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">6. {t('termsOfService.payment.title')}</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {t('termsOfService.payment.credits')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('termsOfService.payment.processing')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('termsOfService.payment.pricing')}
            </p>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">7. {t('termsOfService.availability.title')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('termsOfService.availability.content')}
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">8. {t('termsOfService.intellectualProperty.title')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('termsOfService.intellectualProperty.content')}
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">9. {t('termsOfService.privacy.title')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('termsOfService.privacy.content')}
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">10. {t('termsOfService.disclaimers.title')}</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              <strong>{t('termsOfService.disclaimers.service.title')}:</strong> {t('termsOfService.disclaimers.service.content')}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>{t('termsOfService.disclaimers.liability.title')}:</strong> {t('termsOfService.disclaimers.liability.content')}
            </p>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">11. {t('termsOfService.indemnification.title')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('termsOfService.indemnification.content')}
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">12. {t('termsOfService.termination.title')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('termsOfService.termination.content')}
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">13. {t('termsOfService.governingLaw.title')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('termsOfService.governingLaw.content')}
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">14. {t('termsOfService.changes.title')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('termsOfService.changes.content')}
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">15. {t('termsOfService.contact.title')}</h2>
          <p className="text-sm text-muted-foreground mb-3">
            {t('termsOfService.contact.intro')}
          </p>
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>VEMLO YAZILIM BİLGİ İLETİŞİM TEKNOLOJİLERİ REKLAM PAZARLAMA LİMİTED ŞİRKETİ</strong><br />
              {t('termsOfService.contact.address')}: İkitelli OSB Giyim Sanatkarları 1A Blok Sk. Giyim Sanatkarları Tic. Merkezi 1A Blok No:1 A Blok 1B026-A Başakşehir, İstanbul<br />
              {t('termsOfService.contact.phone')}: +90 212 963 23 76<br />
              {t('termsOfService.contact.email')}: support@veeq.ai<br />
              {t('termsOfService.contact.subject')}: {t('termsOfService.contact.subjectText')}
            </p>
          </div>
        </section>
      </div>
    )
  }

  const getPrivacyContent = () => {
    return (
      <div className="space-y-6">
        <p className="text-gray-600 mb-6">
          <strong>{t('privacyPolicy.lastUpdated')}:</strong> {new Date().toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">1. {t('privacyPolicy.introduction.title')}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t('privacyPolicy.introduction.content')}
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">2. {t('privacyPolicy.informationWeCollect.title')}</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-medium mb-2">{t('privacyPolicy.informationWeCollect.personal.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('privacyPolicy.informationWeCollect.personal.content')}
              </p>
            </div>
            <div>
              <h3 className="text-base font-medium mb-2">{t('privacyPolicy.informationWeCollect.voice.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('privacyPolicy.informationWeCollect.voice.content')}
              </p>
            </div>
            <div>
              <h3 className="text-base font-medium mb-2">{t('privacyPolicy.informationWeCollect.usage.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('privacyPolicy.informationWeCollect.usage.content')}
              </p>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">3. {t('privacyPolicy.howWeUse.title')}</h2>
          <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
            <li>{t('privacyPolicy.howWeUse.item1')}</li>
            <li>{t('privacyPolicy.howWeUse.item2')}</li>
            <li>{t('privacyPolicy.howWeUse.item3')}</li>
            <li>{t('privacyPolicy.howWeUse.item4')}</li>
            <li>{t('privacyPolicy.howWeUse.item5')}</li>
            <li>{t('privacyPolicy.howWeUse.item6')}</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">4. {t('privacyPolicy.dataSharing.title')}</h2>
          <p className="text-sm text-muted-foreground mb-3">
            {t('privacyPolicy.dataSharing.intro')}
          </p>
          <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
            <li><strong>{t('privacyPolicy.dataSharing.providers.title')}:</strong> {t('privacyPolicy.dataSharing.providers.content')}</li>
            <li><strong>{t('privacyPolicy.dataSharing.legal.title')}:</strong> {t('privacyPolicy.dataSharing.legal.content')}</li>
            <li><strong>{t('privacyPolicy.dataSharing.business.title')}:</strong> {t('privacyPolicy.dataSharing.business.content')}</li>
            <li><strong>{t('privacyPolicy.dataSharing.consent.title')}:</strong> {t('privacyPolicy.dataSharing.consent.content')}</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">5. {t('privacyPolicy.dataSecurity.title')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('privacyPolicy.dataSecurity.content')}
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">6. {t('privacyPolicy.dataRetention.title')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('privacyPolicy.dataRetention.content')}
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">7. {t('privacyPolicy.yourRights.title')}</h2>
          <p className="text-sm text-muted-foreground mb-3">{t('privacyPolicy.yourRights.intro')}</p>
          <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
            <li>{t('privacyPolicy.yourRights.access')}</li>
            <li>{t('privacyPolicy.yourRights.delete')}</li>
            <li>{t('privacyPolicy.yourRights.object')}</li>
            <li>{t('privacyPolicy.yourRights.portability')}</li>
            <li>{t('privacyPolicy.yourRights.withdraw')}</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">8. {t('privacyPolicy.internationalTransfers.title')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('privacyPolicy.internationalTransfers.content')}
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">9. {t('privacyPolicy.childrenPrivacy.title')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('privacyPolicy.childrenPrivacy.content')}
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">10. {t('privacyPolicy.changes.title')}</h2>
          <p className="text-sm text-muted-foreground">
            {t('privacyPolicy.changes.content')}
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">11. {t('privacyPolicy.contact.title')}</h2>
          <p className="text-sm text-muted-foreground mb-3">
            {t('privacyPolicy.contact.intro')}
          </p>
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>VEMLO YAZILIM BİLGİ İLETİŞİM TEKNOLOJİLERİ REKLAM PAZARLAMA LİMİTED ŞİRKETİ</strong><br />
              {t('privacyPolicy.contact.address')}: İkitelli OSB Giyim Sanatkarları 1A Blok Sk. Giyim Sanatkarları Tic. Merkezi 1A Blok No:1 A Blok 1B026-A Başakşehir, İstanbul<br />
              {t('privacyPolicy.contact.phone')}: +90 212 963 23 76<br />
              {t('privacyPolicy.contact.email')}: support@veeq.ai<br />
              {t('privacyPolicy.contact.subject')}: {t('privacyPolicy.contact.subjectText')}
            </p>
          </div>
        </section>
      </div>
    )
  }

  const getContent = () => {
    return type === 'terms' ? getTermsContent() : getPrivacyContent()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold">
            {type === 'terms' ? t('auth.termsOfService') : t('auth.privacyPolicy')}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-accent rounded-md transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {getContent()}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-border">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  )
}