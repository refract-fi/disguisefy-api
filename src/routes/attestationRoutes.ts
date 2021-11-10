import Router from 'koa-router';
import moment from 'moment';

import Attestation from '../models/attestation';
import Web3Api from '../lib/web3';

// const web3 = new Web3Api();
const cid = process.env.WEB3_CID;

const attestationRoutes = new Router({
    prefix: '/attestations'
});

// fichier disguise pour linstant

attestationRoutes.post('/generate', async ctx => {
    try {

        let attesation = await Attestation.create({
            name: 'test',
            type: 'uniswap-v3',
            url: Attestation.generateUrl(),
            secret: '123',
            status: 0,
            amount: 10,
            unit: 'eth',
            generation: Number(moment.utc().format('X')),
            confirmation: null,
            expiration: null
        });

        ctx.body = attesation;
    } catch(e) {
        console.log(e);
        ctx.status = 500;
        ctx.body = e;
    }
});

export default attestationRoutes;