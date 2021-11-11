import * as dotenv from 'dotenv';
dotenv.config();

import { SqlTransportOptions } from 'winston-sql-transport'

export default class WinstonManager {
    constructor() {

    }

    static getWinstonTransport(): SqlTransportOptions {
        return {
            client: 'mysql2',
            connection: {
              host: process.env.DB_HOST,
              port: process.env.DB_PORT,
              user: process.env.DB_USER,
              password: process.env.DB_PASS,
              database: process.env.DB_NAME,
            },
            name: 'WinstonTransportDB',
            tableName: 'Logs',
        };
    }
};