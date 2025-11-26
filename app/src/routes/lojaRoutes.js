const express = require('express');
const router = express.Router();
const lojaController = require('../controllers/lojaController');
const saveController = require('../controllers/saveController');

//router.use(saveController.isAuth);
router.use(saveController.loadSave);

//router.get('/loja', lojaController.mostrarLoja);
//router.post('/loja/comprar', lojaController.comprarItem);

module.exports = router;