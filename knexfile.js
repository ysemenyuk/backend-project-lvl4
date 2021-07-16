// @ts-check

const path = require('path');

const migrations = {
  directory: path.join(__dirname, 'server', 'migrations'),
};

module.exports = {
  test: {
    client: 'sqlite3',
    connection: ':memory:',
    useNullAsDefault: true,
    migrations,
  },
  development: {
    client: 'pg',
    connection: {
      user: 'root',
      password: 'root',
      database: 'tasks_db',
      host: 'localhost',
      port: '5432',
    },
    useNullAsDefault: true,
    migrations,
  },
  // development: {
  //   client: 'sqlite3',
  //   connection: {
  //     filename: './database.sqlite',
  //   },
  //   useNullAsDefault: true,
  //   migrations,
  // },
  production: {
    client: 'sqlite3',
    connection: {
      filename: './database.sqlite',
    },
    useNullAsDefault: true,
    migrations,
  },
};
