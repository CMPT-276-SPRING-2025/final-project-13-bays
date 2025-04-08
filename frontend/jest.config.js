export default {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|scss|sass|less)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom', './jest.setup.js'], // Add jest.setup.js
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
};