'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { Suspense } from 'react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('order')

  return (
    <div className="text-center">
      {/* Ícone de Sucesso */}
      <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      {/* Título */}
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Pedido Confirmado!
      </h1>

      {/* Número do Pedido */}
      {orderNumber && (
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-1">Número do Pedido</p>
          <p className="text-2xl font-mono font-bold text-primary">#{orderNumber}</p>
        </div>
      )}

      {/* Mensagem */}
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        Seu pedido foi recebido com sucesso. Nossa equipe entrará em contato em breve para confirmar os detalhes e processar o envio.
      </p>

          {/* Informações do Pedido */}
          <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Próximos Passos</h2>
            <div className="space-y-4 text-left">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-sm font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Confirmação do Pedido</h3>
                  <p className="text-gray-600 text-sm">Você receberá um e-mail de confirmação em até 2 horas</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-sm font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Processamento</h3>
                  <p className="text-gray-600 text-sm">Nossa equipe preparará seu pedido em até 2 dias úteis</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary text-sm font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Envio</h3>
                  <p className="text-gray-600 text-sm">Seu pedido será enviado e você receberá o código de rastreamento</p>
                </div>
              </div>
            </div>
          </div>

          {/* Informações de Contato */}
          <div className="bg-orange-50 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
            <h3 className="font-semibold text-gray-900 mb-2">Precisa de Ajuda?</h3>
            <p className="text-gray-600 text-sm mb-4">
              Nossa equipe está disponível para esclarecer qualquer dúvida sobre seu pedido.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a 
                href="mailto:contato@b2btropical.com"
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm"
              >
                📧 contato@b2btropical.com
              </a>
              <a 
                href="tel:+5511999999999"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                📞 (11) 99999-9999
              </a>
            </div>
          </div>

      {/* Botões de Ação */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link 
          href="/orders"
          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          Ver Meus Pedidos
        </Link>
        <Link 
          href="/catalog"
          className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          Continuar Comprando
        </Link>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Suspense fallback={<div className="text-center">Carregando...</div>}>
          <SuccessContent />
        </Suspense>
      </main>
    </div>
  )
}
