'use client'

import { AlertCircle, X } from 'lucide-react'

interface ErrorAlertProps {
  error: string | null
  onDismiss: () => void
}

export default function ErrorAlert({ error, onDismiss }: ErrorAlertProps) {
  if (!error) return null

  return (
    <div className="fixed bottom-4 right-4 bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-lg max-w-md z-50">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium">Erro</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
        <button 
          onClick={onDismiss}
          className="text-red-600 hover:text-red-800 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
