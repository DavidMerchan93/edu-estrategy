function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor.';
  console.error(`[${status}] ${message}`);
  return res.status(status).json({ error: message });
}

module.exports = errorHandler;
