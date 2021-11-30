export default interface IToken {
    address: string;
    symbol: string;
    reserve?: number;
    price?: number;
    balance?: number;
    balanceUSD?: number;
    balanceRaw?: number;
    tokens?: IToken[];
    img?: string;
    protocolImg?: string;
    reserveRaw?: string;
    type?: string;
    category?: string;
    metaType?: string;
    decimals?: number;
    protocol?: string;
    label?: string;
    isCToken?: boolean;
    weight?: number;
    share?: number;
    supply?: number;
    volume?: number;
    network?: string;
    productLabel?: string;
}