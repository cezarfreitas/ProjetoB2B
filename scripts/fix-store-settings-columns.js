const mysql = require('mysql2/promise');

async function corrigirColunas() {
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
    
    // Verificar estrutura atual
    console.log('🔍 Verificando estrutura atual da tabela...');
    const [columns] = await connection.execute('DESCRIBE store_settings');
    
    const existingColumns = columns.map(col => col.Field);
    console.log('📋 Colunas existentes:', existingColumns.join(', '));
    
    // Campos necessários
    const requiredFields = [
      { name: 'cnpj', type: 'VARCHAR(18)', after: 'address' },
      { name: 'email', type: 'VARCHAR(255)', after: 'cnpj' },
      { name: 'detailedAddress', type: 'TEXT', after: 'email' },
      { name: 'street', type: 'VARCHAR(255)', after: 'detailedAddress' },
      { name: 'number', type: 'VARCHAR(20)', after: 'street' },
      { name: 'complement', type: 'VARCHAR(100)', after: 'number' },
      { name: 'zipCode', type: 'VARCHAR(10)', after: 'complement' },
      { name: 'neighborhood', type: 'VARCHAR(100)', after: 'zipCode' },
      { name: 'city', type: 'VARCHAR(100)', after: 'neighborhood' },
      { name: 'state', type: 'VARCHAR(2)', after: 'city' },
      { name: 'facebook', type: 'VARCHAR(255)', after: 'state' },
      { name: 'instagram', type: 'VARCHAR(255)', after: 'facebook' },
      { name: 'tiktok', type: 'VARCHAR(255)', after: 'instagram' },
      { name: 'googleBusiness', type: 'VARCHAR(255)', after: 'tiktok' },
      { name: 'youtube', type: 'VARCHAR(255)', after: 'googleBusiness' },
      { name: 'linkedin', type: 'VARCHAR(255)', after: 'youtube' },
      { name: 'website', type: 'VARCHAR(255)', after: 'linkedin' }
    ];
    
    // Adicionar campos faltantes
    console.log('\n🔧 Adicionando campos faltantes...\n');
    
    for (const field of requiredFields) {
      if (!existingColumns.includes(field.name)) {
        try {
          await connection.execute(`
            ALTER TABLE store_settings 
            ADD COLUMN ${field.name} ${field.type} NULL AFTER ${field.after}
          `);
          console.log(`✅ Campo ${field.name} adicionado`);
        } catch (error) {
          console.error(`❌ Erro ao adicionar ${field.name}:`, error.message);
        }
      } else {
        console.log(`⏭️  Campo ${field.name} já existe`);
      }
    }
    
    // Verificar estrutura final
    console.log('\n📊 Estrutura final da tabela:');
    const [finalColumns] = await connection.execute('DESCRIBE store_settings');
    console.table(finalColumns.map(col => ({
      Campo: col.Field,
      Tipo: col.Type,
      Nulo: col.Null
    })));
    
    console.log('\n✅ Correção concluída!');
    
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

corrigirColunas();


