import { jest, describe, test, expect, beforeEach } from '@jest/globals';

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: { verify: jest.fn(), sign: jest.fn() },
  verify: jest.fn(),
  sign: jest.fn(),
}));

const { default: jwt } = await import('jsonwebtoken');
const { validarToken } = await import('../../src/middlewares/validarToken.js');

const buildReq = (authorization) => ({ headers: { authorization } });
const buildRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
});

describe('validarToken middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('responde 401 "Token requerido" cuando no llega el header Authorization', () => {
    const req = buildReq(undefined);
    const res = buildRes();
    const next = jest.fn();

    validarToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'Token requerido' });
    expect(next).not.toHaveBeenCalled();
  });

  test('extrae la parte del token despues de "Bearer" y verifica con JWT_SECRET', () => {
    const decoded = { id_estudiante: 7, rol: 'estudiante' };
    jwt.verify.mockReturnValue(decoded);

    const req = buildReq('Bearer abc.def.ghi');
    const res = buildRes();
    const next = jest.fn();

    validarToken(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('abc.def.ghi', process.env.JWT_SECRET);
    expect(req.usuario).toEqual(decoded);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test('responde 401 "Token inválido" cuando jwt.verify lanza una excepcion', () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('jwt malformed');
    });

    const req = buildReq('Bearer token-malo');
    const res = buildRes();
    const next = jest.fn();

    validarToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'Token inválido' });
    expect(next).not.toHaveBeenCalled();
  });

  test('responde 401 "Token inválido" cuando el header no contiene la palabra Bearer', () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('jwt must be provided');
    });

    const req = buildReq('TokenSinPrefijo');
    const res = buildRes();
    const next = jest.fn();

    validarToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ mensaje: 'Token inválido' });
    expect(next).not.toHaveBeenCalled();
  });
});
