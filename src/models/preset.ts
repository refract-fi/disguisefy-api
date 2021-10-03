import AddressBalances from "./addressBalances";
import { AssetCategories } from "../lib/helpers";

export default class Preset {
    presetLevel: number;

    constructor(presetLevel: number) {
        this.presetLevel = presetLevel;
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

    // filters addressBalances in place
    filter(addressBalances: AddressBalances) {
        switch (this.presetLevel) {
            case 10:
                addressBalances.balances = {};
                addressBalances.assets = {};
                if (addressBalances.assetsPercentages.hasOwnProperty('nft')) {
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
                if (addressBalances.assetsPercentages.hasOwnProperty('nft')) {
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

                let test = addressBalances.assetsPercentages

                break;

            default:
                console.log(`Preset level ${this.presetLevel} not supported.`);
                break;
        }
    }
}