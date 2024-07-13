const { Pool } = require('pg');
const { randomUUID } = require("crypto")
const pool = new Pool({
    user: 'polu',
    database: 'polun_DB',
    password: 'root2',
    port: 5432,
    max: 2000,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 2000,
});
module.exports.CriaBLog = async (valores) => {
    const corpo = valores.body
    const idParam = valores.pathParameters
    const idEx = idParam.id
    const cliente = await pool.connect();
    const dados = JSON.parse(corpo)
    const result = await cliente.query('SELECT * FROM "Usuario" WHERE id = $1', [
        idEx,
    ]);
    const usuario = result.rows[0];
    if(usuario){
        const usuarioSD = usuario.usuariosseguidoressecret
        let UsuarioIDS = [];
        for(const usuario of usuarioSD){
            UsuarioIDS.push(usuario)
        }
        const usuariosArr = UsuarioIDS

        const BlogParaJ = {
            id: randomUUID(),
            titulo: dados.titulo,
            descricao: dados.descricao,
            seguidores: 0,
            usuariosSeguidoresSecret: [],
            publicacoes: []
        };
        try {
            for (const id of usuariosArr) {
                const searchId = await cliente.query('SELECT * FROM "Usuario" WHERE id = $1', [id]);
                const usuariosID = searchId.rows[0];
                const ids = usuariosID.id;
                usuariosID.notificacoes.push(`${usuario.nome} criou um Blog`);
                const queryUsuarios = 'UPDATE "Usuario" SET "notificacoes" = $2 WHERE id = $1';
                const valuesUsuarios = [ids, usuariosID.notificacoes];
                await cliente.query(queryUsuarios, valuesUsuarios);
            }
            const usuarioBlogA = await cliente.query('SELECT * FROM "Usuario" WHERE id = $1', [usuario.id])
            const usuarioData = usuarioBlogA.rows[0];
            usuarioData.blogs.push(BlogParaJ)
            const queryUpdateUsuario = 'UPDATE "Usuario" SET "blogs" = $2 WHERE id = $1';
            const valuesUpdateUsuario = [usuario.id, usuarioData.blogs];
            await cliente.query(queryUpdateUsuario, valuesUpdateUsuario);
            cliente.release();
            return ['Blog criado com sucesso:', BlogParaJ];
        } catch (error) {
            cliente.release();
            throw  Error('Erro ao criar Blog:', error);
        }
    }else{
        throw new Error('Usuario nao existe')
    }
    
}
module.exports.ListarBlogsDoUsuario = async(valores) => {
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
        const blogs = usuario.blogs
        cliente.release()
        return[
        "Blogs:", blogs
        ]
    }
}
module.exports.ListarBlogDoUsuario = async(valores) => {
    const {id, id2} = valores.pathParameters
    const cliente =  await pool.connect()
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
            cliente.release()
            return[
            "Blog:", blog
            ]
        }catch(error){
            throw Error(error)
        }
    }
}
module.exports.atualizaBlog = async(valores) => {
    const {id, id2} = valores.pathParameters
    const corpo = valores.body
    const dados = JSON.parse(corpo)
    const cliente =  await pool.connect()
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
            blog.titulo = dados.titulo
            blog.descricao = dados.descricao
            const queryUpdateUsuario = 'UPDATE "Usuario" SET "blogs" = $2 WHERE id = $1';
            const valuesUpdateUsuario = [usuario.id, usuario.blogs];
            await cliente.query(queryUpdateUsuario, valuesUpdateUsuario);
            cliente.release()
            return[
            "Blog atualizado:", blog
            ]
        }catch(error){
            throw Error(error)
        }
    }
}
module.exports.deletaBlog = async (valores) => {
    const {id, id2} = valores.pathParameters
    const cliente =  await pool.connect()
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
            const index = blogs.indexOf(blog)
            blogs.splice(index, 1)
            const queryUpdateUsuario = 'UPDATE "Usuario" SET "blogs" = $2 WHERE id = $1';
            const valuesUpdateUsuario = [usuario.id, blogs];
            await cliente.query(queryUpdateUsuario, valuesUpdateUsuario);
            cliente.release()
            return[
            "Blog deletado:", blog
            ]
        }catch(error){
            throw Error(error)
        }
    }
}