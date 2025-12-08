const db = require('../config/db');
const experienciaNivel = [0, 300, 900, 2700, 6500];
class saveModel {

    static async criarSaveInicial(usuario_id, nomesave) {
        const query = "INSERT INTO saves (usuario_id, nome_save, dinheiro, nivel, itens_adquiridos) VALUES (?, ?, 100, 1, 0)";
        const [result] = await db.execute(query, [usuario_id, nomesave]);
        const save_id = result.insertId;
        const attrQuery = 'INSERT INTO atributos_personagem (save_id) VALUES (?)';
        await db.execute(attrQuery, [save_id]);

        return save_id;
    }

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
        const query = `SELECT i.id as inventario_id, i.id, i.quantidade, i.equipado, ib.nome, ib.tipo, ib.raridade, ib.descricao, ib.atributo_ataque, ib.atributo_defesa, ib.atributo_chave FROM inventario i JOIN itens_base ib ON i.item_base_id = ib.id WHERE i.save_id = ?`;
        const [rows] = await db.execute(query, [save_id]);
        return rows;
    }

    static async buscarSaveCompleto(save_id){
        const query = `SELECT * FROM saves WHERE id = ?`;
        const [save] = await db.execute(query, [save_id]);
        if (save.length === 0) {return null;}

        const invQuery = 'SELECT i.id as inventario_id, i.quantidade, i.equipado, ib.nome, ib.tipo, ib.raridade, ib.descricao, ib.atributo_ataque, ib.atributo_defesa, ib.atributo_chave FROM inventario i JOIN itens_base ib ON i.item_base_id = ib.id WHERE i.save_id = ?';
        const [inventario] = await db.execute(invQuery, [save_id]);

        const attrQuery = `SELECT * FROM atributos_personagem WHERE save_id = ?`;
        const [atributos] = await db.execute(attrQuery, [save_id]);

        const petQuery = `SELECT * FROM pets WHERE save_id = ?`;
        const [pets] = await db.execute(petQuery, [save_id]);

        //agora o ataque é a soma do ataque dos itens equipados
        let ataqueTotal = 0;
        inventario.forEach(item => {
            ataqueTotal += item.atributo_ataque;
        });//defesa é a soma da defesa dos itens equipados + bonus de pet (tipo ganhar sanidade tlgd)
        let defesaTotal = 0;
        if (pets && pets.length > 0) defesaTotal += 2;
        inventario.forEach(item => {
            defesaTotal += item.atributo_defesa;   
        });
        atributos[0].ataque = ataqueTotal;
        atributos[0].defesa = defesaTotal;

        

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

    static async pegarItemNovo() {
        const query = `SELECT * FROM  itens_base WHERE tipo IN ('Arma_ataque','Armadura', 'Escudo') ORDER BY RAND() LIMIT 1`;
        const [rows] = await db.execute(query);
        return rows[0] || null;
    }
    static async buscarNivelMochileiro(save_id) {
        const query = 'SELECT nivel FROM atributos_personagem WHERE id = ?';
        const [rows] = await db.execute(query, [save_id]);
        return rows[0] ?.nivel || 1;
    }
    static async addAtributoAoItem(item_base_id, Atributo_chave, valor) {
        let novoAtaque = 0;
        let novaDefesa = 0;
        if (Atributo_chave === 'Ataque') novoAtaque = valor;
        if (Atributo_chave === 'Defesa') novaDefesa = valor;
        const query = 'UPDATE itens_base SET atributo_ataque = atributo_ataque + ?, atributo_defesa = atributo_defesa + ? WHERE id = ?';
        await db.execute(query, [novoAtaque, novaDefesa, item_base_id]);
    }


    static async adicionarItemInventario(save_id, item_base_id, quantidade = 1) {
        const query = 'INSERT INTO inventario (save_id, item_base_id, quantidade, equipado) VALUES (?, ?, 1, 0) ON DUPLICATE KEY UPDATE quantidade = quantidade + 1';
        await db.execute(query, [save_id, item_base_id]);
    }

    static async equiparItem(item_id, save_id) {
        const queryCount= ' SELECT COUNT(*) AS total FROM inventario WHERE save_id = ? AND equipado = 1';
        const [[{ total }]] = await db.execute(queryCount, [save_id]);
        if (total >= 3) {
            throw new Error('Limite de itens equipados atingido.');
            return false;
        } else {
            const query = 'UPDATE inventario SET equipado = 1 WHERE id = ?';
            await db.execute(query, [item_id]);
            return true;
        }
    }

    static async desequiparItem(item_id) {
            await db.execute('UPDATE inventario SET equipado = 0 WHERE id = ?', [item_id]);
    }

    static async somaAtributos(save_id) {
        const query = 'SELECT SUM (ib.atributo_poder) AS poder FROM inventario i JOIN itens_base ib ON i.item_base_id = ib.id WHERE i.save_id = ? AND i.equipado = 1';

        const [rows] = await db.execute(query, [save_id]);
        return rows[0];
    }

    static async atualizarExperiencia(save_id, ganho_experiencia) {
        const query = 'UPDATE atributos_personagem SET experiencia = experiencia + ? WHERE save_id = ?';
        await db.execute(query, [ganho_experiencia, save_id]);
    }

    static async atualizarDinheiro(save_id, valor) {
        const query = 'UPDATE saves SET dinheiro = dinheiro + ? WHERE id = ?';
        await db.execute(query, [valor, save_id]);
    }

    static async gastarDinheiro(save_id, valor) {
        const query = 'UPDATE saves SET dinheiro = GREATEST(dinheiro - ?, 0) WHERE id = ?';
        await db.execute(query, [valor, save_id]);
    }

    static async perderVida(save_id, dano) {
        const query = 'UPDATE atributos_personagem SET vida_atual = GREATEST(vida_atual - ?, 0) WHERE save_id = ?';
        await db.execute(query, [dano, save_id]);
    }

    static async subirNivel(save_id) {
        const query = 'SELECT nivel, experiencia FROM atributos_personagem WHERE save_id = ?';
        const [usuario] = await db.execute(query, [save_id]);
        if (usuario.nivel <5 && usuario.experiencia >= experienciaNivel[usuario.nivel]) {
            await db.execute('UPDATE atributos_personagem SET nivel = nivel + 1 WHERE save_id = ?', [save_id]);
            return true;
        }
        return false;
    }

    static async caçar(){
        const [rows] = await db.execute('SELECT nome FROM inimigos ORDER BY RAND() LIMIT 1');
        return rows[0].nome;
    }

    static async adotarPet(save_id, nome_pet) {

        const checkQuery = 'SELECT * FROM pets WHERE save_id = ?';
        const [petExistente] = await db.execute(checkQuery, [save_id]);
        
        if (petExistente.length > 0) {
            throw new Error('Este save já possui um pet. Solte o pet anterior para adotar um novo.');
        }
        
        const query = 'INSERT INTO pets (save_id, nome) VALUES (?, ?)';
        const [result] = await db.execute(query, [save_id, nome_pet]);
        
        const petQuery = 'SELECT * FROM pets WHERE id = ?';
        const [pet] = await db.execute(petQuery, [result.insertId]);
        return pet[0];
    }

    static async melhorarItem(save_id, item_id) {
        const save = await this.buscarSaveCompleto(save_id);
        if (save.dinheiro < 10) {
            throw new Error('Dinheiro insuficiente para melhorar o item.');
        }
        const query = 'SELECT ib.atributo_ataque, ib.atributo_defesa, i.quantidade FROM inventario i JOIN itens_base ib ON i.item_base_id = ib.id WHERE i.id = ? AND i.save_id = ?';
        const [itens] = await db.execute(query, [item_id, save_id]);
        if (itens.length === 0) {
            throw new Error('Não ta no inventário.');
        }
        const novoDinheiro = save.dinheiro - 10;
        await db.execute('UPDATE saves SET dinheiro = ? WHERE id = ?', [novoDinheiro, save_id]);
        const item = itens[0];
        const novoAtributoAtaque = (item.atributo_ataque > 0) ? item.atributo_ataque + 5 : item.atributo_ataque;
        const novoAtributoDefesa = (item.atributo_defesa > 0) ? item.atributo_defesa + 5 : item.atributo_defesa;
        const Uquery = 'UPDATE itens_base SET atributo_ataque = ?, atributo_defesa = ? WHERE id = (SELECT item_base_id FROM inventario WHERE id = ?)';
        await db.execute(Uquery, [novoAtributoAtaque, novoAtributoDefesa, item_id]);
        return;
    }

    static async excluirItem(save_id, inventario_id) {
        const query = 'DELETE FROM inventario WHERE id = ? AND save_id = ?';
        const [result] = await db.execute(query, [inventario_id, save_id]);
        return result.affectedRows > 0;
    }

    static async excluirUsuario(user_id) {
        const query = 'DELETE FROM usuarios WHERE id = ?';
        await db.execute(query, [user_id]);
    }
}

module.exports = saveModel;