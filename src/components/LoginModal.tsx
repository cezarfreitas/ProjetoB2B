'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Eye, EyeOff, Mail, Lock } from 'lucide-react'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToRegister: () => void
}

export default function LoginModal({ isOpen, onClose, onSwitchToRegister }: LoginModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetIdentifier, setResetIdentifier] = useState('')
  const [resetMessage, setResetMessage] = useState('')
  const [resetError, setResetError] = useState('')
  const [isResetting, setIsResetting] = useState(false)
  
  const { login } = useAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const success = await login(formData.email, formData.password)
      if (!success) {
        setError('Email ou senha incorretos')
        return
      }
      onClose()
      setFormData({
        email: '',
        password: ''
      })
    } catch (err: any) {
      setError(err?.message || 'Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsResetting(true)
    setResetError('')
    setResetMessage('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: resetIdentifier })
      })

      const data = await response.json()

      if (response.ok) {
        setResetMessage(data.message || 'Link de recuperação enviado!')
        setResetIdentifier('')
        
        // Mostrar o link em desenvolvimento
        if (data.resetLink) {
          console.log('Link de recuperação:', data.resetLink)
        }
      } else {
        setResetError(data.error || 'Erro ao enviar link de recuperação')
      }
    } catch (err) {
      setResetError('Erro ao enviar link de recuperação')
    } finally {
      setIsResetting(false)
    }
  }

  const handleBackToLogin = () => {
    setShowForgotPassword(false)
    setResetIdentifier('')
    setResetMessage('')
    setResetError('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 ease-out">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {showForgotPassword ? 'Recuperar Senha' : 'Entrar'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:scale-110 transition-transform duration-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        {showForgotPassword ? (
          <form onSubmit={handleForgotPassword} className="p-6 space-y-4">
            {resetMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                {resetMessage}
              </div>
            )}

            {resetError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {resetError}
              </div>
            )}

            <p className="text-gray-600 text-sm">
              Digite seu email ou WhatsApp para receber um link de recuperação de senha.
            </p>

            <div className="space-y-2">
              <Label htmlFor="resetIdentifier">Email ou WhatsApp</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="resetIdentifier"
                  type="text"
                  placeholder="seu@email.com ou (00) 00000-0000"
                  value={resetIdentifier}
                  onChange={(e) => setResetIdentifier(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isResetting}
            >
              {isResetting ? 'Enviando...' : 'Enviar Link de Recuperação'}
            </Button>

            <div className="text-center pt-4 border-t">
              <button
                type="button"
                onClick={handleBackToLogin}
                className="text-primary hover:text-primary/80 font-medium text-sm"
              >
                ← Voltar para o login
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-xs text-primary hover:text-primary/80 font-medium"
              >
                Esqueceu a senha?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Sua senha"
                value={formData.password}
                onChange={handleChange}
                className="pl-10 pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </Button>

          {/* Switch to Register */}
          <div className="text-center pt-4 border-t">
            <p className="text-gray-600 text-sm">
              Não tem uma conta?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-primary hover:text-primary/80 font-medium"
              >
                Cadastre-se aqui
              </button>
            </p>
          </div>
        </form>
        )}
      </div>
    </div>
  )
}
