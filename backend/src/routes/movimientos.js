const { Router } = require('express');
const { crearMovimiento } = require('../controllers/movimientosController');
const { verificarToken } = require('../middleware/auth');

const router = Router();

router.post('/', verificarToken, crearMovimiento);

module.exports = router;