const Binance = require('binance-api-node').default;
const {
  getSymbolPrice,
  getAccountBalanceUSDT,
} = require('../Serves-Funcations/allGetFuncations');
const client = Binance({
  apiKey: "9MDlaXiZ3v97EwANLckWfnEliYySPp4ejJYCw4XnH4bbUzi5F3PPK1Genx0Ym4vZ",
  apiSecret:
     "V7yf8DwR5Nw3hjW9pmge7nxlc0AK8WdIKIrq4YbfbLMQJao8t1pQYxdMyD5p3kF6",
  timestamp: 5000,
});
// Buy Market
async function BuyMarket(symbol) {
  getSymbolPrice(symbol)
    .then((Price) => {
      getAccountBalanceUSDT()
        .then((Balance) => {
          const res3 = ((Balance *0.999) / Price).toFixed(2);
          BuyOrderMarket(symbol, res3);
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
}

const BuyOrderMarket = (symbol, quoteOrderQty) => {
  client
    .order({
      symbol: symbol,
      side: 'BUY',
      type: 'MARKET',
      quantity: quoteOrderQty,
    })
    .then((order) => {
      console.log('Market buy order placed successfully:', order);
    })
    .catch((error) => {
      console.error('Error placing market buy order:', error);
    });
};

exports.BuyMarket = BuyMarket;
