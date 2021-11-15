import Router from 'koa-router';
import moment from 'moment';

import Log from '../models/log';

const logRoutes = new Router({
    prefix: '/logs'
});

// fichier disguise pour linstant

logRoutes.get('/test', async ctx => {
    
});

export default logRoutes;