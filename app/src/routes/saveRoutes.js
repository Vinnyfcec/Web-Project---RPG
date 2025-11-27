const express = require("express");
const router = express.Router();
const saveController = require("../controllers/saveController");

router.get("/saves", saveController.isAuth, saveController.listarSaves);
router.post('/saves/:id/selecionar', saveController.selecionarSave);
router.post('/saves/:id/tirarvida', saveController.isAuth, saveController.loadSave, saveController.tirarVida);
router.use(saveController.loadSave);
router.get('/menu', saveController.isAuth, saveController.mostrarMenu);

module.exports = router;
