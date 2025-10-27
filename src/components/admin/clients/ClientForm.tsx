import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Client } from '@/types/client'

interface ClientFormProps {
  formData: Partial<Client>
  setFormData: (data: Partial<Client>) => void
  onSubmit: () => void
  isEdit?: boolean
  isLoading?: boolean
}

export default function ClientForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  isEdit = false,
  isLoading = false
}: ClientFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setFormData({ ...formData, [field]: checked })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Dados Básicos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Dados Básicos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              id="cnpj"
              value={formData.cnpj || ''}
              onChange={(e) => handleInputChange('cnpj', e.target.value)}
              placeholder="00.000.000/0000-00"
            />
          </div>
          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={formData.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>
          <div>
            <Label htmlFor="company">Empresa</Label>
            <Input
              id="company"
              value={formData.company || ''}
              onChange={(e) => handleInputChange('company', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="contactPerson">Pessoa de Contato</Label>
            <Input
              id="contactPerson"
              value={formData.contactPerson || ''}
              onChange={(e) => handleInputChange('contactPerson', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Endereço */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Endereço</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              value={formData.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              value={formData.city || ''}
              onChange={(e) => handleInputChange('city', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="state">Estado</Label>
            <Input
              id="state"
              maxLength={2}
              value={formData.state || ''}
              onChange={(e) => handleInputChange('state', e.target.value.toUpperCase())}
              placeholder="SP"
            />
          </div>
          <div>
            <Label htmlFor="zipCode">CEP</Label>
            <Input
              id="zipCode"
              value={formData.zipCode || ''}
              onChange={(e) => handleInputChange('zipCode', e.target.value)}
              placeholder="00000-000"
            />
          </div>
        </div>
      </div>

      {/* Configurações de Negócio */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Configurações de Negócio</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="minimumOrder">Pedido Mínimo (R$)</Label>
            <Input
              id="minimumOrder"
              type="number"
              step="0.01"
              min="0"
              value={formData.minimumOrder || ''}
              onChange={(e) => handleInputChange('minimumOrder', parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label htmlFor="creditLimit">Limite de Crédito (R$)</Label>
            <Input
              id="creditLimit"
              type="number"
              step="0.01"
              min="0"
              value={formData.creditLimit || ''}
              onChange={(e) => handleInputChange('creditLimit', parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label htmlFor="paymentTerms">Condições de Pagamento</Label>
            <Select 
              value={formData.paymentTerms || 'À vista'} 
              onValueChange={(value) => handleInputChange('paymentTerms', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="À vista">À vista</SelectItem>
                <SelectItem value="30 dias">30 dias</SelectItem>
                <SelectItem value="45 dias">45 dias</SelectItem>
                <SelectItem value="60 dias">60 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="discountPercentage">Desconto (%)</Label>
            <Input
              id="discountPercentage"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.discountPercentage || ''}
              onChange={(e) => handleInputChange('discountPercentage', parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>
      </div>

      {/* Status (apenas para edição) */}
      {isEdit && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Status</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive || false}
                onChange={(e) => handleCheckboxChange('isActive', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="isActive">Cliente Ativo</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isApproved"
                checked={formData.isApproved || false}
                onChange={(e) => handleCheckboxChange('isApproved', e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="isApproved">Cliente Aprovado</Label>
            </div>
          </div>
        </div>
      )}

      {/* Observações */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Observações</h3>
        <div>
          <Label htmlFor="notes">Observações</Label>
          <Textarea
            id="notes"
            value={formData.notes || ''}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            placeholder="Informações adicionais sobre o cliente..."
          />
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : (isEdit ? 'Atualizar' : 'Criar')} Cliente
        </Button>
      </div>
    </form>
  )
}
