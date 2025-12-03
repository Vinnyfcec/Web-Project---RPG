const express = require("express");
const router = express.Router();
const saveController = require("../controllers/saveController");

router.get("/saves", saveController.isAuth, saveController.listarSaves, (req, res) => saveController.mostrarRenomearSave(req, res, false));
router.post('/saves/:id/selecionar', saveController.selecionarSave);
router.post('/saves/:id/tirarvida', saveController.isAuth, saveController.loadSave, saveController.tirarVida);
router.use(saveController.loadSave);
router.get('/menu', saveController.isAuth, saveController.mostrarMenu);
router.post('/saves/criar', saveController.isAuth, saveController.criarSave);
router.post('/saves/:id/renomear', saveController.renomearSave);
router.post('/saves/:id/deletar', saveController.isAuth, saveController.excluirSave);
//router.post('/saves/:id/abririnventario', saveController.isAuth, saveController.abrirInventario);
//router.get('/inventario', saveController.isAuth, saveController.mostrarInventario);
//router.post('/saves/:id/pegaritem', saveController.isAuth, saveController.pegarItem);
//router.post('saves/:id/caçar', saveController.isAuth, saveController.caçar);

module.exports = router;
