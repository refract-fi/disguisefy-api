import { Web3Storage, File } from 'web3.storage';
import got from 'got';
import { isJSON } from './helpers';

import AppSettings from '../models/appSettings';
import Disguise from '../models/disguise';

class Web3Api {
    private token: string = process.env.WEB3_TOKEN || '';
    private cid: string = process.env.WEB3_CID|| '';
    private client: Web3Storage;

    constructor() {
        this.client = new Web3Storage({ token: this.token });
    }

    toFile(obj: object, name: string) {
        const buffer = Buffer.from(JSON.stringify(obj));
        return [new File([buffer], name)];
    }

    // use the url as the filename
    async store(obj: object, name: string) {
        const files = this.toFile(obj, name);
        const cid = await this.client.put(files)
        return cid;
    }

    async listFiles(cid: string = '') {
        const refCID = await AppSettings.getCID();
        const res = await this.client.get(refCID);
        const files = await res?.files();

        if(files && files.length > 0) {
            for(const file of files) {
                console.log(file);
            }
        } else {
            console.log(`cid contains no files.`);
        }
    }

    async addRecord(disguise: Disguise) {
        try {
            let disguiseData: any = disguise.toJSON();
            Disguise.prepareIPFS(disguiseData);
            let disguiseCID = await this.store(disguiseData, disguiseData.url);
            let refLink = await AppSettings.getCID();
            let refCidResponse = await got(`https://${refLink}.ipfs.dweb.link/ref`);
            let refCidBody = refCidResponse.body;
            let refCid: any;
            
            if(isJSON(refCidBody)) {
                refCid = JSON.parse(refCidBody);
            } else {
                throw new Error("RefCid is not a valid JSON.");
            }

            // add new record to big json object
            refCid[disguiseData.url] = {
                expiration: disguiseData.expiration,
                cid: disguiseCID
            };

            // save updated CID references list and store new link to DB
            let updatedRefCid = await this.store(refCid, 'ref');
            await AppSettings.update(
                { value: `${updatedRefCid}` },
                { where: { name: 'ref_cid' } 
            });
            
            return true;
        } catch(e) {
            console.log(e);
            return false;
        }
    }

    async findRecord(url: string) {
        let refLink = await AppSettings.getCID();
        let refCidResponse = await got(`https://${refLink}.ipfs.dweb.link/ref`);
        let refCidBody = refCidResponse.body;
        let refCid: any;
        let disguise: Disguise;
        let found = false;
        
        if(isJSON(refCidBody)) {
            refCid = JSON.parse(refCidBody);
        } else {
            throw new Error("RefCid is not a valid JSON.");
        }

        for(let ipfsUrl of Object.keys(refCid)) {
            if(ipfsUrl == url) {
                found = true;
                let foundDisguise = refCid[ipfsUrl];
                let ipfsDisguiseUrl = `https://${refCid[ipfsUrl].cid}.ipfs.dweb.link/${ipfsUrl}`;
                let ipfsDisguiseResponse = await got(ipfsDisguiseUrl);
                let ipfsDisguisebody = ipfsDisguiseResponse.body;
                let ipfsDisguise;

                if(isJSON(ipfsDisguisebody)) {
                    ipfsDisguise = JSON.parse(ipfsDisguisebody);
                } else {
                    throw new Error(`Disguise at ${ipfsDisguiseUrl} is not a valid JSON.`);
                }

                disguise = Disguise.build({
                    address: '',
                    url: ipfsDisguise.url,
                    name: ipfsDisguise.name,
                    generation: ipfsDisguise.generation,
                    expiration: ipfsDisguise.expiration,
                    preset: ipfsDisguise.preset,
                    version: ipfsDisguise.version,
                    provider: ipfsDisguise.provider,
                    status: ipfsDisguise.status,
                    cache: ipfsDisguise.cache,
                    options: ipfsDisguise.options,
                    cacheExpiration: null,
                    cacheGeneration: null,
                    password: null
                });

                return disguise.isValid() ? disguise : null;
            }
        }
    }
}

export default Web3Api;