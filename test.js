const Binance = require("binance-api-node").default;
const { StochasticRSI } = require("technicalindicators");

// Create a Binance API client
const client = Binance();

// Set the symbol and interval for the candlestick data
const symbol = "LINAUSDT";
const interval = "4h";

// form serch
// const kRange = [20, 23];
// const dRange = [19, 22];
// Set the periods for MA Stoch Line and MA Stoch RSI Line
const stochLinePeriod = 14;
const rsiLinePeriod = 14;
const kPeriod = 3;
const dPeriod = 3;

// Set the %K and %D range
const kRange = [20, 80];
const dRange = [20, 80];

// Fetch the candlestick data from the Binance API

function checkStochRSI() {
   client
      .candles({ symbol, interval, limit: 100 })
      .then((candles) => {
         // Extract the closing prices from the candlestick data
         const closePrices = candles.map((candle) => parseFloat(candle.close));

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
               if (maStochLineCurrent > maStochRsiLineCurrent) {
                  console.log(
                     "MA Stoch Line is up and MA Stoch RSI Line is within %K and %D range."
                  );
               }
            } else {
               console.log(
                  "MA Stoch Line is up but MA Stoch RSI Line is not within %K and %D range."
               );
            }
         } else {
            console.log("MA Stoch Line is not up.");
         }
      })
      .catch((error) => {
         console.error("Error retrieving candlestick data:", error);
      });
}

const intervalTime = 1000; // Interval time in milliseconds
setInterval(checkStochRSI, intervalTime);
