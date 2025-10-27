import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import ClientForm from './ClientForm'
import { Client } from '@/types/client'

interface ClientModalProps {
  isOpen: boolean
  onClose: () => void
  formData: Partial<Client>
  setFormData: (data: Partial<Client>) => void
  onSubmit: () => void
  isEdit?: boolean
  isLoading?: boolean
}

export default function ClientModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  isEdit = false,
  isLoading = false
}: ClientModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar Cliente' : 'Novo Cliente'}
          </DialogTitle>
        </DialogHeader>
        <ClientForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={onSubmit}
          isEdit={isEdit}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  )
}
