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
        res.locals.inventario = req.session.inventario || [];

        if (req.session.save_id) {
            try {
                const saveCompleto = await saveModel.buscarSaveCompleto(req.session.save_id);
                if (!saveCompleto) {
                    req.session.save_id = null;
                    req.session.saveAtual = null;
                    return next();
                }
                req.session.saveAtual = saveCompleto;
                res.locals.save = saveCompleto;


                try {
                    const inventario = await saveModel.listarInventario(req.session.save_id);
                    req.session.inventario = inventario;
                    res.locals.inventario = inventario;
                } catch (invErr) {
                    console.error('Erro ao carregar inventário:', invErr);
                    req.session.inventario = [];
                    res.locals.inventario = [];
                }
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
            res.render('saves', { saves: saves, erro: req.query.erro});
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
        res.render('menu', { erro: req.query.erro, inventario: req.session.inventario });
    }

    static async tirarVida(req, res) {
        if (!req.session.save) {
            return res.redirect('/saves');
        }
        try {
            let novaVida = req.session.saveAtual.atributos.vida_atual - 10;
            if (novaVida < 0) novaVida = 0;
            const query = 'UPDATE atributos_personagem SET vida_atual = ? WHERE save_id = ?';
            await saveModel.atualizarAtributoPersonagem(query, [novaVida, req.session.save_id]);
            req.session.saveAtual.atributos.vida_atual = novaVida;
            res.redirect('/menu');
        } catch (error) {
            console.error('Erro ao tirar sua vida:', error);
            res.redirect('/menu');
        }
    }

    static async adicionarVida(req, res) {
        if (!req.session.save) {
            return res.redirect('/saves');
        }
        try {
            let novaVida = req.session.saveAtual.atributos.vida_atual + 10;
            const vidaMaxima = req.session.saveAtual.atributos.vida_maxima;
            if (novaVida > vidaMaxima) novaVida = vidaMaxima;
            const query = 'UPDATE atributos_personagem SET vida_atual = ? WHERE save_id = ?';
            await saveModel.atualizarAtributoPersonagem(query, [novaVida, req.session.save_id]);
            req.session.saveAtual.atributos.vida_atual = novaVida;
            res.redirect('/menu');
        } catch (error) {
            console.error('Erro ao adicionar vida:', error);
            res.redirect('/menu');
        }
    }

    static async criarSave(req, res) {
        const usuario_id = req.session.usuario.id;
        const nomesave = req.body.nomesave; 

        if (!nomesave || nomesave.trim() === '') {
            return res.redirect('/saves?erro=O nome do save não pode ser vazio.');
        }

        try {
            await saveModel.criarSaveInicial(usuario_id, nomesave);
            res.redirect('/saves');
        } catch (error) {
            console.error('Erro ao criar novo save:', error);
            res.redirect('/saves?erro=Erro ao criar novo save.');
        }
    }

    static async renomearSave(req, res) {
        const saveId = req.params.id;
        const novoNome = req.body.novo_nome;
        if (!novoNome || novoNome.trim() === '') {
                return res.status(400).json({ erro: 'Nome legal, só falta um nome' });}
        try {
            await saveModel.renomearSave(saveId, novoNome);
            res.redirect('/saves?sucesso=Save renomeado com sucesso!');
        } catch (error) {
            res.redirect(`/saves?erro=Erro ao renomear save: ${error.message}`);
        }
    }

    static async excluirSave(req, res) {
        const saveId = req.params.id;
        try {
            await saveModel.excluirSave(saveId);
            res.redirect('/saves?sucesso=Save deletado com sucesso!');
        } catch (error) {
            res.redirect(`/saves?erro=Erro ao deletar save: ${error.message}`);
        }
    }

    static async listarInventario(req, res) {
        const saveId = req.session.save_id;
        try {
            const inventario = await saveModel.listarInventario(saveId);
            res.render('inventario', {itens})
        } catch (error) {
            res.redirect(`/menu?erro=Erro ao carregar inventário: ${error.message}`);
        }
    }

    static async atualizarAtributoPersonagem(req, res) {
        try {
            const { atributo, valor } = req.body;
            await saveModel.atualizarAtributoPersonagem(atributo, valor, req.session.save_id);
            res.redirect('/menu?sucesso=item equipado.');
        } catch (error) {
            res.redirect(`/menu?erro=Erro ao equipar o item. ${error.message}`);
        }
    }

    static async abrirInventario(req, res) {
        try {
            const saveId = req.session.save_id;
            const itens = await saveModel.listarInventario(saveId);
            const slots=20;
            const inventario= [...itens];
            while (inventario.length < slots) {
                inventario.push(null);
            }
            res.render('inventario', { inventario });
        } catch (error) {
            res.redirect(`/menu?erro=Erro ao abrir inventário: ${error.message}`);
        }

    } //ent guarda esse aqui pra se der separar dps do menu// ok

    //man, o inventario por enquanto ta no menu, nn tem uma pagina pra ele pq ele ja ta funcionando por enquanto
    static async equiparItem(req, res) {
        try {
            const { item_id } = req.body;
            const saveId = req.session.save_id;
            const[result] = await db.execute('SELECT COUNT(*) AS total FROM inventario WHERE id = ? AND equipado= 1', [saveId]);
            if (result[0].total >= 3){
                return res.redirect('/menu?erro=Limite de itens equipados atingido.');
            }
            await db.execute('UPDATE inventario SET equipado = 1 WHERE id = ? AND save_id = ?', [item_id, saveId]);
            res.redirect('/menu?sucesso=item equipado.');
        } catch (error) {
            res.redirect(`/menu?erro=Erro ao equipar o item. ${error.message}`);
        }
    }

    static async desequiparItem(req, res) {
        try {
            const { item_id } = req.body;
            const saveId = req.session.save_id;
            await db.execute('UPDATE inventario SET equipado = 0 WHERE id = ? AND save_id = ?', [item_id, saveId]);
            res.redirect('/menu?sucesso=item desequipado.');
        } catch (error) {
            res.redirect(`/menu?erro=Erro ao desequipar o item. ${error.message}`);
        }
    } 
    
    static async adotarPet(req, res) {
        const saveId = req.params.id;
        const nome_pet = req.body.nome_pet;
        try {
            const pet = await saveModel.adotarPet(saveId, nome_pet);
            req.session.save.pet = pet;
            res.redirect('/menu?sucesso=c adotou um pet!');
        } catch (error) {
            res.redirect(`/menu?erro=Erro ao adotar pet: ${error.message}`);
        }
    }

    static async renomearAtributos(req, res) {
        const saveId = req.params.id;
        const novo_nome = req.body.novo_nome;
        const novo_nome_pet = req.body.novo_nome_pet;
        try {
            const queryAttr = 'UPDATE atributos_personagem SET nome = ? WHERE save_id = ?';
            await saveModel.atualizarAtributoPersonagem(queryAttr, [novo_nome, saveId]);
            if (novo_nome_pet && novo_nome_pet.trim() !== '') {
                const queryPet = 'UPDATE pets SET nome = ? WHERE save_id = ?';
                await saveModel.atualizarAtributoPersonagem(queryPet, [novo_nome_pet, saveId]);
            }
            res.redirect('/menu?sucesso=Atributos renomeados com sucesso!');
        } catch (error) {
            res.redirect(`/menu?erro=Erro ao renomear atributos: ${error.message}`);
        }
    }

    static async showFerreiro(req, res) {
        res.render('ferreiro', { erro: req.query.erro });
    }

    static async melhorarItem(req, res) {
        const saveId = req.session.save_id;
        const itemId = req.body.item_id;

        try {
            await saveModel.melhorarItem(saveId, itemId);
            res.redirect('/ferreiro?sucesso=item mlhorado');
        } catch (error) {
            res.redirect(`/ferreiro?erro=Erro ao melhorar item: ${error.message}`);
        }
    }

    static async excluirItem(req, res) {
        const saveId = req.session.save_id;
        const inventarioId = req.body.inventario_id;
        try {
            await saveModel.excluirItem(saveId, inventarioId);
            res.redirect('/menu?sucesso=item excluído');
        } catch (error) {
            res.redirect(`/menu?erro=Erro ao excluir item: ${error.message}`);
        }
    }

    static async soltarPet(req, res) {
        const petId = req.params.pet_id;
        const saveId = req.session.save_id;
        try {
            const query = 'DELETE FROM pets WHERE id = ? AND save_id = ?';
            await saveModel.atualizarAtributoPersonagem(query, [petId, saveId]);
            req.session.save.pet = null;
            res.redirect('/menu?sucesso=Pet solto com sucesso!');
        } catch (error) {
            res.redirect(`/menu?erro=Erro ao soltar pet: ${error.message}`);
        }
    }

    static async pegarItem(req, res) {
        const saveId = req.session.save_id;
        try {
            const item = await saveModel.pegarItemNovo(saveId);
            await saveModel.adicionarItemInventario(saveId, item[0].id);
            res.redirect('/menu?sucesso=item pego!');
        } catch (error) {
            res.redirect(`/menu?erro=Erro ao pegar item: ${error.message}`);
        }
    }
}

module.exports = saveController