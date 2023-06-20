const Binance = require('binance-api-node').default;
const {} = require('../Serves-Funcations/allGetFuncations');
const client = Binance({
  apiKey: 'xmYqKoIWUdT4ieSrSzH4o5YNvJjRvLgA8pF8oj8wMwKVb1DFSeahd7BFWwe9yjvg',
  apiSecret: 'rZTY0b63CLLx7VtIc3iHHelr4Pii1Pn7mXxx1tyhmInJABd97TDZVMBCCq7sPZCM',
});

async function SellMarket(symbol) {
  
  try {
     const Orders = await client.allOrders({ symbol });

     const lastOrder = Orders[Orders.length - 1];
     const qty =
        lastOrder.origQty - Math.round(lastOrder.origQty * 0.002).toFixed(2);
     console.log(lastOrder);
     console.log(qty);
     console.log(lastOrder.origQty);
     SellOrderMarket(symbol, qty);
  } catch (error) {
     console.error("Error retrieving last order:", error);
  }
}

const SellOrderMarket = (symbol, quoteOrderQty) => {
  console.log(quoteOrderQty);
  client
    .order({
      symbol: symbol,
      side: 'SELL',
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
SellMarket();

exports.SellMarket = SellMarket;
