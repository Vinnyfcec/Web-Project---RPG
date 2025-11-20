const lojaModel = require('../models/lojaModel');
const saveModel = require('../models/saveModel');

class lojaController {

    static async mostrarLoja(req, res) {
        if (!req.session.save) {
            return res.redirect('/saves');
        }

        try {
            const intensLoja = await lojaModel.listarProdutosLoja();
            res.render('loja', { itensLoja, erro: req.query.erro, sucesso: req.query.sucesso });
        } catch (error) {
            res.render('loja', { itensLoja: [], erro: 'Erro ao carregar a loja'});
        }
    }

    //comprarItem
}

module.exports = lojaController;