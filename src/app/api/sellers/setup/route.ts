import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'

export async function POST() {
  try {
    // Criar tabela sellers
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS sellers (
        id VARCHAR(191) NOT NULL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(50),
        cpf VARCHAR(14) UNIQUE,
        commissionRate DECIMAL(5, 2) DEFAULT 0.00,
        totalSales DECIMAL(10, 2) DEFAULT 0.00,
        region VARCHAR(255),
        isActive BOOLEAN DEFAULT TRUE,
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        INDEX idx_email (email),
        INDEX idx_cpf (cpf),
        INDEX idx_isActive (isActive)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // Inserir dados de exemplo
    await executeQuery(`
      INSERT INTO sellers (id, name, email, phone, cpf, commissionRate, totalSales, region, isActive) VALUES
      ('seller_001', 'João Silva', 'joao.silva@b2btropical.com', '(11) 98765-4321', '123.456.789-00', 5.00, 125000.00, 'São Paulo', TRUE),
      ('seller_002', 'Maria Santos', 'maria.santos@b2btropical.com', '(21) 97654-3210', '987.654.321-00', 4.50, 98500.00, 'Rio de Janeiro', TRUE),
      ('seller_003', 'Pedro Oliveira', 'pedro.oliveira@b2btropical.com', '(31) 96543-2109', '456.789.123-00', 5.50, 156000.00, 'Minas Gerais', TRUE),
      ('seller_004', 'Ana Costa', 'ana.costa@b2btropical.com', '(41) 95432-1098', '321.654.987-00', 4.00, 75000.00, 'Paraná', TRUE),
      ('seller_005', 'Carlos Almeida', 'carlos.almeida@b2btropical.com', '(51) 94321-0987', '654.321.987-00', 6.00, 198000.00, 'Rio Grande do Sul', TRUE),
      ('seller_006', 'Juliana Ferreira', 'juliana.ferreira@b2btropical.com', '(85) 93210-9876', '789.123.456-00', 4.50, 82000.00, 'Ceará', FALSE),
      ('seller_007', 'Roberto Lima', 'roberto.lima@b2btropical.com', '(71) 92109-8765', '147.258.369-00', 5.00, 110000.00, 'Bahia', TRUE),
      ('seller_008', 'Fernanda Souza', 'fernanda.souza@b2btropical.com', '(81) 91098-7654', '258.369.147-00', 5.50, 145000.00, 'Pernambuco', TRUE),
      ('seller_009', 'Lucas Rodrigues', 'lucas.rodrigues@b2btropical.com', '(61) 90987-6543', '369.147.258-00', 4.00, 68000.00, 'Distrito Federal', TRUE),
      ('seller_010', 'Patricia Martins', 'patricia.martins@b2btropical.com', '(62) 89876-5432', '741.852.963-00', 5.00, 92000.00, 'Goiás', TRUE)
      ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      phone = VALUES(phone),
      commissionRate = VALUES(commissionRate),
      totalSales = VALUES(totalSales),
      region = VALUES(region),
      isActive = VALUES(isActive)
    `)

    // Contar vendedores
    const sellers = await executeQuery('SELECT COUNT(*) as total FROM sellers')
    
    return NextResponse.json({
      success: true,
      message: 'Tabela sellers criada e populada com sucesso!',
      total: sellers[0].total
    })
  } catch (error: any) {
    console.error('Error setting up sellers table:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao configurar tabela de vendedores' },
      { status: 500 }
    )
  }
}

