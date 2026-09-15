export default {
  testEnvironment: 'node',
  testMatch: ['**/*.test.mjs'],
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
