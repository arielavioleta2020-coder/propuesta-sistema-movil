require('dotenv').config();

const app = require('../src/app');
const { pool } = require('../src/config/db');

const PORT = 3999;

async function main() {
  await pool.query('USE stockmobile_db');

  const server = app.listen(PORT, '0.0.0.0', async () => {
    console.log(`Servidor de prueba en http://localhost:${PORT}`);
    try {
      const accesos = ['localhost', '127.0.0.1'];
      for (const h of accesos) {
        const base = `http://${h}:${PORT}`;
        const r1 = await fetch(`${base}/api/productos`);
        const productos = await r1.json();
        console.log(`GET /api/productos (${h}) -> ${r1.status}, ${productos.length} productos`);

        const r2 = await fetch(`${base}/api/productos/escaneo/779123456789`);
        const esc = await r2.json();
        console.log(`GET /api/productos/escaneo/779123456789 (${h}) -> ${r2.status}, ${esc.nombre}, stock=${esc.stock_actual}`);

        const r3 = await fetch(`${base}/api/productos/escaneo/12345`);
        console.log(`GET /api/productos/escaneo/12345 (${h}) -> ${r3.status}`);

        const r4 = await fetch(`${base}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'admin@stockmobile.ec', password: 'Admin123!' })
        });
        const login = await r4.json();
        console.log(`POST /api/auth/login (${h}) -> ${r4.status}, token=${!!login.token}, rol=${login.usuario?.rol}`);
      }
    } catch (err) {
      console.error('Error en la prueba E2E:', err.message);
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