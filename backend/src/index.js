require('dotenv').config();
const app = require('./app');
const pool = require('./db/pool');

const PORT = process.env.PORT || 4000;

pool.connect()
  .then((client) => {
    client.release();
    console.log('Base de datos conectada');
    app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
  })
  .catch((err) => {
    console.error('Error al conectar la base de datos:', err.message);
    process.exit(1);
  });
