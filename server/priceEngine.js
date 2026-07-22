/**
 * Price Engine & Agmarknet Daily Market Data Service
 */

const BASE_MARKET_PRICES = {
  apple: { unit: "kg", mandiPrice: 2.80, currency: "$", priceTrend: "-3.2% vs yesterday", grade: "A Grade Gala" },
  banana: { unit: "kg", mandiPrice: 1.20, currency: "$", priceTrend: "+1.5% vs yesterday", grade: "Premium Cavendish" },
  tomato: { unit: "kg", mandiPrice: 1.50, currency: "$", priceTrend: "-5.0% vs yesterday", grade: "Grade A Farm Fresh" },
  orange: { unit: "kg", mandiPrice: 2.10, currency: "$", priceTrend: "0.0% Stable", grade: "Juicy Valencia" },
  spinach: { unit: "kg", mandiPrice: 1.80, currency: "$", priceTrend: "+2.1% vs yesterday", grade: "Hydroponic Organic" },
  potato: { unit: "kg", mandiPrice: 0.90, currency: "$", priceTrend: "-1.1% vs yesterday", grade: "New Crop Russet" },
  carrot: { unit: "kg", mandiPrice: 1.40, currency: "$", priceTrend: "-2.4% vs yesterday", grade: "Crunchy Red" }
};

/**
 * Match price data across local stores with Agmarknet benchmark
 */
function getStorePricesForProduce(itemKey, stores = []) {
  const benchmark = BASE_MARKET_PRICES[itemKey] || BASE_MARKET_PRICES.apple;

  const storePriceList = stores.map((store, i) => {
    // Generate slight store specific pricing variance (+/- 15%)
    const multiplier = 0.92 + ((i * 7) % 25) / 100;
    const storePrice = Math.round((benchmark.mandiPrice * multiplier) * 100) / 100;
    const discountPercent = storePrice < benchmark.mandiPrice ? Math.round(((benchmark.mandiPrice - storePrice) / benchmark.mandiPrice) * 100) : 0;
    
    return {
      storeId: store.id,
      storeName: store.name,
      storeType: store.type,
      distanceKm: store.distanceKm,
      inStock: store.inStock,
      stockStatus: store.stockStatus,
      pricePerKg: storePrice,
      currency: benchmark.currency,
      formattedPrice: `${benchmark.currency}${storePrice.toFixed(2)} / kg`,
      agmarknetMandiPrice: `${benchmark.currency}${benchmark.mandiPrice.toFixed(2)} / kg`,
      priceSavings: discountPercent > 0 ? `${discountPercent}% Below Mandi Rate` : "Standard Retail Rate",
      dealTag: discountPercent >= 5 ? "BEST VALUE" : (i === 0 ? "NEAREST" : "STANDARD")
    };
  });

  return {
    itemKey,
    unit: benchmark.unit,
    currency: benchmark.currency,
    agmarknetBenchmark: {
      mandiWholesaleRate: `${benchmark.currency}${benchmark.mandiPrice.toFixed(2)} / kg`,
      trend: benchmark.priceTrend,
      grade: benchmark.grade,
      lastUpdated: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    },
    storePrices: storePriceList
  };
}

module.exports = {
  getStorePricesForProduce,
  BASE_MARKET_PRICES
};
