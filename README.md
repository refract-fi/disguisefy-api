# disguisefy-api

You need access to a MySQL database running on port 3306, either locally or on a server for the project to run.

Your .env file should be placed in the root folder and contain the following:

```
PORT=3001
DB_HOST=******
DB_HOST=******
DB_USER=******
DB_PASS=******
DB_PORT=******

ZAPPERFI_API_KEY=******
REST_API_KEYS="******,******"
```

Given you have node, TS, yarn and nodemon installed, you can start developing with ```nodemon src/app.ts```.

A valid ```REST_API_KEY``` must be provided in either ```headers['x-apikey'], headers['x-api-key'], headers['apikey'], query['api-key'] or query['apikey']```.

# Migrations & Database Setup

You need to install the sequelize-cli in order to properly setup the database:

```
yarn add sequelize-cli
```

To run migrations you will need to create migrations/config/config.json with the following format:

```
{
  "development": {
    "username": "******",
    "password": "******",
    "database": "******",
    "host": "******",
    "port": "3306",
    "dialect": "mysql",
    "define": {
      "timestamps": false
    }
  },
  "test": {
    "username": "******",
    "password": "******",
    "database": "******",
    "host": "******",
    "port": "3306",
    "dialect": "mysql",
    "define": {
      "timestamps": false
    }
  },
  "production": {
    "username": "******",
    "password": "******",
    "database": "******",
    "host": "******",
    "port": "3306",
    "dialect": "mysql",
    "define": {
      "timestamps": false
    }
  }
}
```

and then run:
```
npx sequelize-cli db:migrate
```

optionally, you can seed the databse with the following:
```
npx sequelize-cli db:seed:all
```
