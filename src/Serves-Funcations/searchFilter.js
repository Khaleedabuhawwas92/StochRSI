// Get Account Balance By USDT
const Binance = require("binance-api-node").default;
const { StochasticRSI } = require("technicalindicators");

const axios = require("axios");

// Instantiate the client with your API key and secret
const client = Binance({
   apiKey: "PdUrHr6ytmyyNQExWXZSvluBJN644BNk8w8tasCqgluPuW3VWn1BxhPPVWcdnzIY",
   apiSecret:
      "kZyEEoaIHQ8dmrdQIkye6GbkPi26tdVxrYzxdksGrH01VCKSJQV6JhIFboTPZs1q",
   timestamp: 5000,
});
const interval = "1h";
const stochLinePeriod = 14;
const rsiLinePeriod = 14;
const kPeriod = 3;
const dPeriod = 3;

// Set the %K and %D range
const kRange = [0, 20];
const dRange = [0, 20];

const Serch = () => {
   client
      .exchangeInfo()
      .then((exchangeInfo) => {
         // Get all symbols
         const symbols = exchangeInfo.symbols;
         const array2 = [
            "BUSDUSDT",
            "USDCUSDT",
            "TUSDUSDT",
            "BTCUSDT",
            "ETHUSDT",
            "USDPUSDT",
            "EURUSDT",
         ];
         // Filter for cryptocurrencies of interest
         const goodCurrencies = symbols.filter(
            (symbol) =>
               symbol.quoteAsset === "USDT" &&
               symbol.isSpotTradingAllowed &&
               symbol.status === "TRADING" &&
               !array2.includes(symbol.symbol)
            // Filter condition - adjust as per your requirements
         );

         // Iterate over the filtered currencies
         goodCurrencies.forEach((currency, index) => {
            const symbol = currency.symbol;
            client
               .candles({ symbol: symbol, interval: "1h", limit: 500 })
               .then((candles) => {
                  // Extract the closing prices from the candlestick data
                  const closePrices = candles.map((candle) =>
                     parseFloat(candle.close)
                  );

                  // Calculate the Stochastic RSI
                  const stochRsiInput = {
                     values: closePrices,
                     rsiPeriod: rsiLinePeriod,
                     stochasticPeriod: stochLinePeriod,
                     kPeriod,
                     dPeriod,
                  };
                  const stochRsi = StochasticRSI.calculate(stochRsiInput);

                  // Get the last value of the MA Stoch Line and MA Stoch RSI Line
                  const maStochLineCurrent = stochRsi[stochRsi.length - 1].k;
                  const maStochRsiLineCurrent = stochRsi[stochRsi.length - 1].d;

                  // Check if the MA Stoch RSI Line is between %K and %D range
                  if (
                     maStochLineCurrent >= kRange[0] &&
                     maStochLineCurrent <= kRange[1] &&
                     maStochRsiLineCurrent >= dRange[0] &&
                     maStochRsiLineCurrent <= dRange[1]
                  ) {
                     if (maStochLineCurrent > maStochRsiLineCurrent) {
                        // const value =
                        //    maStochLineCurrent - maStochRsiLineCurrent;
                        const value =
                           maStochLineCurrent - maStochRsiLineCurrent;

                        axios
                           .post("http://localhost:8000/api/symbol", {
                              title: symbol,
                              spreads: value,
                           })
                           .then(function (response) {
                              console.log(response.data);
                           })
                           .catch(function (error) {
                              console.log("error");
                           });
                     } else {
                     }
                  } else {
                  }
               })
               .catch((error) => {});

            // Fetch historical candlestick data for the symbol
         });
      })
      .catch((error) => {
         console.log("Error " + symbol);
      });
};
exports.Serch = Serch;
