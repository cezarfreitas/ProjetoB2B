const mysql = require('mysql2/promise');

async function verificarEAjustarTabela() {
  let connection;
  
  try {
    console.log('📡 Conectando ao banco...');
    
    connection = await mysql.createConnection({
      host: 'server.idenegociosdigitais.com.br',
      port: 3394,
      user: 'b2btropical',
      password: 'facbe3b2f9dfa94ddb49',
      database: 'b2btropical'
    });
    
    console.log('✅ Conectado!');
    
    // Verificar se a tabela existe
    console.log('\n🔍 Verificando se a tabela StoreSettings existe...');
    const [tables] = await connection.execute(`
      SHOW TABLES LIKE 'StoreSettings'
    `);
    
    if (tables.length === 0) {
      console.log('❌ Tabela StoreSettings não existe. Criando...');
      
      await connection.execute(`
        CREATE TABLE StoreSettings (
          id INT PRIMARY KEY AUTO_INCREMENT,
          storeName VARCHAR(255) NOT NULL,
          description TEXT,
          contactPhone VARCHAR(20),
          address TEXT,
          cnpj VARCHAR(18),
          email VARCHAR(255),
          detailedAddress TEXT,
          street VARCHAR(255),
          number VARCHAR(20),
          complement VARCHAR(100),
          zipCode VARCHAR(10),
          neighborhood VARCHAR(100),
          city VARCHAR(100),
          state VARCHAR(2),
          facebook VARCHAR(255),
          instagram VARCHAR(255),
          tiktok VARCHAR(255),
          googleBusiness VARCHAR(255),
          youtube VARCHAR(255),
          linkedin VARCHAR(255),
          website VARCHAR(255),
          logoUrl VARCHAR(500),
          publicAccessMode ENUM('closed', 'partial', 'open') DEFAULT 'open',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      console.log('✅ Tabela StoreSettings criada com sucesso!');
      
      // Inserir registro padrão
      await connection.execute(`
        INSERT INTO StoreSettings (storeName, email, publicAccessMode)
        VALUES ('Minha Loja', 'contato@loja.com', 'open')
      `);
      
      console.log('✅ Registro padrão inserido!');
    } else {
      console.log('✅ Tabela StoreSettings já existe. Verificando estrutura...');
      
      // Buscar estrutura atual da tabela
      const [columns] = await connection.execute(`
        DESCRIBE StoreSettings
      `);
      
      const existingColumns = columns.map(col => col.Field);
      console.log('\n📋 Colunas existentes:', existingColumns.join(', '));
      
      // Campos necessários
      const requiredFields = [
        { name: 'id', type: 'INT PRIMARY KEY AUTO_INCREMENT' },
        { name: 'storeName', type: 'VARCHAR(255)' },
        { name: 'description', type: 'TEXT' },
        { name: 'contactPhone', type: 'VARCHAR(20)' },
        { name: 'address', type: 'TEXT' },
        { name: 'cnpj', type: 'VARCHAR(18)' },
        { name: 'email', type: 'VARCHAR(255)' },
        { name: 'detailedAddress', type: 'TEXT' },
        { name: 'street', type: 'VARCHAR(255)' },
        { name: 'number', type: 'VARCHAR(20)' },
        { name: 'complement', type: 'VARCHAR(100)' },
        { name: 'zipCode', type: 'VARCHAR(10)' },
        { name: 'neighborhood', type: 'VARCHAR(100)' },
        { name: 'city', type: 'VARCHAR(100)' },
        { name: 'state', type: 'VARCHAR(2)' },
        { name: 'facebook', type: 'VARCHAR(255)' },
        { name: 'instagram', type: 'VARCHAR(255)' },
        { name: 'tiktok', type: 'VARCHAR(255)' },
        { name: 'googleBusiness', type: 'VARCHAR(255)' },
        { name: 'youtube', type: 'VARCHAR(255)' },
        { name: 'linkedin', type: 'VARCHAR(255)' },
        { name: 'website', type: 'VARCHAR(255)' },
        { name: 'logoUrl', type: 'VARCHAR(500)' },
        { name: 'publicAccessMode', type: "ENUM('closed', 'partial', 'open') DEFAULT 'open'" },
        { name: 'createdAt', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' },
        { name: 'updatedAt', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' }
      ];
      
      // Verificar campos faltantes
      const missingFields = requiredFields.filter(
        field => !existingColumns.includes(field.name) && field.name !== 'id'
      );
      
      if (missingFields.length > 0) {
        console.log('\n⚠️  Campos faltantes detectados:', missingFields.map(f => f.name).join(', '));
        console.log('🔧 Adicionando campos...\n');
        
        for (const field of missingFields) {
          try {
            await connection.execute(`
              ALTER TABLE StoreSettings 
              ADD COLUMN ${field.name} ${field.type}
            `);
            console.log(`✅ Campo ${field.name} adicionado`);
          } catch (error) {
            console.error(`❌ Erro ao adicionar ${field.name}:`, error.message);
          }
        }
      } else {
        console.log('✅ Todos os campos necessários já existem!');
      }
    }
    
    // Mostrar estrutura final
    console.log('\n📊 Estrutura final da tabela:');
    const [finalColumns] = await connection.execute('DESCRIBE StoreSettings');
    console.table(finalColumns.map(col => ({
      Campo: col.Field,
      Tipo: col.Type,
      Nulo: col.Null,
      Padrão: col.Default
    })));
    
    // Verificar se existe pelo menos um registro
    const [records] = await connection.execute('SELECT COUNT(*) as total FROM StoreSettings');
    console.log(`\n📝 Total de registros: ${records[0].total}`);
    
    if (records[0].total === 0) {
      console.log('⚠️  Nenhum registro encontrado. Inserindo registro padrão...');
      await connection.execute(`
        INSERT INTO StoreSettings (storeName, email, publicAccessMode)
        VALUES ('Minha Loja', 'contato@loja.com', 'open')
      `);
      console.log('✅ Registro padrão inserido!');
    }
    
    console.log('\n✅ Verificação e ajuste concluídos com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n📡 Conexão fechada.');
    }
  }
}

verificarEAjustarTabela();


