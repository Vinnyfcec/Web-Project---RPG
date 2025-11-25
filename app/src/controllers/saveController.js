saveModel = require('../models/saveModel');
userModel = require('../models/userModel');

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
                const saveCompleto = await saveModel.buscarsavecompleto(req.session.save_id);
                req.session.save = saveCompleto;

                res.locals.save = saveCompleto;
                
                res.locals.save_nome = 'saveCompleto.nome_save' || 'Nome do Save não encontrado';
                
                return next(); 
            } catch (error) {
                console.error("Erro ao carregar o save:", error);
                req.session.save_id = null;
                req.session.save = null;
            }
        }
        return next();
    }
}


module.exports = saveController