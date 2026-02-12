import express from "express";
import SaveController from "../controllers/saveController.js";
import { validateCreateSave, validateRenameSave, validateId } from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.use(SaveController.isAuth);
router.use(SaveController.loadSave);

router.get('/saves', SaveController.listarSaves);
router.post('/saves/:id/selecionar', validateId, SaveController.selecionarSave);
router.post('/saves/criar', validateCreateSave, SaveController.criarSave);
router.post('/saves/:id/renomear', validateId, validateRenameSave, SaveController.renomearSave);
router.post('/saves/:id/deletar', validateId, SaveController.excluirSave);
router.post('/saves/:id/adicionarvida', validateId, SaveController.adicionarVida);

router.get('/menu', SaveController.mostrarMenu);
router.post('/menu/excluirItem', SaveController.excluirItem);
router.post('/menu/:pet_id/soltarPet', SaveController.soltarPet);
router.post('/saves/:id/adotarpet', validateId, SaveController.adotarPet);
router.post('/saves/:id/renomearatributos', validateId, SaveController.renomearAtributos);
router.post('/saves/:id/cacar', validateId, SaveController.cacar);
router.post('/inventario/equipar', SaveController.equiparItem);
router.post('/inventario/desequipar', SaveController.desequiparItem);

router.get('/ferreiro', SaveController.showFerreiro);
router.post('/ferreiro/melhorar', SaveController.melhorarItem);

router.get('/loja', SaveController.showLoja);
router.post('/loja/comprar', SaveController.comprar);
router.post('/loja/vender', SaveController.vender)

export default router;