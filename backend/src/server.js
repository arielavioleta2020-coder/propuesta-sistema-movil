require('dotenv').config();

const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = Number(process.env.PORT) || 3000;

async function iniciar() {
  try {
    await testConnection();
    console.log('✅ Conexión a MySQL (stockmobile_db) establecida');
  } catch (err) {
    console.error('❌ No se pudo conectar a MySQL:', err.message);
    console.error('   Verifique que XAMPP/MySQL esté activo y que la base de datos exista.');
    process.exit(1);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Servidor StockMobile activo en http://localhost:${PORT}`);
    console.log(`   API accesible desde la red local: http://192.168.1.4:${PORT}/api/productos`);
  });
}

iniciar();