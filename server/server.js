require("dotenv").config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const { analyzeImageFreshness, PRODUCE_DATABASE } = require('./aiEngine');
const { getNearbyStores } = require('./storeLocator');
const { getStorePricesForProduce } = require('./priceEngine');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Multer memory storage for direct buffer processing
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

// Serve static frontend files from client directory
app.use(express.static(path.join(__dirname, '../client')));
app.use(express.static(path.join(__dirname, '..')));

/**
 * Endpoint: API Health Check
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'online', service: 'AgriFresh API Server', timestamp: new Date() });
});

/**
 * Endpoint: Produce Database Metadata
 */
app.get('/api/produce-catalog', (req, res) => {
  res.json({ success: true, catalog: PRODUCE_DATABASE });
});

/**
 * Endpoint: Image Upload & Freshness Detection
 */
app.post('/api/analyze-freshness', async (req, res) => {
  try {
    const { imageBase64, filename, itemKey } = req.body;

    if (!imageBase64 && !filename && !itemKey) {
      return res.status(400).json({ success: false, error: "No image data provided" });
    }

    const cleanBase64 = imageBase64 ? imageBase64.replace(/^data:image\/\w+;base64,/, "") : "";

    const result = await analyzeImageFreshness(cleanBase64, filename || itemKey || "");
    res.json(result);
  } catch (error) {
    console.error("Freshness Analysis API Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Endpoint: Nearby Stores & 20 KM Radius Stock Finder
 */
app.get('/api/nearby-stores', async (req, res) => {
  try {
    const { lat, lng, itemKey = "apple", radius = 20, placeName = "" } = req.query;
    
    const stores = await getNearbyStores(parseFloat(lat) || 28.6139, parseFloat(lng) || 77.2090, itemKey, parseFloat(radius));
    const priceData = getStorePricesForProduce(itemKey, stores);

    res.json({
      success: true,
      userLocation: { lat: parseFloat(lat) || 28.6139, lng: parseFloat(lng) || 77.2090, placeName },
      searchRadiusKm: parseFloat(radius),
      itemKey,
      totalStoresFound: stores.length,
      stores,
      marketPricing: priceData
    });
  } catch (error) {
    console.error("Error fetching nearby stores:", error);
    res.status(500).json({ success: false, error: "Failed to fetch store location data" });
  }
});

/**
 * Endpoint: Agmarknet & Local Market Prices
 */
app.get('/api/market-prices', (req, res) => {
  try {
    const { itemKey = "apple", lat = 28.6139, lng = 77.2090 } = req.query;
    const stores = getNearbyStores(lat, lng, itemKey, 10);
    const priceData = getStorePricesForProduce(itemKey, stores);
    res.json({ success: true, priceData });
  } catch (error) {
    console.error("Error fetching market prices:", error);
    res.status(500).json({ success: false, error: "Failed to fetch price comparison data" });
  }
});

/**
 * Endpoint: Store Order Creation / Checkout Simulation
 */
app.post('/api/create-order', (req, res) => {
  try {
    const { storeId, storeName, itemKey, itemName, quantityKg, unitPrice, totalPrice, deliveryAddress, paymentMethod } = req.body;
    
    const orderId = "ORD-" + Math.floor(100000 + Math.random() * 900000);
    const estimatedDeliveryMin = 25 + Math.floor(Math.random() * 15);

    res.json({
      success: true,
      order: {
        orderId,
        storeId: storeId || "store_01",
        storeName: storeName || "Green Leaf Organic Mart",
        itemKey: itemKey || "produce",
        itemName: itemName || "Fresh Produce",
        quantityKg: quantityKg || 1,
        unitPrice: unitPrice || 2.50,
        totalPrice: totalPrice || (quantityKg * unitPrice) || 5.00,
        deliveryAddress: deliveryAddress || "User GPS Coordinates",
        paymentMethod: paymentMethod || "Cash / UPI on Delivery",
        status: "Confirmed",
        estimatedDelivery: `${estimatedDeliveryMin} Mins`,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, error: "Failed to place store order" });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 AgriFresh Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
