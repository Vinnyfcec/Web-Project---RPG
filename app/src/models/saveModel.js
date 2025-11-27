const db = require('../config/db');

class saveModel {

    static async criarSaveInicial(usuario_id) {
        const query = "INSERT INTO saves (usuario_id, nome_save, dinheiro, nivel, itens_adquiridos) VALUES (?, 'myfirstsave', 10, 1, 0)";
        const [result] = await db.execute(query, [usuario_id]);
        const save_id = result.insertId;
        const attrQuery = 'INSERT INTO atributos_personagem (save_id) VALUES (?)';
        await db.execute(attrQuery, [save_id]);

        return save_id;
    }

    static async atualizarSave(nome_save, dinheiro, nivel, itens_adquiridos) {
        const query = 'UPDATE saves SET dinheiro = ?, nivel = ?, itens_adquiridos = ? WHERE id = ?';
        const [result] = await db.execute(query, [dinheiro, nivel, itens_adquiridos, nome_save]);
        return result.affectedRows > 0;
    }

    static async excluirSave(nome_save) {
        const query = 'DELETE FROM saves WHERE nome_save = ?';
        const [result] = await db.execute(query, [nome_save]);
        return result.affectedRows > 0;
    }

    static async listarInventario(save_id) {
        const query = `SELECT i.id as inventario_id, i.quantidade, i.equipado, ib.nome, ib.tipo, ib.raridade, ib.descricao, ib.atributo_ataque, ib.atributo_defesa FROM inventario i JOIN itens_base ib ON i.item_base_id = ib.id WHERE i.save_id = ?`;
        const [rows] = await db.execute(query, [save_id]);
        return rows;
    }

    static async buscarSaveCompleto(save_id){
        const query = `SELECT * FROM saves WHERE id = ?`;
        const [save] = await db.execute(query, [save_id]);
        if (save.length === 0) {return null;}

        const attrQuery = `SELECT * FROM atributos_personagem WHERE save_id = ?`;
        const [atributos] = await db.execute(attrQuery, [save_id]);

        return {...save[0], atributos: atributos.length > 0 ? atributos[0] : {} };
    }

    static async listarSavesporUsuario(usuario_id) {
        const query = 'SELECT * FROM saves WHERE usuario_id = ?';
        const [rows] = await db.execute(query, [usuario_id]);
        return rows;
    }

    static async atualizarAtributoPersonagem(query, params) {
        const [result] = await db.execute(query, params);
        return result;
    }
}

module.exports = saveModel;