const userModel = require('../models/userModel');
const saveModel = require('../models/saveModel');


class userController {
    static mostrarCadastro(req, res) {
        res.render("cadastro");
    }

    static async cadastrarUsuario(req, res) {
        const { nome, email, senha, confirmarSenha } = req.body;
        
        if (senha !== confirmarSenha) {
            return res.redirect('/cadastro?erro=As senhas não coincidem.');
        }

        try {
            const novoUsuarioId = await userModel.criarUsuario(nome, email, senha, confirmarSenha);
            //criar save incial aqui dps

            res.redirect('/login?//sucesso');
            // res.render('../view/home', <variaveis do usuario criado pra usar no ejs>)

        } catch (error) {
            console.error(error);
            res.redirect(`/cadastro?erro=${encodeURIComponent(error.message)}`);
        }
    }

    static mostrarLogin(req, res) {
        res.render("login", { erro: req.query.erro, sucesso: req.query.sucesso});
    }

    static async fazerLogin(req, res) {
        const { identificador, senha } = req.body;

        try {
            const usuario = await userModel.buscarUsuarioporIdentificador(identificador);

            if (!usuario || !(await userModel.verificarSenha(senha, usuario.senha_hash))) { //mudar para hash dps
                return res.redirect('/login?erro=Ocorreu um erro no servidor.');
            }
            
            req.session.usuarioId = usuario.id;
            
        } catch (error) {
            console.error(error);
            res.redirect('/login?erro=Credenciais inválidas.')
        }
    }


    static fazerLogout(req, res) {
        req.session.destroy((err) => {
            if (err) {
                console.error(err);
                return res.redirect('/');
            }
            res.clearCookie('connect.sid');
            res.redirect('/login');
        });
    }

}


module.exports = userController;