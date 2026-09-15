export default {
  testEnvironment: 'node',
  testMatch: ['**/*.test.mjs'],
  testPathIgnorePatterns: [
    '/tests/holographic/display-session-integration.test.mjs$',
    '/tests/holographic/surface-session.test.mjs$',
    '/tests/holographic/interaction.test.mjs$',
    '/tests/holographic/surface-dispatch.test.mjs$',
    '/tests/holographic/public-surface-dispatch.test.mjs$',
    '/tests/holographic/interaction-session.integration.test.mjs$',
    '/tests/holographic/public-api.integration.test.mjs$',
  ],
  transform: {},
  collectCoverageFrom: [
    'src/**/*.mjs',
    'Software Engineering & AI Tooling/Authentication & Security/Token Authentication Regression/06 FINAL CORRECTED CODE/auth_middleware.mjs',
    'Software Engineering & AI Tooling/API Foundations/Express Gemini Backend Foundation/06 FINAL CORRECTED CODE/cors_policy.mjs',
    'Software Engineering & AI Tooling/Storage & File Services/Signed URL File Access/06 FINAL CORRECTED CODE/sign_route.mjs',
  ],
  coveragePathIgnorePatterns: ['/node_modules/'],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
};
