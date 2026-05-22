import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { pool } from './src/configuracion/baseDatos.js';

dotenv.config();

const cifrarCredenciales = async () => {
  try {
    const resultado = await pool.query(
      `SELECT id_credencial, email, password_hash
       FROM credencial`
    );

    for (const usuario of resultado.rows) {
      const passwordActual = usuario.password_hash;

      // Si ya está cifrada con bcrypt, no la toca
      if (passwordActual.startsWith('$2b$') || passwordActual.startsWith('$2a$')) {
        console.log(`Ya estaba cifrada: ${usuario.email}`);
        continue;
      }

      const passwordCifrada = await bcrypt.hash(passwordActual, 10);

      await pool.query(
        `UPDATE credencial
         SET password_hash = $1
         WHERE id_credencial = $2`,
        [passwordCifrada, usuario.id_credencial]
      );

      console.log(`Contraseña cifrada para: ${usuario.email}`);
    }

    console.log('Proceso finalizado correctamente.');
    process.exit(0);
  } catch (error) {
    console.error('Error al cifrar credenciales:', error.message);
    process.exit(1);
  }
};

cifrarCredenciales();