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
            }
        }

        for(let [category, assetList] of Object.entries(this.assets)) {
            for(let [token, details] of Object.entries(assetList)) {
                let tokenDetails = new TokenDetails(details);
                
                if(!this.assetsPercentages.hasOwnProperty(category)) {
                    this.assetsPercentages[category] = {};
                }

                this.assetsPercentages[category][token] = {
                    percentage: tokenDetails.percentage == 0 ? 0 : (tokenDetails.percentage / total) * 100,
                    tokens: tokenDetails.tokens,
                    address: tokenDetails.address,
                    img: tokenDetails.img
                };
            }
        }
    }
}

class TokenDetails {
    percentage: number;
    tokens: IToken[];
    address: string;
    img?: string;

    constructor(details: any) { // find more TS compliant solution
        if(details[0]) {
            this.percentage = details[0].balance;
            this.tokens = details[0].tokens || [];
            this.address = details[0].address;
            this.img = details[0].img || '';
        } else {
            //should not be used anymore
            this.percentage = details.balance;
            this.tokens = details.tokens;
            this.address = details.address;
            this.img = details.img || '';
        }
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