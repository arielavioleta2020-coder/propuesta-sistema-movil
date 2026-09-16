const { pool } = require('../config/db');

const SELECT_PRODUCTOS = `
  SELECT p.id, p.codigo_barras, p.nombre, p.costo_compra, p.precio_venta,
         p.stock_actual, p.stock_minimo, p.categoria_id, p.proveedor_id,
         c.nombre AS categoria, pr.razon_social AS proveedor
  FROM productos p
  JOIN categorias c ON c.id = p.categoria_id
  JOIN proveedores pr ON pr.id = p.proveedor_id`;

async function listar(req, res) {
  const [rows] = await pool.query(SELECT_PRODUCTOS + ' ORDER BY p.nombre');
  return res.json(rows);
}

async function buscarPorCodigo(req, res) {
  const { codigo } = req.params;
  const [rows] = await pool.query(SELECT_PRODUCTOS + ' WHERE p.codigo_barras = ?', [codigo]);

  if (rows.length === 0) {
    return res.status(404).json({
      error: 'Producto no encontrado',
      codigo_barras: codigo,
      mensaje: 'El código de barras ingresado no está registrado en la base de datos'
    });
  }
  return res.json(rows[0]);
}

async function crear(req, res) {
  const { codigo_barras, nombre, costo_compra, precio_venta, stock_actual, stock_minimo, categoria_id, proveedor_id } = req.body;

  if (!codigo_barras || !nombre || !costo_compra || !precio_venta || !categoria_id || !proveedor_id) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const [result] = await pool.query(
    `INSERT INTO productos (codigo_barras, nombre, costo_compra, precio_venta, stock_actual, stock_minimo, categoria_id, proveedor_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [codigo_barras, nombre, costo_compra, precio_venta, stock_actual ?? 0, stock_minimo ?? 5, categoria_id, proveedor_id]
  );
  return res.status(201).json({ mensaje: 'Producto creado', id: result.insertId });
}

async function actualizar(req, res) {
  const { id } = req.params;
  const { codigo_barras, nombre, costo_compra, precio_venta, stock_actual, stock_minimo, categoria_id, proveedor_id } = req.body;

  const campos = { codigo_barras, nombre, costo_compra, precio_venta, stock_actual, stock_minimo, categoria_id, proveedor_id };
  const claves = Object.keys(campos);
  claves.forEach((k) => { if (campos[k] === undefined) delete campos[k]; });

  if (claves.length === 0) {
    return res.status(400).json({ error: 'No se enviaron campos para actualizar' });
  }

  const asignaciones = claves.map((k) => `${k} = ?`).join(', ');
  const valores = claves.map((k) => campos[k]);

  const [result] = await pool.query(`UPDATE productos SET ${asignaciones} WHERE id = ?`, [...valores, id]);
  if (result.affectedRows === 0) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }
  return res.json({ mensaje: 'Producto actualizado' });
}

async function eliminar(req, res) {
  const { id } = req.params;
  const [result] = await pool.query('DELETE FROM productos WHERE id = ?', [id]);
  if (result.affectedRows === 0) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }
  return res.json({ mensaje: 'Producto eliminado' });
}

module.exports = { listar, buscarPorCodigo, crear, actualizar, eliminar };