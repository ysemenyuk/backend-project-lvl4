// @ts-check

const path = require('path');

const migrations = {
  directory: path.join(__dirname, 'server', 'migrations'),
};

module.exports = {
  development: {
    client: process.env.DEV_DB_TYPE,
    connection: {
      user: process.env.DEV_DB_USER,
      password: process.env.DEV_DB_PASSWORD,
      database: process.env.DEV_DB_NAME,
      host: process.env.DEV_DB_HOST,
      port: process.env.DEV_DB_PORT,
    },
    useNullAsDefault: true,
    migrations,
  },
  test: {
    client: 'sqlite3',
    connection: ':memory:',
    useNullAsDefault: true,
    migrations,
  },
  production: {
    client: 'sqlite3',
    connection: {
      filename: './database.sqlite',
    },
    useNullAsDefault: true,
    migrations,
  },
};
