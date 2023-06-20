// Get Account Balance By USDT
const Binance = require("binance-api-node").default;

// Instantiate the client with your API key and secret
const client = Binance({
   apiKey: "xmYqKoIWUdT4ieSrSzH4o5YNvJjRvLgA8pF8oj8wMwKVb1DFSeahd7BFWwe9yjvg",
   apiSecret:
      "rZTY0b63CLLx7VtIc3iHHelr4Pii1Pn7mXxx1tyhmInJABd97TDZVMBCCq7sPZCM",

      recvWindow: 5000, // Set recvWindow parameter
});
const symbol = "ADXUSDT";

function getAccountBalanceAllYourCrypto() {
   client
      .accountInfo()
      .then((accountInfo) => {
         const balances = accountInfo.balances;

         // Fetch USDT price
         client

            .avgPrice({ symbol: "ADXUSDT" })
            .then((usdtPrice) => {
               const usdtValue = parseFloat(usdtPrice.price);

               // Calculate values for each asset in USDT
               const assets = balances.map((balance) => {
                  const asset = balance.asset;
                  const free = parseFloat(balance.free);
                  const locked = parseFloat(balance.locked);
                  const value =
                     asset === "USDT"
                        ? free + locked
                        : (free + locked) * getAssetPrice(asset, usdtValue);

                  return { asset, value };
               });

               console.log("Asset Balances in USDT:", assets);
            })
            .catch((error) => {
               console.error("Error fetching USDT price:", error);
            });
      })
      .catch((error) => {
         console.error("Error retrieving account information:", error);
      });
}
function getAssetPrice(asset, usdtValue) {
   return client
      .avgPrice({ symbol: asset + "USDT" })
      .then((assetPrice) => {
         const price = parseFloat(assetPrice.price);
         return price * usdtValue;
      })
      .catch((error) => {
         console.error(`Error fetching ${asset} price:`, error);
         return 0;
      });
}

// Get Quantity Based On Balance And Price

// Calculate The Correct Quantity Based On The Lot Size Step
async function getAllOrders() {
   await client
      .allOrders({
         symbol: "ADXUSDT",
         limit: 1,
         recvWindow: 5000, // Optional parameter for the server time offset
         timestamp: Date.now(), // Optional parameter for the current timestamp
      })
      .then((orders) => {
         if (orders.length > 0) {
            if (orders[0].side === "BUY" && orders[0].status === "CANCELED") {
               console.log("BUY:", orders);
            } else {
               if (orders[0].side === "BUY" && orders[0].status === "FILLED") {
                  console.log("FILLED:", orders);
               }
               console.log(orders);
            }
         } else {
            console.log("No orders found.");
         }
      })
      .catch((error) => {
         console.error(error);
      });
}
function getall() {
   // Retrieve all symbols
   client
      .accountInfo()
      .then((accountInfo) => {
         const symbols = accountInfo.balances.map((asset) => asset.asset);
         console.log("Symbols in your account:", symbols);
      })
      .catch((error) => {
         console.error("Error retrieving account information:", error);
      });
}

// const symbol = 'ADXUSDT';
// const balancePromise = getAccountBalance();
// const pricePromise = getSymbolPrice(symbol);
// Promise.all([balancePromise, pricePromise])
//   .then(([balance, price]) => {
//     const quantity = getQuantity(balance.USDT, price);
//     console.log(`Account balance:`, balance);
//     console.log(`Current price of ${symbol}:`, price);
//     console.log(`Quantity based on balance and price:`, quantity);
//   })
//   .catch(error => {
//     console.error('Error:', error);
//   });
const getAccountBalanceUSDT = async () => {
   let acc = await client.accountInfo().then((accountInfo) => {
      const balances = accountInfo.balances;
      const usdtSymbol = "USDT";
      const usdtBalance = balances.find(
         (balance) => balance.asset === usdtSymbol
      );

      if (usdtBalance) {
         const usdtQuantity = parseFloat(usdtBalance.free) ;
         console.log(usdtQuantity);
         return usdtQuantity;
      } else {
         throw new Error(`No balance found for ${usdtSymbol}`);
      }
   });
   return acc;
};

// Get Symbol Price
const getSymbolPrice = (symbol) => {
   return client.prices({ symbol }).then((prices) => {
      const symbolPrice = parseFloat(prices[symbol]);
      return symbolPrice;
   });
};
const getQuantity = (balance, price) => {
   return (balance / price).toFixed(2);
};
// Promise.all([getAccountBalanceUSDT(), getSymbolPrice(symbol)])
//    .then(([accountBalance, symbolPrice]) => {
//       let Quntityt = accountBalance / symbolPrice;
//       console.log(`Value of account balance in ${Quntityt.toFixed(2)}:`);
//    })
//    .catch((error) => {
//       console.error("Error:", error);
//    });

async function getAccountBalanceUSDTMinusOne() {
   try {
      // Get the balance of USDT
      const balances = await client.accountInfo();

      // Find the USDT balance in the response
      const usdtBalance = balances.balances.find(
         (asset) => asset.asset === "USDT"
      );

      // Fetch the current USDT price
      const usdtPriceTicker = await client.book({
         symbol: "USDT",
      }); // USDTUSDT is a valid trading pair for USDT price

      // Calculate the total value in USDT
      const totalValueUSDT =
         parseFloat(usdtBalance.free) * parseFloat(usdtPriceTicker.price);

      // Subtract 1 USDT from the total value
      const newValueUSDT = totalValueUSDT - 1;

      // Return the new value in USDT
      return newValueUSDT;
   } catch (error) {
      console.error("Error fetching account balance:", error);
      throw error;
   }
}
getAccountBalanceUSDT()
exports.getSymbolPrice = getSymbolPrice;
exports.getAccountBalanceUSDT = getAccountBalanceUSDT;
exports.getQuantity = getQuantity;
