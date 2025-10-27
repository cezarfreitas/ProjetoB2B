import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configuração da string de conexão com fallback
const databaseUrl = process.env.DATABASE_URL || "mysql://b2btropical:facbe3b2f9dfa94ddb49@server.idenegociosdigitais.com.br:3394/b2btropical"

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
