'use client'

import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ErrorAlertProps {
  error: string | null
  onDismiss: () => void
}

export default function ErrorAlert({ error, onDismiss }: ErrorAlertProps) {
  return (
    <Dialog open={!!error} onOpenChange={(open) => !open && onDismiss()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Erro
          </DialogTitle>
          <DialogDescription>
            {error}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onDismiss} className="bg-primary hover:bg-primary/90 text-white">
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

