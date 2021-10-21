import { symbolName } from "typescript";
import IAsset from "./interfaces/asset";
import IToken from "./interfaces/token";

const imgBase = 'https://storage.googleapis.com/zapper-fi-assets/tokens';
const protocolImgBase = 'https://storage.googleapis.com/zapper-fi-assets/apps/';

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

export function isJSON(text: any) {
    if (/^[\],:{}\s]*$/.test(text.replace(/\\["\\\/bfnrtu]/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
        return true;
    } else {
        return false;
    }
}

export function addAsset(assets: any, assetCategory: AssetCategories, asset: IAsset, balances: any, currentNetwork: string) {
    let key = String(assetCategory);
    let tokens: IToken[] = extractTokens(asset);

    if(assets[key].hasOwnProperty(asset.address)) {
        for(let token of tokens) {
            let foundToken = assets[key][asset.address].find((element: any) => element.symbol == token.symbol);
            if(foundToken) {
                foundToken.balance += token.balance;
                balances[key] += token.balance;

                console.log('[addAsset]: looks weird 1');
            } else {
                console.log('[addAsset]: should not happen.');
            }
        }
        
        assets[key][asset.address].balance += asset.balanceUSD;
        console.log('[addAsset]: looks weird 2');
    } else {
        if((asset.type == 'farm' || asset.type == 'claimable') && asset.tokens && asset.tokens.length > 0) {
            for(let token of tokens) {
                token.network = currentNetwork;
                if(token.metaType == 'staking' || token.metaType == 'staked') {
                    assets['staking'][token.address] = [token];
                    balances['staking'] += token.balance;
                } else if(token.metaType == 'claimable' || token.metaType == 'yield') {
                    assets['claimable'][token.address] = [token];
                    balances['claimable'] += token.balance;
                } else {
                    assets['claimable'][token.address] = [token];
                    balances['claimable'] += token.balance;
                }
            }
        } else {
            for(let token of tokens) { token.network = currentNetwork; }
            assets[key][asset.address] = tokens;
            balances[key] += asset.balanceUSD;
        }
    }
}

export function addToken(assets: any, assetCategory: AssetCategories, token: IToken) {
    let key = String(assetCategory);

    if(assets[key].hasOwnProperty(token.address)) {
        assets[key][token.address].balance += token.balanceUSD;
    } else {
        assets[key][token.address] = token;
    }
}

export function extractTokens(asset: IAsset): IToken[] {
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
                img: asset.img,
                protocolImg: `${protocolImgBase}${asset.appId}.png`
            });
            break;

        case "claimable":
            let claimableAssetTokens = asset.tokens;
            if(claimableAssetTokens && claimableAssetTokens.length > 0) {
                for(let assetToken of claimableAssetTokens) {
                    assetToken.img = extractAssetImg(assetToken, asset.category);
                    tokens.push({
                        address: assetToken.address,
                        symbol: assetToken.symbol,
                        balance: assetToken.balanceUSD,
                        protocol: asset.protocolDisplay || '',
                        label: assetToken.label || assetToken.symbol,
                        img: assetToken.img
                    });
                }
            }
            break;

        case "nft":
            // should look into assets for NFT details
            tokens.push({
                address: asset.address,
                symbol: asset.symbol,
                balance: asset.balanceUSD,
                protocol: asset.collectionName || asset.location?.protocolDisplay || '',
                label: asset.collectionName || asset.symbol,
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
            let poolAssetTokens = asset.tokens;
            if(poolAssetTokens && poolAssetTokens.length > 0) {
                for(let assetToken of poolAssetTokens) {
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
                    balance: asset.balanceUSD,
                    protocol: asset.location?.protocolDisplay || '',
                    label: asset.label || asset.symbol,
                    img: extractAssetImg(asset, asset.category)
                });
            } else if(asset.type == 'pool') {
                let assetTokens = asset.tokens;
                if(assetTokens && assetTokens.length > 0) {
                    for(let assetToken of assetTokens) {
                        if(assetToken.category == 'pool') {
                            assetToken.img = `${protocolImgBase}${asset.appId}.png`;
                        } else {
                            assetToken.img = extractAssetImg(assetToken, asset.category);
                        }
                    }
                }

                tokens.push({
                    address: asset.address,
                    symbol: asset.symbol,
                    balance: asset.balanceUSD,
                    protocol: asset.location?.protocolDisplay || '',
                    label: asset.label || asset.symbol,
                    tokens: assetTokens
                });
            } else if(asset.type == 'farm') {
                let assetTokens = asset.tokens;
                let symbol = '';

                if(asset.symbol) {
                    symbol = asset.symbol
                } else if(assetTokens && assetTokens.length > 0) {
                    symbol = assetTokens[0].symbol;
                }

                if(assetTokens && assetTokens.length > 0) {
                    for(let assetToken of assetTokens) {
                        assetToken.img = `${protocolImgBase}${asset.appId}.png`;
                        assetToken.protocol = asset.protocolDisplay;

                        tokens.push({
                            address: assetToken.address,
                            symbol: assetToken.symbol,
                            metaType: assetToken.metaType,
                            balance: assetToken.balanceUSD,
                            protocol: asset.protocolDisplay || asset.location?.protocolDisplay || '',
                            label: assetToken.label || assetToken.symbol || symbol,
                            img: assetToken.img
                        });
                    }
                }
            }
            break;

        default:
            console.log(`Asset category ${asset.category} not supported`);
            break;
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