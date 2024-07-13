const { randomUUID } = require('crypto');
const { Pool } = require('pg');
const pool = new Pool({
    user: 'polu',
    database: 'polun_DB',
    password: 'root2',
    port: 5432,
    max: 2000,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 2000,
});
module.exports.CriaComentario = async (valores) => {
    const {id, id2, id3, id4} = valores.pathParameters
    const corpo = valores.body
    const dados = JSON.parse(corpo)
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
            const blogs = usuario2.blogs
            const ids = blogs.map(blogsS => blogsS.id)
            const verifica = ids.find(id => id === id3)
            if(!verifica){
                throw new Error('Usuario nao possui esse blog')
            }
            const blogF = blogs.filter((valor) => valor.id === verifica)
            const blog = blogF[0]
            const publicacoes = blog.publicacoes
            const idsPublicacoes = publicacoes.map(publiId => publiId.id)
            const verificaPubli = idsPublicacoes.find(id => id === id4)
            if(!verificaPubli){
                throw new Error('Usuario nao possui essa Publicacao')
            }
            const publicacaoF = publicacoes.filter((valorS) => valorS.id === verificaPubli)
            const publicacao = publicacaoF[0]
            const comentario = {
                id: randomUUID(),
                idDono: usuario.id,
                nome: usuario.nome,
                comentario: dados.comentario,
                likes: 0,
                usuariosLikes: []
            }
            publicacao.comentarios.push(comentario)
            const usuarioBlogA = await cliente.query('SELECT * FROM "Usuario" WHERE id = $1', [usuario2.id])
            const usuarioData = usuarioBlogA.rows[0];
            usuarioData.blogs.push(blog)
            usuarioData.notificacoes.push(`${usuario.nome} postou um comentario na sua publicacao: ${publicacao.titulo}, de uma olhada!`);
            const queryUpdateUsuario = 'UPDATE "Usuario" SET "blogs" = $2,  "notificacoes" = $3 WHERE id = $1';
            const valuesUpdateUsuario = [usuarioData.id, usuario2.blogs, usuarioData.notificacoes];
            await cliente.query(queryUpdateUsuario, valuesUpdateUsuario);
            cliente.release()
            return [
                "Voce comentou nessa Publicacao!"
            ]
        }catch(error){
            throw Error(error)
        }
    }
}
module.exports.CurtirComentario = async(valores) => {
    const {id, id2, id3, id4, id5} = valores.pathParameters
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
            const blogs = usuario2.blogs
            const ids = blogs.map(blogsS => blogsS.id)
            const verifica = ids.find(id => id === id3)
            if(!verifica){
                throw new Error('Usuario nao possui esse blog')
            }
            const blogF = blogs.filter((valor) => valor.id === verifica)
            const blog = blogF[0]
            const publicacoes = blog.publicacoes
            const idsPublicacoes = publicacoes.map(publiId => publiId.id)
            const verificaPubli = idsPublicacoes.find(id => id === id4)
            if(!verificaPubli){
                throw new Error('Usuario nao possui essa Publicacao')
            }
            const publicacaoF = publicacoes.filter((valorS) => valorS.id === verificaPubli)
            const publicacao = publicacaoF[0]
            const comentarios = publicacao.comentarios
            const verificaComentario = comentarios.find( comentario => comentario.id === id5)
            if(!verificaComentario){
                throw new Error('Erro na Operacao')
            }
            const comentarioF = comentarios.filter((valorS) => valorS.id === verificaComentario.id)
            const comentario = comentarioF[0]
            const verificaComentarioLike = comentario.usuariosLikes.find(id => id === usuario.id)
            if(verificaComentarioLike){
                throw new Error('Voce ja curtiu esse comentario')
            }
            comentario.likes += 1
            comentario.usuariosLikes.push(usuario.id)
            const usuarioComentarioId = comentario.idDono
            const resultComentario = await cliente.query('SELECT * FROM "Usuario" WHERE id = $1', [
                usuarioComentarioId,
            ]);
            const usuarioDoComentario = resultComentario.rows[0]
            const usuarioDonoComentarioId = usuarioDoComentario.id
            if(usuarioDonoComentarioId !== usuario.id){
                usuarioDoComentario.notificacoes.push(`Usuario ${usuario.nome} curtiu seu comentario`)
                const queryUsuarios = 'UPDATE "Usuario" SET "notificacoes" = $2 WHERE id = $1';
                const valuesUsuarios = [usuarioDonoComentarioId, usuarioDoComentario.notificacoes ];
                await cliente.query(queryUsuarios, valuesUsuarios);
            }
            const queryUsuarios = 'UPDATE "Usuario" SET "blogs" = $2 WHERE id = $1';
            const valuesUsuarios = [usuario2.id, blogs];
            await cliente.query(queryUsuarios, valuesUsuarios);
            cliente.release()
            return [
               "Voce curtiu esse comentario"
            ]
        }catch(error){
            throw Error(error)
        }
    }
}
module.exports.removerLikeComentario = async(valores) => {
    const {id, id2, id3, id4, id5} = valores.pathParameters
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
            const blogs = usuario2.blogs
            const ids = blogs.map(blogsS => blogsS.id)
            const verifica = ids.find(id => id === id3)
            if(!verifica){
                throw new Error('Usuario nao possui esse blog')
            }
            const blogF = blogs.filter((valor) => valor.id === verifica)
            const blog = blogF[0]
            const publicacoes = blog.publicacoes
            const idsPublicacoes = publicacoes.map(publiId => publiId.id)
            const verificaPubli = idsPublicacoes.find(id => id === id4)
            if(!verificaPubli){
                throw new Error('Usuario nao possui essa Publicacao')
            }
            const publicacaoF = publicacoes.filter((valorS) => valorS.id === verificaPubli)
            const publicacao = publicacaoF[0]
            const comentarios = publicacao.comentarios
            const verificaComentario = comentarios.find( comentario => comentario.id === id5)
            if(!verificaComentario){
                throw new Error('Erro na Operacao')
            }
            const comentarioF = comentarios.filter((valorS) => valorS.id === verificaComentario.id)
            const comentario = comentarioF[0]
            const verificaComentarioLike = comentario.usuariosLikes.find(id => id === usuario.id)
            if(!verificaComentarioLike){
                throw new Error('Voce nao curtiu esse comentario')
            }
            const index = comentario.usuariosLikes.indexOf(verificaComentarioLike)
            comentario.likes -= 1
            comentario.usuariosLikes.splice(index, 1)
            const queryUsuarios = 'UPDATE "Usuario" SET "blogs" = $2 WHERE id = $1';
            const valuesUsuarios = [usuario2.id, blogs];
            await cliente.query(queryUsuarios, valuesUsuarios);
            cliente.release()
            return [
               "Voce removeu sua curtida"
            ]

        }catch(error){
            throw Error(error)
        }
    }
}
module.exports.listarComentariosDaPublicacao = async(valores) => {
    const {id, id2, id3} = valores.pathParameters
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
            const blogs = usuario.blogs
            const ids = blogs.map(blogsS => blogsS.id)
            const verifica = ids.find(id => id === id2)
            if(!verifica){
                throw new Error('Usuario nao possui esse blog')
            }
            const blogF = blogs.filter((valor) => valor.id === verifica)
            const blog = blogF[0]
            const publicacoes = blog.publicacoes
            const idsPublicacoes = publicacoes.map(publiId => publiId.id)
            const verificaPubli = idsPublicacoes.find(id => id === id3)
            if(!verificaPubli){
                throw new Error('Usuario nao possui essa Publicacao')
            }
            const publicacaoF = publicacoes.filter((valorS) => valorS.id === verificaPubli)
            const publicacao = publicacaoF[0]
            const comentariosMtN = publicacao.comentarios.sort((a, b) => b.likes - a.likes)
            return [
                "Comentarios", comentariosMtN
            ]
        }catch(error){
            throw Error(error)
        }
    }
}
module.exports.deletarComentario = async(valores) => {
    const {id, id2, id3, id4, id5} = valores.pathParameters
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
            const blogs = usuario2.blogs
            const ids = blogs.map(blogsS => blogsS.id)
            const verifica = ids.find(id => id === id3)
            if(!verifica){
                throw new Error('Usuario nao possui esse blog')
            }
            const blogF = blogs.filter((valor) => valor.id === verifica)
            const blog = blogF[0]
            const publicacoes = blog.publicacoes
            const idsPublicacoes = publicacoes.map(publiId => publiId.id)
            const verificaPubli = idsPublicacoes.find(id => id === id4)
            if(!verificaPubli){
                throw new Error('Usuario nao possui essa Publicacao')
            }
            const publicacaoF = publicacoes.filter((valorS) => valorS.id === verificaPubli)
            const publicacao = publicacaoF[0]
            const comentarios = publicacao.comentarios
            const verificaComentario = comentarios.find( comentario => comentario.id === id5)
            if(!verificaComentario){
                throw new Error('Erro na Operacao')
            }
            const comentarioF = comentarios.filter((valorS) => valorS.id === verificaComentario.id)
            const comentario = comentarioF[0]
            const idDono = comentario.idDono
            if(usuario.id !== idDono){
                throw new Error('Erro na Operacao')
            }
            const index = comentarios.indexOf(comentario)
            comentarios.splice(index, 1)
            const queryUsuarios = 'UPDATE "Usuario" SET "blogs" = $2 WHERE id = $1';
            const valuesUsuarios = [usuario2.id, blogs];
            await cliente.query(queryUsuarios, valuesUsuarios);
            cliente.release()
            return [
               "Voce deletou esse comentario"
            ]
        }catch(error){
            throw Error(error)
        }
    }
}