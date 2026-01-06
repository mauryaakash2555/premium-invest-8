const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['<rootDir>/tests/**/*.(test|spec).(js|jsx)'],
  modulePathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/out/'],
  watchPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/out/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};

module.exports = createJestConfig(customJestConfig);
