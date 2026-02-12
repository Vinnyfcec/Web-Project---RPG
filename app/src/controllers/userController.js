import UserModel from '../models/userModel.js';
import SaveModel from '../models/saveModel.js';
import { ValidationError, UnauthorizedError } from '../utils/customErrors.js';

class UserController {
    static mostrarCadastro(req, res) {
        res.render("cadastro", { erro: req.query.erro });
    }

    static async cadastrarUsuario(req, res, next) {
        console.log(`(no controlleruser) Tentativa de cadastro: ${req.body.email || req.body.nome_usuario}`);
        const { nome_usuario, email, senha, confirmarSenha } = req.body;
        if (senha !== confirmarSenha) {
            req.session.flash = { tipo: 'erro', mensagem: 'As senhas não coincidem.' };
            return res.redirect('/cadastro');
        }

        try {
            const novoUsuarioId = await UserModel.criarUsuario(nome_usuario, email, senha);
            await SaveModel.criarSaveInicial(novoUsuarioId, 'myfirstsave');
            
            req.session.flash = { tipo: 'sucesso', mensagem: 'Cadastro realizado com sucesso!' };
            res.redirect('/login');
        } catch (error) {
            console.error(`(no controlleruser) Erro no cadastro: ${error.message}`);
            next(error);
        }
    }

    static mostrarLogin(req, res) {
        res.render("login", { erro: req.query.erro, sucesso: req.query.sucesso});
    }

    static async fazerLogin(req, res, next) {
        const identificador = req.body.identificador || req.body.email || req.body.nome_usuario;
        const senha = req.body.senha;

        try {
            if (!identificador || !senha) {
                console.warn('(no controlleruser) Login falhou: campos ausentes', { identificador: !!identificador, senha: !!senha });
                throw new ValidationError('E-mail/Usuário e senha são obrigatórios.');
            }

            const usuario = await UserModel.buscarUsuarioporIdentificador(identificador);
            if (!usuario || !(await UserModel.verificarSenha(senha, usuario.senhaHash))) { 
                console.warn(`(no controlleruser) Falha de login para: ${identificador}`);
                throw new UnauthorizedError('E-mail ou senha incorretos.');
            }
            
            req.session.usuario = { id: usuario.id, nome: usuario.nome_usuario };
            res.redirect('/saves');
        } catch (error) {
            console.error(`(no controlleruser) Erro no login: ${error.message}`);
            next(error);
        }
    }

    static fazerLogout(req, res, next) {
        req.session.destroy((err) => {
            if (err) return next(err);
            res.clearCookie('connect.sid');
            res.redirect('/');
        });
    }

    static async excluirUsuario(req, res, next) {
        if (!req.session.usuario) return next(new UnauthorizedError());
        
        const userId = req.session.usuario.id;
        try {
            await UserModel.excluirUsuario(userId);
            req.session.destroy((err) => {
                if (err) return next(err);
                res.redirect('/?sucesso=Usuário excluído com sucesso.');
            });
        } catch (error) {
            next(error);
        }
    }
}

export default UserController;