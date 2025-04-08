module.exports = {
    testEnvironment: 'node', // Use Node.js environment for backend tests
    setupFiles: ['dotenv/config'], // Load environment variables from .env.test
    moduleNameMapper: {
      '^firebase-admin$': '<rootDir>/backend/test/__mocks__/firebase-admin.js', // Mock Firebase Admin SDK
    },
    roots: ['<rootDir>/backend/test'], // Specify the root directory for tests
  };