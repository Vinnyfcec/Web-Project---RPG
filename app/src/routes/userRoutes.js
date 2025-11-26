const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/cadastro", userController.cadastrarUsuario);
router.post("/login", userController.fazerLogin);
router.get("/cadastro", userController.mostrarCadastro);
router.get("/login", userController.mostrarLogin);
router.post("/logout", userController.fazerLogout);

module.exports = router; 