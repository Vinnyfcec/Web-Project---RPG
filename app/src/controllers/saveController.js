import SaveModel from '../models/saveModel.js';
import db from '../config/db.js';

class SaveController {
    static isAuth(req, res, next) {
        const publicPaths = ['/', '/login', '/cadastro'];
        if (publicPaths.includes(req.path)) {
            return next();
        }
        if (!req.session.usuario) {
            return res.redirect('/login');
        }

        next();
    }

    static async loadSave(req, res, next) {
        res.locals.save = null;
        res.locals.inventario = [];
        if (!req.session.save_id) {
            return next();
        }

        try {
            const saveCompleto = await SaveModel.buscarSaveCompleto(req.session.save_id);
            if (!saveCompleto) {
                req.session.save_id = null;
                return next();
            }
            res.locals.save = saveCompleto;

            try {
                const inventario = await SaveModel.listarInventario(req.session.save_id);
                res.locals.inventario = inventario;
            } catch (error_) {
                console.error('Erro ao carregar inventário:', error_);
            }
            try {
                const estoque = await SaveModel.listarEstoque(req.session.save_id);
                res.locals.estoque = estoque;
            } catch (error_) {
                console.error('Erro ao carregar estoque: ', error_)
            }

        } catch (error) {
            console.error('Erro ao carregar o save:', error);
            req.session.save_id = null;
        }
        next();
    }

    static async listarSaves(req, res) {
        try {
            const saves = await SaveModel.listarSavesporUsuario(req.session.usuario.id);
            res.render('saves', { saves: saves, erro: req.query.erro});
        } catch (error) {
            console.error('Erro ao listar saves:', error);
            res.render('saves', { saves: [], erro: 'Erro ao listar saves.' });
        }
    }

    static async selecionarSave(req, res) {
        const save_id = req.params.id;
        req.session.save_id = save_id;
        req.session.save(err => {
            if (err) {
                console.error(err);
                return res.redirect('/saves');
            }
        res.redirect('/menu');
        });
    }

    static async criarSave(req, res) {
        const usuario_id = req.session.usuario.id;
        const nome_save = req.body.nome_save; 
        if (typeof nome_save !== "string") {
        return res.status(400).send("Nome inválido");
        }
        if (!nome_save || nome_save.trim() === '') {
            return res.redirect('/saves?erro=O nome do save não pode ser vazio.');
        }

        try {
            await SaveModel.criarSaveInicial(usuario_id, nome_save);
            res.redirect('/saves');
        } catch (error) {
            console.error('Erro ao criar novo save:', error);
            res.redirect('/saves?erro=Erro ao criar novo save.');
        }
    }

    static async renomearSave(req, res) {
        const saveId = req.params.id;
        const novoNome = req.body.novo_nome;
        if (typeof novoNome !== "string") {
            return res.status(400).send("Nome inválido");
        }
        if (!novoNome || novoNome.trim() === '') {
                return res.status(400).json({ erro: 'Nome legal, só falta um nome' });}
        try {
            await SaveModel.renomearSave(saveId, novoNome);
            res.redirect('/saves?sucesso=Save renomeado com sucesso!');
        } catch (error) {
            res.redirect(`/saves?erro=Erro ao renomear save: ${error.message}`);
        }
    }

    static async excluirSave(req, res) {
        const saveId = req.params.id;
        try {
            await SaveModel.excluirSave(saveId);
            res.redirect('/saves?sucesso=Save deletado com sucesso!');
        } catch (error) {
            res.redirect(`/saves?erro=Erro ao deletar save: ${error.message}`);
        }
    }

    static async mostrarMenu(req, res) {
        if (!req.session.save_id) {
            return res.redirect('/saves');
        }
        res.render('menu', { erro: req.query.erro });
    }

    static async abrirInventario(req, res) {
        try {
            const saveId = req.session.save_id;
            const itens = await SaveModel.listarInventario(saveId);
            const slots=20;
            const inventario= [...itens];
            while (inventario.length < slots) {
                inventario.push(null);
            }
            res.render('inventario', { inventario });
        } catch (error) {
            res.redirect(`/menu?erro=Erro ao abrir inventário: ${error.message}`);
        }
    } 

    static async equiparItem(req, res) {
        const { item_id } = req.body;
        const saveId = req.session.save_id;
        
        try{
            await SaveModel.equiparItem(item_id, saveId);
            req.session.flash = "Item equipado com sucesso";
            res.redirect('/menu');
        } catch (error) {
            console.error('Erro ao equipar item:', error);
            req.session.flash = `Erro ao equipar o item: ${error.message}`;
            res.redirect('/menu');
        }
    }

    static async desequiparItem(req, res) {
        const { item_id } = req.body;
        const saveId = req.session.save_id;
        try {
            await SaveModel.desequiparItem(item_id, saveId);
            req.session.flash = "Item desequipado";
            res.redirect('/menu');
        } catch (error) {
            console.error('Erro ao desequipar item:', error);
            res.redirect(`/menu?erro=Erro ao desequipar o item`);
        }
    }

    static async excluirItem(req, res) {
        const saveId = req.session.save_id;
        const inventarioId = req.body.inventario_id;
        try {
            await SaveModel.excluirItem(saveId, inventarioId);
            req.session.flash = "Item excluído com sucesso";
            res.redirect('/menu');
        } catch (error) {
            console.error('Erro ao excluir item:', error);
            req.session.flash = `Erro ao excluir item: ${error.message}`;
            res.redirect('/menu');
        }
    }
    
    static async adotarPet(req, res) {
        const saveId = req.params.id;
        const nome_pet = req.body.nome_pet;
        try {
            const pet = await SaveModel.adotarPet(saveId, nome_pet);
            if (req.session.thesave) req.session.thesave.pet = pet;
            res.redirect('/menu?sucesso=Você adotou um pet!');
        } catch (error) {
            res.redirect(`/menu?erro=Erro ao adotar pet: ${error.message}`);
        }
    }

    static async soltarPet(req, res) {
        const petId = req.params.pet_id;
        const saveId = req.session.save_id;
        try {
            const query = 'DELETE FROM pets WHERE id = ? AND save_id = ?';
            await db.execute(query, [petId, saveId]);
            if (req.session.thesave) req.session.thesave.pet = null;
            req.session.flash = "Pet solto com sucesso";
            res.redirect('/menu');
        } catch (error) {
            console.error('Erro ao soltar pet:', error);
            req.session.flash = `Erro ao soltar pet: ${error.message}`;
            res.redirect('/menu');
        }
    }

    static async renomearAtributos(req, res) {
        const saveId = req.params.id;
        const novo_nome = req.body.novo_nome;
        const novo_nome_pet = req.body.novo_nome_pet;
        if (typeof novo_nome !== "string") {
            return res.status(400).send("Nome inválido");
        }
        if (typeof novo_nome_pet !== "string") {
            return res.status(400).send("Nome inválido");
        }

        try {
            const queryAttr = 'UPDATE atributos_personagem SET nome = ? WHERE save_id = ?';
            await db.execute(queryAttr, [novo_nome, saveId]);
            
            if (novo_nome_pet && novo_nome_pet.trim() !== '') {
                const queryPet = 'UPDATE pets SET nome = ? WHERE save_id = ?';
                await db.execute(queryPet, [novo_nome_pet, saveId]);
            }
            
            req.session.flash = "Atributos renomeados";
            res.redirect('/menu');
        } catch (error) {
            console.error('Erro ao renomear atributos:', error);
            req.session.flash = `Erro ao renomear atributos: ${error.message}`;
            res.redirect('/menu');
        }
    }

    static async cacar(req, res) {
        try {
            const saveId = req.session.save_id;
            const save = await SaveModel.buscarSaveCompleto(saveId);
            if (save.atributos.vida_atual <= 0) {
                return res.redirect('/menu?erro=Você está morto');
            }

            const { nivel, ataque, defesa } = save.atributos;
            const inimigoNome = await SaveModel.caçar();
            
            const inimigoNivel = Math.max(1, nivel + Math.floor(Math.random() * 3) - 1);
            const inimigoAtaque = 5 + (inimigoNivel * 4);
            const inimigoDefesa = 2 + (inimigoNivel * 3);
            
            const danoInimigo = Math.max(3, inimigoAtaque - defesa + Math.floor(Math.random() * nivel));

            const poderJogador = ataque + defesa;
            const poderInimigo = inimigoAtaque + inimigoDefesa;
            const chanceBase = 50;
            const bonusPoder = (poderJogador - poderInimigo) * 2;
            const chanceVitoria = Math.min(95, Math.max(5, chanceBase + bonusPoder));

            const roll = Math.floor(Math.random() * 100) + 1;
            
            if (roll <= chanceVitoria) {
                const ouroGanho = Math.floor(10 + (inimigoNivel * 5) + (Math.random() * 10));
                const expGanha = Math.floor(20 + (inimigoNivel * 10));
                
                const danoRecebido = Math.floor(danoInimigo * 0.3); 
                
                await SaveModel.atualizarDinheiro(saveId, save.dinheiro + ouroGanho);
                await SaveModel.atualizarExperiencia(saveId, expGanha);
                if (danoRecebido > 0) await SaveModel.perderVida(saveId, danoRecebido);
                await SaveModel.subirNivel(saveId);

                req.session.flash = `Vitória! Você derrotou ${inimigoNome} (Nível ${inimigoNivel}). +${ouroGanho} Ouro, +${expGanha} EXP. Dano recebido: ${danoRecebido}`;
                return res.redirect('/menu');
            } else {
                const danoRecebido = danoInimigo;
                await SaveModel.perderVida(saveId, danoRecebido);
                
                req.session.flash = `Derrota! ${inimigoNome} foi brabo e te causou ${danoRecebido} de dano`;
                return res.redirect('/menu');
            }

        } catch (error) {
            console.error('Erro na caça:', error);
            return res.redirect(`/menu?erro=Erro ao caçar: ${error.message}`);
        }
    }

    static async adicionarVida(req, res) {
        const saveId = req.params.id;
        try {
            await SaveModel.adicionarVida(saveId, 100);
            req.session.flash = "Vida adicionada com sucesso";
            res.redirect('/menu');
        } catch (error) {
            console.error('Erro ao adicionar vida:', error);
            req.session.flash = `Erro ao adicionar vida: ${error.message}`;
            res.redirect('/menu');
        }
    }

    static async showFerreiro(req, res) {
        res.render('ferreiro', { erro: req.query.erro });
    }

    static async melhorarItem(req, res) {
        const saveId = req.session.save_id;
        const itemId = req.body.item_id;

        try {
            await SaveModel.melhorarItem(saveId, itemId);
            req.session.flash = "Item melhorado com sucesso";
            res.redirect('/ferreiro');
        } catch (error) {
            console.error('Erro ao melhorar item:', error);
            req.session.flash = `Erro ao melhorar item: ${error.message}`;
            res.redirect('/ferreiro');
        }
    }

    static async showLoja(req, res) {
        res.render('loja', { erro: req.query.erro });
    }

    static async comprar(req, res) {
        const idItem = req.body.idItem;
        const saveId = req.session.save_id;

        if (!idItem) {
            req.session.flash = "ID do item não fornecido";
            return res.redirect('/loja');
        }

        try {
            const save = await SaveModel.buscarSaveCompleto(saveId);
            const itemEstoque = await SaveModel.buscarItemNoEstoque(idItem, saveId);

            if (!itemEstoque) {
                req.session.flash = "Item não encontrado no estoque";
                return res.redirect('/loja');
            }

            const custo = itemEstoque.valor_mercado;
            if (save.dinheiro < custo) {
                req.session.flash = "Dinheiro insuficiente";
                return res.redirect('/loja');
            }

            const novoDinheiro = save.dinheiro - custo;
            await SaveModel.atualizarDinheiro(saveId, novoDinheiro);
            
            await SaveModel.adicionarItemInventario(saveId, itemEstoque.item_base_id, 1, {
                raridade: itemEstoque.raridade,
                valor_mercado: itemEstoque.valor_mercado,
                atributo_ataque: itemEstoque.atributo_ataque,
                atributo_defesa: itemEstoque.atributo_defesa,
                atualizavel: itemEstoque.atualizavel
            });
            
            req.session.flash = `Item ${itemEstoque.nome} comprado com sucesso`;
            res.redirect('/loja');
        } catch (error) {
            console.error('Erro ao comprar item:', error);
            req.session.flash = "Erro ao processar compra";
            res.redirect('/loja');
        }
    }

    static async vender(req, res) {
        const { itemId } = req.body;
        const saveId = req.session.save_id;

        try {
            const save = await SaveModel.buscarSaveCompleto(saveId);
            const [rows] = await db.execute('SELECT * FROM inventario WHERE id = ? AND save_id = ?', [itemId, saveId]);
            const item = rows[0];

            if (!item) {
                req.session.flash = "Item não encontrado no seu inventário";
                return res.redirect('/loja');
            }

            const valorVenda = Math.floor(item.valor_mercado * 0.5);
            const novoDinheiro = save.dinheiro + valorVenda;

            await SaveModel.atualizarDinheiro(saveId, novoDinheiro);
            await SaveModel.venderItem(saveId, itemId);

            req.session.flash = "Item vendido com sucesso";
            res.redirect('/loja');
        } catch (error) {
            console.error('Erro ao vender item:', error);
            req.session.flash = "Erro ao processar venda";
            res.redirect('/loja');
        }
    }
}

export default SaveController;