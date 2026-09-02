export default {
  testEnvironment: 'node',
  testMatch: ['**/*.test.mjs'],
  transform: {},
  collectCoverageFrom: [
    'src/**/*.mjs',
    '!src/cloud.mjs',
    '!src/server.mjs',
  ],
  coveragePathIgnorePatterns: ['/node_modules/', '/Software Engineering & AI Tooling/'],
};
