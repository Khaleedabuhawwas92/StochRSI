const Binance = require("binance-api-node").default;
const {
   getSymbolPrice,
   getAccountBalanceUSDT,
} = require("../Serves-Funcations/allGetFuncations");
const client = Binance({
   apiKey: "hoKzEzGOsf23NPbfibLrThDJQoQLXhHAC89nO3ziDHdRIKrh35eoLxtdfxifKHR7",
   apiSecret:
      "UCOtewC7rgq4ANr8a2h9l3bYvi1t5vFJBUTMuf3Z7fWNSg9Cpg61IygmJ2XTmEAF",
   timestamp: 5000,
});



// Fetch symbol information
function LOT_SIZE(symbol, quantity) {
   return client.exchangeInfo().then((info) => {
      // Find the symbol in the symbols array
      const symbolInfo = info.symbols.find((s) => s.symbol === symbol);

      if (symbolInfo) {
         // Extract the PRICE_FILTER and LOT_SIZE filters
         const priceFilter = symbolInfo.filters.find(
            (f) => f.filterType === "PRICE_FILTER"
         );
         const lotSizeFilter = symbolInfo.filters.find(
            (f) => f.filterType === "LOT_SIZE"
         );
         if (lotSizeFilter) {
            if (parseFloat(lotSizeFilter.stepSize) === 1) {
               const adjustedQuantity = Math.floor(quantity);
               console.log(adjustedQuantity);

               return { adjustedQuantity };
            } else {
               if (priceFilter && lotSizeFilter) {
                  // Extract the tickSize and stepSize values
                  const tickSize = parseFloat(priceFilter.tickSize);
                  const stepSize = parseFloat(lotSizeFilter.stepSize);

                  // Calculate the number of decimal places based on tickSize
                  const pricePrecision = tickSize
                     .toString()
                     .split(".")[1].length;

                  // Calculate the number of decimal places based on stepSize
                  const lotSizePrecision = stepSize
                     .toString()
                     .split(".")[1].length;

                  // Calculate the quantity precision based on the lot size precision
                  const quantityPrecision = -Math.log10(stepSize);

                  // Calculate the adjusted quantity based on the quantity precision
                  const adjustedQuantity =
                     parseFloat(quantity).toFixed(quantityPrecision);

                  return {
                     pricePrecision,
                     lotSizePrecision,
                     quantityPrecision,
                     adjustedQuantity,
                  };
               }
            }
         }


      }

      throw new Error("PRICE_FILTER or LOT_SIZE not found for the symbol");
   });
}

// Buy Market
async function BuyMarket(symbol) {
   getSymbolPrice(symbol)
      .then((Price) => {
         getAccountBalanceUSDT()
            .then((Balance) => {
               const res3 = (Balance * 0.999) / Price;
               console.log(res3);
               LOT_SIZE(symbol, res3)
                  .then(({ adjustedQuantity }) => {
                     console.log(
                        "Adjusted quantity for",
                        symbol,
                        "is",
                        adjustedQuantity
                     );
                     BuyOrderMarket(symbol, adjustedQuantity);

                     // Place a market order
                     // client
                     //    .order({
                     //       symbol: symbol,
                     //       side: "BUY",
                     //       type: "MARKET",
                     //       quantity: adjustedQuantity,
                     //    })
                     //    .then((response) => {
                     //       console.log("Market order placed:", response);
                     //    })
                     //    .catch((error) => {
                     //       console.error(
                     //          "Error placing market order:",
                     //          error
                     //       );
                     //    });
                  })
                  .catch((error) => {
                     console.error("Error:", error);
                  });

               // console.log(res3);
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
         side: "BUY",
         type: "MARKET",
         quantity: quoteOrderQty,
      })
      .then((order) => {
         console.log("Market buy order placed successfully:", order);
      })
      .catch((error) => {
         console.error("Error placing market buy order:", error);
      });
};
function test12(symbol) {
   client
      .exchangeInfo()
      .then((info) => {
         // Find the symbol in the symbols array
         const symbolInfo = info.symbols.find((s) => s.symbol === symbol);

         if (symbolInfo) {
            // Find the LOT_SIZE filter
            const lotSizeFilter = symbolInfo.filters.find(
               (f) => f.filterType === "LOT_SIZE"
            );

            if (lotSizeFilter) {
               // Check if the stepSize is 1, indicating integer-only quantity
               if (parseFloat(lotSizeFilter.stepSize) === 1) {
                  console.log(symbol, "requires integer quantity");
               } else {
                  console.log(symbol, "does not require integer quantity");
               }
            } else {
               console.log("LOT_SIZE filter not found for", symbol);
            }
         } else {
            console.log("Symbol not found:", symbol);
         }
      })
      .catch((error) => {
         console.error("Error:", error);
      });
}

exports.BuyMarket = BuyMarket;
