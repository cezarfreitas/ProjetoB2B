'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    cnpj: '',
    phone: '',
    address: '',
    addressNumber: '',
    addressComplement: '',
    city: '',
    state: '',
    zipCode: ''
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

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
        setFormData({
          name: data.name || '',
          email: data.email || '',
          company: data.company || '',
          cnpj: data.cnpj || '',
          phone: data.phone || '',
          address: data.address || '',
          addressNumber: data.addressNumber || '',
          addressComplement: data.addressComplement || '',
          city: data.city || '',
          state: data.state || '',
          zipCode: data.zipCode || ''
        })
      } else {
        console.error('Erro ao carregar perfil:', response.status)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let phone = e.target.value.replace(/\D/g, '')
    
    // Limitar a 11 dígitos
    if (phone.length > 11) {
      phone = phone.slice(0, 11)
    }
    
    // Formatar telefone (11) 99999-9999 ou (11) 9999-9999
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
    
    setFormData({
      ...formData,
      phone: formattedPhone
    })
  }

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let cnpj = e.target.value.replace(/\D/g, '')
    
    // Limitar a 14 dígitos
    if (cnpj.length > 14) {
      cnpj = cnpj.slice(0, 14)
    }
    
    // Formatar CNPJ 00.000.000/0000-00
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
    
    setFormData({
      ...formData,
      cnpj: formattedCnpj
    })
  }

  const handleStateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const state = e.target.value.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 2)
    setFormData({
      ...formData,
      state
    })
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    })
  }

  const handleZipCodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let zipCode = e.target.value.replace(/\D/g, '')
    
    // Limitar a 8 dígitos
    if (zipCode.length > 8) {
      zipCode = zipCode.slice(0, 8)
    }
    
    // Formatar CEP (00000-000)
    let formattedZipCode = zipCode
    if (zipCode.length > 5) {
      formattedZipCode = `${zipCode.slice(0, 5)}-${zipCode.slice(5)}`
    }
    
    setFormData({
      ...formData,
      zipCode: formattedZipCode
    })

    // Buscar endereço quando o CEP tiver 8 dígitos
    if (zipCode.length === 8) {
      setLoading(true)
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
            setMessage({ type: 'success', text: 'Endereço encontrado automaticamente!' })
            setTimeout(() => setMessage(null), 3000)
          } else {
            setMessage({ type: 'error', text: 'CEP não encontrado' })
            setTimeout(() => setMessage(null), 3000)
          }
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error)
        setMessage({ type: 'error', text: 'Erro ao buscar CEP' })
        setTimeout(() => setMessage(null), 3000)
      } finally {
        setLoading(false)
      }
    }
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateCNPJ = (cnpj: string) => {
    const cleanCnpj = cnpj.replace(/\D/g, '')
    return cleanCnpj.length === 0 || cleanCnpj.length === 14
  }

  const validatePhone = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '')
    return cleanPhone.length === 0 || cleanPhone.length >= 10
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    // Validações
    if (!validateEmail(formData.email)) {
      setMessage({ type: 'error', text: 'Email inválido' })
      setLoading(false)
      return
    }

    if (formData.cnpj && !validateCNPJ(formData.cnpj)) {
      setMessage({ type: 'error', text: 'CNPJ inválido. Deve ter 14 dígitos' })
      setLoading(false)
      return
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      setMessage({ type: 'error', text: 'Telefone inválido. Deve ter pelo menos 10 dígitos' })
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' })
        setEditing(false)
        // Reload user data to refresh the context
        window.location.reload()
      } else {
        const data = await response.json()
        setMessage({ type: 'error', text: data.error || 'Erro ao atualizar perfil' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao atualizar perfil' })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem' })
      return
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Senha alterada com sucesso!' })
        setChangingPassword(false)
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        const data = await response.json()
        setMessage({ type: 'error', text: data.error || 'Erro ao alterar senha' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao alterar senha' })
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-gray-600 mt-2">Gerencie suas informações pessoais</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Profile Information */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Informações Pessoais</h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 text-sm font-medium text-primary hover:text-primary"
                >
                  Editar
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Seu nome completo"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="seu@email.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Empresa
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CNPJ
                    </label>
                    <input
                      type="text"
                      name="cnpj"
                      value={formData.cnpj}
                      onChange={handleCnpjChange}
                      placeholder="00.000.000/0000-00"
                      maxLength={18}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CEP
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleZipCodeChange}
                      placeholder="00000-000"
                      maxLength={9}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Digite o CEP para buscar o endereço automaticamente</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Endereço
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Rua, Avenida, etc"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número
                    </label>
                    <input
                      type="text"
                      name="addressNumber"
                      value={formData.addressNumber}
                      onChange={handleInputChange}
                      placeholder="123"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Complemento
                    </label>
                    <input
                      type="text"
                      name="addressComplement"
                      value={formData.addressComplement}
                      onChange={handleInputChange}
                      placeholder="Apto, Sala, Bloco, etc"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cidade
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Cidade"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleStateChange}
                      placeholder="SP"
                      maxLength={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent uppercase"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false)
                      loadUserData()
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Nome</p>
                  <p className="text-gray-900 mt-1">{formData.name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900 mt-1">{formData.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Empresa</p>
                  <p className="text-gray-900 mt-1">{formData.company || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">CNPJ</p>
                  <p className="text-gray-900 mt-1">{formData.cnpj || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Telefone</p>
                  <p className="text-gray-900 mt-1">{formData.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">CEP</p>
                  <p className="text-gray-900 mt-1">{formData.zipCode || '-'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Endereço Completo</p>
                  <p className="text-gray-900 mt-1">
                    {formData.address || '-'}
                    {formData.addressNumber && `, ${formData.addressNumber}`}
                    {formData.addressComplement && ` - ${formData.addressComplement}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cidade</p>
                  <p className="text-gray-900 mt-1">{formData.city || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estado</p>
                  <p className="text-gray-900 mt-1">{formData.state || '-'}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Change Password Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Alterar Senha</h2>
              {!changingPassword && (
                <button
                  onClick={() => setChangingPassword(true)}
                  className="px-4 py-2 text-sm font-medium text-primary hover:text-primary"
                >
                  Alterar
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            {changingPassword ? (
              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha Atual *
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nova Senha *
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Nova Senha *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                    {loading ? 'Alterando...' : 'Alterar Senha'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setChangingPassword(false)
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-gray-600">
                Clique em "Alterar" para modificar sua senha de acesso.
              </p>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => router.push('/orders')}
            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left"
          >
            <h3 className="font-semibold text-gray-900">Meus Pedidos</h3>
            <p className="text-sm text-gray-600 mt-1">Ver histórico de pedidos</p>
          </button>
          
          <button
            onClick={() => router.push('/catalog')}
            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left"
          >
            <h3 className="font-semibold text-gray-900">Catálogo</h3>
            <p className="text-sm text-gray-600 mt-1">Explorar produtos</p>
          </button>
        </div>
      </main>
    </div>
  )
}

