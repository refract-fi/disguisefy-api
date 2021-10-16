import axios from 'axios';
import { URLSearchParams } from 'url';
import Disguise from '../models/disguise';
import Preset from '../models/preset';
import IAddressProtocol from './interfaces/addressProtocol';
import IStakingAsset from './interfaces/stakingAsset';
import IAsset from './interfaces/asset';
import IToken from './interfaces/token';
import AddressBalances from '../models/addressBalances';

import {
    AssetCategories,
    getEmptyBalances,
    getEmptyAssets,
    getAssetCategories,
    addAsset
} from './helpers';

class ZapperApi {
    private static apiKey?: string = process.env.ZAPPERFI_API_KEY;
    private static apiUrl: string = `https://api.zapper.fi/v1`;
    // private static apiUrl: string = `http://localhost:3408`;

    constructor() {

    }

    static async getSupportedProtocols(disguise: Disguise) {
        let params = new URLSearchParams();
        params.append('addresses[]', disguise.address);
        params.append('api_key', ZapperApi.apiKey || '');
        const url = `${ZapperApi.apiUrl}/protocols/balances/supported?` + params.toString(); 
        // const url = `${ZapperApi.apiUrl}/users/408?` + params.toString(); 

        try {
            let response = await axios.get(url);
            let networks = response.data;
            let uniqueProtocols = new Set();

            for(let network of networks) {
                for(let app of network.apps) {
                    uniqueProtocols.add(app.appId);
                }
            }

            return Array.from(uniqueProtocols);
        } catch(e) {
            throw e
        }
    }

    static async getBalances(disguise: Disguise, saveCache: boolean = false): Promise<AddressBalances> {
        let balances = getEmptyBalances();
        let assets = getEmptyAssets();

        try {

            let uniqueProtocols: any = await ZapperApi.getSupportedProtocols(disguise); // TODO: how to handle returned type Promise<string[]> doesn't work
            let promises = ZapperApi.balancePromiseGenerator(disguise, uniqueProtocols);
            let responses = await Promise.all(promises);

            for(let response of responses) {
                let protocolBalances = response.data;
                let addressesProtocol: IAddressProtocol[] = Object.values(protocolBalances);

                for(let addressProtocol of addressesProtocol) {
                    for(let product of addressProtocol.products) {
                        for(let asset of product.assets) {
                            if(!asset.category) {
                                if(asset.location && asset.location.type) {
                                    asset.category = asset.location.type; // put the location type in category (some edge cases)
                                } else if(asset.type) {
                                    asset.category = asset.type;
                                }
                            }
                            
                            if(asset.category == 'staked' || asset.category == 'farm') { 
                                // https://github.com/disguisefy/disguisefy-api/projects/1#card-68794734
                                asset.category = 'staking';  
                            }

                            if(asset.category == 'pool' && asset.location && (asset.location.type == 'staked' || asset.location.type == 'staking')) {
                                // do not add this is pool as we will likely receive it from staking-balances
                            } else {
                                let assetCategory: AssetCategories = getAssetCategories(asset.category);
                                if(asset.hide) {
                                    // do nothing
                                } else {
                                    addAsset(assets, assetCategory, asset, balances);
                                }
                            }
                        }
                    }
                }
            }

            let addressBalances = new AddressBalances(balances, assets, disguise.options);
            let preset = new Preset(disguise.preset);
            preset.filter(addressBalances);

            // do not wait for cache creation when regenerating while viewing
            if(saveCache) {
                Disguise.saveCache(disguise, addressBalances);
            }

            return addressBalances;
        } catch(e) {
            console.log(`[zapperFi.getBalances]: ${e}`);
            throw e;
        }
    }

    private static balancePromiseGenerator(disguise: Disguise, protocols: any) { // find TS compliant solutions to interface protocols
        let promises = [];
        let params = new URLSearchParams();
        params.append('addresses[]', disguise.address);
        params.append('api_key', ZapperApi.apiKey || '');

        for(let protocol of protocols) {
            // Zapper allows to be network agnostic: maybe false and defaults to Ethereum?
            let url = `${ZapperApi.apiUrl}/protocols/${protocol}/balances?` + params.toString();
            promises.push(axios.get(url));
        }

        return promises;
    }
}

export default ZapperApi;