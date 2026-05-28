import jwt from "jsonwebtoken";

/**
 * Middleware que valida el token JWT enviado en el encabezado Authorization.
 * Si el token es valido, adjunta el payload decodificado en `req.usuario` y
 * llama a `next()`. De lo contrario responde con HTTP 401.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {void}
 */
export const validarToken = (req, res, next) => {
  try {
    const token = req.headers["authorization"];

    if (!token) {
      return res.status(401).json({ mensaje: "Token requerido" });
    }

    const tokenLimpio = token.split(" ")[1];

    const decoded = jwt.verify(tokenLimpio, process.env.JWT_SECRET);

    req.usuario = decoded;

    next();
  } catch {
    return res.status(401).json({ mensaje: "Token inválido" });
  }
};