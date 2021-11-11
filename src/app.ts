import * as dotenv from 'dotenv';
dotenv.config();

import Koa from 'koa';
import Router from 'koa-router';
import logger from 'koa-logger';
import json from 'koa-json';
import bodyParser from 'koa-bodyparser';
import cors from 'koa-cors';
// import winston from 'winston';
// import { SqlTransport } from 'winston-sql-transport';

import koaApikey from './koaApikey';
import DatabaseManager from './db';
// import WinstonManager from './lib/winstonManager';

import disguiseRoutes from './routes/disguiseRoutes';
// import { ConsoleTransportOptions } from 'winston/lib/winston/transports';
// import attestationRoutes from './routes/disguiseRoutes';

class App {
    private dbManager: DatabaseManager;
    private api: Koa;
    private router: Router;
    // private logger: winston.Logger;

    constructor() {
        this.dbManager = DatabaseManager.getInstance();
        this.api = new Koa();
        this.router = new Router();
        // this.logger = winston.createLogger({
        //     format: winston.format.json(),
        //     transports: [new SqlTransport(WinstonManager.getWinstonTransport())],
        // });
    }

    async start() {
        await this.dbManager.init();
        
        this.api.use(cors({
            origin: '*'
        }));

        this.api.use(json());
        this.api.use(logger());
        this.api.use(bodyParser());
        this.api.use(koaApikey({
                apiKeyServerEnvironmentVariableName: 'REST_API_KEYS',
                unprotectedRoutes: ['/']
            }
        ));

        this.api.use(this.router.routes()).use(this.router.allowedMethods());
        this.api.use(disguiseRoutes.routes()).use(disguiseRoutes.allowedMethods());
        // this.api.use(attestationRoutes.routes()).use(attestationRoutes.allowedMethods());

        // welcome route
        this.router.get('/', async (ctx, next) => {
            ctx.body = {
                status: "Online",
                msg: "We are buidling something cool!      -Disguisefy API."
            };

            await next();
        });

        this.api.listen(process.env.PORT, () => {
            console.log('API started.');
        });
    }
}

const app = new App();
app.start();