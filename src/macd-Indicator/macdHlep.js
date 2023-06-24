

const Binance = require("binance-api-node").default;
const { MACD } = require("technicalindicators");
const client = Binance({
   apiKey: "PdUrHr6ytmyyNQExWXZSvluBJN644BNk8w8tasCqgluPuW3VWn1BxhPPVWcdnzIY",
   apiSecret:
      "kZyEEoaIHQ8dmrdQIkye6GbkPi26tdVxrYzxdksGrH01VCKSJQV6JhIFboTPZs1q",
   timestamp: 5000,
});

async function testMacd() {
   client
      .exchangeInfo()
      .then((exchangeInfo) => {
         // Get all symbols
         const symbols = exchangeInfo.symbols;

         // Filter for cryptocurrencies of interest
         const goodCurrencies = symbols.filter((symbol) => {
            // Filter condition - adjust as per your requirements
            return symbol.symbol.endsWith("USDT");
         });

         // Iterate over the filtered currencies
         goodCurrencies.forEach((currency) => {
            const symbol = currency.symbol;

            // Fetch historical candlestick data for the symbol
            client
               .candles({ symbol: symbol, interval: "1h", limit: 100 })
               .then((candles) => {
                  // Extract close prices from the candlestick data
                  const closePrices = candles.map((candle) =>
                     parseFloat(candle.close)
                  );
                  // Calculate MACD
                  const macdInput = {
                     values: closePrices,
                     fastPeriod: 12,
                     slowPeriod: 26,
                     signalPeriod: 9,
                     SimpleMAOscillator: false,
                     SimpleMASignal: false,
                  };
                  const macdResult = MACD.calculate(macdInput);
                  // Check if MACD is positive
                  const isMACDPositive =
                     macdResult[macdResult.length - 1].histogram > 0;
                  // Print the symbol if MACD is positive
                  if (isMACDPositive) {
                     console.log("Good Currency:", symbol);
                  }
               })
               .catch((error) => {
                  console.error("Error fetching candlestick data:", error);
               });
         });
      })
      .catch((error) => {
         console.error("Error fetching exchange information:", error);
      });
}
