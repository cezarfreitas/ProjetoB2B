import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Customer, CustomerFormData } from '@/types/customer'
import { Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Brand {
  id: number
  name: string
  slug: string
}

interface Seller {
  id: string
  name: string
  email: string
}

interface CustomerFormProps {
  formData: Partial<CustomerFormData>
  setFormData: React.Dispatch<React.SetStateAction<Partial<CustomerFormData>>>
  onSubmit: () => void
  isEdit?: boolean
  isLoading?: boolean
}

export default function CustomerForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  isEdit = false,
  isLoading = false
}: CustomerFormProps) {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loadingBrands, setLoadingBrands] = useState(true)
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loadingSellers, setLoadingSellers] = useState(true)

  // Buscar marcas
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('/api/brands')
        if (response.ok) {
          const data = await response.json()
          setBrands(data)
        }
      } catch (error) {
        console.error('Erro ao buscar marcas:', error)
      } finally {
        setLoadingBrands(false)
      }
    }
    fetchBrands()
  }, [])

  // Buscar vendedores
  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const response = await fetch('/api/sellers')
        if (response.ok) {
          const data = await response.json()
          setSellers(data)
        }
      } catch (error) {
        console.error('Erro ao buscar vendedores:', error)
      } finally {
        setLoadingSellers(false)
      }
    }
    fetchSellers()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleCheckboxChange = useCallback((field: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [field]: checked }))
  }, [])

  const toggleBrand = useCallback((brandId: number) => {
    setFormData(prev => {
      const currentBrandIds = prev.brandIds || []
      const newBrandIds = currentBrandIds.includes(brandId)
        ? currentBrandIds.filter((id: number) => id !== brandId)
        : [...currentBrandIds, brandId]
      
      return { ...prev, brandIds: newBrandIds }
    })
  }, [])

  // Função para buscar CEP via ViaCEP
  const fetchCEP = useCallback(async (cep: string) => {
    try {
      const cleanCEP = cep.replace(/\D/g, '')
      if (cleanCEP.length === 8) {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
        const data = await response.json()
        
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            zipCode: `${cleanCEP.slice(0, 5)}-${cleanCEP.slice(5)}`,
            address: data.logradouro || prev.address,
            city: data.localidade || prev.city,
            state: data.uf || prev.state
          }))
        }
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
    }
  }, [])

  const handleCEPBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value
    if (cep) {
      fetchCEP(cep)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Layout em 1 Coluna - Principal */}
      <div className="space-y-6">
        {/* Seção 1 - Identificação, Contato e Configurações */}
        <div className="bg-white/50 backdrop-blur-sm border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Identificação, Contato e Configurações</h3>
              <p className="text-xs text-gray-600">Dados básicos e configurações comerciais do cliente</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            {/* Coluna 1: Dados do Cliente */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="name" className="text-xs font-medium">Nome/Razão Social *</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-xs font-medium">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="phone" className="text-xs font-medium">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="company" className="text-xs font-medium">Empresa/Fantasia</Label>
                  <Input
                    id="company"
                    value={formData.company || ''}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="cnpj" className="text-xs font-medium">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={formData.cnpj || ''}
                    onChange={(e) => handleInputChange('cnpj', e.target.value)}
                    placeholder="00.000.000/0000-00"
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="sellerId" className="text-xs font-medium">Vendedor</Label>
                  <select
                    id="sellerId"
                    value={formData.sellerId || ''}
                    onChange={(e) => {
                      const sellerId = e.target.value === '' ? null : e.target.value
                      setFormData(prev => ({ ...prev, sellerId }))
                    }}
                    className="h-8 text-xs w-full px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Selecione um vendedor</option>
                    {loadingSellers ? (
                      <option disabled>Carregando...</option>
                    ) : (
                      sellers.map(seller => (
                        <option key={seller.id} value={seller.id}>
                          {seller.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div>
                  <Label htmlFor="minimumOrder" className="text-xs font-medium">Pedido Mínimo (R$)</Label>
                  <Input
                    id="minimumOrder"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minimumOrder || ''}
                    onChange={(e) => handleInputChange('minimumOrder', parseFloat(e.target.value) || 0)}
                    className="h-8 text-xs"
                    placeholder="0,00"
                  />
                </div>
              </div>
            </div>

            {/* Coluna 2: Marcas com Acesso */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <h4 className="text-sm font-medium text-gray-700">Marcas com Acesso</h4>
                </div>
                {(formData.brandIds || []).length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {(formData.brandIds || []).length} selecionada{(formData.brandIds || []).length > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              
              {loadingBrands ? (
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {brands.map(brand => {
                    const isSelected = (formData.brandIds || []).includes(brand.id)
                    return (
                      <Label
                        key={brand.id}
                        className={`hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-all duration-200 has-[[aria-checked=true]]:border-primary has-[[aria-checked=true]]:bg-primary/5 ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <Checkbox
                          id={`brand-${brand.id}`}
                          checked={isSelected}
                          onCheckedChange={() => toggleBrand(brand.id)}
                          className="data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white mt-0.5"
                        />
                        <div className="grid gap-1.5 font-normal flex-1">
                          <p className="text-sm leading-none font-medium text-gray-900">
                            {brand.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {brand.slug}
                          </p>
                        </div>
                      </Label>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Seção 2 - Endereço */}
        <div className="bg-white/50 backdrop-blur-sm border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Endereço</h3>
              <p className="text-xs text-gray-600">Informações de localização e entrega</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-5 gap-3">
              <div>
                <Label htmlFor="zipCode" className="text-xs font-medium">CEP</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode || ''}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  onBlur={handleCEPBlur}
                  placeholder="00000-000"
                  className="h-8 text-xs"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="address" className="text-xs font-medium">Endereço</Label>
                <Input
                  id="address"
                  value={formData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="addressNumber" className="text-xs font-medium">Número</Label>
                <Input
                  id="addressNumber"
                  value={formData.addressNumber || ''}
                  onChange={(e) => handleInputChange('addressNumber', e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="addressComplement" className="text-xs font-medium">Complemento</Label>
                <Input
                  id="addressComplement"
                  value={formData.addressComplement || ''}
                  onChange={(e) => handleInputChange('addressComplement', e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="city" className="text-xs font-medium">Cidade</Label>
                <Input
                  id="city"
                  value={formData.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="state" className="text-xs font-medium">Estado</Label>
                <Input
                  id="state"
                  maxLength={2}
                  value={formData.state || ''}
                  onChange={(e) => handleInputChange('state', e.target.value.toUpperCase())}
                  placeholder="SP"
                  className="h-8 text-xs"
                />
              </div>
            </div>
            <p className="text-[10px] text-gray-400">Digite o CEP para auto-preenchimento do endereço</p>
          </div>
        </div>
      </div>

      {/* Seção 3 - Status e Observações */}
      <div className="space-y-6">
        {/* Status */}
        <div className="bg-white/50 backdrop-blur-sm border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Status do Cliente</h3>
              <p className="text-xs text-gray-600">Controle de ativação e aprovação</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive !== undefined ? formData.isActive : true}
                onChange={(e) => handleCheckboxChange('isActive', e.target.checked)}
                className="rounded h-3.5 w-3.5"
              />
              <Label htmlFor="isActive" className="text-xs font-normal">Cliente Ativo</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isApproved"
                checked={formData.isApproved !== undefined ? formData.isApproved : true}
                onChange={(e) => handleCheckboxChange('isApproved', e.target.checked)}
                className="rounded h-3.5 w-3.5"
              />
              <Label htmlFor="isApproved" className="text-xs font-normal">Cliente Aprovado</Label>
            </div>
          </div>
        </div>
      </div>


      {/* Observações - Campo Simples */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="text-sm font-medium text-gray-700">Observações</Label>
        <Textarea
          id="notes"
          value={formData.notes || ''}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          rows={4}
          placeholder="Informações adicionais sobre o cliente..."
          className="text-sm resize-none"
        />
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-end gap-3 pt-3 border-t-2 border-gray-200">
        <Button type="submit" disabled={isLoading} className="min-w-[150px]">
          {isLoading ? 'Salvando...' : (isEdit ? 'Atualizar Cliente' : 'Criar Cliente')}
        </Button>
      </div>
    </form>
  )
}
