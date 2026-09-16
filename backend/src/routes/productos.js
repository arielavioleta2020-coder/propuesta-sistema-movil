const { Router } = require('express');
const {
  listar,
  buscarPorCodigo,
  crear,
  actualizar,
  eliminar
} = require('../controllers/productosController');
const { verificarToken, requiereRol } = require('../middleware/auth');

const router = Router();

// Endpoints documentados en el informe (acceso público para la demo)
router.get('/', listar);
router.get('/escaneo/:codigo', buscarPorCodigo);

// Operaciones CRUD (protegidas, solo administrador)
router.post('/', verificarToken, requiereRol(1), crear);
router.put('/:id', verificarToken, requiereRol(1), actualizar);
router.delete('/:id', verificarToken, requiereRol(1), eliminar);

module.exports = router;