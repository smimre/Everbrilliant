import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js','json','ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.module.ts',
    '!**/main.ts',
    '!**/__mocks__/**',
    '!**/node_modules/**',
  ],
  coverageDirectory: '../coverage',
  coverageReporters: ['text','lcov','html'],
  coverageThresholds: {
    global: { branches: 70, functions: 80, lines: 80, statements: 80 },
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterFramework: [],
  globals: {
    'ts-jest': { tsconfig: '<rootDir>/../tsconfig.json' },
  },
};

export default config;
