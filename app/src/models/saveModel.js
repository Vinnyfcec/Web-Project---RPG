const db = require('../config/db');

class saveModel {

    static async criarSaveInicial(usuario_id, nome_save) {
        const query = 'INSERT INTO saves (usuario_id, nome_save, dinheiro, nivel, itens_adquiridos) VALUES (?, `myfirstsave`, 10, 1, 0)';
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


//SELECT i.id as inventario_id, i.quantidade, i.equipado, ib.nome, ib.tipo, ib.raridade, ib.descricao, ib.atributo_ataque, ib.atributo_defesa
//FROM inventario i JOIN itens_base id ON i.item_base_id = ib.id WHERE i.save_id = ?

}