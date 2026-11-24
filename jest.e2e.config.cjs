module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/**/*.e2e-spec.ts'],
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          ...require('./tsconfig.json').compilerOptions,
          module: 'ESNext',
          moduleResolution: 'Bundler',
          rootDir: '.',
        },
      },
    ],
  },
  moduleNameMapper: {
    '^@nestjs/throttler$': '<rootDir>/test/e2e-throttler.module.ts',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  setupFiles: ['<rootDir>/test/e2e-setup.ts'],
  maxWorkers: 1,
};
