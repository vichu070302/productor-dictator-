/**
 * Free Store Locator - Overpass API
 */
const axios = require('axios');

async function getNearbyStores(lat, lng, itemKey = "apple", radiusKm = 10) {
    try {
        const userLat = parseFloat(lat) || 10.8505;
        const userLng = parseFloat(lng) || 76.2711;
        const radiusMeters = radiusKm * 1000;

        const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];node(around:${radiusMeters},${userLat},${userLng})["shop"~"supermarket|grocery|greengrocer|fruit"];out;`;

        const response = await axios.get(overpassUrl);
        const elements = response.data.elements || [];

        const stores = elements.slice(0, 20).map((place, index) => {
            const pLat = parseFloat(place.lat);
            const pLon = parseFloat(place.lon);
            const dist = calculateDistance(userLat, userLng, pLat, pLon);

            return {
                id: `osm_store_${place.id || index}`,
                name: place.tags.name || `${itemKey.toUpperCase()} Fresh Market`,
                address: place.tags['addr:street'] || place.tags['addr:suburb'] || "Local Grocery Center",
                lat: pLat,  // എപ്പോഴും Valid Number ആയിരിക്കും
                lng: pLon,  // എപ്പോഴും Valid Number ആയിരിക്കും
                rating: 4.5,
                reviewsCount: 25,
                openNow: true,
                distanceKm: parseFloat(dist.toFixed(1))
            };
        });

        if (stores.length === 0) {
            return getFallbackStores(userLat, userLng, itemKey);
        }

        return stores;

    } catch (error) {
        console.error("Error fetching stores:", error.message);
        return getFallbackStores(parseFloat(lat) || 10.8505, parseFloat(lng) || 76.2711, itemKey);
    }
}

function getFallbackStores(lat, lng, itemKey) {
    return [
        { id: "store_1", name: `Fresh ${itemKey.toUpperCase()} Mart`, address: "Market Junction", lat: lat + 0.01, lng: lng + 0.01, rating: 4.6, reviewsCount: 45, openNow: true, distanceKm: 1.2 },
        { id: "store_2", name: "Green Grocery & Fruits", address: "Main Road Corner", lat: lat - 0.01, lng: lng - 0.01, rating: 4.3, reviewsCount: 30, openNow: true, distanceKm: 2.5 }
    ];
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

module.exports = { getNearbyStores };