const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: 'Email y contraseña son obligatorios' });
  }

  const [rows] = await pool.query(
    `SELECT u.id, u.nombre, u.email, u.password_hash, u.rol_id, r.nombre AS rol
     FROM usuarios u
     JOIN roles r ON r.id = u.rol_id
     WHERE u.email = ?`,
    [email]
  );

  const usuario = rows[0];
  if (!usuario) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  const coinciden = await bcrypt.compare(password, usuario.password_hash);
  if (!coinciden) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  const token = jwt.sign(
    { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol_id: usuario.rol_id, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );

  return res.json({
    mensaje: 'Inicio de sesión exitoso',
    token,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      rol_id: usuario.rol_id
    }
  });
}

async function perfil(req, res) {
  const [rows] = await pool.query(
    `SELECT u.id, u.nombre, u.email, r.nombre AS rol
     FROM usuarios u
     JOIN roles r ON r.id = u.rol_id
     WHERE u.id = ?`,
    [req.usuario.id]
  );
  if (!rows[0]) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }
  return res.json({ usuario: rows[0] });
}

module.exports = { login, perfil };