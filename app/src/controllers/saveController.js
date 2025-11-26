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
}

module.exports = saveController