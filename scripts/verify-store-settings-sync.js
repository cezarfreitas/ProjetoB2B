const mysql = require('mysql2/promise');

async function verificarSincronizacao() {
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
    
    console.log('✅ Conectado!\n');
    
    // Verificar se existe tabela com nome diferente
    const [tables] = await connection.execute(`
      SHOW TABLES LIKE '%store%'
    `);
    
    console.log('📋 Tabelas relacionadas a store encontradas:');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });
    
    // Verificar se precisa renomear
    const tableNames = tables.map(t => Object.values(t)[0]);
    
    if (tableNames.includes('StoreSettings') && !tableNames.includes('store_settings')) {
      console.log('\n🔧 Renomeando tabela StoreSettings para store_settings...');
      await connection.execute('RENAME TABLE StoreSettings TO store_settings');
      console.log('✅ Tabela renomeada!');
    } else if (tableNames.includes('store_settings')) {
      console.log('\n✅ Tabela store_settings já existe com o nome correto!');
    }
    
    // Verificar o ENUM
    console.log('\n🔍 Verificando configuração do ENUM publicAccessMode...');
    const [columns] = await connection.execute(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'b2btropical' 
      AND TABLE_NAME = 'store_settings' 
      AND COLUMN_NAME = 'publicAccessMode'
    `);
    
    if (columns.length > 0) {
      const currentEnum = columns[0].COLUMN_TYPE;
      console.log(`  Tipo atual: ${currentEnum}`);
      
      // Verificar se está em minúsculas e precisa converter
      if (currentEnum.includes("'closed'")) {
        console.log('\n🔧 Ajustando ENUM para maiúsculas (CLOSED, PARTIAL, OPEN)...');
        
        // Primeiro, alterar para VARCHAR temporário
        await connection.execute(`
          ALTER TABLE store_settings 
          MODIFY COLUMN publicAccessMode VARCHAR(10)
        `);
        
        // Atualizar valores existentes
        await connection.execute(`
          UPDATE store_settings 
          SET publicAccessMode = UPPER(publicAccessMode)
        `);
        
        // Converter para ENUM com valores corretos
        await connection.execute(`
          ALTER TABLE store_settings 
          MODIFY COLUMN publicAccessMode ENUM('CLOSED', 'PARTIAL', 'OPEN') DEFAULT 'OPEN'
        `);
        
        console.log('✅ ENUM ajustado para maiúsculas!');
      } else {
        console.log('✅ ENUM já está configurado corretamente!');
      }
    }
    
    // Mostrar dados atuais
    console.log('\n📊 Dados atuais na tabela:');
    const [data] = await connection.execute('SELECT * FROM store_settings');
    if (data.length > 0) {
      console.table(data.map(row => ({
        ID: row.id,
        Nome: row.storeName,
        Email: row.email,
        CNPJ: row.cnpj,
        Modo: row.publicAccessMode
      })));
    } else {
      console.log('  Nenhum registro encontrado.');
    }
    
    console.log('\n✅ Verificação concluída!');
    console.log('\n💡 Próximo passo: Execute "npx prisma generate" para atualizar o Prisma Client');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n📡 Conexão fechada.');
    }
  }
}

verificarSincronizacao();


