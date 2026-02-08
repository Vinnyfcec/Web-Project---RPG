const express = require("express");
const router = express.Router();
const saveController = require("../controllers/saveController");

router.use(saveController.isAuth);
router.use(saveController.loadSave);

router.get('/saves', saveController.listarSaves);
router.post('/saves/:id/selecionar', saveController.selecionarSave);
router.post('/saves/criar', saveController.criarSave);
router.post('/saves/:id/renomear', saveController.renomearSave);
router.post('/saves/:id/deletar', saveController.excluirSave);

router.get('/menu', saveController.mostrarMenu);
router.post('/menu/excluirItem', saveController.excluirItem);
router.post('/menu/:pet_id/soltarPet', saveController.soltarPet);
router.post('/saves/:id/adotarpet', saveController.adotarPet);
router.post('/saves/:id/renomearatributos', saveController.renomearAtributos);
router.post('/saves/:id/adicionarvida', saveController.adicionarVida);
router.post('/saves/:id/cacar', saveController.cacar);
router.post('/saves/:id/pegarItem', saveController.pegarItem);

router.get('/ferreiro', saveController.showFerreiro);
router.post('/ferreiro/melhorar', saveController.melhorarItem);

module.exports = router;
