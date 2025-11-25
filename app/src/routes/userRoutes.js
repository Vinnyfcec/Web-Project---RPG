const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/registro", userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/registro", userController.showRegistrationForm);
router.get("/login", userController.showLoginForm);
router.post("/logout", userController.logoutUser);
router.get("/logout", userController.logoutUser);

module.exports = router; 