const Binance = require("binance-api-node").default;
const { MACD, StochasticRSI } = require("technicalindicators");
const tulind = require("tulind");
const axios = require("axios");

// Instantiate the client with your API key and secret
const client = Binance({
   apiKey: "9MDlaXiZ3v97EwANLckWfnEliYySPp4ejJYCw4XnH4bbUzi5F3PPK1Genx0Ym4vZ",
   apiSecret:
      "V7yf8DwR5Nw3hjW9pmge7nxlc0AK8WdIKIrq4YbfbLMQJao8t1pQYxdMyD5p3kF6",
   timestamp: 5000,
});
const symbol = "LINAUSDT";
const interval = "1h";
const stochLinePeriod = 14;
const rsiLinePeriod = 14;
const kPeriod = 3;
const dPeriod = 3;

// Set the %K and %D range
const kRange = [0, 20];
const dRange = [0, 20];

function getAccountBalance() {
   return client.accountInfo().then((accountInfo) => {
      const balances = {};
      for (const { asset, free } of accountInfo.balances) {
         if (asset === "USDT") {
            balances[asset] = parseFloat(free) - 2;
         }
      }
      return balances;
   });
}

// Get symbol price
function getSymbolPrice(symbol) {
   return client.prices({ symbol: symbol }).then((prices) => {
      return parseFloat(prices[symbol]);
   });
}

// Get quantity based on balance and price
function getQuantity(balance, price) {
   return (balance / price).toFixed(8);
}

// Retrieve symbol information including lot size
async function getSymbolInfo(symbol) {
   const exchangeInfo = await client.exchangeInfo();
   const symbolInfo = exchangeInfo.symbols.find((s) => s.symbol === symbol);
   return symbolInfo;
}

// Calculate the correct quantity based on the lot size step
function calculateOrderQuantity(symbolInfo, quantity) {
   const { lotSize } = symbolInfo.filters.find(
      (f) => f.filterType === "LOT_SIZE"
   );
   const stepSize = parseFloat(lotSize.stepSize);
   const calculatedQuantity = Math.floor(quantity / stepSize) * stepSize;
   return calculatedQuantity;
}

// Place a limit order
async function placeLimitOrder(symbol, side, price, quantity) {
   try {
      const symbolInfo = await getSymbolInfo(symbol);
      const calculatedQuantity = calculateOrderQuantity(symbolInfo, quantity);
      const order = await client.newOrder({
         symbol: symbol,
         side: side,
         type: "MARKET",
         price: price,
         quantity: calculatedQuantity.toString(),
      });
      console.log("Limit order placed successfully:", order);
   } catch (error) {
      console.error("Error placing limit order:", error);
   }
}
function testMacd() {
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
               .candles({ symbol: symbol, interval: "4h", limit: 100 })
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

                  // Check if the MA Stoch Line is up
                  if (maStochLineCurrent > 0) {
                     // Check if the MA Stoch RSI Line is between %K and %D range
                     if (
                        maStochLineCurrent >= kRange[0] &&
                        maStochLineCurrent <= kRange[1] &&
                        maStochRsiLineCurrent >= dRange[0] &&
                        maStochRsiLineCurrent <= dRange[1]
                     ) {
                        const value =
                           maStochLineCurrent - maStochRsiLineCurrent;
                        if (maStochLineCurrent > maStochRsiLineCurrent) {
                           console.log(symbol);
                           console.log(value);

                        }
                     }
                  }
               })
               .catch((error) => {
                  console.error("Error retrieving candlestick data:", error);
               });

            // Fetch historical candlestick data for the symbol
         });
      })
      .catch((error) => {
         console.error("Error fetching exchange information:", error);
      });
}

// Define the parameters for the limit order

function isSingleLineAndMACDUnderZero(data) {
   const input = {
      values: data.close, // Assuming 'close' is an array of closing prices
      fastPeriod: 12, // Fast period for MACD calculation
      slowPeriod: 26, // Slow period for MACD calculation
      signalPeriod: 9, // Signal period for MACD calculation
      SimpleMAOscillator: false, // Use EMA for MACD calculation
      SimpleMASignal: false, // Use EMA for signal calculation
   };

   // Calculate MACD
   const macdResult = MACD.calculate(input);

   // Get the latest MACD histogram value
   const macdHistogram = macdResult[macdResult.length - 1].histogram;

   // Get the latest single line value (e.g., SMA, EMA, etc.)
   const singleLine = data.singleLine; // Replace with the actual single line values

   // Check if both the single line and MACD line are below zero
   if (singleLine < 0 && macdHistogram < 0) {
      return true;
   }

   return false;
}

const data = {
   close: [10, 15, 20, 12, 8], // Example closing prices
   singleLine: -2, // Example single line value
};
//  testMacd()

// Check if single line and MACD line are both below zero
//  const isUnderZero = isSingleLineAndMACDUnderZero(data);
//  console.log('Is under zero:', isUnderZero);
// Place the limit order
// placeLimitOrder(symbol, side, price, quantity);
const getCandleData = async () => {
   try {
      const candles = await client.candles({
         symbol: symbol,
         interval: "1h",
         limit: 20, // Replace with the number of candles you want to fetch
      });

      const closePrices = candles.map((candle) => parseFloat(candle.close));
      return closePrices;
   } catch (error) {
      console.error("Error fetching candlestick data:", error);
      return [];
   }
};

const calculateMACD = async (symbol) => {
   const closePrices = await getCandleData3(symbol);

   if (closePrices.length === 0) {
      console.error("No candlestick data available.");
      return;
   }

   tulind.indicators.macd.indicator(
      [closePrices],
      [12, 26, 9],
      (err, results) => {
         if (err) {
            console.error("Error calculating MACD:", err);
            return;
         }

         const macdLine = results[0];
         const signalLine = results[1];
         const histogram = results[2];

         const lastMacdValue = macdLine[macdLine.length - 1];
         const lastSignalValue = signalLine[signalLine.length - 1];

         if (lastMacdValue < 0 && lastSignalValue < 0) {
            console.log("this is the symbol" + symbol);
         } else {
            console.log("close");
         }
      }
   );
};
const timeframe = "1h"; //

const getCandleData3 = async (symbol) => {
   try {
      const candles = await client.candles({
         symbol: symbol,
         interval: timeframe,
         limit: 100, // Replace with the number of candles you want to fetch
      });

      const closePrices = candles.map((candle) => parseFloat(candle.close));
      return closePrices;
   } catch (error) {
      console.error("Error fetching candlestick data:", error);
      return [];
   }
};
testMacd();
