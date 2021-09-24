import AddressBalances from "./addressBalances";

export default class Preset {
    presetLevel: number;

    constructor(presetLevel: number) {
        this.presetLevel = presetLevel;
    }

    // filters addressBalances in place
    filter(addressBalances: AddressBalances) {
        switch(this.presetLevel) {
            case 10:
                addressBalances.balances = {};
                addressBalances.assets = {};
                if(addressBalances.assetsPercentages.hasOwnProperty('nft')) {
                    addressBalances.assetsPercentages['nft'] = {};
                }
                break;

            default:
                console.log(`Preset level ${this.presetLevel} not supported.`);
                break;
        }
    }
}