const { pool } = require('../config/db');

async function listarCategorias(req, res) {
  const [rows] = await pool.query('SELECT id, nombre FROM categorias ORDER BY nombre');
  return res.json(rows);
}

async function listarProveedores(req, res) {
  const [rows] = await pool.query(
    'SELECT id, ruc_cedula, razon_social, telefono, direccion FROM proveedores ORDER BY razon_social'
  );
  return res.json(rows);
}

async function listarBodegas(req, res) {
  const [rows] = await pool.query('SELECT id, nombre_bodega, ubicacion FROM bodegas ORDER BY id');
  return res.json(rows);
}

module.exports = { listarCategorias, listarProveedores, listarBodegas };