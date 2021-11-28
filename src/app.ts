import * as dotenv from 'dotenv';
dotenv.config();

const path = require('path');

import Koa from 'koa';
import Router from 'koa-router';
import logger from 'koa-logger';
import json from 'koa-json';
import bodyParser from 'koa-bodyparser';
import cors from 'koa-cors';

import koaApikey from './koaApikey';
import DatabaseManager from './db';
import CronManager from './cronManager';
import { Logger } from './models/log';

import disguiseRoutes from './routes/disguiseRoutes';
import logRoutes from './routes/logRoutes';

class App {
    private dbManager: DatabaseManager;
    private api: Koa;
    private router: Router;
    private cronManager: CronManager;

    constructor() {
        this.dbManager = DatabaseManager.getInstance();
        this.api = new Koa();
        this.router = new Router();
        this.cronManager = new CronManager();
    }

    async start() {
        await this.dbManager.init();
        this.cronManager.run('3 * * * * * ', 'gasPriceUpdater');
        
        this.api.use(cors({
            origin: '*'
        }));

        this.api.use(json());
        this.api.use(logger((str, args) => {
            Logger.handleRequest(str, args);
        }));

        this.api.use(bodyParser());
        this.api.use(koaApikey({
                apiKeyServerEnvironmentVariableName: 'REST_API_KEYS',
                unprotectedRoutes: ['/']
            }
        ));

        this.api.use(this.router.routes()).use(this.router.allowedMethods());
        this.api.use(disguiseRoutes.routes()).use(disguiseRoutes.allowedMethods());
        this.api.use(logRoutes.routes()).use(logRoutes.allowedMethods());
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