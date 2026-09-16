require('dotenv').config();

const app = require('../src/app');
const { pool } = require('../src/config/db');

const PORT = 3998;

async function main() {
  const server = app.listen(PORT, '0.0.0.0', async () => {
    const base = `http://localhost:${PORT}`;
    try {
      const cats = await (await fetch(`${base}/api/categorias`)).json();
      const provs = await (await fetch(`${base}/api/proveedores`)).json();
      const bods = await (await fetch(`${base}/api/bodegas`)).json();
      console.log(`categorias=${cats.length} proveedores=${provs.length} bodegas=${bods.length}`);

      const login = await (await fetch(`${base}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@stockmobile.ec', password: 'Admin123!' })
      })).json();
      const token = login.token;

      // Producto de prueba para el movimiento
      const crear = await fetch(`${base}/api/productos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          codigo_barras: 'TEST-9999', nombre: 'Producto de Prueba', costo_compra: 5,
          precio_venta: 9, stock_actual: 10, stock_minimo: 2, categoria_id: 1, proveedor_id: 1
        })
      });
      const creado = await crear.json();
      console.log(`crear producto -> ${crear.status}, id=${creado.id}`);

      // Entrada de 5
      const mov = await fetch(`${base}/api/movimientos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          tipo: 'ENTRADA', bodega_id: 1, usuario_id: 1,
          items: [{ producto_id: creado.id, cantidad: 5, costo_unitario: 5 }]
        })
      });
      console.log(`movimiento ENTRADA -> ${mov.status}`);

      const esc = await (await fetch(`${base}/api/productos/escaneo/TEST-9999`)).json();
      console.log(`stock tras entrada = ${esc.stock_actual} (esperado 15)`);

      // Salida mayor al stock -> debe fallar 400
      const salidaMala = await fetch(`${base}/api/movimientos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          tipo: 'SALIDA', bodega_id: 1, usuario_id: 1,
          items: [{ producto_id: creado.id, cantidad: 999, costo_unitario: 5 }]
        })
      });
      console.log(`salida con stock insuficiente -> ${salidaMala.status} (esperado 400)`);

      // Limpieza
      await fetch(`${base}/api/productos/${creado.id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
      });
      console.log('producto de prueba eliminado');
    } catch (err) {
      console.error('Error:', err.message);
    } finally {
      server.close();
      await pool.end();
      process.exit(0);
    }
  });
}

main().catch(async (err) => {
  console.error(err);
  await pool.end().catch(() => {});
  process.exit(1);
});