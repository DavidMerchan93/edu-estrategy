/**
 * @type {import('jest').Config}
 */
export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['<rootDir>/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/configuracion/swagger.js',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/',
  ],
  coverageThreshold: {
    global: {
      lines: 85,
      branches: 85,
      functions: 85,
      statements: 85,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
  setupFiles: ['<rootDir>/__tests__/setup.js'],
  clearMocks: true,
  verbose: false,
};
