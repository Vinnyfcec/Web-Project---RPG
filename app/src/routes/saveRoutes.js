const express = require("express");
const router = express.Router();
const saveController = require("../controllers/saveController");

//router.post("/saves", saveController.saveGame);
router.get("/saves", saveController.listarSaves);
router.use(saveController.loadSave);

module.exports = router;
