const { Router } = require('express');
const { login, perfil } = require('../controllers/authController');
const { verificarToken, requiereRol } = require('../middleware/auth');

const router = Router();

router.post('/login', login);
router.get('/me', verificarToken, perfil);
router.get('/admin-only', verificarToken, requiereRol(1), (req, res) => res.json({ mensaje: 'Acceso de administrador' }));

module.exports = router;