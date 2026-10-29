require('./env');
const { Sequelize } = require('sequelize');

function getEnv(name) {
  const value = process.env[name];
  if (value === undefined || value === null) return undefined;

  const trimmedValue = String(value).trim();
  if (!trimmedValue || ['null', 'undefined'].includes(trimmedValue.toLowerCase())) {
    return undefined;
  }

  return trimmedValue;
}

const databaseUrl = getEnv('DATABASE_URL');
const dialect = getEnv('DB_DIALECT') || 'postgres';

function parseBoolean(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  return ['true', '1', 'yes', 'y'].includes(String(value).toLowerCase());
}

function isLocalHost(host) {
  return ['localhost', '127.0.0.1', '::1'].includes(String(host || '').toLowerCase());
}

function isLocalDatabaseUrl(url) {
  try {
    return isLocalHost(new URL(url).hostname);
  } catch (_) {
    return false;
  }
}

function assertValidDatabaseUrl(url) {
  let parsedUrl;

  try {
    parsedUrl = new URL(url);
  } catch (_) {
    throw new Error('DATABASE_URL debe tener formato postgres://usuario:password@host:puerto/base_de_datos');
  }

  if (!['postgres:', 'postgresql:'].includes(parsedUrl.protocol) || !parsedUrl.hostname) {
    throw new Error('DATABASE_URL debe empezar con postgres:// o postgresql:// e incluir un host valido.');
  }
}

const dbHost = getEnv('DB_HOST') || 'localhost';
const defaultSsl = databaseUrl ? !isLocalDatabaseUrl(databaseUrl) : !isLocalHost(dbHost);
const useSsl = parseBoolean(getEnv('DB_SSL'), defaultSsl);

const sequelizeOptions = {
  dialect,
  logging: false,
};

if (useSsl) {
  sequelizeOptions.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  };
}

if (databaseUrl) {
  assertValidDatabaseUrl(databaseUrl);
}

const sequelize = databaseUrl ? new Sequelize(databaseUrl, sequelizeOptions) : new Sequelize(
  getEnv('DB_NAME'),
  getEnv('DB_USER'),
  getEnv('DB_PASSWORD'),
  {
    ...sequelizeOptions,
    host: dbHost,
    port: getEnv('DB_PORT') ? Number(getEnv('DB_PORT')) : undefined,
  }
);

module.exports = sequelize;
