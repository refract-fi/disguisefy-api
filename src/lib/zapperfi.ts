import axios from 'axios';
import { URLSearchParams } from 'url';
import Disguise from '../models/disguise';
import Preset from '../models/preset';
import IAddressProtocol from './interfaces/addressProtocol';
import IAddressList from './interfaces/addressList';
import AddressBalances from '../models/addressBalances';
import * as url from "url";

import {
    AssetCategories,
    getEmptyBalances,
    getEmptyAssets,
    getAssetCategories,
    addAsset,
    extractGas
} from './helpers';
import Price from '../models/price';

const ALL_CHAINS = 'all';

class ZapperApi {
    private static apiKey?: string = process.env.ZAPPERFI_API_KEY;
    private static apiUrl: string = `https://api.zapper.fi/v1`;
    // private static apiUrl: string = `http://localhost:3408`;

    constructor() {

    }

    static async getTransactionsGas(addresses: string[], chains: string[]) {
        let addressGasContainers: any = {};

        for(let address of addresses) {
            let gasContrainer: any = {};

            for(let chain of chains) {
                gasContrainer[chain] = 0;
            }

            addressGasContainers[address] = gasContrainer;

            let transactions = await ZapperApi.getTransactions([address], chains);
            extractGas(transactions, gasContrainer);
        }

        for(let [address, gasTokens] of Object.entries(addressGasContainers)){
            try{
                //@ts-ignore
                for(let [network, amount] of Object.entries(gasTokens)){
                    let gasToken = await Price.findOne({
                        where: {
                            network: network
                        }
                    })
                    if(!gasToken){
                        // add throw error
                    }
                    //@ts-ignore
                    addressGasContainers[address][`${network}USD`] = amount * gasToken?.priceUSD
                }    
            }catch(e){
                console.log(e)
            }
        }
        console.log(addressGasContainers)
        return addressGasContainers;
    }

    static async getTransactions(addresses: string[], chains: string[]) {
        let promises = ZapperApi.transactionsPromiseGenerator(addresses, chains)
        let responses = await Promise.all(promises);
        let transactions = [];

        for(let response of responses) {
            transactions.push(...response.data.data);
        }

        return transactions;
    }

    static async getSupportedProtocols(disguise: Disguise) {
        let params = new URLSearchParams();

        if (!disguise.addresses) {
            throw new Error(`[getSupportedProtocols]: problem on field addresses for disguise ${disguise.id}`);
        }

        let addresses = disguise.addresses.split(',');
        params.append('api_key', ZapperApi.apiKey || '');
        for (let address of addresses) {
            params.append('addresses[]', address.toLowerCase());
        }

        const url = `${ZapperApi.apiUrl}/protocols/balances/supported?` + params.toString(); 
        // const url = `${ZapperApi.apiUrl}/users/408?` + params.toString(); 

        try {
            let response = await axios.get(url);
            let networks = response.data;
            let uniqueProtocols = new Set();

            for (let network of networks) {
                for (let app of network.apps) {
                    uniqueProtocols.add(app.appId);
                }
            }

            return Array.from(uniqueProtocols);
        } catch (e) {
            throw e
        }
    }

    static async getSupportedNetworks(disguise: Disguise) {
        let params = new URLSearchParams();

        if (!disguise.addresses) {
            throw new Error(`[getSupportedProtocols]: problem on field addresses for disguise ${disguise.id}`);
        }

        let addresses = disguise.addresses.split(',');
        params.append('api_key', ZapperApi.apiKey || '');
        for (let address of addresses) {
            params.append('addresses[]', address.toLowerCase());
        }
        const url = `${ZapperApi.apiUrl}/protocols/balances/supported?` + params.toString();
        // const url = `${ZapperApi.apiUrl}/users/408?` + params.toString(); 

        try {
            let response = await axios.get(url);
            let networks = response.data;
            let uniqueNetworks: any = {};

            for (let network of networks) {
                if (disguise.options?.chains && disguise.options?.chains[0] != ALL_CHAINS) {
                    if (disguise.options?.chains.includes(network.network)) {
                        uniqueNetworks[network.network] = network.apps;
                    }
                } else {
                    uniqueNetworks[network.network] = network.apps;
                }
            }

            return uniqueNetworks;
        } catch (e) {
            throw e
        }
    }

    static async getBalances(disguise: Disguise, saveCache: boolean = false): Promise<AddressBalances> {
        let balances = getEmptyBalances();
        let assets = getEmptyAssets();

        try {
            let uniqueNetworks: any = await ZapperApi.getSupportedNetworks(disguise); // TODO: how to handle returned type Promise<string[]> doesn't work
            let promises = ZapperApi.balancePromiseGenerator(disguise, uniqueNetworks);
            let responses = await Promise.all(promises);

            for (let response of responses) {
                let queryUrl = new url.URL(response.config.url || '');
                let currentNetwork = queryUrl.searchParams.get('network') || '';

                let protocolBalances = response.data;
                let addressesProtocol: IAddressProtocol[] = Object.values(protocolBalances);
                
                for (let addressProtocol of addressesProtocol) {
                    for (let product of addressProtocol.products) {
                        for (let asset of product.assets) {
                            if (!asset.category) {
                                if (asset.location && asset.location.type) {
                                    asset.category = asset.location.type; // put the location type in category (some edge cases)
                                } else if (asset.type) {
                                    asset.category = asset.type;
                                }
                            }

                            if (asset.category == 'staked' || asset.category == 'farm') {
                                // https://github.com/disguisefy/disguisefy-api/projects/1#card-68794734
                                asset.category = 'staking';
                            }

                            if (asset.category == 'pool' && asset.location && (asset.location.type == 'staked' || asset.location.type == 'staking')) {
                                // do not add this is pool as we will likely receive it from staking-balances
                            } else {
                                let assetCategory: AssetCategories = getAssetCategories(asset.category);
                                if (asset.hide) {
                                    // do nothing
                                } else {
                                    addAsset(assets, assetCategory, asset, balances, currentNetwork, product.label);
                                }
                            }
                        }
                    }
                }
            }

            let addressBalances = new AddressBalances(balances, assets, disguise.options);
            let preset = new Preset(disguise);
            preset.filter(addressBalances);

            // do not wait for cache creation when regenerating while viewing
            if (saveCache) {
                Disguise.saveCache(disguise, addressBalances);
            }

            return addressBalances;
        } catch (e) {
            console.log(`[zapperFi.getBalances]: ${e}`);
            throw e;
        }
    }

    private static balancePromiseGenerator(disguise: Disguise, networks: any) { // find TS compliant solutions to interface protocols
        let promises = [];
        let params = new URLSearchParams();

        if (!disguise.addresses) {
            throw new Error(`[balancePromiseGenerator]: problem on field addresses for disguise ${disguise.id}`);
        }

        let addresses = disguise.addresses.split(',');
        params.append('api_key', ZapperApi.apiKey || '');
        for (let address of addresses) {
            params.append('addresses[]', address.toLowerCase());
        }

        for (let [network, apps] of Object.entries(networks)) {
            params.append('network', network);
            // find TS compliant solution
            // @ts-ignore
            for (let app of apps) {
                let url = `${ZapperApi.apiUrl}/protocols/${app.appId}/balances?` + params.toString();
                promises.push(axios.get(url));
            }
            params.delete('network');
        }

        return promises;
    }

    private static transactionsPromiseGenerator(addresses: string[], chains: string[]) {
        let promises = [];
        let params = new URLSearchParams();

        params.append('api_key', ZapperApi.apiKey || '');
        for(let address of addresses) {
            params.append('address', address.toLowerCase());
            params.append('addresses[]', address.toLowerCase());
        }

        for(let chain of chains) {
            params.append('network', chain);
            let url = `${ZapperApi.apiUrl}/transactions?` + params.toString();
            promises.push(axios.get(url));
            params.delete('network');
        }

        return promises;
    }
    // static async getTransactions(disguise: Disguise, saveCache: boolean = false) {

    //     try {
    //         let uniqueNetworks: any = await ZapperApi.getSupportedNetworks(disguise); // TODO: how to handle returned type Promise<string[]> doesn't work
    //         let promises = ZapperApi.balancePromiseGenerator(disguise, uniqueNetworks);
    //         let responses = await Promise.all(promises);

    //         for (let response of responses) {
    //             let queryUrl = new url.URL(response.config.url || '');
    //             let currentNetwork = queryUrl.searchParams.get('network') || '';

    //             let protocolBalances = response.data;
    //             let addressesProtocol: IAddressProtocol[] = Object.values(protocolBalances);


    //         }

    //         let addressTransactions = new AddressBalances(balances, assets, disguise.options);
    //         let preset = new Preset(disguise);
    //         preset.filter(addressTransactions);

    //         // do not wait for cache creation when regenerating while viewing
    //         if (saveCache) {
    //             Disguise.saveCache(disguise, addressTransactions);
    //         }

    //         return addressTransactions;
    //     } catch (e) {
    //         console.log(`[zapperFi.getBalances]: ${e}`);
    //         throw e;
    //     }
    // }
}

export default ZapperApi;