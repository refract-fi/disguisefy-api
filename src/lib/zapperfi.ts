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
    addAsset,
    addToken,
    extractTokens,
    extractAssetImg
} from './helpers';

// gauge & single-staking return assets classified as non staking (pool, base, deposit, etc...)
// they are still accounted for in staking since most of them are not listed in general balance route
const SUPPORTED_STAKING_PROTOCOLS = ['masterchef', 'gauge', 'single-staking'];

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
            let stakingBalance: number;
            let stakingTokens: IToken[];
            let claimableTokens: IToken[];

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

            // seems not needed anymore since feractor on 07/10/2021 from zapper
            // special attention kid and needs its own dedicated route
            // [stakingBalance, stakingTokens, claimableTokens] = await ZapperApi.getStakingBalances(disguise);
            // balances[AssetCategories.staking] = stakingBalance;

            // for(let stakingToken of stakingTokens) {
            //     addToken(assets, AssetCategories.staking, stakingToken);
            // }

            // for(let claimableToken of claimableTokens) {
            //     addToken(assets, AssetCategories.claimable, claimableToken);
            // }

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

    // masterchef, gauge, single-staking
    static async getStakingBalances(disguise: Disguise): Promise<[number, IToken[], IToken[]]> {
        let stakingBalance: number = 0;
        let claimableTokens: IToken[] = [];
        let stakingTokens: IToken[] = [];

        try {
            let promises = ZapperApi.stakingBalancePromiseGenerator(disguise);
            let responses = await Promise.all(promises);

            for(let response of responses) {
                let stakingList = response.data[disguise.address];

                if(stakingList && stakingList.length > 0) {
                    for(let staking of stakingList) {
                        stakingBalance += parseFloat(staking.balanceUSD);

                        // add claimable tokens
                        if(staking.rewardTokens) {
                            for(let rewardToken of staking.rewardTokens) {
                                claimableTokens.push({
                                    address: rewardToken.address,
                                    symbol: rewardToken.symbol,
                                    balance: rewardToken.balanceUSD,
                                    protocol: rewardToken.protocolDisplay || '',
                                    label: rewardToken.label || rewardToken.symbol,
                                    img: extractAssetImg(rewardToken, 'base')
                                });
                            }
                        }

                        let assetTokens = staking.tokens;
                        if(assetTokens && assetTokens.length > 0) {
                            for(let assetToken of assetTokens) {
                                assetToken.img = extractAssetImg(assetToken, stakingList.category);
                                delete assetToken.address;
                                delete assetToken.balance;
                                delete assetToken.balanceUSD;
                                delete assetToken.decimals;
                                delete assetToken.price;
                                delete assetToken.type;
                            }
                        }

                        // add stacking position with tokens for images
                        stakingTokens.push({
                            address: staking.address,
                            symbol: staking.symbol,
                            balance: staking.balanceUSD,
                            protocol: staking.protocolDisplay || '',
                            label: staking.label || staking.symbol,
                            tokens: assetTokens
                        });
                    }
                }
            }

            return [stakingBalance, stakingTokens, claimableTokens];
        } catch(e) {
            console.log(`[zapperFi.getStakingBalances]: ${e}`);
            return [0, [], []];
        }
    }

    private static stakingBalancePromiseGenerator(disguise: Disguise) {
        let promises = [];
        let params = new URLSearchParams();
        params.append('addresses[]', disguise.address);
        params.append('api_key', ZapperApi.apiKey || '');

        for(let stakingProtocol of SUPPORTED_STAKING_PROTOCOLS) {
            let url = `${ZapperApi.apiUrl}/staked-balance/${stakingProtocol}?` + params.toString();
            promises.push(axios.get(url));
        }

        return promises;
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