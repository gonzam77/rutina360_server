require('dotenv').config();
const { Sequelize } = require('sequelize');

const databaseUrl = process.env.DATABASE_URL;
const dialect = process.env.DB_DIALECT || 'postgres';

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

const dbHost = process.env.DB_HOST || 'localhost';
const defaultSsl = databaseUrl ? !isLocalDatabaseUrl(databaseUrl) : !isLocalHost(dbHost);
const useSsl = parseBoolean(process.env.DB_SSL, defaultSsl);

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

const sequelize = databaseUrl ? new Sequelize(databaseUrl, sequelizeOptions) : new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    ...sequelizeOptions,
    host: dbHost,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
  }
);

module.exports = sequelize;
