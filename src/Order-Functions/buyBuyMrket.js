const Binance = require('binance-api-node').default;
const {
  getSymbolPrice,
  getAccountBalanceUSDT,
} = require('../Serves-Funcations/allGetFuncations');
const client = Binance({
  apiKey: 'xmYqKoIWUdT4ieSrSzH4o5YNvJjRvLgA8pF8oj8wMwKVb1DFSeahd7BFWwe9yjvg',
  apiSecret: 'rZTY0b63CLLx7VtIc3iHHelr4Pii1Pn7mXxx1tyhmInJABd97TDZVMBCCq7sPZCM',
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
