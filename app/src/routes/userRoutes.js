import express from "express";
import userController from "../controllers/userController.js";
import { validateCadastro, validateLogin } from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.get("/cadastro", userController.mostrarCadastro);
router.get("/login", userController.mostrarLogin);

router.post("/cadastro", validateCadastro, userController.cadastrarUsuario);
router.post("/login", validateLogin, userController.fazerLogin);

router.post("/logout", userController.fazerLogout);
router.post("/excluirUser", userController.excluirUsuario);

export default router;