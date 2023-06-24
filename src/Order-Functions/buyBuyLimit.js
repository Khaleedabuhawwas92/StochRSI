const Binance = require("binance-api-node").default;
const client = Binance({
   apiKey: "hoKzEzGOsf23NPbfibLrThDJQoQLXhHAC89nO3ziDHdRIKrh35eoLxtdfxifKHR7",
   apiSecret:
      "UCOtewC7rgq4ANr8a2h9l3bYvi1t5vFJBUTMuf3Z7fWNSg9Cpg61IygmJ2XTmEAF",
   timestamp: 5000,
});

const price = 0.13
const symbol = "YGGUSDT";
const desiredQuantity = 88.8;
// Buy Limit
const BuyLimit = () => {
   client
      .exchangeInfo()
      .then((info) => {
         const lotSizeFilter = info.symbols
            .find((s) => s.symbol === symbol)
            .filters.find((f) => f.filterType === "LOT_SIZE");

         // Adjust the quantity based on the lot size filter
         let adjustedQuantity = parseFloat(desiredQuantity);
         adjustedQuantity = Math.max(
            parseFloat(lotSizeFilter.minQty),
            Math.min(parseFloat(lotSizeFilter.maxQty), adjustedQuantity)
         );
         adjustedQuantity -=
            adjustedQuantity % parseFloat(lotSizeFilter.stepSize);

         // Place the limit order with the adjusted quantity
         client
            .order({
               symbol: symbol, // BTCUSDT , ADXUSDT ........
               side: "BUY", // BUY
               type: "LIMIT", // MARKET , LIMITE
               price: price, // WICHE THE PRICE ORDER
               quantity: adjustedQuantity,
            })
            .then((order) => {
               console.log("Limit order placed successfully:", order);
            })
            .catch((error) => {
               console.error("Error placing limit order:", error);
            });
      })
      .catch((error) => {
         console.error("Error retrieving lot size filter:", error);
      });
};

// Sell Limit
async function SellLimit() {
   client
      .order({
         symbol: symbol, // BTCUSDT , ADXUSDT ........
         side: "SELL", // SELL
         type: "LIMIT", // MARKET , LIMITE
         quantity: quantity, // COUNTUTE OF CRYPTO
      })
      .then((order) => {
         console.log("Limit order placed successfully:", order);
      })
      .catch((error) => {
         console.error("Error placing limit order:", error);
      });
}
exports.BuyLimit = BuyLimit;

// Place a market buy order (quoteOrderQty) ??????

// Define the parameters for the market buy order
