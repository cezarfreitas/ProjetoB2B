import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import CustomerForm from './CustomerForm'
import { CustomerFormData } from '@/types/customer'

interface CustomerModalProps {
  isOpen: boolean
  onClose: () => void
  formData: Partial<CustomerFormData>
  setFormData: (data: Partial<CustomerFormData>) => void
  onSubmit: () => void
  isEdit?: boolean
  isLoading?: boolean
}

export default function CustomerModal({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  isEdit = false,
  isLoading = false
}: CustomerModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto" style={{ minWidth: '900px', maxWidth: '1000px' }}>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Editar Cliente' : 'Novo Cliente'}
          </DialogTitle>
        </DialogHeader>
        <CustomerForm
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
