/* eslint-disable */
export default {
  displayName: 'importer-e2e',
  preset: '../..//jest.preset.js',
  globals: {},
  setupFiles: ['<rootDir>/src/test-setup.ts'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'html', 'node'],
  coverageDirectory: '../..//coverage/importer-e2e',
};
