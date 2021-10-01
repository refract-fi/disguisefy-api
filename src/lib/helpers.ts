import IAsset from "./interfaces/asset";
import IToken from "./interfaces/token";

const imgBase = 'https://storage.googleapis.com/zapper-fi-assets/tokens';

export enum AssetCategories {
    notUsed = 'notUsed',
    wallet = 'wallet',
    deposit = 'deposit',
    investment = 'investment',
    pool = 'pool',
    staking = 'staking',
    claimable = 'claimable',
    debt = 'debt',
    nft = 'nft',
    other = 'others'
};

const emptyBalances = {
    [AssetCategories.notUsed]: 0,
    [AssetCategories.wallet]: 0,
    [AssetCategories.deposit]: 0,
    [AssetCategories.investment]: 0,
    [AssetCategories.pool]: 0,
    [AssetCategories.staking]: 0,
    [AssetCategories.claimable]: 0,
    [AssetCategories.debt]: 0,
    [AssetCategories.nft]: 0,
    [AssetCategories.other]: 0
};

const emptyAssets = JSON.stringify({
    [AssetCategories.notUsed]: {},
    [AssetCategories.wallet]: {},
    [AssetCategories.deposit]: {},
    [AssetCategories.investment]: {},
    [AssetCategories.pool]: {},
    [AssetCategories.staking]: {},
    [AssetCategories.claimable]: {},
    [AssetCategories.debt]: {},
    [AssetCategories.nft]: {},
    [AssetCategories.other]: {}
});

export function getAssetCategories(x = 'wallet'): AssetCategories {
    return (<any>AssetCategories)[x];
}

export function getEmptyBalances() {
    return Object.assign({}, emptyBalances);
}

export function getEmptyAssets() {
    // for deeper copy https://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-deep-clone-an-object-in-javascript
    return Object.assign({}, JSON.parse(emptyAssets));
}

export function addAsset(assets: any, assetCategory: AssetCategories, asset: IAsset) {
    let key = String(assetCategory);
    let tokens: IToken[] = extractTokens2(asset);

    if(assets[key].hasOwnProperty(asset.address)) {
        for(let token of tokens) {
            let foundToken = assets[key][asset.address].find((element: any) => element.symbol == token.symbol);
            if(foundToken) {
                foundToken.balance += token.balance;
            } else {
                console.log('BIG ERROR.');
            }
        }
        
        assets[key][asset.address].balance += asset.balanceUSD;
    } else {
        assets[key][asset.address] = tokens;
    }
}

// improved version of extractTokens
// refactor if any good
export function extractTokens2(asset: IAsset): IToken[] {
    let tokens: IToken[] = [];
    switch(asset.category) {
        case "debt":
            tokens.push({
                address: asset.address,
                symbol: asset.symbol,
                balance: asset.balanceUSD,
                protocol: asset.protocolDisplay || '',
                label: asset.label || asset.symbol,
                img: asset.img
            });
            break;

        case "wallet" :
            tokens.push({
                address: asset.address,
                symbol: asset.symbol,
                balance: asset.balanceUSD,
                protocol: asset.protocolDisplay || '',
                label: asset.label || asset.symbol,
                img: asset.img
            });
            break;

        case "deposit" :
            tokens.push({
                address: asset.address,
                symbol: asset.symbol,
                balance: asset.balanceUSD,
                protocol: asset.protocolDisplay || '',
                label: asset.label || asset.symbol,
                img: asset.img
            });
            break;

        case "claimable":
            tokens.push({
                address: asset.address,
                symbol: asset.symbol,
                balance: asset.balanceUSD,
                protocol: asset.location?.protocolDisplay || '',
                label: asset.label || asset.symbol,
                img: extractAssetImg(asset, asset.category)
            });
            break;

        case "nft":
            // should look into assets for NFT details
            tokens.push({
                address: asset.address,
                symbol: asset.symbol,
                balance: asset.balanceUSD,
                protocol: asset.collectionName || asset.location?.protocolDisplay || '',
                label: asset.label || asset.symbol,
                img: asset.collectionImg
            });
            break;

        case "investment":
            tokens.push({
                address: asset.address,
                symbol: asset.symbol,
                balance: asset.balanceUSD,
                protocol: asset.location?.protocolDisplay || '',
                label: asset.label || asset.symbol,
                img: extractAssetImg(asset, asset.category)
            });
            break;
        
        case "pool" :
            let assetTokens = asset.tokens;
            if(assetTokens && assetTokens.length > 0) {
                for(let assetToken of assetTokens) {
                    assetToken.img = extractAssetImg(assetToken, asset.category);
                }
            }

            tokens.push({
                address: asset.address,
                symbol: asset.symbol,
                balance: asset.balanceUSD,
                protocol: asset.protocolDisplay,
                label: asset.label || asset.symbol,
                tokens: asset.tokens
            });
            break;

        case "staking":
            if(asset.type == 'base') {
                tokens.push({
                    address: asset.address,
                    symbol: asset.symbol,
                    balance: asset.balance,
                    protocol: asset.location?.protocolDisplay || '',
                    label: asset.label || asset.symbol,
                    img: extractAssetImg(asset, asset.category)
                });
            } else if(asset.type == 'pool') {
                let assetTokens = asset.tokens;
                if(assetTokens && assetTokens.length > 0) {
                    for(let assetToken of assetTokens) {
                        assetToken.img = extractAssetImg(assetToken, asset.category);
                    }
                }

                tokens.push({
                    address: asset.address,
                    symbol: asset.symbol,
                    balance: asset.balance,
                    protocol: asset.location?.protocolDisplay || '',
                    label: asset.label || asset.symbol,
                    tokens: assetTokens
                });
            }
            break;

        default:
            console.log(`Asset category ${asset.category} not supported`);
            break;
    }
    return tokens;
}

// asset should be IAsset | IToken
export function extractTokens(asset: any): any {
    let tokens: IToken[] = [];

    if(asset.tokens) {
        if(asset.tokens[0].tokens) {
             // pools may have an array of tokens in the asset
            tokens = extractTokens(asset.tokens[0]);
        } else {
            for(let token of asset.tokens) {
                // clean up the token content
                delete token.reserve;
                delete token.price;
                delete token.balance;
                delete token.balanceUSD;
                delete token.balanceRaw;
                delete token.reserveRaw;
                delete token.type;
                delete token.decimals;
                delete token.isCToken;
                delete token.weight;
    
                token.img = extractAssetImg(token, asset.type)
                tokens.push(token);
            }
        }
    } else if(asset[0]?.type == 'pool') {
        // special case where we do not want the deepest tokens
        for(let poolAsset of asset) {
            let poolAssetTokens = poolAsset.tokens;

            for(let poolAssetToken of poolAssetTokens) {
                poolAssetToken.img = extractAssetImg(poolAssetToken, AssetCategories.pool);
            }

            tokens.push({
                address: poolAsset.address,
                symbol: poolAsset.symbol,
                // balanceUSD: poolAsset.balanceUSD,
                tokens: poolAssetTokens
            });
        }
    } else if(asset[0] && asset[0].symbol) { 
        if(asset[0].tokens) {
            // asset has an array of tokens
            tokens = extractTokens(asset[0].tokens);
        } else {
            // asset is an array of tokens
            for(let token of asset) {
                // clean up the token content
                delete token.reserve;
                delete token.price;
                delete token.balance;
                // delete token.balanceUSD;
                delete token.balanceRaw;
                delete token.reserveRaw;
                delete token.type;
                delete token.decimals;
                delete token.isCToken;
                delete token.weight;
    
                token.img = extractAssetImg(token, asset.type)
                tokens.push(token);
            }
        }
    } else {
        tokens.push({
            address: asset.address,
            symbol: asset.symbol,
            img: extractAssetImg(asset, asset.type)
        });
    }

    return tokens;
}

// asset should be IAsset | IToken
export function extractAssetImg(asset: any, assetCategory: string) {
    let img = null;

    if(asset.img && asset.img != '') {
        if(assetCategory != AssetCategories.nft) {
            img = asset.img;
        }
    } else {
        if(assetCategory != AssetCategories.nft) {
            img = `${imgBase}/ethereum/${asset.address}.png`; // network should be dynamic
        }
    }

    return img;
}