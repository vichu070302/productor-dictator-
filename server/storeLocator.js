/**
 * Store Locator & 10 KM Radius Geo-Stock Finder
 */

// Sample network of local supermarkets, organic marts, and local mandis
const STORE_TEMPLATES = [
  {
    id: "store_01",
    name: "Green Leaf Organic Mart",
    type: "Organic Supermarket",
    rating: 4.8,
    reviewsCount: 312,
    offsetLat: 0.012,
    offsetLng: 0.015,
    address: "742 Evergreen Avenue, North District",
    phone: "+1 (555) 234-5678",
    openHours: "08:00 AM - 10:00 PM",
    expressDelivery: true
  },
  {
    id: "store_02",
    name: "Fresh Market Hypercenter",
    type: "Hypermarket",
    rating: 4.6,
    reviewsCount: 840,
    offsetLat: -0.018,
    offsetLng: 0.022,
    address: "105 Central Plaza, Downtown",
    phone: "+1 (555) 876-5432",
    openHours: "07:00 AM - 11:00 PM",
    expressDelivery: true
  },
  {
    id: "store_03",
    name: "City Farmer's Mandi & Bazaar",
    type: "Wholesale Mandi / Farmers Market",
    rating: 4.7,
    reviewsCount: 1250,
    offsetLat: 0.035,
    offsetLng: -0.028,
    address: "Sector 14 Main Wholesale Market",
    phone: "+1 (555) 345-6789",
    openHours: "05:00 AM - 08:00 PM",
    expressDelivery: false
  },
  {
    id: "store_04",
    name: "Nature's Basket Grocery",
    type: "Specialty Grocery Store",
    rating: 4.5,
    reviewsCount: 490,
    offsetLat: -0.042,
    offsetLng: -0.015,
    address: "42 Westside Boulevard",
    phone: "+1 (555) 987-6543",
    openHours: "08:30 AM - 09:30 PM",
    expressDelivery: true
  },
  {
    id: "store_05",
    name: "Daily Veggies Direct Outlet",
    type: "Local Produce Shop",
    rating: 4.4,
    reviewsCount: 180,
    offsetLat: 0.055,
    offsetLng: 0.048,
    address: "18 East Coast Road",
    phone: "+1 (555) 456-7890",
    openHours: "07:00 AM - 09:00 PM",
    expressDelivery: true
  }
];

/**
 * Haversine formula to calculate distance in KM between two geographic coordinates
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal place
}

/**
 * Find stores within specified radius (default 10 KM)
 */
function getNearbyStores(userLat, userLng, itemKey = "apple", radiusKm = 10) {
  const lat = parseFloat(userLat) || 28.6139; // Fallback to city default if not provided
  const lng = parseFloat(userLng) || 77.2090;

  const stores = STORE_TEMPLATES.map((tmpl, index) => {
    const storeLat = lat + tmpl.offsetLat;
    const storeLng = lng + tmpl.offsetLng;
    const distance = calculateHaversineDistance(lat, lng, storeLat, storeLng);

    // Stock availability generator based on store type & index
    const inStock = index !== 3 || itemKey !== "spinach";
    const stockQuantityKg = inStock ? (15 + (index * 12) + (Math.floor(lat * 10) % 20)) : 0;
    const stockStatus = stockQuantityKg > 20 ? "In Stock" : (stockQuantityKg > 0 ? "Low Stock" : "Out of Stock");

    return {
      ...tmpl,
      latitude: storeLat,
      longitude: storeLng,
      distanceKm: distance,
      inStock,
      stockQuantityKg: `${stockQuantityKg} kg`,
      stockStatus
    };
  })
  .filter(store => store.distanceKm <= radiusKm)
  .sort((a, b) => a.distanceKm - b.distanceKm);

  return stores;
}

module.exports = {
  getNearbyStores,
  calculateHaversineDistance
};
