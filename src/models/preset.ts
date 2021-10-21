import AddressBalances from "./addressBalances";
import { AssetCategories } from "../lib/helpers";
import Disguise, { DisguiseOptions } from "./disguise";

export default class Preset {
    presetLevel: number;
    disguiseOptions: DisguiseOptions | null;

    constructor(disguise: Disguise) {
        this.presetLevel = disguise.preset;
        this.disguiseOptions = disguise.options;
    }

    // TS is a bitch, idgaf
    // @ts-ignore
    static removeNFTs(addressBalances: AddressBalances): void {
        if(addressBalances.assets.hasOwnProperty(AssetCategories.nft)) {
            // @ts-ignore
            addressBalances.assets[AssetCategories.nft] = {};
        }

        if(addressBalances.balances.hasOwnProperty(AssetCategories.nft)) {
            // @ts-ignore
            addressBalances.balances[AssetCategories.nft] = 0;
        }
    }

    static groupAssets(addressBalances: AddressBalances, groupAssetsUnder: number) {
        for(let [category, assetList] of Object.entries(addressBalances.assetsPercentages)) {
            if(Object.keys(assetList).length > 0) { // check if category has assets
                for(let [assetAddress, assetDetails] of Object.entries(assetList)) { // assetDetails is an array of assets for some reason
                    if(assetDetails.address != undefined) {
                        if(Math.abs(assetDetails.percentage) < groupAssetsUnder) {
                            if(assetList.hasOwnProperty('groupedAssets')) {
                                assetList['groupedAssets'].percentage += assetDetails.percentage;
                            } else {
                                assetList['groupedAssets'] = {
                                    address: '',
                                    img: 'null',
                                    label: 'Grouped Assets',
                                    percentage: assetDetails.percentage,
                                    tokens: []
                                };
                            }
                            delete assetList[assetAddress];
                        }
                    }
                }
            }
        }
    }

    // filters addressBalances in place
    filter(addressBalances: AddressBalances) {
        switch (this.presetLevel) {
            case 0:
                // add BalanceUSD in assetPercentages for dev purposes
                for(let [category, assetList] of Object.entries(addressBalances.assetsPercentages)) {
                    for(let [assetAddress, assetDetails] of Object.entries(assetList)) {
                        // @ts-ignore
                        if(addressBalances.assets[category][assetAddress]) {
                            // @ts-ignore
                            addressBalances.assetsPercentages[category][assetAddress].balance = addressBalances.assets[category][assetAddress][0].balance;
                        }
                    }
                }
                break;

            case 10:
                addressBalances.balances = {};
                addressBalances.assets = {};

                if (addressBalances.assetsPercentages.hasOwnProperty('nft') && !this.disguiseOptions?.showNFTCollections) {
                    addressBalances.assetsPercentages['nft'] = {};
                }

                for(let [category, assetList] of Object.entries(addressBalances.assetsPercentages)) {
                    if(Object.keys(assetList).length > 0) {
                        for(let [assetAddress, assetDetails] of Object.entries(assetList)) {
                            if(assetDetails.tokens && assetDetails.tokens.length > 0) {
                                for(let token of assetDetails.tokens) {
                                    delete token.balance;
                                    delete token.balanceRaw;
                                    delete token.balanceUSD;
                                    delete token.reserve;
                                    delete token.reserveRaw;
                                    delete token.decimals;
                                }
                            }
                        }
                    }
                }

                break;
            case 20:
                addressBalances.balances = {};
                addressBalances.assets = {};
                if (addressBalances.assetsPercentages.hasOwnProperty('nft') && !this.disguiseOptions?.showNFTCollections) {
                    addressBalances.assetsPercentages['nft'] = {};
                }

                for (let [type, values] of Object.entries(addressBalances.assetsPercentages)) {
                    var sortable = [];
                    for (let key in values){
                        if (values.hasOwnProperty(key)){
                            sortable.push([key, values[key]]);
                        }
                    }
                    const sortedType = sortable.sort((a: any, b: any) => b[1].percentage - a[1].percentage)
                    let index = 0
                    for(let asset of sortedType){
                        let name = asset[0]
                        addressBalances.assetsPercentages[type][`${name}`].percentage = index
                        index ++
                    }
                }
                break;

            default:
                console.log(`Preset level ${this.presetLevel} not supported.`);
                break;
        }
    }
}