import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Customer } from '@/types/customer'

interface CustomerCardProps {
  customer: Customer
  onEdit: (customer: Customer) => void
  onDelete: (customerId: string) => void
}

export default function CustomerCard({ customer, onEdit, onDelete }: CustomerCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{customer.name}</CardTitle>
            <p className="text-sm text-gray-600">{customer.company}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant={customer.isActive ? "default" : "secondary"}>
              {customer.isActive ? 'Ativo' : 'Inativo'}
            </Badge>
            <Badge variant={customer.isApproved ? "default" : "outline"}>
              {customer.isApproved ? 'Aprovado' : 'Pendente'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="text-sm space-y-1">
          <p><strong>Email:</strong> {customer.email}</p>
          <p><strong>CNPJ:</strong> {customer.cnpj || 'Não informado'}</p>
          <p><strong>Telefone:</strong> {customer.phone || 'Não informado'}</p>
          <p><strong>Pedido Mínimo:</strong> {formatCurrency(customer.minimumOrder || 0)}</p>
        </div>

        <div className="flex gap-2 pt-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit(customer)}
          >
            Editar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                Desativar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Desativar Customer</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja desativar este customer? 
                  Esta ação pode ser revertida posteriormente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(customer.id)}
                >
                  Desativar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}