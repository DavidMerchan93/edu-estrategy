const router = require('express').Router();
const { validarLogin, postLogin } = require('../controllers/auth.controller');

router.post('/login', validarLogin, postLogin);

module.exports = router;
