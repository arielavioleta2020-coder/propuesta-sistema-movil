require('dotenv').config();

const { test, before, after } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');

const app = require('../src/app');
const { pool } = require('../src/config/db');

before(async () => {
  await pool.query('USE stockmobile_db');
});

after(async () => {
  await pool.end();
});

test('GET /api/productos devuelve el catálogo con JOIN a categorías', async () => {
  const res = await request(app).get('/api/productos');

  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(res.body), 'La respuesta debe ser un arreglo');
  assert.ok(res.body.length >= 1, 'Debe existir al menos un producto');

  const mouse = res.body.find((p) => p.codigo_barras === '779123456789');
  assert.ok(mouse, 'El producto Mouse Inalámbrico debe estar presente');
  assert.strictEqual(mouse.categoria, 'Electrónica');
  assert.strictEqual(mouse.nombre, 'Mouse Inalámbrico Logitech');
});

test('GET /api/productos/escaneo/:codigo devuelve el producto por código de barras', async () => {
  const res = await request(app).get('/api/productos/escaneo/779123456789');

  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.codigo_barras, '779123456789');
  assert.strictEqual(res.body.nombre, 'Mouse Inalámbrico Logitech');
  assert.strictEqual(res.body.stock_actual, 20);
});

test('GET /api/productos/escaneo/:codigo responde 404 para un código inexistente', async () => {
  const res = await request(app).get('/api/productos/escaneo/12345');

  assert.strictEqual(res.status, 404);
  assert.strictEqual(res.body.error, 'Producto no encontrado');
});

test('POST /api/auth/login devuelve token con credenciales válidas (RBAC)', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@stockmobile.ec', password: 'Admin123!' });

  assert.strictEqual(res.status, 200);
  assert.ok(res.body.token, 'Debe devolver un token JWT');
  assert.strictEqual(res.body.usuario.rol, 'Administrador');
});

test('POST /api/auth/login responde 401 con credenciales inválidas', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@stockmobile.ec', password: 'incorrecta' });

  assert.strictEqual(res.status, 401);
  assert.strictEqual(res.body.error, 'Credenciales incorrectas');
});

test('Endpoints CRUD de productos exigen token JWT (protección)', async () => {
  const res = await request(app).post('/api/productos').send({});

  assert.strictEqual(res.status, 401);
  assert.strictEqual(res.body.error, 'Token no proporcionado');
});