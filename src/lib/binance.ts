const { Spot } = require('@binance/connector')

class BinanceAPI {
    static async getBalances(apiKey: string, apiSecret: string) {
        const client = new Spot(apiKey, apiSecret)

        try{
            let response = await client.accountSnapshot('SPOT')
            return response.data
        }
        catch(e){
            console.log(e)
            return e
        }
    }
}

export default BinanceAPI