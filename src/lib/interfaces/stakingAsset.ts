import IToken from "./token";

export default interface IStakingAsset {
    address: string;
    label?: string;
    symbol?: string;
    img?: string;
    balanceUSD: number;
    tokens?: IToken[];
    rewardTokens?: IToken[];
}