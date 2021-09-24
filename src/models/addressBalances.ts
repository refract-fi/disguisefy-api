import IToken from "../lib/interfaces/token";

export default class AddressBalances {
    balances: object; // find more TS compliant solution
    percentages: IPercentages;
    assets: object; // find more TS compliant solution
    assetsPercentages: IAssetPercentages;

    constructor(balances: object, assets: object) {
        this.balances = balances;
        this.percentages = {};
        this.assets = assets;
        this.assetsPercentages = {};

        this.calcPercentages();
    }

    calcPercentages() {
        let total = Object.values(this.balances).reduce((previousValue, currentValue) => {
            let a = parseFloat(previousValue);
            let b = parseFloat(currentValue);

            return isNaN(b) ? a : (a + b);
        });

        for(let [key, value] of Object.entries(this.balances)) {
            if(key != 'undefined') {
                this.percentages[key] = value == 0 ? 0 : (value / total) * 100;
            } else {
                console.log('This asset type is not supported yet.');
            }
        }

        for(let [category, assetList] of Object.entries(this.assets)) {
            for(let [token, details] of Object.entries(assetList)) {
                let tokenDetails = new TokenDetails(details);
                
                if(!this.assetsPercentages.hasOwnProperty(category)) {
                    this.assetsPercentages[category] = {};
                }

                // network should be dynamic in img
                this.assetsPercentages[category][token] = {
                    percentage: tokenDetails.percentage == 0 ? 0 : (tokenDetails.percentage / total) * 100,
                    tokens: tokenDetails.tokens,
                    address: tokenDetails.address
                };
            }
        }
    }
}

class TokenDetails {
    percentage: number;
    tokens: IToken[]; // img link
    address: string;

    constructor(details: any) { // find more TS compliant solution
        this.percentage = details.balance;
        this.tokens = details.tokens;
        this.address = details.address;
    }
}

interface IPercentages {
    [key: string]: number;
}

interface IDetailedPercentages {
    [key: string]: TokenDetails;
}

interface IAssetPercentages {
    [key: string]: IDetailedPercentages;
}