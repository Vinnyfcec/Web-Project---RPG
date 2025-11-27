const saveModel = require('../models/saveModel');
const userModel = require('../models/userModel');

class saveController {
    static isAuth(req, res, next) {
        if (req.session.usuario) {
            return next();
        }
        res.redirect('/login');
    }

    static async loadSave(req, res, next) {
        if (req.session.save_id) {
            try {
                const saveCompleto = await saveModel.buscarSaveCompleto(req.session.save_id);
                req.session.save = saveCompleto;
                res.locals.save = saveCompleto;
            } catch (error) {
                console.error("Erro ao carregar o save:", error);
                req.session.save_id = null;
                req.session.save = null;
            }
        }
        next();
    }

    static async listarSaves(req, res) {
        try {
            const saves = await saveModel.listarSavesporUsuario(req.session.usuario.id);
            res.render('saves', { saves: saves, erro: req.query.erro });
        } catch (error) {
            res.render('saves', { saves: [], erro: 'Erro ao listar saves.' });
        }
    }

    static async selecionarSave(req, res) {
        const save_id = req.params.id;
        req.session.save_id = save_id;
        req.session.save(err => {
            if (err) {
                console.error('Erro ao salvar sessão:', err);
                return res.redirect('/saves');
            }
            res.redirect('/menu');
        });
    }

    static async mostrarMenu(req, res) {
        if (!req.session.save) {
            return res.redirect('/saves');
        }
        res.render('menu', { erro: req.query.erro });
    }

    static async tirarVida(req, res) {
        if (!req.session.save) {
            return res.redirect('/saves');
        }
        try {
            let novaVida = req.session.save.atributos.vida_atual - 10;
            if (novaVida < 0) novaVida = 0;
            const query = 'UPDATE atributos_personagem SET vida_atual = ? WHERE save_id = ?';
            await saveModel.atualizarAtributoPersonagem(query, [novaVida, req.session.save_id]);
            req.session.save.atributos.vida_atual = novaVida;
            res.redirect('/menu');
        } catch (error) {
            console.error('Erro ao tirar sua vida:', error);
            res.redirect('/menu');
        }
    }
}

module.exports = saveController