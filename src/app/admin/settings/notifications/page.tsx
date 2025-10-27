'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, Mail, Globe, Save, ShoppingCart, UserPlus, UserCheck, KeyRound, Package, Edit, FileText } from 'lucide-react'

// Componente Switch simples
function Switch({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (checked: boolean) => void }) {
  return (
    <button
      onClick={() => onCheckedChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-primary' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

interface NotificationType {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  email: boolean
  webhook: boolean
}

const notificationTypes: NotificationType[] = [
  {
    id: 'new-order',
    name: 'Novo Pedido',
    description: 'Notificar quando um novo pedido for realizado',
    icon: ShoppingCart,
    email: true,
    webhook: true
  },
  {
    id: 'order-approved',
    name: 'Pedido Aprovado',
    description: 'Notificar quando um pedido for aprovado',
    icon: UserCheck,
    email: true,
    webhook: true
  },
  {
    id: 'order-paid',
    name: 'Pedido Pago',
    description: 'Notificar quando o pagamento de um pedido for confirmado',
    icon: Package,
    email: true,
    webhook: true
  },
  {
    id: 'order-cancelled',
    name: 'Pedido Cancelado',
    description: 'Notificar quando um pedido for cancelado',
    icon: ShoppingCart,
    email: true,
    webhook: true
  },
  {
    id: 'user-registration',
    name: 'Cadastro Realizado',
    description: 'Notificar quando um novo usuário se cadastrar',
    icon: UserPlus,
    email: true,
    webhook: true
  },
  {
    id: 'user-approved',
    name: 'Cadastro Aprovado',
    description: 'Notificar quando um cadastro for aprovado',
    icon: UserCheck,
    email: true,
    webhook: false
  },
  {
    id: 'registration-invite',
    name: 'Link de Convite para Cadastro',
    description: 'Enviar link de convite para novos usuários se cadastrarem',
    icon: Mail,
    email: true,
    webhook: false
  },
  {
    id: 'password-recovery',
    name: 'Recuperação de Senha',
    description: 'Notificar quando houver tentativa de recuperação de senha',
    icon: KeyRound,
    email: true,
    webhook: false
  },
  {
    id: 'order-update',
    name: 'Atualização de Pedidos',
    description: 'Notificar quando um pedido for atualizado',
    icon: Package,
    email: true,
    webhook: true
  }
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationType[]>(notificationTypes)
  const [loading, setLoading] = useState(false)
  const [editingNotification, setEditingNotification] = useState<NotificationType | null>(null)
  const [emailTemplate, setEmailTemplate] = useState('')
  const [webhookTemplate, setWebhookTemplate] = useState('')

  const updateNotification = (id: string, channel: keyof Omit<NotificationType, 'id' | 'name' | 'description' | 'icon'>, value: boolean) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, [channel]: value }
          : notification
      )
    )
    // Aqui você pode adicionar uma chamada à API para salvar automaticamente
  }

  const handleEditTemplate = (notification: NotificationType) => {
    setEditingNotification(notification)
    // Carregar templates padrão
    setEmailTemplate(getDefaultEmailTemplate(notification.id))
    setWebhookTemplate(getDefaultWebhookTemplate(notification.id))
  }

  const handleSaveTemplate = async () => {
    setLoading(true)
    try {
      // Simular salvamento do template
      await new Promise(resolve => setTimeout(resolve, 1000))
      setEditingNotification(null)
      // Aqui você pode adicionar uma chamada à API para salvar o template
    } catch (error) {
      console.error('Erro ao salvar template:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDefaultEmailTemplate = (notificationId: string) => {
    const templates = {
      'new-order': 'Novo pedido #{orderNumber} recebido!\n\nCliente: {customerName}\nValor: {orderTotal}\n\nAcesse o painel para mais detalhes.',
      'order-approved': 'Pedido #{orderNumber} aprovado!\n\nCliente: {customerName}\nValor: {orderTotal}\nData: {approvalDate}',
      'order-paid': 'Pagamento confirmado para o pedido #{orderNumber}!\n\nCliente: {customerName}\nValor: {orderTotal}\nMétodo: {paymentMethod}',
      'order-cancelled': 'Pedido #{orderNumber} foi cancelado.\n\nCliente: {customerName}\nMotivo: {cancellationReason}\nData: {cancellationDate}',
      'user-registration': 'Novo usuário cadastrado: {userName}\nEmail: {userEmail}\n\nAcesse o painel para aprovar.',
      'user-approved': 'Cadastro aprovado para {userName}\n\nO usuário já pode acessar o sistema.',
      'registration-invite': 'Você foi convidado para se cadastrar!\n\nClique no link abaixo para criar sua conta:\n{inviteLink}\n\nO link é válido até: {expirationDate}',
      'password-recovery': 'Tentativa de recuperação de senha para {userEmail}\n\nIP: {userIP}\nData: {date}',
      'order-update': 'Pedido #{orderNumber} atualizado!\n\nStatus: {orderStatus}\n\nAcesse o painel para mais detalhes.'
    }
    return templates[notificationId as keyof typeof templates] || ''
  }

  const getDefaultWebhookTemplate = (notificationId: string) => {
    const templates = {
      'new-order': '{"event": "new_order", "orderNumber": "{orderNumber}", "customerName": "{customerName}", "total": {orderTotal}}',
      'order-approved': '{"event": "order_approved", "orderNumber": "{orderNumber}", "customerName": "{customerName}", "total": {orderTotal}, "approvalDate": "{approvalDate}"}',
      'order-paid': '{"event": "order_paid", "orderNumber": "{orderNumber}", "customerName": "{customerName}", "total": {orderTotal}, "paymentMethod": "{paymentMethod}"}',
      'order-cancelled': '{"event": "order_cancelled", "orderNumber": "{orderNumber}", "customerName": "{customerName}", "reason": "{cancellationReason}", "date": "{cancellationDate}"}',
      'user-registration': '{"event": "user_registration", "userName": "{userName}", "userEmail": "{userEmail}"}',
      'user-approved': '{"event": "user_approved", "userName": "{userName}"}',
      'registration-invite': '{"event": "registration_invite", "inviteLink": "{inviteLink}", "expirationDate": "{expirationDate}"}',
      'password-recovery': '{"event": "password_recovery", "userEmail": "{userEmail}", "ip": "{userIP}"}',
      'order-update': '{"event": "order_update", "orderNumber": "{orderNumber}", "status": "{orderStatus}"}'
    }
    return templates[notificationId as keyof typeof templates] || ''
  }

  const getAvailableTokens = (notificationId: string) => {
    const tokens = {
      'new-order': ['{orderNumber}', '{customerName}', '{orderTotal}', '{orderDate}', '{orderStatus}'],
      'order-approved': ['{orderNumber}', '{customerName}', '{orderTotal}', '{approvalDate}'],
      'order-paid': ['{orderNumber}', '{customerName}', '{orderTotal}', '{paymentMethod}', '{paymentDate}'],
      'order-cancelled': ['{orderNumber}', '{customerName}', '{cancellationReason}', '{cancellationDate}'],
      'user-registration': ['{userName}', '{userEmail}', '{userPhone}', '{registrationDate}'],
      'user-approved': ['{userName}', '{userEmail}', '{approvalDate}'],
      'registration-invite': ['{inviteLink}', '{expirationDate}', '{invitedBy}'],
      'password-recovery': ['{userEmail}', '{userIP}', '{date}', '{recoveryToken}'],
      'order-update': ['{orderNumber}', '{orderStatus}', '{updateDate}', '{customerName}']
    }
    return tokens[notificationId as keyof typeof tokens] || []
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="h-4 w-4" />
      case 'webhook':
        return <Globe className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'email':
        return 'text-blue-600'
      case 'webhook':
        return 'text-orange-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="w-full px-2.5 py-2.5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Notificações <span className="text-sm font-normal text-gray-600">- Configure como e quando receber notificações</span>
          </h1>
        </div>
      </div>

      {/* Cards Estatísticos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card className="bg-black border-gray-800">
          <CardContent className="p-2 pl-4">
            <div className="flex items-center gap-3">
              <Mail className="h-6 w-6 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-bold text-white">{notifications.filter(n => n.email).length}</p>
                <p className="text-xs text-gray-400">E-mail Ativadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black border-gray-800">
          <CardContent className="p-2 pl-4">
            <div className="flex items-center gap-3">
              <Globe className="h-6 w-6 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-bold text-white">{notifications.filter(n => n.webhook).length}</p>
                <p className="text-xs text-gray-400">Webhook Ativadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Notificações */}
      <div className="rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-black hover:bg-black border-b border-gray-800">
              <th className="text-white font-bold text-xs tracking-wider h-12 px-4 text-center uppercase">
                Notificação
              </th>
              <th className="text-white font-bold text-xs tracking-wider h-12 px-4 text-center uppercase">
                E-mail
              </th>
              <th className="text-white font-bold text-xs tracking-wider h-12 px-4 text-center uppercase">
                Webhook
              </th>
              <th className="text-white font-bold text-xs tracking-wider h-12 px-4 text-center">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((notification) => {
              const Icon = notification.icon
              return (
                <tr key={notification.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-gray-900">{notification.name}</p>
                        <p className="text-sm text-gray-600">{notification.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-center">
                      <Switch
                        checked={notification.email}
                        onCheckedChange={(checked) => updateNotification(notification.id, 'email', checked)}
                      />
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-center">
                      <Switch
                        checked={notification.webhook}
                        onCheckedChange={(checked) => updateNotification(notification.id, 'webhook', checked)}
                      />
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTemplate(notification)}
                        className="h-8 px-3 hover:bg-orange-100 hover:text-primary transition-colors"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal de Edição de Template */}
        {editingNotification && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Editar Template - {editingNotification.name}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingNotification(null)}
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-6">
                {/* Template de E-mail */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium text-gray-900">Template de E-mail</h3>
                  </div>
                  <textarea
                    value={emailTemplate}
                    onChange={(e) => setEmailTemplate(e.target.value)}
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Digite o template do e-mail..."
                  />
                  <div className="mt-2 text-sm text-gray-600">
                    <p className="font-medium mb-1">Tokens disponíveis:</p>
                    <div className="flex flex-wrap gap-2">
                      {getAvailableTokens(editingNotification.id).map((token) => (
                        <span key={token} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {token}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Template de Webhook */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="h-5 w-5 text-orange-600" />
                    <h3 className="font-medium text-gray-900">Template de Webhook (JSON)</h3>
                  </div>
                  <textarea
                    value={webhookTemplate}
                    onChange={(e) => setWebhookTemplate(e.target.value)}
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
                    placeholder='{"event": "event_name", "data": {...}}'
                  />
                  <div className="mt-2 text-sm text-gray-600">
                    <p className="font-medium mb-1">Tokens disponíveis:</p>
                    <div className="flex flex-wrap gap-2">
                      {getAvailableTokens(editingNotification.id).map((token) => (
                        <span key={token} className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                          {token}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Botões do Modal */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setEditingNotification(null)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveTemplate}
                  disabled={loading}
                  className="bg-black hover:bg-gray-900 text-white"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Template
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
  )
}