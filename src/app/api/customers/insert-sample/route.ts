import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'

export async function POST() {
  try {
    const customers = [
      { id: 'customer_001', name: 'João Silva', email: 'joao.silva@empresa.com', cnpj: '12.345.678/0001-90', phone: '(11) 98765-4321', company: 'Silva Comércio Ltda', contactPerson: 'João Silva', address: 'Rua das Flores, 123', city: 'São Paulo', state: 'SP', zipCode: '01234-567', minimumOrder: 500.00, creditLimit: 5000.00, paymentTerms: '30 dias', discountPercentage: 5.00, notes: 'Cliente preferencial' },
      { id: 'customer_002', name: 'Maria Santos', email: 'maria.santos@loja.com', cnpj: '98.765.432/0001-10', phone: '(21) 99876-5432', company: 'Santos Moda Ltda', contactPerson: 'Maria Santos', address: 'Av. Atlântica, 456', city: 'Rio de Janeiro', state: 'RJ', zipCode: '22010-000', minimumOrder: 300.00, creditLimit: 3000.00, paymentTerms: '15 dias', discountPercentage: 3.00, notes: '' },
      { id: 'customer_003', name: 'Pedro Oliveira', email: 'pedro@distribuidora.com', cnpj: '11.222.333/0001-44', phone: '(47) 99999-8888', company: 'Oliveira Distribuidora', contactPerson: 'Pedro Oliveira', address: 'Rua Principal, 789', city: 'Blumenau', state: 'SC', zipCode: '89010-000', minimumOrder: 1000.00, creditLimit: 10000.00, paymentTerms: '45 dias', discountPercentage: 7.00, notes: 'Atacadista regional' },
      { id: 'customer_004', name: 'Ana Costa', email: 'ana.costa@fashion.com', cnpj: '77.888.999/0001-55', phone: '(85) 98888-7777', company: 'Costa Fashion Store', contactPerson: 'Ana Costa', address: 'Av. Beira Mar, 321', city: 'Fortaleza', state: 'CE', zipCode: '60165-000', minimumOrder: 400.00, creditLimit: 4000.00, paymentTerms: 'Boleto', discountPercentage: 4.00, notes: '' },
      { id: 'customer_005', name: 'Carlos Ferreira', email: 'carlos@megastore.com', cnpj: '33.444.555/0001-66', phone: '(48) 97777-6666', company: 'Mega Store Ferreira', contactPerson: 'Carlos Ferreira', address: 'Rua Comercial, 654', city: 'Florianópolis', state: 'SC', zipCode: '88020-000', minimumOrder: 800.00, creditLimit: 8000.00, paymentTerms: 'Cartão', discountPercentage: 6.00, notes: 'Loja com grande volume' },
      { id: 'customer_006', name: 'Fernanda Lima', email: 'fernanda@boutique.com', cnpj: '44.555.666/0001-77', phone: '(51) 96666-5555', company: 'Boutique Fernanda', contactPerson: 'Fernanda Lima', address: 'Av. Borges, 890', city: 'Porto Alegre', state: 'RS', zipCode: '90000-000', minimumOrder: 350.00, creditLimit: 3500.00, paymentTerms: '20 dias', discountPercentage: 4.50, notes: '' },
      { id: 'customer_007', name: 'Roberto Alves', email: 'roberto@textil.com', cnpj: '55.666.777/0001-88', phone: '(27) 95555-4444', company: 'Alves Têxtil', contactPerson: 'Roberto Alves', address: 'Rua Vitória, 234', city: 'Vitória', state: 'ES', zipCode: '29000-000', minimumOrder: 600.00, creditLimit: 6000.00, paymentTerms: '30 dias', discountPercentage: 5.50, notes: 'Indústria têxtil' },
      { id: 'customer_008', name: 'Juliana Martins', email: 'juliana@moda.com', cnpj: '66.777.888/0001-99', phone: '(31) 94444-3333', company: 'Martins Moda', contactPerson: 'Juliana Martins', address: 'Av. Afonso Pena, 567', city: 'Belo Horizonte', state: 'MG', zipCode: '30000-000', minimumOrder: 450.00, creditLimit: 4500.00, paymentTerms: 'Boleto', discountPercentage: 4.00, notes: '' },
      { id: 'customer_009', name: 'Ricardo Souza', email: 'ricardo@varejo.com', cnpj: '77.888.999/0001-00', phone: '(41) 93333-2222', company: 'Souza Varejo', contactPerson: 'Ricardo Souza', address: 'Rua XV, 678', city: 'Curitiba', state: 'PR', zipCode: '80000-000', minimumOrder: 550.00, creditLimit: 5500.00, paymentTerms: 'Cartão', discountPercentage: 5.00, notes: 'Rede de lojas' },
      { id: 'customer_010', name: 'Patricia Rocha', email: 'patricia@vestuario.com', cnpj: '88.999.000/0001-11', phone: '(62) 92222-1111', company: 'Rocha Vestuário', contactPerson: 'Patricia Rocha', address: 'Av. Goiás, 901', city: 'Goiânia', state: 'GO', zipCode: '74000-000', minimumOrder: 380.00, creditLimit: 3800.00, paymentTerms: '15 dias', discountPercentage: 3.50, notes: '' },
      { id: 'customer_011', name: 'Marcos Pereira', email: 'marcos@atacado.com', cnpj: '99.000.111/0001-22', phone: '(83) 91111-0000', company: 'Pereira Atacado', contactPerson: 'Marcos Pereira', address: 'Av. João Pessoa, 123', city: 'João Pessoa', state: 'PB', zipCode: '58000-000', minimumOrder: 1200.00, creditLimit: 12000.00, paymentTerms: '45 dias', discountPercentage: 8.00, notes: 'Atacadista regional' },
      { id: 'customer_012', name: 'Beatriz Nunes', email: 'beatriz@costura.com', cnpj: '00.111.222/0001-33', phone: '(81) 90000-9999', company: 'Nunes Costura', contactPerson: 'Beatriz Nunes', address: 'Rua Recife, 456', city: 'Recife', state: 'PE', zipCode: '50000-000', minimumOrder: 320.00, creditLimit: 3200.00, paymentTerms: 'Boleto', discountPercentage: 3.00, notes: '' },
      { id: 'customer_013', name: 'André Carvalho', email: 'andre@confec.com', cnpj: '11.222.333/0001-44', phone: '(73) 98888-8888', company: 'Carvalho Confecções', contactPerson: 'André Carvalho', address: 'Av. Barra, 789', city: 'Salvador', state: 'BA', zipCode: '40000-000', minimumOrder: 700.00, creditLimit: 7000.00, paymentTerms: '30 dias', discountPercentage: 6.00, notes: 'Atacado confecções' },
      { id: 'customer_014', name: 'Camila Dias', email: 'camila@malha.com', cnpj: '22.333.444/0001-55', phone: '(86) 97777-7777', company: 'Dias Malhas', contactPerson: 'Camila Dias', address: 'Av. Frei Serafim, 012', city: 'Teresina', state: 'PI', zipCode: '64000-000', minimumOrder: 480.00, creditLimit: 4800.00, paymentTerms: '20 dias', discountPercentage: 4.50, notes: '' },
      { id: 'customer_015', name: 'Eduardo Gomes', email: 'eduardo@turismo.com', cnpj: '33.444.555/0001-66', phone: '(68) 96666-6666', company: 'Gomes Turismo', contactPerson: 'Eduardo Gomes', address: 'Rua Rio Branco, 345', city: 'Rio Branco', state: 'AC', zipCode: '69900-000', minimumOrder: 360.00, creditLimit: 3600.00, paymentTerms: 'Boleto', discountPercentage: 3.50, notes: '' },
      { id: 'customer_016', name: 'Larissa Freitas', email: 'larissa@acess.com', cnpj: '44.555.666/0001-77', phone: '(69) 95555-5555', company: 'Freitas Acessórios', contactPerson: 'Larissa Freitas', address: 'Av. Jorge Teixeira, 678', city: 'Porto Velho', state: 'RO', zipCode: '76800-000', minimumOrder: 420.00, creditLimit: 4200.00, paymentTerms: 'Cartão', discountPercentage: 4.00, notes: '' },
      { id: 'customer_017', name: 'Felipe Ramos', email: 'felipe@garment.com', cnpj: '55.666.777/0001-88', phone: '(84) 94444-4444', company: 'Ramos Garment', contactPerson: 'Felipe Ramos', address: 'Av. Deodoro, 901', city: 'Natal', state: 'RN', zipCode: '59000-000', minimumOrder: 580.00, creditLimit: 5800.00, paymentTerms: '30 dias', discountPercentage: 5.00, notes: '' },
      { id: 'customer_018', name: 'Gabriela Araújo', email: 'gabriela@wear.com', cnpj: '66.777.888/0001-99', phone: '(96) 93333-3333', company: 'Araújo Wear', contactPerson: 'Gabriela Araújo', address: 'Av. FAB, 234', city: 'Macapá', state: 'AP', zipCode: '68900-000', minimumOrder: 340.00, creditLimit: 3400.00, paymentTerms: '15 dias', discountPercentage: 3.50, notes: '' },
      { id: 'customer_019', name: 'Thiago Barbosa', email: 'thiago@shirt.com', cnpj: '77.888.999/0001-00', phone: '(63) 92222-2222', company: 'Barbosa Shirts', contactPerson: 'Thiago Barbosa', address: 'Av. JK, 567', city: 'Palmas', state: 'TO', zipCode: '77000-000', minimumOrder: 520.00, creditLimit: 5200.00, paymentTerms: 'Boleto', discountPercentage: 4.50, notes: '' },
      { id: 'customer_020', name: 'Isabela Monteiro', email: 'isabela@style.com', cnpj: '88.999.000/0001-11', phone: '(65) 91111-1111', company: 'Monteiro Style', contactPerson: 'Isabela Monteiro', address: 'Av. CPA, 890', city: 'Cuiabá', state: 'MT', zipCode: '78000-000', minimumOrder: 440.00, creditLimit: 4400.00, paymentTerms: '20 dias', discountPercentage: 4.00, notes: '' },
      { id: 'customer_021', name: 'Renato Cardoso', email: 'renato@fit.com', cnpj: '99.000.111/0001-22', phone: '(67) 90000-0000', company: 'Cardoso Fit', contactPerson: 'Renato Cardoso', address: 'Av. Afonso Pena, 123', city: 'Campo Grande', state: 'MS', zipCode: '79000-000', minimumOrder: 490.00, creditLimit: 4900.00, paymentTerms: 'Cartão', discountPercentage: 4.50, notes: '' },
      { id: 'customer_022', name: 'Tatiana Leite', email: 'tatiana@casual.com', cnpj: '00.111.222/0001-33', phone: '(61) 89999-9999', company: 'Leite Casual', contactPerson: 'Tatiana Leite', address: 'SQS 406, 456', city: 'Brasília', state: 'DF', zipCode: '70000-000', minimumOrder: 390.00, creditLimit: 3900.00, paymentTerms: '30 dias', discountPercentage: 3.80, notes: '' },
      { id: 'customer_023', name: 'Vitor Cunha', email: 'vitor@urban.com', cnpj: '11.222.333/0001-44', phone: '(92) 88888-8888', company: 'Cunha Urban', contactPerson: 'Vitor Cunha', address: 'Av. Eduardo Ribeiro, 789', city: 'Manaus', state: 'AM', zipCode: '69000-000', minimumOrder: 540.00, creditLimit: 5400.00, paymentTerms: 'Boleto', discountPercentage: 4.75, notes: '' },
      { id: 'customer_024', name: 'Daniela Moura', email: 'daniela@trend.com', cnpj: '22.333.444/0001-55', phone: '(98) 87777-7777', company: 'Moura Trends', contactPerson: 'Daniela Moura', address: 'Av. Beira Mar, 012', city: 'São Luís', state: 'MA', zipCode: '65000-000', minimumOrder: 410.00, creditLimit: 4100.00, paymentTerms: '15 dias', discountPercentage: 3.90, notes: '' },
      { id: 'customer_025', name: 'Leonardo Batista', email: 'leonardo@fashion.com', cnpj: '33.444.555/0001-66', phone: '(79) 86666-6666', company: 'Batista Fashion', contactPerson: 'Leonardo Batista', address: 'Av. Ivo Pitanguy, 345', city: 'Aracaju', state: 'SE', zipCode: '49000-000', minimumOrder: 560.00, creditLimit: 5600.00, paymentTerms: 'Cartão', discountPercentage: 5.20, notes: '' },
      { id: 'customer_026', name: 'Priscila Cavalcanti', email: 'priscila@look.com', cnpj: '44.555.666/0001-77', phone: '(48) 85555-5555', company: 'Cavalcanti Look', contactPerson: 'Priscila Cavalcanti', address: 'Rua Felipe Schmidt, 678', city: 'Florianópolis', state: 'SC', zipCode: '88000-000', minimumOrder: 430.00, creditLimit: 4300.00, paymentTerms: 'Boleto', discountPercentage: 4.10, notes: '' },
      { id: 'customer_027', name: 'Bruno Teixeira', email: 'bruno@store.com', cnpj: '55.666.777/0001-88', phone: '(47) 84444-4444', company: 'Teixeira Store', contactPerson: 'Bruno Teixeira', address: 'Rua XV de Novembro, 901', city: 'Joinville', state: 'SC', zipCode: '89200-000', minimumOrder: 620.00, creditLimit: 6200.00, paymentTerms: '30 dias', discountPercentage: 5.50, notes: '' },
      { id: 'customer_028', name: 'Vanessa Rocha', email: 'vanessa@moda.com', cnpj: '66.777.888/0001-99', phone: '(54) 83333-3333', company: 'Rocha Moda', contactPerson: 'Vanessa Rocha', address: 'Av. Osvaldo Aranha, 234', city: 'Caxias do Sul', state: 'RS', zipCode: '95000-000', minimumOrder: 530.00, creditLimit: 5300.00, paymentTerms: '20 dias', discountPercentage: 4.90, notes: '' },
      { id: 'customer_029', name: 'Lucas Mendes', email: 'lucas@shop.com', cnpj: '77.888.999/0001-00', phone: '(16) 82222-2222', company: 'Mendes Shop', contactPerson: 'Lucas Mendes', address: 'Av. Paulista, 567', city: 'Ribeirão Preto', state: 'SP', zipCode: '14000-000', minimumOrder: 610.00, creditLimit: 6100.00, paymentTerms: 'Cartão', discountPercentage: 5.30, notes: '' },
      { id: 'customer_030', name: 'Cristina Barbosa', email: 'cristina@wear.com', cnpj: '88.999.000/0001-11', phone: '(62) 81111-1111', company: 'Barbosa Wear', contactPerson: 'Cristina Barbosa', address: 'Av. T-2, 890', city: 'Goiânia', state: 'GO', zipCode: '74300-000', minimumOrder: 470.00, creditLimit: 4700.00, paymentTerms: 'Boleto', discountPercentage: 4.40, notes: '' }
    ]

    const insertedCustomers = []
    const errors = []

    for (const customer of customers) {
      try {
        const query = `
          INSERT INTO customers (
            id, name, email, cnpj, phone, company, contactPerson,
            address, city, state, zipCode,
            minimumOrder, creditLimit, paymentTerms, discountPercentage,
            notes, isActive, isApproved, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
          ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            email = VALUES(email),
            phone = VALUES(phone),
            updatedAt = NOW()
        `

        const values = [
          customer.id,
          customer.name,
          customer.email,
          customer.cnpj,
          customer.phone,
          customer.company,
          customer.contactPerson,
          customer.address,
          customer.city,
          customer.state,
          customer.zipCode,
          customer.minimumOrder,
          customer.creditLimit,
          customer.paymentTerms,
          customer.discountPercentage,
          customer.notes,
          true, // isActive
          true  // isApproved
        ]

        await executeQuery(query, values)
        insertedCustomers.push(customer.name)
      } catch (error) {
        console.error(`Erro ao inserir cliente ${customer.name}:`, error)
        errors.push({
          customer: customer.name,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        })
      }
    }

    const countResult = await executeQuery('SELECT COUNT(*) as total FROM customers')
    const total = (countResult as any)[0]?.total || 0

    return NextResponse.json({
      success: true,
      message: `Inseridos ${insertedCustomers.length} clientes com sucesso!`,
      inserted: insertedCustomers,
      errors: errors.length > 0 ? errors : undefined,
      total
    })
  } catch (error) {
    console.error('Erro ao inserir clientes:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao inserir clientes',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}