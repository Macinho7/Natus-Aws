const { Pool } = require('pg')
const { randomUUID } = require("crypto");
const pool = new Pool({
    user: 'polu',
    database: 'polun_DB',
    password: 'root2',
    port: 5432,
    max: 2000,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 2000,
});
module.exports.CriaPublicacao = async (valores) => {
    const corpo = valores.body
    const {id, id2} = valores.pathParameters
    const dados = JSON.parse(corpo)
    const cliente = await pool.connect();
    const result = await cliente.query('SELECT * FROM "Usuario" WHERE id = $1', [
        id,
    ]);
    const usuario = result.rows[0];
    if(usuario){
        try{
            const usuarioSeguidores = usuario.usuariosseguidoressecret
            const blogs = usuario.blogs
            const ids = blogs.map(blogsS => blogsS.id)
            const verifica = ids.find(id => id === id2)
            if(!verifica){
                throw new Error('Usuario nao possui esse blog')
            }
            const blogF = blogs.filter((valor) => valor.id === verifica)
            const blog = blogF[0]
            const blogSeguidores = blog.usuariosSeguidoresSecret
            const Publicacao = {
                id: randomUUID(),
                titulo: dados.titulo,
                descricao: dados.descricao,
                likes: 0,
                usuariosLikes: [],
                comentarios: [],
            }
            blog.publicacoes.push(Publicacao)
            const queryUpdateUsuario = 'UPDATE "Usuario" SET "blogs" = $2 WHERE id = $1';
            const valuesUpdateUsuario = [usuario.id, usuario.blogs];
            const seguidoresAmbos = new Set([...usuarioSeguidores, ...blogSeguidores])
            for (const id of seguidoresAmbos) {
                const usuarios = await cliente.query('SELECT * FROM "Usuario" WHERE id = $1', [id]);
                const usuariosID = usuarios.rows[0];
                usuariosID.notificacoes.push(`${usuario.nome} postou uma publicacao no Blog: ${blog.titulo}, de uma olhada!`);
                const queryUsuarios = 'UPDATE "Usuario" SET "notificacoes" = $2 WHERE id = $1';
                const valuesUsuarios = [id, usuariosID.notificacoes];
                await cliente.query(queryUsuarios, valuesUsuarios);
            }
            await cliente.query(queryUpdateUsuario, valuesUpdateUsuario);
            cliente.release();
            return [
                "Publicacao enviada!", Publicacao
            ]
        }catch(error){
            cliente.release();
            throw Error(error)
        }
    }else{
        cliente.release();
        throw new Error('Usuario nao existe')
    }
}
module.exports.CurtirPublicacao = async (valores) => {
    const {id, id2, id3, id4} = valores.pathParameters
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
            const verificaLike = publicacao.usuariosLikes.find(id => id === usuario.id)
            if(verificaLike){
                throw new Error('Voce ja curtiu essa publicacao')
            }
            publicacao.likes += 1
            publicacao.usuariosLikes.push(usuario.id)
            usuario2.notificacoes.push(`Usuario ${usuario.nome} curtiu sua publicacao`)
            const queryUsuarios = 'UPDATE "Usuario" SET "notificacoes" = $2, "blogs" = $3 WHERE id = $1';
            const valuesUsuarios = [usuario2.id, usuario2.notificacoes, blogs];
            await cliente.query(queryUsuarios, valuesUsuarios);
            cliente.release()
            return [
                "Voce curtiu essa publicacao!"
            ]

        }catch(error){
            throw Error(error)
        }
    }
}
module.exports.removerLike = async (valores) => {
    const {id, id2, id3, id4} = valores.pathParameters
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
            const verificaLike = publicacao.usuariosLikes.find(id => id === usuario.id)
            if(!verificaLike){
                throw new Error('Voce nao curtiu essa publicacao')
            }
            const index = publicacao.usuariosLikes.indexOf(verificaLike)
            publicacao.likes -= 1
            publicacao.usuariosLikes.splice(index, 1)
            const queryUsuarios = 'UPDATE "Usuario" SET "blogs" = $2 WHERE id = $1';
            const valuesUsuarios = [usuario2.id, blogs];
            await cliente.query(queryUsuarios, valuesUsuarios);
            cliente.release()
            return [
               "Voce removeu sua curtida!"
            ]
        }catch(error){
            throw Error(error)
        }
    }
}
module.exports.deletaPublicacao = async(valores) =>{
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
            const index = publicacoes.indexOf(publicacao)
            publicacoes.splice(index, 1)
            const queryUsuarios = 'UPDATE "Usuario" SET "blogs" = $2 WHERE id = $1';
            const valuesUsuarios = [usuario.id, blogs];
            await cliente.query(queryUsuarios, valuesUsuarios);
            cliente.release()
            return [
               "Voce deletou essa publicacao!"
            ]
        }catch(error){
            throw Error(error)
        }
    }
}