const Binance = require('binance-api-node').default;
const tulind = require('tulind');


const { StochasticRSI } = require('technicalindicators');

const { BuyMarket } = require('../Order-Functions/buyBuyMrket');
const { SellMarket } = require('../Order-Functions/sellByMarket');
// const { BuyLimit } = require("../Order-Functions/buyBuyLimit");
// const { cancel } = require("@alpacahq/alpaca-trade-api/dist/resources/order");

// async function buy() {
//    BuyLimit();
// }

// // Configure your Binance API credentials
const client = Binance({
  apiKey: "9MDlaXiZ3v97EwANLckWfnEliYySPp4ejJYCw4XnH4bbUzi5F3PPK1Genx0Ym4vZ",
  apiSecret:
     "V7yf8DwR5Nw3hjW9pmge7nxlc0AK8WdIKIrq4YbfbLMQJao8t1pQYxdMyD5p3kF6",
  timestamp: 5000,
});
const symbol = 'LINAUSDT';
const timeframe = '1s';
const stochLinePeriod = 14;
const rsiLinePeriod = 14;
const kPeriod = 3;
const dPeriod = 3;

// Set the %K and %D range
const kRange = [20, 80];
const dRange = [20, 80];

// Define the MACD parameters


// Function to check the MACD and execute trades




async function getLastOrder(symbol) {
  try {
    const trades = await client.myTrades({ symbol });
    if (trades.length > 0) {
      const lastTrade = trades[trades.length - 1];
      if (lastTrade.isBuyer) {
        console.log('Buyed');
      } else {
        BuyMarket(symbol);
        console.log('now Buy');
      }
      // Perform actions with the last order data
    } else {
      BuyMarket(symbol);
    }
  } catch (error) {
    console.error('Error retrieving last order:', error);
  }
}
async function getLastOrde4Sell(symbol) {
  try {
    const trades = await client.myTrades({ symbol });
    if (trades.length > 0) {
      const lastTrade = trades[trades.length - 1];
      if (!lastTrade.isBuyer) {
        console.log('Selld');
      } else {
        SellMarket(symbol);
        console.log('now Sell');
      }
      // Perform actions with the last order data
    }
  } catch (error) {
    console.error('Error retrieving last order:', error);
  }
}


async function checkStochRSI(symbol) {
  client
    .candles({ symbol:symbol, interval: timeframe, limit: 100 })
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
            getLastOrder(symbol);
          } else if (maStochLineCurrent < maStochRsiLineCurrent) {
            getLastOrde4Sell(symbol);
          }
        } else {
          console.log(
            'MA Stoch Line is up but MA Stoch RSI Line is not within %K and %D range.'
          );
        }
      } else {
        console.log('MA Stoch Line is not up.');
      }
    })
    .catch((error) => {
      console.error('Error retrieving candlestick data:', error);
    });
}

// const intervalTime = 1000; // Interval time in milliseconds
// setInterval(, intervalTime);
// MACDandRSI();
// testMacd();
// BuyMarket(symbol);
checkStochRSI(symbol)
