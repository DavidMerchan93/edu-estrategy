const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  findCredencialByEmail,
  incrementarIntentosLogin,
  resetearIntentosLogin,
} = require('../queries/auth.queries');

function derivarIniciales(nombreCompleto) {
  const partes = (nombreCompleto || '').trim().split(/\s+/);
  return partes.slice(0, 2).map((p) => p[0].toUpperCase()).join('') || '?';
}

async function login(email, password) {
  const fila = await findCredencialByEmail(email);

  if (!fila) {
    throw { status: 401, message: 'Correo o contraseña incorrectos.' };
  }
  if (fila.bloqueado) {
    throw { status: 403, message: 'Cuenta bloqueada. Contacte al administrador.' };
  }

  const coincide = await bcrypt.compare(password, fila.password_hash);
  if (!coincide) {
    await incrementarIntentosLogin(fila.id_credencial);
    throw { status: 401, message: 'Correo o contraseña incorrectos.' };
  }

  await resetearIntentosLogin(fila.id_credencial);

  const payload = {
    idCredencial: fila.id_credencial,
    idEstudiante: fila.id_estudiante,
    idSemestre: fila.id_semestre,
    rol: fila.rol,
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });

  return {
    token,
    usuario: {
      id: fila.id_estudiante,
      nombre: fila.nombre_completo,
      iniciales: derivarIniciales(fila.nombre_completo),
      correo: fila.email,
      carrera: fila.carrera,
      semestre: fila.semestre_actual,
      semestreActivo: fila.semestre_nombre || 'Sin semestre',
    },
  };
}

module.exports = { login };
