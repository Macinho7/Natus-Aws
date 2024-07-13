const { Pool } = require('pg');

// Configuração da conexão com o banco de dados
const pool = new Pool({
  user: 'polu',
  database: 'polun_DB',
  password: 'root2',
  port: 5432,
  max: 500,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 2000,
});
const criaTabelas = `
  CREATE TABLE IF NOT EXISTS "Usuario" (
    id UUID PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    senha VARCHAR(100) NOT NULL,
    idade INTEGER NOT NULL,
    país VARCHAR(100) NOT NULL,
    seguindo INTEGER NOT NULL DEFAULT 0,
    seguidores INTEGER NOT NULL DEFAULT 0,
    usuariosSeguidoresSecret TEXT[] DEFAULT ARRAY[]::TEXT[],
    notificacoes TEXT[] DEFAULT ARRAY[]::TEXT[],
    blogs JSONB[] DEFAULT ARRAY[]::JSONB[], -- Alteração para JSONB[]
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

module.exports.createTable = async () => {
  try {
    const client = await pool.connect();
    await client.query(criaTabelas);
    client.release();
    return ['Tabelas criadas com sucesso'];
  } catch (error) {
    throw new Error('Erro ao criar a tabela:', error);
  }
};
