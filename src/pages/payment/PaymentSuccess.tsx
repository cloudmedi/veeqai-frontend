import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckCircle, CreditCard, ArrowRight } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const [paymentStatus, setPaymentStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Get token and conversationId from URL parameters
  const token = searchParams.get('token')
  const conversationId = searchParams.get('conversationId')

  useEffect(() => {
    const processPaymentCallback = async () => {
      try {
        if (!token) {
          throw new Error('Missing payment token')
        }

        // Process payment callback
        const response = await apiClient.post('/payment/callback', {
          token,
          conversationId
        }) as any

        if (response.success) {
          setPaymentStatus(response.data)
        } else {
          throw new Error(response.message || 'Payment processing failed')
        }

      } catch (error) {
        console.error('Payment callback processing failed:', error)
        // Redirect to failure page
        window.location.href = '/payment/failed'
      } finally {
        setLoading(false)
      }
    }

    processPaymentCallback()
  }, [token, conversationId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Processing your payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Success Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>

          {/* Success Message */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your subscription has been activated successfully.
          </p>

          {/* Payment Details */}
          {paymentStatus && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6 text-left">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Amount:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {paymentStatus.amount} {paymentStatus.currency}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Payment ID:</span>
                  <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
                    {paymentStatus.conversationId?.substring(0, 16)}...
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Success
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => window.location.href = '/settings'}
              className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              View Subscription
            </button>
          </div>

          {/* Support Note */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
            If you have any questions, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  )
}