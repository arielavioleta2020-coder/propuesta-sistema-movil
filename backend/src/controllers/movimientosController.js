const { pool } = require('../config/db');

async function crearMovimiento(req, res) {
  const { tipo, bodega_id, usuario_id, items } = req.body;

  if (!['ENTRADA', 'SALIDA'].includes(tipo)) {
    return res.status(400).json({ error: 'El tipo debe ser ENTRADA o SALIDA' });
  }
  if (!bodega_id || !usuario_id || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Faltan campos obligatorios o el detalle está vacío' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [mov] = await conn.query(
      'INSERT INTO movimientos (tipo, bodega_id, usuario_id) VALUES (?, ?, ?)',
      [tipo, bodega_id, usuario_id]
    );

    for (const item of items) {
      const { producto_id, cantidad, costo_unitario } = item;

      const [rows] = await conn.query('SELECT stock_actual FROM productos WHERE id = ? FOR UPDATE', [producto_id]);
      const producto = rows[0];
      if (!producto) {
        throw Object.assign(new Error(`Producto ${producto_id} no existe`), { status: 404 });
      }

      if (tipo === 'SALIDA' && producto.stock_actual < cantidad) {
        throw Object.assign(new Error('Stock insuficiente para la salida'), { status: 400 });
      }

      const nuevoStock = tipo === 'ENTRADA'
        ? producto.stock_actual + cantidad
        : producto.stock_actual - cantidad;

      await conn.query('UPDATE productos SET stock_actual = ? WHERE id = ?', [nuevoStock, producto_id]);
      await conn.query(
        'INSERT INTO detalle_movimiento (movimiento_id, producto_id, cantidad, costo_unitario) VALUES (?, ?, ?, ?)',
        [mov.insertId, producto_id, cantidad, costo_unitario]
      );
    }

    await conn.commit();
    return res.status(201).json({ mensaje: 'Movimiento registrado correctamente', movimiento_id: mov.insertId });
  } catch (err) {
    await conn.rollback();
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Error al registrar el movimiento', detalle: err.message });
  } finally {
    conn.release();
  }
}

module.exports = { crearMovimiento };