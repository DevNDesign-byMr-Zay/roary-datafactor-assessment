export default {
  testEnvironment: 'node',
  testMatch: ['**/*.test.mjs'],
  transform: {},
  collectCoverageFrom: ['src/**/*.mjs'],
  coveragePathIgnorePatterns: ['/node_modules/', '/Software Engineering & AI Tooling/'],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
};
