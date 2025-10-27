/**
 * Hook para controlar o que é exibido para usuários não autenticados
 * 
 * Regras:
 * - CLOSED: Apenas home com slider (sem produtos)
 * - PARTIAL: Home + slider + produtos SEM preços
 * - OPEN: Tudo aberto (com preços)
 * - Quando usuário está logado: sempre mostra tudo normal
 * 
 * @deprecated Use o hook do contexto diretamente: import { usePublicAccess } from '@/contexts/PublicAccessContext'
 */
export { usePublicAccess } from '@/contexts/PublicAccessContext'
export type { PublicAccessMode } from '@/contexts/PublicAccessContext'

