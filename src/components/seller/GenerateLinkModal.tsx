'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { X, Copy, Check, Link2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface Brand {
  id: number
  name: string
  slug: string
}

interface GenerateLinkModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function GenerateLinkModal({ isOpen, onClose }: GenerateLinkModalProps) {
  const { user } = useAuth()
  const [brands, setBrands] = useState<Brand[]>([])
  const [selectedBrands, setSelectedBrands] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [generating, setGenerating] = useState(false)
  
  // Campos do formulário
  const [customerName, setCustomerName] = useState('')
  const [customerWhatsapp, setCustomerWhatsapp] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [expirationDays, setExpirationDays] = useState(7)

  // Buscar marcas disponíveis e resetar estado ao abrir
  useEffect(() => {
    if (isOpen) {
      // Resetar estado ao abrir o modal
      setSelectedBrands([])
      setCustomerName('')
      setCustomerWhatsapp('')
      setCustomerEmail('')
      setExpirationDays(7)
      setGeneratedLink(null)
      setCopied(false)
      
      fetchBrands()
    }
  }, [isOpen])

  const fetchBrands = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/brands')
      if (response.ok) {
        const data = await response.json()
        setBrands(data)
      }
    } catch (error) {
      console.error('Erro ao buscar marcas:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleBrand = (brandId: number) => {
    setSelectedBrands(prev => {
      if (prev.includes(brandId)) {
        return prev.filter(id => id !== brandId)
      } else {
        return [...prev, brandId]
      }
    })
  }

  const handleGenerateLink = async () => {
    // Validações
    if (!customerName.trim()) {
      alert('Nome do cliente é obrigatório!')
      return
    }
    
    if (!customerWhatsapp.trim()) {
      alert('WhatsApp do cliente é obrigatório!')
      return
    }
    
    if (selectedBrands.length === 0) {
      alert('Selecione pelo menos uma marca!')
      return
    }

    try {
      setGenerating(true)
      
      // Gerar token único
      const response = await fetch('/api/seller/generate-registration-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          brandIds: selectedBrands,
          customerName: customerName.trim(),
          customerWhatsapp: customerWhatsapp.trim(),
          customerEmail: customerEmail.trim() || null,
          expirationDays
        })
      })

      if (response.ok) {
        const data = await response.json()
        const link = `${window.location.origin}/register?token=${data.token}`
        setGeneratedLink(link)
      } else {
        alert('Erro ao gerar link de cadastro')
      }
    } catch (error) {
      console.error('Erro ao gerar link:', error)
      alert('Erro ao gerar link de cadastro')
    } finally {
      setGenerating(false)
    }
  }

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClose = () => {
    setGeneratedLink(null)
    setSelectedBrands([])
    setCustomerName('')
    setCustomerWhatsapp('')
    setCustomerEmail('')
    setExpirationDays(7)
    setCopied(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-h-[90vh] overflow-hidden" style={{ minWidth: '900px', maxWidth: '1000px' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <h2 className="text-base font-semibold text-gray-900">Gerar Link de Cadastro</h2>
          <Button variant="ghost" size="sm" onClick={handleClose} className="h-7 w-7 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : generatedLink ? (
            /* Link Gerado */
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800 mb-2">
                  <Check className="h-5 w-5" />
                  <span className="font-semibold">Link gerado com sucesso!</span>
                </div>
                <p className="text-sm text-green-700 mb-4">
                  Compartilhe este link com o cliente. Ao se cadastrar, ele terá acesso às marcas selecionadas.
                </p>
                
                {/* Link */}
                <div className="bg-white border border-green-300 rounded-lg p-3 flex items-center gap-2">
                  <code className="flex-1 text-sm text-gray-700 break-all">
                    {generatedLink}
                  </code>
                  <Button
                    size="sm"
                    onClick={handleCopyLink}
                    className={`flex-shrink-0 ${copied ? 'bg-green-600' : 'bg-primary'}`}
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Marcas Selecionadas */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Marcas incluídas neste link:</h3>
                <div className="flex flex-wrap gap-2">
                  {brands
                    .filter(b => selectedBrands.includes(b.id))
                    .map(brand => (
                      <span
                        key={brand.id}
                        className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full"
                      >
                        {brand.name}
                      </span>
                    ))
                  }
                </div>
              </div>

              <Button
                onClick={handleClose}
                className="w-full"
              >
                Fechar
              </Button>
            </div>
          ) : (
            /* Layout Simples e Compacto */
            <div className="grid grid-cols-2 gap-6">
              {/* COLUNA ESQUERDA - Dados do Cliente */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Dados do Cliente</h3>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="customerName" className="text-xs font-medium text-gray-700">
                      Nome Completo <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="customerName"
                      placeholder="João da Silva"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                      className="h-9 mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="customerWhatsapp" className="text-xs font-medium text-gray-700">
                      WhatsApp <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="customerWhatsapp"
                      placeholder="(11) 99999-9999"
                      value={customerWhatsapp}
                      onChange={(e) => setCustomerWhatsapp(e.target.value)}
                      required
                      className="h-9 mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="customerEmail" className="text-xs font-medium text-gray-700">
                      E-mail <span className="text-gray-400">(opcional)</span>
                    </Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      placeholder="cliente@email.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="h-9 mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs font-medium text-gray-700 mb-2 block">
                      Validade do Link
                    </Label>
                    <RadioGroup
                      value={expirationDays.toString()}
                      onValueChange={(value) => setExpirationDays(Number(value))}
                      className="flex flex-wrap gap-2"
                    >
                      <div className="flex items-center space-x-1.5">
                        <RadioGroupItem value="1" id="exp-1" className="h-3.5 w-3.5" />
                        <Label htmlFor="exp-1" className="text-xs cursor-pointer font-normal">1 dia</Label>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <RadioGroupItem value="3" id="exp-3" className="h-3.5 w-3.5" />
                        <Label htmlFor="exp-3" className="text-xs cursor-pointer font-normal">3 dias</Label>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <RadioGroupItem value="7" id="exp-7" className="h-3.5 w-3.5" />
                        <Label htmlFor="exp-7" className="text-xs cursor-pointer font-normal">7 dias</Label>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <RadioGroupItem value="15" id="exp-15" className="h-3.5 w-3.5" />
                        <Label htmlFor="exp-15" className="text-xs cursor-pointer font-normal">15 dias</Label>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <RadioGroupItem value="30" id="exp-30" className="h-3.5 w-3.5" />
                        <Label htmlFor="exp-30" className="text-xs cursor-pointer font-normal">30 dias</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>

              {/* COLUNA DIREITA - Marcas */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-sm font-semibold text-gray-900">Marcas Permitidas</h3>
                  {selectedBrands.length > 0 && (
                    <Badge variant="secondary" className="bg-primary text-white text-xs px-2 py-0.5">
                      {selectedBrands.length}
                    </Badge>
                  )}
                </div>

                {/* Lista de Marcas - 2 Colunas */}
                <div className="grid grid-cols-2 gap-2 max-h-[360px] overflow-y-auto pr-1">
                  {brands.length === 0 ? (
                    <p className="text-center text-gray-400 text-xs py-8 col-span-2">Nenhuma marca disponível</p>
                  ) : (
                    brands.map(brand => {
                      const isSelected = selectedBrands.includes(brand.id)
                      return (
                        <div
                          key={brand.id}
                          onClick={() => toggleBrand(brand.id)}
                          className={`flex items-center gap-2 p-2.5 border rounded-lg cursor-pointer transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleBrand(brand.id)}
                            className="h-3.5 w-3.5"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="flex-1 text-xs text-gray-900 font-medium">
                            {brand.name}
                          </span>
                          {isSelected && (
                            <Check className="h-3.5 w-3.5 text-primary" />
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!generatedLink && (
          <div className="border-t p-4 flex items-center justify-end gap-3 bg-gray-50">
            <Button
              variant="outline"
              onClick={handleClose}
              size="sm"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGenerateLink}
              disabled={!customerName.trim() || !customerWhatsapp.trim() || selectedBrands.length === 0 || generating}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white mr-2"></div>
                  Gerando...
                </>
              ) : (
                <>
                  <Link2 className="h-3.5 w-3.5 mr-2" />
                  Gerar Link
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

