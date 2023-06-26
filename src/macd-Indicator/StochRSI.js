const Binance = require("binance-api-node").default;
const tulind = require("tulind");

const { StochasticRSI } = require("technicalindicators");

const { BuyMarket } = require("../Order-Functions/buyBuyMrket");
const { SellMarket } = require("../Order-Functions/sellByMarket");
const { Serch } = require("../Serves-Funcations/searchFilter");

// // Configure your Binance API credentials
const client = Binance({
   apiKey: "PdUrHr6ytmyyNQExWXZSvluBJN644BNk8w8tasCqgluPuW3VWn1BxhPPVWcdnzIY",
   apiSecret:
      "kZyEEoaIHQ8dmrdQIkye6GbkPi26tdVxrYzxdksGrH01VCKSJQV6JhIFboTPZs1q",
   timestamp: 5000,
});
const symbol = "YFIIUSDT";
const interval = "1h";
const stochLinePeriod = 14;
const rsiLinePeriod = 14;
const kPeriod = 3;
const dPeriod = 3;

// Set the %K and %D range
const kRange = [20, 80];
const dRange = [20, 80];
const cRange = [0, 20];
const eRange = [0, 20];

// Define the MACD parameters

// Function to check the MACD and execute trades

async function getLastOrder(symbol) {
   try {
      const Orders = await client.allOrders({ symbol });
      if (Orders.length > 0) {
         const lastOrders = Orders[Orders.length - 1];
         if (lastOrders.side ==="BUY") {
            console.log("Buyed");
         } else {

            BuyMarket(symbol);
            console.log("now Buy");
         }
         // Perform actions with the last order data
      } else {
         BuyMarket(symbol);
         console.log("new symbol Buy");
      }
   } catch (error) {
      console.error("Error retrieving last order:", error);
   }
}
async function getLastOrde4Sell(symbol) {
   try {
      const Orders = await client.allOrders({ symbol });
      if (Orders.length > 0) {
         const lastOrders = Orders[Orders.length - 1];
         if (lastOrders.side ==="SELL") {
            console.log("Selld");
         } else {
            SellMarket(symbol);
            console.log("now Sell");
         }
         // Perform actions with the last order data
      }
   } catch (error) {
      console.error("Error retrieving last order:", error);
   }
}

async function checkStochRSI() {
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
            const gapToSell = maStochRsiLineCurrent - maStochLineCurrent;
            // Check if the MA Stoch RSI Line is between %K and %D range
            if (
               maStochLineCurrent >= kRange[0] &&
               maStochLineCurrent <= kRange[1] &&
               maStochRsiLineCurrent >= dRange[0] &&
               maStochRsiLineCurrent <= dRange[1]
            ) {
               if (maStochLineCurrent > maStochRsiLineCurrent) {
                  getLastOrder(symbol);
               } else if (
                  maStochLineCurrent < maStochRsiLineCurrent &&
                  gapToSell >= 7
               ) {
                  getLastOrde4Sell(symbol);
               }
            } else {
               if (
                  maStochLineCurrent >= cRange[0] &&
                  maStochLineCurrent <= cRange[1] &&
                  maStochRsiLineCurrent >= eRange[0] &&
                  maStochRsiLineCurrent <= eRange[1]
               ) {
                  if (maStochLineCurrent < maStochRsiLineCurrent) {
                     getLastOrde4Sell(symbol);
                  }
               }
            }
         }
      })
      .catch((error) => {
         console.error("Error retrieving candlestick data:", error);
      });
}

const intervalTime = 1000; // Interval time in milliseconds
setInterval(checkStochRSI, intervalTime);
// MACDandRSI();
// testMacd();
// BuyMarket(symbol);
// checkStochRSI()
