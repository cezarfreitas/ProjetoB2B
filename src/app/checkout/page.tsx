'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import Header from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { 
  ShoppingCart, 
  MapPin, 
  ArrowLeft,
  Trash2
} from 'lucide-react'
import { QuantitySelector } from '@/components/ui/quantity-selector'
import Link from 'next/link'

export default function CheckoutPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { items, totalPrice, updateQuantity, removeItem, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [loadingAddress, setLoadingAddress] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Dados do formulário
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    cnpj: '',
    phone: '',
    zipCode: '',
    address: '',
    addressNumber: '',
    addressComplement: '',
    city: '',
    state: '',
    notes: ''
  })

  // Redirecionar se não estiver logado
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout')
    }
  }, [isAuthenticated, router])

  // Buscar dados completos do cliente
  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({
          ...prev,
          name: data.name || '',
          company: data.company || '',
          cnpj: data.cnpj || '',
          phone: data.phone || '',
          zipCode: data.zipCode || '',
          address: data.address || '',
          addressNumber: data.addressNumber || '',
          addressComplement: data.addressComplement || '',
          city: data.city || '',
          state: data.state || ''
        }))
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  // Redirecionar se carrinho vazio
  useEffect(() => {
    if (items.length === 0 && isAuthenticated) {
      router.push('/cart')
    }
  }, [items.length, isAuthenticated, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let phone = e.target.value.replace(/\D/g, '')
    if (phone.length > 11) phone = phone.slice(0, 11)
    
    let formattedPhone = phone
    if (phone.length > 10) {
      formattedPhone = `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`
    } else if (phone.length > 6) {
      formattedPhone = `(${phone.slice(0, 2)}) ${phone.slice(2, 6)}-${phone.slice(6)}`
    } else if (phone.length > 2) {
      formattedPhone = `(${phone.slice(0, 2)}) ${phone.slice(2)}`
    } else if (phone.length > 0) {
      formattedPhone = `(${phone}`
    }
    
    setFormData(prev => ({ ...prev, phone: formattedPhone }))
  }

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let cnpj = e.target.value.replace(/\D/g, '')
    if (cnpj.length > 14) cnpj = cnpj.slice(0, 14)
    
    let formattedCnpj = cnpj
    if (cnpj.length > 12) {
      formattedCnpj = `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12)}`
    } else if (cnpj.length > 8) {
      formattedCnpj = `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8)}`
    } else if (cnpj.length > 5) {
      formattedCnpj = `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5)}`
    } else if (cnpj.length > 2) {
      formattedCnpj = `${cnpj.slice(0, 2)}.${cnpj.slice(2)}`
    }
    
    setFormData(prev => ({ ...prev, cnpj: formattedCnpj }))
  }

  const handleZipCodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let zipCode = e.target.value.replace(/\D/g, '')
    if (zipCode.length > 8) zipCode = zipCode.slice(0, 8)
    
    let formattedZipCode = zipCode
    if (zipCode.length > 5) {
      formattedZipCode = `${zipCode.slice(0, 5)}-${zipCode.slice(5)}`
    }
    
    setFormData(prev => ({ ...prev, zipCode: formattedZipCode }))

    if (zipCode.length === 8) {
      setLoadingAddress(true)
      try {
        const response = await fetch(`https://viacep.com.br/ws/${zipCode}/json/`)
        if (response.ok) {
          const data = await response.json()
          if (!data.erro) {
            setFormData(prev => ({
              ...prev,
              address: data.logradouro || prev.address,
              city: data.localidade || prev.city,
              state: data.uf || prev.state,
              zipCode: formattedZipCode
            }))
            setMessage({ type: 'success', text: 'Endereço encontrado!' })
            setTimeout(() => setMessage(null), 3000)
          }
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error)
      } finally {
        setLoadingAddress(false)
      }
    }
  }

  const handleStateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const state = e.target.value.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 2)
    setFormData(prev => ({ ...prev, state }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validações básicas
    if (!user?.id) {
      setError('Usuário não autenticado')
      setLoading(false)
      return
    }

    if (!items || items.length === 0) {
      setError('Carrinho vazio')
      setLoading(false)
      return
    }

    if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.zipCode) {
      setError('Preencha todos os campos obrigatórios')
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem('auth_token')
      
      if (!token) {
        setError('Token de autenticação não encontrado')
        setLoading(false)
        return
      }
      
      // Preparar endereço completo
      const fullAddress = `${formData.address}${formData.addressNumber ? ', ' + formData.addressNumber : ''}${formData.addressComplement ? ' - ' + formData.addressComplement : ''} - ${formData.city}/${formData.state} - CEP: ${formData.zipCode}`
      
      const orderData = {
        customerId: user?.id,
        items: items.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          productName: item.name,
          variantName: item.size || item.color ? `${item.size || ''} ${item.color || ''}`.trim() : null,
          sku: item.sku || '',
          quantity: item.quantity,
          unitPrice: item.price,
          image: item.image
        })),
        shippingAddress: {
          name: formData.name,
          company: formData.company,
          phone: formData.phone,
          address: formData.address,
          addressNumber: formData.addressNumber,
          addressComplement: formData.addressComplement,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          fullAddress: fullAddress
        },
        billingAddress: {
          name: formData.name,
          company: formData.company,
          cnpj: formData.cnpj,
          phone: formData.phone,
          address: formData.address,
          addressNumber: formData.addressNumber,
          addressComplement: formData.addressComplement,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          fullAddress: fullAddress
        },
        paymentMethod: 'BANK_TRANSFER',
        notes: formData.notes
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      })

      if (response.ok) {
        const data = await response.json()
        // Não limpar o carrinho aqui - será limpo na página de sucesso
        router.push(`/checkout/complete?order=${data.order.orderNumber}`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao processar pedido')
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  if (!isAuthenticated) {
    return <div>Carregando...</div>
  }

  if (items.length === 0) {
    return (
      <>
        <div className="max-w-[1600px] mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Carrinho vazio</h1>
          <Link href="/catalog">
            <Button>Continuar comprando</Button>
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="max-w-[1600px] mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 sm:mb-8">
          <Link href="/cart">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao carrinho
            </Button>
          </Link>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold">Finalizar Pedido</h1>
            <p className="text-sm sm:text-base text-gray-600">Revise seus dados e confirme o pedido</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Formulário */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}


              {message && (
                <Alert className={message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : ''}>
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
              )}

              {/* Dados do Cliente e Endereço */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Dados de Entrega e Cobrança
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Seu nome completo"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Empresa</Label>
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="Nome da empresa"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cnpj">CNPJ</Label>
                      <Input
                        id="cnpj"
                        name="cnpj"
                        value={formData.cnpj}
                        onChange={handleCnpjChange}
                        placeholder="00.000.000/0000-00"
                        maxLength={18}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                        required
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">CEP *</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleZipCodeChange}
                      placeholder="00000-000"
                      maxLength={9}
                      required
                      disabled={loadingAddress}
                    />
                    <p className="text-xs text-gray-500">Digite o CEP para buscar o endereço automaticamente</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Rua, Avenida, etc"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="addressNumber">Número *</Label>
                      <Input
                        id="addressNumber"
                        name="addressNumber"
                        value={formData.addressNumber}
                        onChange={handleInputChange}
                        placeholder="123"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="addressComplement">Complemento</Label>
                      <Input
                        id="addressComplement"
                        name="addressComplement"
                        value={formData.addressComplement}
                        onChange={handleInputChange}
                        placeholder="Apto, Sala, Bloco, etc"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Cidade"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">Estado *</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleStateChange}
                        placeholder="SP"
                        maxLength={2}
                        className="uppercase"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Observações */}
              <Card>
                <CardHeader>
                  <CardTitle>Observações do Pedido</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Observações (opcional)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Adicione qualquer observação sobre o pedido..."
                    />
                  </div>
                </CardContent>
              </Card>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processando...
                  </div>
                ) : (
                  `Confirmar Pedido - ${formatCurrency(totalPrice)}`
                )}
              </Button>
            </form>
          </div>

          {/* Resumo do Pedido */}
          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Resumo do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Itens */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 pb-3 border-b">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        {item.size && <p className="text-xs text-gray-500">Tamanho: {item.size}</p>}
                        {item.color && <p className="text-xs text-gray-500">Cor: {item.color}</p>}
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm font-semibold">{formatCurrency(item.price)}</p>
                          <div className="flex items-center gap-1">
                            <QuantitySelector
                              value={item.quantity}
                              onChange={(quantity) => updateQuantity(item.id, quantity)}
                              min={1}
                              max={99}
                              size="sm"
                              variant="inline"
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeItem(item.id)}
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Total */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary">{formatCurrency(totalPrice)}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    * Frete será calculado após confirmação do pedido
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
