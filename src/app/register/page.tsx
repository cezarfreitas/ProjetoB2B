'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, EyeOff, Mail, Lock, User, Building, ArrowLeft } from 'lucide-react'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingToken, setLoadingToken] = useState(false)
  const [error, setError] = useState('')
  const [tokenError, setTokenError] = useState('')
  
  // Buscar dados do token e rastrear visualização
  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      // Enviar tracking para a API
      fetch('/api/registration-tokens/track-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      }).catch(err => {
        console.error('Erro ao rastrear visualização:', err)
      })
      
      // Buscar dados pré-cadastrados
      setLoadingToken(true)
      fetch(`/api/registration-tokens/${token}`)
        .then(async (response) => {
          if (response.ok) {
            const data = await response.json()
            setFormData(prev => ({
              ...prev,
              name: data.customerName || '',
              email: data.customerEmail || '',
              phone: data.customerWhatsapp || ''
            }))
            setTokenError('')
          } else {
            const errorData = await response.json()
            setTokenError(errorData.error || 'Token inválido')
          }
        })
        .catch(err => {
          console.error('Erro ao buscar dados do token:', err)
          setTokenError('Erro ao carregar dados do convite')
        })
        .finally(() => {
          setLoadingToken(false)
        })
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validações
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      setLoading(false)
      return
    }

    if (!formData.acceptTerms) {
      setError('Você deve aceitar os termos de uso')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          company: formData.company,
          phone: formData.phone,
          password: formData.password
        })
      })

      if (response.ok) {
        router.push('/login?registered=true')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao criar conta')
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      acceptTerms: checked
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-3 md:p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-4 md:mb-8">
          <Link href="/" className="inline-flex items-center text-primary hover:text-primary mb-2 md:mb-4 text-sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao site
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Crie sua conta</h1>
          <p className="text-gray-600 mt-1 md:mt-2 text-sm">Junte-se à nossa plataforma B2B</p>
        </div>

        {/* Card de Cadastro */}
        <Card>
          <CardHeader className="pb-3 md:pb-6">
            <CardTitle className="text-center text-lg md:text-xl">Cadastro</CardTitle>
            <CardDescription className="text-center text-sm">
              Preencha os dados para criar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 md:space-y-4">
            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
              {loadingToken && (
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertDescription className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                    Carregando seus dados...
                  </AlertDescription>
                </Alert>
              )}
              
              {tokenError && (
                <Alert variant="destructive">
                  <AlertDescription>{tokenError}</AlertDescription>
                </Alert>
              )}
              
              {!tokenError && !loadingToken && searchParams.get('token') && formData.name && (
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription className="text-green-800">
                    ✓ Bem-vindo! Alguns dados já foram preenchidos para você.
                  </AlertDescription>
                </Alert>
              )}
              
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Informações Pessoais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="name" className="text-sm">Nome Completo *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Seu nome completo"
                      className="pl-10 h-10 md:h-11"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="email" className="text-sm">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-10 h-10 md:h-11"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Informações da Empresa e Contato */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="company" className="text-sm">Empresa</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="company"
                      name="company"
                      type="text"
                      placeholder="Nome da empresa"
                      className="pl-10 h-10 md:h-11"
                      value={formData.company}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="phone" className="text-sm">Telefone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    className="h-10 md:h-11"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Senhas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="password" className="text-sm">Senha *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
                      className="pl-10 pr-10 h-10 md:h-11"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm">Confirmar Senha *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirme sua senha"
                      className="pl-10 pr-10 h-10 md:h-11"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Termos */}
              <div className="flex items-start space-x-2 pt-2">
                <Checkbox
                  id="acceptTerms"
                  checked={formData.acceptTerms}
                  onCheckedChange={handleCheckboxChange}
                  className="mt-1"
                />
                <Label htmlFor="acceptTerms" className="text-xs md:text-sm leading-relaxed">
                  Aceito os{' '}
                  <Link href="/terms" className="text-primary hover:text-primary">
                    Termos de Uso
                  </Link>{' '}
                  e{' '}
                  <Link href="/privacy" className="text-primary hover:text-primary">
                    Política de Privacidade
                  </Link>
                </Label>
              </div>

              <Button type="submit" className="w-full h-10 md:h-11 mt-2 md:mt-4" disabled={loading}>
                {loading ? 'Criando conta...' : 'Criar conta'}
              </Button>
            </form>

            <div className="mt-4 md:mt-6 text-center">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{' '}
                <Link href="/login" className="text-primary hover:text-primary font-medium">
                  Faça login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}
