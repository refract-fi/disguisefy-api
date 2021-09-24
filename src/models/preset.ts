import AddressBalances from "./addressBalances";

export default class Preset {
    presetLevel: number;

    constructor(presetLevel: number) {
        this.presetLevel = presetLevel;
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