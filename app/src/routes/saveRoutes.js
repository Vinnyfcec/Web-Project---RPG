const express = require("express");
const router = express.Router();
const saveController = require("../controllers/saveController");

router.get('/saves', saveController.isAuth, saveController.listarSaves, (req, res) => saveController.mostrarRenomearSave(req, res, false));
router.post('/saves/:id/selecionar', saveController.selecionarSave);
//router.post('/saves/:id/tirarvida', saveController.isAuth, saveController.loadSave, saveController.tirarVida);
router.post('/saves/:id/adicionarvida', saveController.isAuth, saveController.loadSave, saveController.adicionarVida);
router.use(saveController.loadSave);
router.get('/menu', saveController.isAuth, saveController.mostrarMenu);
router.post('/menu/excluirItem', saveController.isAuth, saveController.excluirItem);
router.post('/menu/:pet_id/soltarPet', saveController.isAuth, saveController.soltarPet);
router.post('/saves/criar', saveController.isAuth, saveController.criarSave);
router.post('/saves/:id/renomear', saveController.renomearSave);
router.post('/saves/:id/deletar', saveController.isAuth, saveController.excluirSave);
router.post('/saves/:id/adotarpet', saveController.isAuth, saveController.adotarPet);
router.post('/saves/:id/renomearatributos', saveController.isAuth, saveController.renomearAtributos);
router.get('/ferreiro', saveController.isAuth, saveController.showFerreiro);
router.post('/ferreiro/melhorar', saveController.isAuth, saveController.melhorarItem);
router.post('/pegarItem', saveController.isAuth, saveController.pegarItem);
router.post('/saves/:id/cacar', saveController.isAuth, saveController.cacar);
router.post('/saves/:id/pegarItem', saveController.isAuth, saveController.pegarItem)

module.exports = router;
