const db = require('../config/db');

class saveModel {

    static async criarSaveInicial(usuario_id, nomesave) {
        const query = "INSERT INTO saves (usuario_id, nome_save, dinheiro, nivel, itens_adquiridos) VALUES (?, ?, 10, 1, 0)";
        const [result] = await db.execute(query, [usuario_id, nomesave]);
        const save_id = result.insertId;
        const attrQuery = 'INSERT INTO atributos_personagem (save_id) VALUES (?)';
        await db.execute(attrQuery, [save_id]);

        return save_id;
    }

    //static async atualizarSave(nome_save, dinheiro, nivel, itens_adquiridos) {
        //const query = 'UPDATE saves SET nome_save = ?, dinheiro = ?, nivel = ?, itens_adquiridos = ? WHERE id = ?';
        //const [result] = await db.execute(query, [nome_save, dinheiro, nivel, itens_adquiridos, nome_save]);
        //return result.affectedRows > 0;
    //}
    static async renomearSave(save_id, novo_nome) {
        const query = 'UPDATE saves SET nome_save = ? WHERE id = ?';
        const [result] = await db.execute(query, [novo_nome, save_id]);
        return result.affectedRows > 0;
    }

    static async excluirSave(save_id) {
        const query = 'DELETE FROM saves WHERE id = ?';
        const [result] = await db.execute(query, [save_id]);
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

        const petQuery = `SELECT * FROM pets WHERE save_id = ?`;
        const [pets] = await db.execute(petQuery, [save_id]);

        return {
            ...save[0], 
            atributos: atributos.length > 0 ? atributos[0] : {},
            pet: pets.length > 0 ? pets[0] : null
        };
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
    static async pegarItemNovo(save_id, nivel_mochileiro) {
        const query = 'SELECT * FROM  itens_base WHERE stat_min <= ? AND stat_max <= ?';
        const [result] = await db.execute(query, [nivel_mochileiro, nivel_mochileiro]);
        return result;
    }
    static async adicionarItemInventario(save_id, item_base_id, quantidade = 1,) {
        const query = 'INSERT INTO inventario (save_id, item_base_id, quantidade,) VALUES (?, ?, ?)';
        await db.execute(query, [save_id, item_base_id, quantidade]);
    }
    static async equiparItem(item_id, save_id) {
        const queryCount= ' SELECT COUNT(*) AS total FROM inventario WHERE save_id = ? AND equipado = 1';
        const [[{ total }]] = await db.execute(queryCount, [save_id]);
        if (total >= 3) {
            throw new Error('Limite de itens equipados atingido.');
            return false;
            const query = 'UPDATE inventario SET equipado = 1 WHERE id = ?';
            await db.execute(query, [item_id]);
            return true;
        }
    }
    static async desequiparItem(item_id) {
            await db.execute('UPDATE inventario SET equipado = 0 WHERE id = ?', [item_id]);
    }

    static async somaAtributos(save_id) {
        const query = 'SELECT SUM (ib.atributo_poder) AS poder, FROM inventario i JOIN itens_base ib OM i.item_base_id = ib.id WHERE i.save_id = ? AND i.equipado = 1';

        const [rows] = await db.execute(query, [save_id]);
        return rows[0];
    }

    static async adotarPet(save_id, nome_pet) {

        const checkQuery = 'SELECT * FROM pets WHERE save_id = ?';
        const [petExistente] = await db.execute(checkQuery, [save_id]);
        
        if (petExistente.length > 0) {
            throw new Error('Este save já possui um pet. Delete o pet anterior para adotar um novo.');
        }
        
        const query = 'INSERT INTO pets (save_id, nome) VALUES (?, ?)';
        const [result] = await db.execute(query, [save_id, nome_pet]);
        
        const petQuery = 'SELECT * FROM pets WHERE id = ?';
        const [pet] = await db.execute(petQuery, [result.insertId]);
        return pet[0];
    }
}

module.exports = saveModel;
