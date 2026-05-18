const { body, validationResult } = require('express-validator');
const { login } = require('../services/auth.service');

const validarLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 1 }),
];

async function postLogin(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Datos inválidos.', detalles: errors.array() });
  }
  try {
    const { email, password } = req.body;
    const resultado = await login(email, password);
    return res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
}

module.exports = { validarLogin, postLogin };
