const Binance = require('binance-api-node').default;
const tulind = require('tulind');
const { MACD, RSI, BollingerBands } = require('technicalindicators');
const CryptoCompareAPI = require('cryptocompare-api');
const axios = require('axios');
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
  apiKey: 'xmYqKoIWUdT4ieSrSzH4o5YNvJjRvLgA8pF8oj8wMwKVb1DFSeahd7BFWwe9yjvg',
  apiSecret: 'rZTY0b63CLLx7VtIc3iHHelr4Pii1Pn7mXxx1tyhmInJABd97TDZVMBCCq7sPZCM',
});

const symbol = 'LINAUSDT';
const timeframe = '1s';
async function fetchPriceData(symbol, timeframe) {
  try {
    const response = await axios.get(`https://api.binance.com/api/v3/klines`, {
      params: {
        symbol: symbol,
        interval: timeframe,
        limit: 100, // Adjust the limit as needed
      },
    });

    const priceData = response.data.map((entry) => parseFloat(entry[4])); // Extract the close prices

    return priceData;
  } catch (error) {
    console.error('Error fetching price data:', error);
    return null;
  }
}
async function calculateBollingerBands(symbol, timeframe) {
  const priceData = await fetchPriceData(symbol, timeframe);

  if (priceData) {
    const period = 20; // Number of periods to consider
    const stdDev = 2; // Standard deviation multiplier
    const input = {
      values: priceData,
      period: period,
      stdDev: stdDev,
    };

    const result = BollingerBands.calculate(input);
    const { middle, upper, lower } = result[result.length - 1]; // Get the last calculated bands

    console.log('Symbol:', symbol);
    console.log('Middle Band:', middle);
    console.log('Upper Band:', upper);
    console.log('Lower Band:', lower);
  }
}
calculateBollingerBands(symbol, timeframe);

async function testMacd() {
  await client
    .exchangeInfo()
    .then((exchangeInfo) => {
      // Get all symbols
      const symbols = exchangeInfo.symbols;

      // Filter for cryptocurrencies of interest
      const goodCurrencies = symbols.filter((symbol) => {
        // Filter condition - adjust as per your requirements
        return symbol.symbol.endsWith('USDT');
      });

      // Iterate over the filtered currencies
      goodCurrencies.forEach((currency) => {
        const symbol = currency.symbol;

        // Fetch historical candlestick data for the symbol
        client
          .candles({ symbol: symbol, interval: '1h', limit: 100 })
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
              macdResult[macdResult.length - 1].histogram < 0;
            // Print the symbol if MACD is positive
            if (isMACDPositive) {
              console.log('Good MACD :', symbol);
            }
          })
          .catch((error) => {
            console.error('Error fetching candlestick data:', error);
          });
      });
    })
    .catch((error) => {
      console.error('Error fetching exchange information:', error);
    });
}

async function testRSI() {
  await client
    .exchangeInfo()
    .then((exchangeInfo) => {
      // Get all symbols
      const symbols = exchangeInfo.symbols;

      // Filter for cryptocurrencies of interest
      const goodCurrencies = symbols.filter((symbol) => {
        // Filter condition - adjust as per your requirements
        return symbol.symbol.endsWith('USDT');
      });

      // Iterate over the filtered currencies
      goodCurrencies.forEach((currency) => {
        const symbol = currency.symbol;

        // Fetch historical candlestick data for the symbol
        client
          .candles({ symbol: symbol, interval: '1d', limit: 100 })
          .then((candles) => {
            // Extract close prices from the candlestick data
            const closePrices = candles.map((candle) =>
              parseFloat(candle.close)
            );

            // Calculate RSI
            const rsiInput = {
              values: closePrices,
              period: 14,
            };
            const rsiResult = RSI.calculate(rsiInput);

            // Check if RSI is below 30 (oversold condition)
            const isRSIBelow30 = rsiResult[rsiResult.length - 1] < 30;

            // Print the symbol if RSI is below 30
            if (isRSIBelow30) {
              console.log('Good RSI :', symbol);
            }
          })
          .catch((error) => {
            console.error('Error fetching candlestick data:', error);
          });
      });
    })
    .catch((error) => {
      console.error('Error fetching exchange information:', error);
    });
}

// Define the MACD parameters
const macdInput = {
  open: [],
  high: [],
  low: [],
  close: [],
  startIdx: 0,
  endIdx: 0,
};
const macdOptions = {
  optInFastPeriod: 12, // Example MACD fast period
  optInSlowPeriod: 26, // Example MACD slow period
  optInSignalPeriod: 9, // Example MACD signal period
};
// Function to check the MACD and execute trades
async function cancelORDER() {
  client
    .cancelOpenOrders({ symbol: symbol })
    .then(() => {
      console.log('All open orders have been successfully canceled.');
    })
    .catch((error) => {
      console.error('Error canceling open orders:', error);
    });
}
async function checkMarketBuyOrder(symbol) {
  try {
    const trades = await client.myTrades({
      symbol: symbol,
    });

    const marketBuyOrderExists = trades.some((trade) => trade.isBuyer);

    if (marketBuyOrderExists) {
      console.log('Market buy order already exists for', symbol);
      // Perform actions if a market buy order exists
      await client
        .allOrders({
          symbol: 'LINAUSDT',
          limit: 1,
        })
        .then((orders) => {
          console.log(orders);
        });
    } else {
      console.log('No market buy order found for', symbol);
      BuyMarket(symbol);
      // Perform actions if no market buy order exists
    }
  } catch (error) {
    console.error('Error checking market buy order:', error);
  }
}

async function checkMACDAndTrade() {
  try {
    // Fetch the last 100 candles for the symbol
    const candles = await client.candles({
      symbol: symbol,
      interval: '1h',
      limit: 100,
    });

    // Extract the close prices from the candles
    const closePrices = candles.map((candle) => parseFloat(candle.close));

    // Update the MACD input with the close prices
    macdInput.close = closePrices;
    macdInput.startIdx = 0;
    macdInput.endIdx = closePrices.length - 1;

    // Calculate the MACD
    const macd = await calculateMACD(macdInput);

    // Get the last MACD line value
    const macdLine = macd[0];
    const lastMacdLineValue = macdLine[macdLine.length - 1];

    // Get the last MACD signal line value
    const macdSignalLine = macd[1];
    const lastMacdSignalLineValue = macdSignalLine[macdSignalLine.length - 1];

    // Buy if MACD line crosses above the MACD signal line, sell if crosses below
    if (lastMacdLineValue > lastMacdSignalLineValue) {
      getLastOrder(symbol);
    } else if (lastMacdLineValue < lastMacdSignalLineValue) {
      getLastOrde4Sell(symbol);
      // await sell(quantity);
    }
  } catch (error) {
    console.error('Error checking MACD and trading:', error);
  }
}

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
// Function to calculate MACD
function calculateMACD(candles) {
  return new Promise((resolve, reject) => {
    tulind.indicators.macd.indicator(
      [candles.close],
      [
        macdOptions.optInFastPeriod,
        macdOptions.optInSlowPeriod,
        macdOptions.optInSignalPeriod,
      ],
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      }
    );
  });
}

function checkStochRSI(symbol) {
  client
    .candles({ symbol, interval:timeframe, limit: 100 })
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
          } else if(maStochLineCurrent < maStochRsiLineCurrent){
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




const intervalTime = 1000; // Interval time in milliseconds
setInterval(checkStochRSI(symbol), intervalTime);
// MACDandRSI();
// testMacd();
// BuyMarket(symbol);
