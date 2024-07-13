const { randomUUID } = require("crypto")
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const {
    verificaCampoProibido,
  } = require('./verificaPalavras.js/manipulaPalavrasDoCampo');
  dotenv.config({ path: '../../.env' });

const pool = new Pool({
  user: 'polu',
  database: 'polun_DB',
  password: 'root2',
  port: 5432,
  max: 500,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 2000,
});
async function verificaEspacoNome(valor) {
    await verificaCampoProibido(valor);
    const tamanho = valor.length;
    if (tamanho > 25) {
      throw new Error(`Nome: ${valor} muito grande, max 25 caracteres`);
    } else if (tamanho < 5) {
      throw new Error(`Nome: ${valor} muito pequeno, min 5 caracteres`);
    }
    const verificacao = valor.includes(' ');
    if (verificacao === true) {
      throw new Error('Campo nome possui espaco');
    } else {
      return valor;
    }
}
async function verificaEspacoEmail(valor) {
    const verificacao = valor.includes(' ');
    if (verificacao === true) {
      throw new Error('Campo email possui espaco');
    } else {
      return valor;
    }
}
async function verificaEspacoSenha(valor) {
    const tamanho = valor.length;
    if (tamanho > 40) {
      throw new Error(`senha: ${valor} acima do limite de caracteres`);
    }
    const verificacao = valor.includes(' ');
    if (verificacao === true) {
      throw new Error('Campo senha possui espaco');
    } else {
      return valor;
    }
}
async function verificaEspacoPaís(valor) {
  await verificaCampoProibido(valor);
    const verificacao = valor.includes(' ');
    if (verificacao === true) {
      throw new Error('Campo país possui espaco');
    } else {
      return valor;
    }
}
async function validarSenha(senha) {
    await verificaCampoProibido(senha);
    const tamanho = senha.length;
    const letraM = /(?=.*[A-Z])/;
    const letram = /(?=.*[a-z])/;
    const numero = /(?=.\d)/;
    const letraMteste = letraM.test(senha);
    const letramteste = letram.test(senha);
    const letraDteste = numero.test(senha);
    if (tamanho < 5) {
      throw new Error(
        `Senha possui: ${tamanho} caracteres, deve ter pelo menos 5 caracteres`,
      );
    }
    if (letraMteste === false) {
      throw new Error('Senha deve ter pelo menos uma letra maiscula');
    }
    if (letramteste === false) {
      throw new Error('Senha deve ter pelo menos uma letra minuscula');
    }
    if (letraDteste === false) {
      throw new Error('Senha deve ter pelo menos um numero');
    }
    return senha;
}
  
async function verificaNomeEmailExistente(nome, email) {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM "Usuario"');
    const usuarios = result.rows;
    const usuariosNome = usuarios.map((usuario) => usuario.nome);
    const usuariosEmail = usuarios.map((usuario) => usuario.email);
    const inclui = usuariosNome.includes(nome);
    const inclui2 = usuariosEmail.includes(email);
    if (inclui === true || inclui2 === true) {
      throw new Error(`Nome: ${nome} ou Email: ${email} ja existentes`);
    } else {
      return nome, email;
    }
}
async function verificaNomeEmailWU(id, nome, email) {
  const client = await pool.connect();
  const result = await client.query('SELECT * FROM "Usuario"');
  const usuarios = result.rows;
  usuarios.forEach(usuario => {
    if(usuario.nome === nome || usuario.email === email){
      if(usuario.id === id){
        return nome, email
      }else{
        const nomes = usuarios.map((usuario) => usuario.nome)
        const emails = usuarios.map((usuario) => usuario.email)
        const verificaNome = nomes.includes(nome)
        const verificaEmail = emails.includes(email)
        if (verificaNome === true || verificaEmail === true) {
          throw new Error(`Nome: ${nome} ou Email: ${email} ja existentes`);
        } else {
          return nome, email;
        }
      }
    }
  })
}
async function validarEmail(email) {
    const servicosEmail = [
      'gmail.com',
      'hotmail.com',
      'protonmail.com',
      'yahoo.com',
      'icloud.com',
      'aol.com',
      'zoho.com',
      'yandex.com',
      'gmx.com',
      'mail.com',
      'tutanota.com',
      'fastmail.com',
      'mailfence.com',
      'hushmail.com',
    ];
    const key = '@';
    const contaiKey = email.includes(key);
    if (!contaiKey) {
      throw new Error(`Email: ${email} nao contem chave para servicos email: @`);
    }
    const separaEmail = email.split('@');
    const segundaParte = separaEmail[1];
    const primeiraParte = separaEmail[0];
    await verificaCampoProibido(primeiraParte);
    const verificado = servicosEmail.includes(segundaParte);
    if (verificado === false) {
      throw new Error('Formato de email indisponivel');
    }
    const verificarEmail = servicosEmail.some((servico) =>
      email.includes(servico),
    );
    if (!verificarEmail) {
      throw new Error('Servico de email invalido');
    } else {
      return email;
    }
}
module.exports.CriaUsuario = async (valores) => {
    const corpo = valores.body
    const dados = JSON.parse(corpo)
    const id = randomUUID()
    const nome = dados.nome
    const email = dados.email
    const senha = dados.senha
    const idade = dados.idade
    const país = dados.país
  await verificaEspacoNome(nome);
  await verificaEspacoSenha(senha);
  await validarSenha(senha);
  const sal = await bcrypt.genSalt(12);
  const senhaHasheada = await bcrypt.hash(senha, sal);
  await verificaEspacoEmail(email);
  await validarEmail(email);
  if (idade < 18 || idade > 120) {
    throw new Error(`Idade ${idade} invalida`);
  }
  await verificaEspacoPaís(país);
  await verificaNomeEmailExistente(nome, email);
  const query =
    'INSERT INTO "Usuario" (id, nome, email, senha, idade, país) VALUES ($1, $2, $3, $4, $5, $6)';

  const values = [id, nome, email, senhaHasheada,  idade, país];
  const cliente = await pool.connect();

  try {
    await cliente.query(query, values);
    cliente.release();
    return ['Usuário criado com sucesso:', values];
  } catch (error) {
    cliente.release();
    throw new Error('Erro ao inserir usuário:', values);
  }
}
module.exports.ListarUsuarios = async () => {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM "Usuario"');
    const usuarios = result.rows;
    client.release();
    return ['Usuarios:', usuarios];
};
module.exports.ListarUsuario = async(valores) => {
  const valor = valores.pathParameters
  const id = valor.id
  const cliente =  await pool.connect()
  const result = await cliente.query('SELECT * FROM "Usuario" WHERE id = $1', [
    id,
  ]);
  const usuario = result.rows[0];
  if(!usuario){
    cliente.release();
    throw new Error('Usuario invalido')
  }else{
    cliente.release()
    return[
      "Usuario", usuario
    ]
  }
}
module.exports.deletaUsuario = async(valores) => {
  const {id} = valores.pathParameters
  const cliente = await pool.connect();
  const result = await cliente.query('SELECT * FROM "Usuario" WHERE id = $1', [
    id,
  ]);
  const usuario = result.rows[0];
  if(!usuario){
    cliente.release();
    throw new Error('Usuario invalido')
  }else{
    try{
      const ids = usuario.usuariosseguidoressecret
      for(const id of ids){
        const result = await cliente.query('SELECT * FROM "Usuario" WHERE id = $1', [
          id,
        ]);
        const usuarios = result.rows[0];
        usuarios.seguindo -= 1
        const query1 = `UPDATE "Usuario" SET "seguindo" = $2  WHERE id = $1`;
        const values1 = [usuarios.id, usuarios.seguindo];
        await cliente.query(query1, values1);
      }
      await cliente.query('DELETE FROM "Usuario" WHERE id = $1', [
        usuario.id,
      ]);
      cliente.release()
      return[
        "Usuario deletado", usuario
      ]
    }catch(error){
      throw Error(error)
    }
  }

}
module.exports.SeguirUsuario = async(valores) => {
    const {id, id2} = valores.pathParameters
    const cliente = await pool.connect();
    const result = await cliente.query('SELECT * FROM "Usuario" WHERE id = $1', [
        id,
    ]);
    const usuario = result.rows[0];
    const result2 = await cliente.query('SELECT * FROM "Usuario" WHERE id = $1', [
        id2,
    ]);
    const usuario2 = result2.rows[0];
    if(!usuario || !usuario2){
      cliente.release();
      throw new Error('Usuario invalido')
    }else{
      try{
        usuario.seguindo += 1
        usuario2.seguidores += 1
        const verifica = usuario2.usuariosseguidoressecret.find(id => id === usuario.id)
        if(verifica){
          throw new Error('Voce ja segue o usuario')
        }
        usuario2.usuariosseguidoressecret.push(usuario.id)
        usuario2.notificacoes.push(`Usuario ${usuario.nome} comecou a te seguir!`)
        const query1 = `UPDATE "Usuario" SET "seguindo" = $2  WHERE id = $1`;
        const values1 = [id, usuario.seguindo];
        const query2 = `UPDATE "Usuario" SET "seguidores" = $2, "usuariosseguidoressecret" = $3, "notificacoes" = $4   WHERE id = $1`;
        const values2 = [id2, usuario2.seguidores, usuario2.usuariosseguidoressecret, usuario2.notificacoes];
        await cliente.query(query1, values1);
        await cliente.query(query2, values2);
        cliente.release();
        return ['Voce comecou a seguir esse usuario']
      } catch(error){
        throw Error(error)
      }
    }
    
}
module.exports.atualizarUsuario = async (valores) => {
  const cliente = await pool.connect();
  const {id} = valores.pathParameters
  const corpo = valores.body
  const dados = JSON.parse(corpo)
  const nome = dados.nome
  const email = dados.email
  const senha = dados.senha
  const sal = await bcrypt.genSalt(12);
  const senhaHasheada = await bcrypt.hash(senha, sal);const result = await cliente.query('SELECT * FROM "Usuario" WHERE id = $1', [
    id,
  ]);
  const usuarioAtualiza = result.rows[0]
  if(!usuarioAtualiza){
    cliente.release()
    throw new Error('Usuario inexistente')
  }else{
    usuarioAtualiza.nome = nome
    usuarioAtualiza.email = email
    usuarioAtualiza.senha = senhaHasheada
    await verificaEspacoNome(nome);
    await verificaEspacoSenha(senha);
    await validarSenha(senha);s
    await verificaEspacoEmail(email)
    await validarEmail(email)
    await verificaNomeEmailWU(usuarioAtualiza.id, nome, email)
    const query1 = `UPDATE "Usuario" SET "nome" = $2,"email" = $3, "senha" = $4   WHERE id = $1`;
    const values1 = [usuarioAtualiza.id, usuarioAtualiza.nome, usuarioAtualiza.email, usuarioAtualiza.senha];
    await cliente.query(query1, values1);
    cliente.release()
    return [
      "Usuario atualizado", usuarioAtualiza
    ]
  }
}
module.exports.DeixarDeSeguir = async(valores) => {
  const {id, id2} = valores.pathParameters
  const cliente = await pool.connect();
  const result = await cliente.query('SELECT * FROM "Usuario" WHERE id = $1', [
      id,
  ]);
  const usuario = result.rows[0];
  const result2 = await cliente.query('SELECT * FROM "Usuario" WHERE id = $1', [
      id2,
  ]);
  const usuario2 = result2.rows[0];
  if(!usuario || !usuario2){
    cliente.release();
    throw new Error('Usuario invalido')
  }else{
    try{
      usuario.seguindo -= 1
      usuario2.seguidores -= 1
      const id = usuario2.usuariosseguidoressecret.find(id => id === usuario.id)
      if(!id){
        throw new Error('Operacao Invalida')
      }{
        const indiceD = usuario2.usuariosseguidoressecret.indexOf(id)
        usuario2.usuariosseguidoressecret.splice(indiceD, 1)
        const query1 = `UPDATE "Usuario" SET "seguindo" = $2  WHERE id = $1`;
        const values1 = [id, usuario.seguindo];
        const query2 = `UPDATE "Usuario" SET "seguidores" = $2, "usuariosseguidoressecret" = $3   WHERE id = $1`;
        const values2 = [id2, usuario2.seguidores, usuario2.usuariosseguidoressecret];
        await cliente.query(query1, values1);
        await cliente.query(query2, values2);
        return [
          `Voce deixou de seguir ${usuario2.nome}`
        ]
      }

    }catch(error){
      throw Error(error)
    }
  }
}
module.exports.SeguirBlog = async(valores) => {
  const {id, id2, id3} = valores.pathParameters
  const cliente = await pool.connect();
  const result = await cliente.query('SELECT * FROM "Usuario" WHERE id = $1', [
    id,
  ]);
  const usuario = result.rows[0];
  const result2 = await cliente.query('SELECT * FROM "Usuario" WHERE id = $1', [
      id2,
  ]);
  const usuario2 = result2.rows[0];
  if(!usuario || !usuario2){
    cliente.release();
    throw new Error('Usuario invalido')
  }else {
    try{
      const blogs = usuario2.blogs
      const ids = blogs.map(blogsS => blogsS.id)
      const verifica = ids.find(id => id === id3)
      if(!verifica){
        throw new Error('Usuario em especifico nao possui esse blog')
      }
      if(id === id2){
        throw new Error('voce nao pode seguir seu Blog')
      }
      const blogF = blogs.filter((valor) => valor.id === verifica)
      const blog = blogF[0]
      const verificaDF = blog.usuariosSeguidoresSecret.find(id => id === usuario.id)
      if(verificaDF){
        throw new Error('Voce ja segue esee Blog')
      }
      blog.seguidores += 1
      blog.usuariosSeguidoresSecret.push(usuario.id)
      usuario2.notificacoes.push(`Usuario ${usuario.nome} comecou a seguir seu Blog ${blog.titulo}`)
      const query2 = `UPDATE "Usuario" SET "seguidores" = $2, "usuariosseguidoressecret" = $3, "notificacoes" = $4, "blogs" = $5   WHERE id = $1`;
      const values2 = [id2, usuario2.seguidores, usuario2.usuariosseguidoressecret, usuario2.notificacoes, usuario2.blogs];
      await cliente.query(query2, values2);
      return [
        "Voce comecou a seguir esse Blog"
      ]
    }catch(error){
      throw Error(error)
    }
  }
}