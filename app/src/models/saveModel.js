const db = require('../config/db');
const experienciaNivel = [0, 300, 900, 2700, 6500];
class saveModel {

    static async criarSaveInicial(usuario_id, nomesave) {
        const query = "INSERT INTO saves (usuario_id, nome_save, dinheiro, nivel, itens_adquiridos) VALUES (?, ?, 100, 1, 0)";
        const [result] = await db.execute(query, [usuario_id, nomesave]);
        const save_id = result.insertId;
        const attrQuery = 'INSERT INTO atributos_personagem (save_id) VALUES (?)';
        await db.execute(attrQuery, [save_id]);
        const inimigos = "INSERT INTO `monstros` (`save_id`, `nome`) VALUES (?, 'Goblin'), (?, 'Orc'), (?, 'Lobo'), (?, 'Bandido'), (?, 'Espectro');"
        await db.execute(inimigos, [save_id, save_id, save_id, save_id, save_id]);
        const [itensBase] = await db.execute("SELECT * FROM itens_base WHERE id IN (1, 2)");
        for (const item of itensBase) {
            const invent = "INSERT INTO `inventario` (`save_id`, `item_base_id`, `quantidade`, `equipado`, `raridade`, `valor_mercado`, `efeito_consumivel`, `atualizavel`, `atributo_ataque`, `atributo_defesa`) VALUES (?, ?, 1, TRUE, ?, ?, ?, ?, ?, ?);"
            await db.execute(invent, [save_id, item.id, item.raridade, item.valor_mercado, item.efeito_consumivel, item.atualizavel, item.atributo_ataque, item.atributo_defesa]);
        }
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
        const query = `SELECT i.id as inventario_id, i.quantidade, i.equipado, i.raridade, i.atributo_ataque, i.atributo_defesa, i.valor_mercado, ib.nome, ib.tipo, ib.descricao, ib.atributo_chave FROM inventario i JOIN itens_base ib ON i.item_base_id = ib.id WHERE i.save_id = ?`;
        const [rows] = await db.execute(query, [save_id]);
        return rows;
    }

    static async buscarSaveCompleto(save_id){
        if (!save_id || save_id <= 0) {
            throw new Error('ID do save inválido');
        }

        const query = `SELECT * FROM saves WHERE id = ?`;
        const [save] = await db.execute(query, [save_id]);
        if (save.length === 0) {return null;}

        const inventario = await this.listarInventario(save_id);

        const attrQuery = `SELECT * FROM atributos_personagem WHERE save_id = ?`;
        const [atributos] = await db.execute(attrQuery, [save_id]);

        const petQuery = `SELECT * FROM pets WHERE save_id = ?`;
        const [pets] = await db.execute(petQuery, [save_id]);

        let ataqueTotal = 0;
        let defesaTotal = 0;
        let poder = 0;
        poder = atributos[0].poder;
        ataqueTotal = atributos[0].ataque;
        defesaTotal = atributos[0].defesa;

        if (pets && pets.length > 0) {
            poder += 2;
            defesaTotal += 2;
        }

        inventario.forEach(item => {
            if (item.equipado) {
                ataqueTotal += item.atributo_ataque;
                defesaTotal += item.atributo_defesa;
                poder += item.atributo_ataque;
                poder += item.atributo_defesa;
            }
        });
        
        return {
            ...save[0], 
            atributos: atributos.length > 0 ? {...atributos[0], ataque: ataqueTotal, defesa: defesaTotal, poder: poder } : {},
            inventario,
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

    static async pegarItemNovo(save_id) {
    const nivelQuery = `SELECT atributos_personagem.nivel AS nivel_mochileiro FROM atributos_personagem JOIN saves ON atributos_personagem.save_id = saves.id WHERE saves.id = ?`;
    const [nivelResult] = await db.execute(nivelQuery, [save_id]);
    const nivel_mochileiro = nivelResult[0]?.nivel_mochileiro || 1;
    const query = `SELECT * FROM itens_base WHERE nivel_requerido <= ? ORDER BY RAND() LIMIT 1`;
    const [result] = await db.execute(query, [nivel_mochileiro]);

    return result[0];
}

    static async adicionarItemInventario(save_id, item_base_id, quantidade = 1) {
        const query = 'INSERT INTO inventario (save_id, item_base_id, quantidade, equipado, raridade, valor_mercado, efeito_consumivel, atualizavel, atributo_ataque, atributo_defesa) VALUES (?, ?, ?, 0, (SELECT raridade FROM itens_base WHERE id = ?), (SELECT valor_mercado FROM itens_base WHERE id = ?), (SELECT efeito_consumivel FROM itens_base WHERE id = ?), (SELECT atualizavel FROM itens_base WHERE id = ?), (SELECT atributo_ataque FROM itens_base WHERE id = ?), (SELECT atributo_defesa FROM itens_base WHERE id = ?)) ON DUPLICATE KEY UPDATE quantidade = quantidade + ?';
        await db.execute(query, [save_id, item_base_id, quantidade, item_base_id, item_base_id, item_base_id, item_base_id, item_base_id, item_base_id, quantidade]);
    }

    static async equiparItem(item_id, save_id) {
        const queryCount= ' SELECT COUNT(*) AS total FROM inventario WHERE save_id = ? AND equipado = 1';
        const [[{ total }]] = await db.execute(queryCount, [save_id]);
        if (total >= 3) {
            throw new Error('Limite de itens equipados atingido.');
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
        const query = 'SELECT SUM(ib.atributo_poder) AS poder FROM inventario i JOIN itens_base ib ON i.item_base_id = ib.id WHERE i.save_id = ? AND i.equipado = 1';
        const [rows] = await db.execute(query, [save_id]);
        return rows[0] || { poder: 0 };
    }

    static async atualizarExperiencia(save_id, ganho_experiencia) {
        const query = 'UPDATE atributos_personagem SET experiencia = experiencia + ? WHERE save_id = ?';
        await db.execute(query, [ganho_experiencia, save_id]);
    }

    static async atualizarDinheiro(save_id, valor) {
        const query = 'UPDATE saves SET dinheiro = ? WHERE id = ?';
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
        const [rows] = await db.execute(query, [save_id]);
        const usuario = rows[0]

        if (usuario.nivel <5 && usuario.experiencia >= experienciaNivel[usuario.nivel]) {
            await db.execute('UPDATE atributos_personagem SET nivel = nivel + 1 WHERE save_id = ?', [save_id]);
            return true;
        }
        return false;
    }

    static async caçar(){
        const [rows] = await db.execute('SELECT nome FROM monstros ORDER BY RAND() LIMIT 1');
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

        const query = 'SELECT i.id, ib.atributo_chave, i.atributo_ataque, i.atributo_defesa, i.quantidade FROM inventario i JOIN itens_base ib ON i.item_base_id = ib.id WHERE i.id = ? AND i.save_id = ?';
        const [itens] = await db.execute(query, [item_id, save_id]);
        
        if (itens.length === 0) {
            throw new Error('Item não encontrado no inventário.');
        }
        
        const item = itens[0];
        if (item.atributo_chave === 'nenhum') {
            throw new Error('Esre item não pode ser melhorado.');
        }
        
        const novoDinheiro = save.dinheiro - 10;
        await db.execute('UPDATE saves SET dinheiro = ? WHERE id = ?', [novoDinheiro, save_id]);
        
        let novoAtributoAtaque = item.atributo_ataque;
        let novoAtributoDefesa = item.atributo_defesa;
        
        if (item.atributo_chave === 'Ataque') {
            novoAtributoAtaque += 5;
        } else if (item.atributo_chave === 'Defesa') {
            novoAtributoDefesa += 5;
        }
        
        const updateQuery = 'UPDATE inventario SET atributo_ataque = ?, atributo_defesa = ? WHERE id = ?';
        await db.execute(updateQuery, [novoAtributoAtaque, novoAtributoDefesa, item.id]);

        return { sucesso: true, item_base_id: item.item_base_id, novoAtributoAtaque, novoAtributoDefesa };
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

    static async aplicarAtributoItem(item_id, atributo_chave, valor) {
        let novoAtaque = 0;
        let novoDefesa = 0;
        
        if (atributo_chave === 'ataque') {
            novoAtaque = valor;
        } else if (atributo_chave === 'defesa') {
            novoDefesa = valor;
        }
        
        const query = 'UPDATE itens_base SET atributo_ataque = ?, atributo_defesa = ? WHERE id = ?';
        await db.execute(query, [novoAtaque, novoDefesa, item_id]);
    }
}

module.exports = saveModel;