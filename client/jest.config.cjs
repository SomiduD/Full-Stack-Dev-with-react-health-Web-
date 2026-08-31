// client/jest.config.cjs
module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  transform: {},
  testMatch: ['**/__tests__/**/*.test.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/src/__tests__/__mocks__/styleMock.js',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/src/__tests__/__mocks__/fileMock.js',
  },
};
