const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const productoRoutes = require('./routes/productos');
const movimientoRoutes = require('./routes/movimientos');
const catalogoRoutes = require('./routes/catalogo');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    sistema: 'StockMobile API',
    version: '1.0.0',
    endpoints: ['/api/auth/login', '/api/productos', '/api/productos/escaneo/:codigo', '/api/movimientos'],
    estado: 'En ejecución'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/movimientos', movimientoRoutes);
app.use('/api', catalogoRoutes);

// Manejo de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

// Manejo de errores global
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[StockMobile] Error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' });
});

module.exports = app;