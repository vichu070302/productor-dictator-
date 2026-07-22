# AgriFresh AI - Fruit & Vegetable Freshness Detection & Smart Store Purchase Integration

A full-stack web application for automated produce freshness detection, quality diagnostic scoring, Agmarknet daily market price matching, and 10 km radius local store inventory & order integration.

---

## 🌟 Key Features

1. **AI Image Freshness & Quality Scanner**:
   - Accepts produce photos via Drag-and-Drop file upload, Live Camera Stream, or Sample produce shortcuts.
   - Analyzes quality parameters: Freshness status (`Fresh`, `Average`, `Spoiled`), quality %, texture/firmness rating, blemish spot %, remaining shelf life, storage tips, and nutritional values.

2. **"Purchase Now" & GPS Location Finder (10 KM Radius)**:
   - Uses Browser Geolocation API (or fallback location search) to calculate Haversine distances to local supermarkets, organic marts, hypermarkets, and APMC mandis within a 10 km radius.
   - Checks stock availability (`In Stock`, `Low Stock`, `Out of Stock`) per store.

3. **Agmarknet & Daily Market Price Integration**:
   - Matches local store retail prices directly with daily APMC Agmarknet mandi benchmark wholesale rates.
   - Highlights savings tags (e.g. `15% Below Mandi Rate`, `BEST VALUE`).

4. **Interactive Map & Instant Checkout**:
   - Leaflet.js interactive map rendering user position and nearby store pins.
   - Instant store order modal with quantity calculator and checkout confirmation.

---

## 🏗️ Project Architecture

```
agrifresh/
├── server/
│   ├── server.js              # Express REST API server & static file host
│   ├── aiEngine.js            # Image freshness & produce quality diagnostic model
│   ├── storeLocator.js        # Geolocation & 10 KM radius store discovery engine
│   ├── priceEngine.js         # Agmarknet daily price indexer & store price matcher
│   └── package.json           # Backend Node.js dependencies
├── client/
│   ├── index.html             # Semantic Glassmorphic single-page web app
│   ├── style.css              # Custom CSS design system (Dark slate, emerald accents)
│   └── app.js                 # Frontend application logic, Leaflet map & API client
├── .env.example               # Environment variables configuration template
└── README.md                  # Detailed documentation & API guide
```

---

## 🚀 Quick Start Guide

### 1. Install Backend Dependencies
Open your terminal in the `server` directory:
```bash
cd server
npm install
```

### 2. Start the Application Server
Run the dev server:
```bash
npm start
```
The server will start at: **`http://localhost:5000`**

### 3. Open in Browser
Visit **`http://localhost:5000`** in your browser to experience the complete web application.

---

## 🔌 API Documentation

### 1. Freshness Analysis API
- **Endpoint**: `POST /api/analyze-freshness`
- **Payload**: `FormData` (with `image` file) OR `JSON` (`{ "itemKey": "apple", "imageBase64": "..." }`)
- **Response**:
```json
{
  "success": true,
  "item": {
    "key": "apple",
    "name": "Red Gala Apple",
    "category": "Fruit",
    "scientificName": "Malus domestica"
  },
  "quality": {
    "status": "Fresh",
    "scorePercentage": 92,
    "firmness": "Firm & Crisp",
    "spotDefectsPercent": "4%",
    "estimatedRemainingShelfLife": "14 Days"
  },
  "nutrition": { "calories": "52 kcal", "vitaminC": "14%", "fiber": "2.4g" },
  "storageAdvice": "Store in a cool, dry place..."
}
```

### 2. Nearby Store & Stock Finder API
- **Endpoint**: `GET /api/nearby-stores?lat=28.6139&lng=77.2090&itemKey=apple&radius=10`
- **Response**: Returns matching stores within radius, stock quantities, and Agmarknet price comparison data.

### 3. Market Pricing API
- **Endpoint**: `GET /api/market-prices?itemKey=apple`
- **Response**: Returns APMC Agmarknet benchmark rates and store price list.

### 4. Create Store Order API
- **Endpoint**: `POST /api/create-order`
- **Body**: `{ "storeId": "store_01", "itemKey": "apple", "quantityKg": 2, "unitPrice": 2.58 }`

---

## 🌐 External API Integration Options

The application includes built-in realistic engines. To connect real third-party APIs in production:

1. **Google Places API**: Replace mock coordinates in `server/storeLocator.js` with calls to `https://maps.googleapis.com/maps/api/place/nearbysearch/json`.
2. **Agmarknet API**: Fetch live government mandi rates from `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070`.
3. **OpenAI / Gemini Vision API**: Plug in vision classification calls inside `server/aiEngine.js`.
