import { jest, describe, test, expect } from '@jest/globals';

jest.unstable_mockModule('pg', () => {
  const PoolMock = jest.fn().mockImplementation((opts) => ({
    _opts: opts,
    query: jest.fn(),
    connect: jest.fn(),
  }));
  return { Pool: PoolMock, default: { Pool: PoolMock } };
});

describe('baseDatos.js - Pool configuration', () => {
  test('usa ssl=false cuando DATABASE_URL apunta a 127.0.0.1', async () => {
    const prevUrl = process.env.DATABASE_URL;
    process.env.DATABASE_URL = 'postgresql://u:p@127.0.0.1:5432/db';

    let poolInstance;
    await jest.isolateModulesAsync(async () => {
      const pg = await import('pg');
      pg.Pool.mockClear();
      const bd = await import('../../src/configuracion/baseDatos.js');
      poolInstance = bd.pool;
    });

    expect(poolInstance._opts).toEqual({
      connectionString: 'postgresql://u:p@127.0.0.1:5432/db',
      ssl: false,
    });
    process.env.DATABASE_URL = prevUrl;
  });

  test('usa ssl con rejectUnauthorized=false cuando DATABASE_URL no es localhost', async () => {
    const prevUrl = process.env.DATABASE_URL;
    process.env.DATABASE_URL = 'postgresql://u:p@db.example.com:5432/db';

    let poolInstance;
    await jest.isolateModulesAsync(async () => {
      const bd = await import('../../src/configuracion/baseDatos.js');
      poolInstance = bd.pool;
    });

    expect(poolInstance._opts).toEqual({
      connectionString: 'postgresql://u:p@db.example.com:5432/db',
      ssl: { rejectUnauthorized: false },
    });
    process.env.DATABASE_URL = prevUrl;
  });

  test('usa ssl=false cuando DATABASE_URL apunta a localhost', async () => {
    const prevUrl = process.env.DATABASE_URL;
    process.env.DATABASE_URL = 'postgresql://u:p@localhost:5432/db';

    let poolInstance;
    await jest.isolateModulesAsync(async () => {
      const bd = await import('../../src/configuracion/baseDatos.js');
      poolInstance = bd.pool;
    });

    expect(poolInstance._opts.ssl).toBe(false);
    process.env.DATABASE_URL = prevUrl;
  });
});
