import { XCircle, RefreshCw, ArrowLeft, CreditCard } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

export default function PaymentFailed() {
  const [searchParams] = useSearchParams()
  
  // Get error info from URL parameters
  const errorMessage = searchParams.get('error') || 'Payment could not be completed'
  const errorCode = searchParams.get('errorCode')

  const handleRetry = () => {
    // Go back to pricing page
    window.location.href = '/pricing'
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Error Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          {/* Error Icon */}
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>

          {/* Error Message */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Payment Failed
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {errorMessage}
          </p>

          {/* Error Details */}
          {errorCode && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
              <div className="text-sm">
                <span className="text-red-600 dark:text-red-400 font-medium">Error Code: </span>
                <span className="font-mono text-red-800 dark:text-red-300">{errorCode}</span>
              </div>
            </div>
          )}

          {/* Common Reasons */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">
              Common reasons for payment failure:
            </h3>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Insufficient funds in your account</li>
              <li>• Incorrect card information</li>
              <li>• Card expired or blocked</li>
              <li>• 3D Secure verification failed</li>
              <li>• Bank declined the transaction</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            
            <button
              onClick={handleGoHome}
              className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go to Home
            </button>
          </div>

          {/* Support Note */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-blue-900 dark:text-blue-200 text-sm">
                Need Help?
              </span>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Contact our support team if the problem persists. We're here to help!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}