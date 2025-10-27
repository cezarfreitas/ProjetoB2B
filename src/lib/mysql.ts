import mysql from 'mysql2/promise'

// Configuração da conexão MySQL usando variáveis de ambiente
const dbConfig = {
  host: process.env.DB_HOST || 'server.idenegociosdigitais.com.br',
  port: parseInt(process.env.DB_PORT || '3394'),
  user: process.env.DB_USER || 'b2btropical',
  password: process.env.DB_PASSWORD || 'facbe3b2f9dfa94ddb49',
  database: process.env.DB_NAME || 'b2btropical',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}

// Pool de conexões para melhor performance
const pool = mysql.createPool(dbConfig)

export { pool }

// Função para executar queries
export async function executeQuery(query: string, params: any[] = []) {
  try {
    const [rows] = await pool.execute(query, params)
    return rows
  } catch (error) {
    console.error('Erro na query MySQL:', error)
    throw error
  }
}

// Função para fechar o pool (usar no final da aplicação)
export async function closePool() {
  await pool.end()
}

