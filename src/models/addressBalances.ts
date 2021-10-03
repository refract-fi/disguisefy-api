import IToken from "../lib/interfaces/token";
import { DisguiseOptions } from "./disguise";
import Preset from "./preset";

export default class AddressBalances {
    balances: object; // find more TS compliant solution
    percentages: IPercentages;
    assets: object; // find more TS compliant solution
    assetsPercentages: IAssetPercentages;

    constructor(balances: object, assets: object, options: DisguiseOptions | null) {
        this.balances = balances;
        this.percentages = {};
        this.assets = assets;
        this.assetsPercentages = {};

        if(options?.ignoreNFTs) {
            Preset.removeNFTs(this);
        }
        this.calcPercentages(options);
    }

    calcPercentages(options: DisguiseOptions | null) {
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
                    img: tokenDetails.img,
                    label: tokenDetails.label
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
    label: string;

    constructor(details: any) { // find more TS compliant solution
        if(details[0]) {
            this.percentage = details[0].balance;
            this.tokens = details[0].tokens || [];
            this.address = details[0].address;
            this.img = details[0].img || '';
            this.label = details[0].label;
        } else {
            //should not be used anymore
            this.percentage = details.balance;
            this.tokens = details.tokens;
            this.address = details.address;
            this.img = details.img || '';
            this.label = details.label;
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