const { Router } = require('express');
const { listarCategorias, listarProveedores, listarBodegas } = require('../controllers/catalogoController');

const router = Router();

router.get('/categorias', listarCategorias);
router.get('/proveedores', listarProveedores);
router.get('/bodegas', listarBodegas);

module.exports = router;