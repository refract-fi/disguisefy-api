import Router from 'koa-router';
import Disguise, { DisguiseOptions } from '../models/disguise';
import DisguiseCache from '../models/disguiseCache';
import ZapperApi from '../lib/zapperfi';

const disguiseRoutes = new Router({
    prefix: '/disguises'
});

disguiseRoutes.get('/:id/balances', async ctx => {
    try {
        let balances;
        let disguise = await Disguise.findByPk(ctx.params.id);

        if(disguise && disguise.isValid()) {
            balances = await ZapperApi.getBalances(disguise, false);
        } else {
            ctx.throw(404, `No disguise found.`)
        }

        ctx.body = balances;
    } catch(e) {
        ctx.status = 404;
        ctx.body = e;
    } 
});

disguiseRoutes.get('/url/:url/balances', async ctx => {
    try {
        let balances: any; // find more TS compliant solution
        let disguise: Disguise | null = await Disguise.findOne({
            where: {
                url: ctx.params.url
            }
        });

        if(disguise && disguise.isValid()) {
            if(disguise?.isCacheValid()) {
                balances = disguise.cache;
            } else {
                balances = await ZapperApi.getBalances(disguise, true);
            }

            balances.disguise = disguise.filter();
        } else {
            console.log('error');
            ctx.throw(404, `No disguise found.`)
        }

        ctx.body = balances;
    } catch(e: any) {
        ctx.status = e.response.status;
        ctx.body = e;
    } 
});

disguiseRoutes.get('/url/:url/balances/staking', async ctx => {
    try {
        let stakingBalance;
        let disguise = await Disguise.findOne({
            where: {
                url: ctx.params.url
            }
        });

        if(disguise && disguise.isValid()) {
            stakingBalance = await ZapperApi.getStakingBalances(disguise);
        } else {
            ctx.throw(404, `No disguise found.`)
        }

        ctx.body = stakingBalance;
    } catch(e) {
        ctx.status = 404;
        ctx.body = e;
    } 
});

disguiseRoutes.get('/:id/supportedProtocols', async ctx => {
    try {
        let supportedProtocols;
        let disguise = await Disguise.findByPk(ctx.params.id);

        if(disguise && disguise.isValid()) {
            supportedProtocols = await ZapperApi.getSupportedProtocols(disguise);
        } else {
            ctx.throw(404, `No disguise found.`)
        }

        ctx.body = supportedProtocols;
    } catch(e) {
        ctx.status = 404;
        ctx.body = e;
    } 
});

disguiseRoutes.get('/url/:url/supportedProtocols', async ctx => {
    try {
        let supportedProtocols;
        let disguise = await Disguise.findOne({
            where: {
                url: ctx.params.url
            }
        });

        if(disguise && disguise.isValid()) {
            supportedProtocols = await ZapperApi.getSupportedProtocols(disguise);
        } else {
            ctx.throw(404, `No disguise found.`)
        }

        ctx.body = supportedProtocols;
    } catch(e) {
        ctx.status = 404;
        ctx.body = e;
    } 
});

disguiseRoutes.post('/generate', async ctx => {
    try {
        let body = ctx.request.body;
        let address = String(body.address).toLowerCase();

        let options: DisguiseOptions = {
            isGroupAssetUnder: Boolean(body.isAssetGroupActive) || false,
            groupAssetsUnder: Number(body.groupAssetsUnder) || 0.1,
            ignoreNFTs: Boolean(body.ignoreNFTs) || false
        }

        let disguise = await Disguise.generate(address, body.name, body.duration, body.preset, options, true)
        ctx.body = disguise;
    } catch(e) {
        ctx.status = 500;
        ctx.body = e;
    }
});

disguiseRoutes.get('/all', async ctx => {
    let disguises = await Disguise.findAll();
    ctx.body = disguises;
});

disguiseRoutes.get('/:id', async ctx => {
    try {
        let disguise: Disguise | null = await Disguise.findByPk(ctx.params.id);

        if(!disguise || !disguise.isValid()) {
            ctx.throw(404, `No disguise found for ${ctx.params.id}`);
        }

        ctx.body = disguise;
    } catch(e) {
        ctx.status = 404;
        ctx.body = e;
    }
});

// working on sequelize association: SequelizeEagerLoadingError
disguiseRoutes.get('/:id/cache', async ctx => {
    try {
        let disguise = await Disguise.findByPk(ctx.params.id, {
            include: [{
                model: DisguiseCache, required: false
            }]
        });
        if(!disguise || !disguise.isValid()) {
            ctx.throw(404, `No disguise found for ${ctx.params.id}`);
        }

        ctx.body = disguise;
    } catch(e) {
        ctx.status = 404;
        ctx.body = e;
    }
});

disguiseRoutes.post('/', async ctx => {
    let body = ctx.request.body;
    try {
        let disguise = await Disguise.create(body);
        ctx.body = disguise;
    } catch(e) {
        console.log(e);
        ctx.throw(500, `Could not create disguise.`);
    }
});

export default disguiseRoutes;