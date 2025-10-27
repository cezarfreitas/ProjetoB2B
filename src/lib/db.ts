import mysql from 'mysql2/promise'

const DB_CONFIG = {
  host: process.env.DB_HOST || 'server.idenegociosdigitais.com.br',
  port: parseInt(process.env.DB_PORT || '3394'),
  user: process.env.DB_USER || 'b2btropical',
  password: process.env.DB_PASSWORD || 'facbe3b2f9dfa94ddb49',
  database: process.env.DB_NAME || 'b2btropical',
  charset: 'utf8mb4'
}

let connection: mysql.Connection | null = null

export async function getConnection(): Promise<mysql.Connection> {
  if (!connection) {
    connection = await mysql.createConnection(DB_CONFIG)
  }
  return connection
}

export async function executeQuery(query: string, params: any[] = []): Promise<any> {
  const conn = await getConnection()
  try {
    const [rows] = await conn.execute(query, params)
    return rows
  } catch (error) {
    console.error('Database error:', error)
    throw error
  }
}

export async function closeConnection(): Promise<void> {
  if (connection) {
    await connection.end()
    connection = null
  }
}
