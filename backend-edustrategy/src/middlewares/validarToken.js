import jwt from "jsonwebtoken";

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