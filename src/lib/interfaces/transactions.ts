export default interface ITransaction {
    network: string;
    hash: string;
    blocknumber: number;
    name: string;
    direction: string;
    timeStamp: string;
    symbol: string;
    address: string;
    amount: string;
    from: string;
    destination: string;
    contract: string;
    subTransactions: Array<ISubTransaction>;
    nonce: string;
    gasPrice: number;
    input: string;
    gas: number;
    txSuccessful: boolean;
    acount: string;
    fromEns: string | null;
    accountEns: string | null;

}

interface ISubTransaction {
    type: string;
    symbol: string;
    amount: number;
    address: string;
}