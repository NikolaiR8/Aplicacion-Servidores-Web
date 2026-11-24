const requiredEnvironment = [
  'E2E_DB_HOST',
  'E2E_DB_PORT',
  'E2E_DB_NAME',
  'E2E_DB_USER',
  'E2E_DB_PASSWORD',
];

for (const key of requiredEnvironment) {
  if (process.env[key] === undefined) {
    throw new Error(
      `Missing ${key}. E2E tests require an explicitly configured test database.`,
    );
  }
}

const databaseName = process.env.E2E_DB_NAME!;
if (!/_test$/i.test(databaseName)) {
  throw new Error(
    'E2E_DB_NAME must end with "_test"; refusing to run against a non-test database.',
  );
}

process.env.NODE_ENV = 'test';
process.env.DB_HOST = process.env.E2E_DB_HOST;
process.env.DB_PORT = process.env.E2E_DB_PORT;
process.env.DB_NAME = databaseName;
process.env.DB_USER = process.env.E2E_DB_USER;
process.env.DB_PASSWORD = process.env.E2E_DB_PASSWORD;
process.env.JWT_SECRET = 'e2e-only-secret-never-use-outside-tests';
process.env.JWT_EXPIRES_IN = '15m';
process.env.CORS_ORIGINS = 'http://localhost:5173';
