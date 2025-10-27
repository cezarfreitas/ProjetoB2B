import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface ErrorAlertProps {
  error: string | null
  onDismiss: () => void
}

export default function ErrorAlert({ error, onDismiss }: ErrorAlertProps) {
  if (!error) return null

  return (
    <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg max-w-md z-50">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-medium">Erro</p>
          <p className="text-sm opacity-90">{error}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="text-white hover:text-red-200 ml-2"
        >
          ×
        </Button>
      </div>
    </div>
  )
}
