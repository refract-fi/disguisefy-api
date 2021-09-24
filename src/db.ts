import * as dotenv from 'dotenv';
dotenv.config();

import { Sequelize } from 'sequelize';

class DatabaseManager {
    host: string;
    name: string;
    user: string;
    pass: string;
    port: string;
    dialect: string;
    private static instance: DatabaseManager;
    private db: any; // TODO: check how to define a sequelize connection as a proper type

    private constructor() {
        this.host = process.env.DB_HOST!;
        this.name = process.env.DB_NAME!;
        this.user = process.env.DB_USER!;
        this.pass = process.env.DB_PASS!;
        this.port = process.env.DB_PORT!;
        this.dialect = 'mysql';
        this.db = new Sequelize(this.name, this.user, this.pass, {
            host: this.host,
            port: parseInt(this.port),
            dialect: 'mysql',
            logging: false
        });
    }

    public static getInstance(): DatabaseManager {
        if(!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }

        return DatabaseManager.instance;
    }

    public getSequelize(): any {
        return this.db;
    }

    async init() {
        try {
            await this.db.authenticate();
            console.log('Database connection successful.');
        } catch(e) {
            console.log(e);
            console.log('Could not connect to database.');
        }
    }
}

export default DatabaseManager;
 