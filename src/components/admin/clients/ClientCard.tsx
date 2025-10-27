import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Client } from '@/types/client'

interface ClientCardProps {
  client: Client
  onEdit: (client: Client) => void
  onDelete: (clientId: string) => void
}

export default function ClientCard({ client, onEdit, onDelete }: ClientCardProps) {
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
            <CardTitle className="text-lg">{client.name}</CardTitle>
            <p className="text-sm text-gray-600">{client.company}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant={client.isActive ? "default" : "secondary"}>
              {client.isActive ? 'Ativo' : 'Inativo'}
            </Badge>
            <Badge variant={client.isApproved ? "default" : "outline"}>
              {client.isApproved ? 'Aprovado' : 'Pendente'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="text-sm space-y-1">
          <p><strong>Email:</strong> {client.email}</p>
          <p><strong>CNPJ:</strong> {client.cnpj || 'Não informado'}</p>
          <p><strong>Telefone:</strong> {client.phone || 'Não informado'}</p>
          <p><strong>Pedido Mínimo:</strong> {formatCurrency(client.minimumOrder)}</p>
          <p><strong>Limite de Crédito:</strong> {formatCurrency(client.creditLimit)}</p>
          <p><strong>Total de Pedidos:</strong> {client.totalOrders}</p>
          <p><strong>Valor Total:</strong> {formatCurrency(client.totalValue)}</p>
        </div>

        <div className="flex gap-2 pt-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit(client)}
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
                <AlertDialogTitle>Desativar Cliente</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja desativar este cliente? 
                  Esta ação pode ser revertida posteriormente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(client.id)}
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
