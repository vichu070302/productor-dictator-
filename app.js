/**
 * AgriFresh Client Application Logic - Root Application Copy
 */

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("fileInput");
  const browseBtn = document.getElementById("browseBtn");
  const previewContainer = document.getElementById("previewContainer");
  const imagePreview = document.getElementById("imagePreview");
  const dropzoneContent = document.getElementById("dropzoneContent");
  const removeImgBtn = document.getElementById("removeImgBtn");
  const analyzeBtn = document.getElementById("analyzeBtn");

  // Webcam Elements
  const webcamBtn = document.getElementById("webcamBtn");
  const videoContainer = document.getElementById("videoContainer");
  const webcamVideo = document.getElementById("webcamVideo");
  const captureBtn = document.getElementById("captureBtn");
  const closeCameraBtn = document.getElementById("closeCameraBtn");

  // Result Card Elements
  const resultCard = document.getElementById("resultCard");
  const resultProduceName = document.getElementById("resultProduceName");
  const resultCategory = document.getElementById("resultCategory");
  const freshnessBadge = document.getElementById("freshnessBadge");
  const scoreCircle = document.getElementById("scoreCircle");
  const scoreText = document.getElementById("scoreText");
  const shelfLifeVal = document.getElementById("shelfLifeVal");
  const firmnessVal = document.getElementById("firmnessVal");
  const defectVal = document.getElementById("defectVal");
  const storageTipsText = document.getElementById("storageTipsText");
  const nutritionTags = document.getElementById("nutritionTags");
  const purchaseItemName = document.getElementById("purchaseItemName");
  const purchaseNowBtn = document.getElementById("purchaseNowBtn");

  // Store Locator Elements
  const storeSection = document.getElementById("storeSection");
  const selectedProduceName = document.getElementById("selectedProduceName");
  const detectLocationBtn = document.getElementById("detectLocationBtn");
  const radiusSelect = document.getElementById("radiusSelect");
  const storesList = document.getElementById("storesList");
  const mandiPriceVal = document.getElementById("mandiPriceVal");
  const mandiTrendVal = document.getElementById("mandiTrendVal");
  const mandiGradeVal = document.getElementById("mandiGradeVal");

  // Modal Elements
  const orderModal = document.getElementById("orderModal");
  const closeOrderModalBtn = document.getElementById("closeOrderModalBtn");
  const checkoutForm = document.getElementById("checkoutForm");
  const modalStoreName = document.getElementById("modalStoreName");
  const modalItemName = document.getElementById("modalItemName");
  const modalUnitPrice = document.getElementById("modalUnitPrice");
  const orderQtyInput = document.getElementById("orderQtyInput");
  const modalTotalPayable = document.getElementById("modalTotalPayable");

  // State Variables
  let currentFile = null;
  let currentBase64 = null;
  let currentProduceKey = "apple";
  let analysisResult = null;
  let userCoords = { lat: 28.6139, lng: 77.2090 };
  let leafletMap = null;
  let mapMarkers = [];
  let mediaStream = null;
  let selectedStoreForOrder = null;

  // 4K Ultra HD Produce Sample Images (PNG Photography)
  const SAMPLE_IMAGES = {
    apple: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=1920&q=90&fm=png",
    tomato: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=1920&q=90&fm=png",
    banana: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=1920&q=90&fm=png",
    orange: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=1920&q=90&fm=png",
    spinach: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=1920&q=90&fm=png",
    potato: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=1920&q=90&fm=png"
  };

  // 4K Lightbox Modal Elements
  const open4kModalBtn = document.getElementById("open4kModalBtn");
  const hd4kModal = document.getElementById("hd4kModal");
  const close4kModalBtn = document.getElementById("close4kModalBtn");
  const hd4kImageDisplay = document.getElementById("hd4kImageDisplay");
  const hd4kCaption = document.getElementById("hd4kCaption");

  if (open4kModalBtn) {
    open4kModalBtn.addEventListener("click", () => {
      if (imagePreview && imagePreview.src) {
        hd4kImageDisplay.src = imagePreview.src;
        hd4kCaption.textContent = `🔍 4K Ultra HD View: ${capitalize(currentProduceKey)} Inspection`;
        hd4kModal.classList.remove("hidden");
      }
    });
  }

  if (close4kModalBtn) {
    close4kModalBtn.addEventListener("click", () => {
      hd4kModal.classList.add("hidden");
    });
  }

  // Pre-load default apple image on startup & run initial analysis
  currentProduceKey = "apple";
  currentBase64 = SAMPLE_IMAGES.apple;
  if (imagePreview) imagePreview.src = SAMPLE_IMAGES.apple;
  if (dropzoneContent) dropzoneContent.classList.add("hidden");
  if (previewContainer) previewContainer.classList.remove("hidden");

  // Auto run initial analysis on startup
  setTimeout(() => {
    runProduceAnalysis();
  }, 300);

  // --- 1. FILE UPLOAD & PRESET DRAG-DROP HANDLERS ---
  if (browseBtn) {
    browseBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      fileInput.click();
    });
  }

  dropzone.addEventListener("click", (e) => {
    if (e.target.id !== "browseBtn" && e.target.id !== "fileInput" && !e.target.classList.contains("btn-remove")) {
      fileInput.click();
    }
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleImageFile(e.target.files[0]);
    }
  });

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  });

  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  });

  function handleImageFile(file) {
    if (!file) return;
    currentFile = file;

    const fname = file.name ? file.name.toLowerCase() : "";
    for (const key of Object.keys(SAMPLE_IMAGES)) {
      if (fname.includes(key)) {
        currentProduceKey = key;
        break;
      }
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      currentBase64 = e.target.result;
      if (imagePreview) imagePreview.src = currentBase64;
      dropzoneContent.classList.add("hidden");
      previewContainer.classList.remove("hidden");
      
      // Auto analyze uploaded produce image immediately
      runProduceAnalysis();
    };
    reader.readAsDataURL(file);
    fileInput.value = "";
  }

  removeImgBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    currentFile = null;
    currentBase64 = SAMPLE_IMAGES.apple;
    currentProduceKey = "apple";
    imagePreview.src = SAMPLE_IMAGES.apple;
    previewContainer.classList.add("hidden");
    dropzoneContent.classList.remove("hidden");
    fileInput.value = "";
    runProduceAnalysis();
  });

  // Preset Sample Chips
  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", (e) => {
      document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      const sampleKey = chip.dataset.sample;
      currentProduceKey = sampleKey;

      if (SAMPLE_IMAGES[sampleKey]) {
        currentBase64 = SAMPLE_IMAGES[sampleKey];
        currentFile = null;
        imagePreview.src = currentBase64;
        dropzoneContent.classList.add("hidden");
        previewContainer.classList.remove("hidden");
        
        // Auto analyze selected sample produce immediately
        runProduceAnalysis();
      }
    });
  });

  // --- 2. WEBCAM STREAM CONTROLLER ---
  webcamBtn.addEventListener("click", async () => {
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      webcamVideo.srcObject = mediaStream;
      videoContainer.classList.remove("hidden");
      dropzone.classList.add("hidden");
    } catch (err) {
      alert("Unable to access camera: " + err.message);
    }
  });

  captureBtn.addEventListener("click", () => {
    const canvas = document.createElement("canvas");
    canvas.width = webcamVideo.videoWidth || 640;
    canvas.height = webcamVideo.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(webcamVideo, 0, 0, canvas.width, canvas.height);
    currentBase64 = canvas.toDataURL("image/png");
    currentFile = null;

    imagePreview.src = currentBase64;
    dropzoneContent.classList.add("hidden");
    previewContainer.classList.remove("hidden");
    stopWebcam();
    
    // Auto analyze captured camera snapshot
    runProduceAnalysis();
  });

  closeCameraBtn.addEventListener("click", stopWebcam);

  function stopWebcam() {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      mediaStream = null;
    }
    videoContainer.classList.add("hidden");
    dropzone.classList.remove("hidden");
  }

  // --- 3. ANALYZE FRESHNESS ACTION ---
  analyzeBtn.addEventListener("click", () => {
    runProduceAnalysis();
  });

  async function runProduceAnalysis() {
    if (!currentFile && !currentBase64) {
      currentProduceKey = "apple";
      currentBase64 = SAMPLE_IMAGES.apple;
      imagePreview.src = SAMPLE_IMAGES.apple;
      dropzoneContent.classList.add("hidden");
      previewContainer.classList.remove("hidden");
    }

    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = `🔍 Analyzing Product...`;

    try {
      const formData = new FormData();
      formData.append("itemKey", currentProduceKey);

      if (currentFile) {
        formData.append("image", currentFile);
      } else if (currentBase64) {
        formData.append("imageBase64", currentBase64);
      }

      const response = await fetch("/api/analyze-freshness", {
        method: "POST",
        body: currentFile ? formData : JSON.stringify({ itemKey: currentProduceKey, imageBase64: currentBase64, filename: currentFile ? currentFile.name : "" }),
        headers: currentFile ? {} : { "Content-Type": "application/json" }
      });

      analysisResult = await response.json();

      if (analysisResult.success) {
        renderFreshnessResult(analysisResult);
      }
    } catch (err) {
      console.error(err);
    } finally {
      analyzeBtn.disabled = false;
      analyzeBtn.innerHTML = `🔍 Analyze Freshness & Quality`;
    }
  }

  function renderFreshnessResult(data) {
    currentProduceKey = data.item.key;
    const produceName = data.item.name;

    resultProduceName.textContent = produceName;
    resultCategory.textContent = `${data.item.category} • ${data.item.scientificName} • ✨ Google Vision AI Analyzed`;

    const statusText = data.quality.conditionLabel || (data.quality.isFresh ? "🟢 Fresh Product" : "🔴 Old / Spoiled Product");
    freshnessBadge.textContent = statusText;

    let badgeClass = "fresh";
    if (statusText.includes("Average")) badgeClass = "average";
    if (statusText.includes("Old") || statusText.includes("Spoiled")) badgeClass = "spoiled";

    freshnessBadge.className = `status-badge ${badgeClass}`;

    const score = data.quality.scorePercentage;
    scoreText.textContent = `${score}%`;
    scoreCircle.style.background = `conic-gradient(${getStatusColor(badgeClass)} ${score}%, rgba(255, 255, 255, 0.1) 0)`;

    shelfLifeVal.textContent = data.quality.estimatedRemainingShelfLife;
    firmnessVal.textContent = data.quality.firmness;
    defectVal.textContent = data.quality.spotDefectsPercent;

    storageTipsText.textContent = data.storageAdvice;

    const storageHeader = document.getElementById("storageTipsHeader");
    if (storageHeader) storageHeader.textContent = `💡 Storage & Preservation Advice for ${produceName}`;

    const nutritionHeader = document.getElementById("nutritionHeader");
    if (nutritionHeader) nutritionHeader.textContent = `🥗 Nutritional Breakdown for ${produceName} (per 100g)`;

    const benchmarkTitle = document.getElementById("benchmarkTitle");
    if (benchmarkTitle) benchmarkTitle.textContent = `AGMARKNET APMC Rate for ${produceName}`;

    nutritionTags.innerHTML = Object.entries(data.nutrition)
      .map(([k, v]) => `<span class="tag">${capitalize(k)}: ${v}</span>`)
      .join("");

    purchaseItemName.textContent = produceName;
    if (selectedProduceName) {
      selectedProduceName.textContent = currentPlaceName ? `${produceName} near ${currentPlaceName}` : produceName;
    }

    resultCard.classList.remove("hidden");
    resultCard.scrollIntoView({ behavior: "smooth" });
  }

  function getStatusColor(status) {
    if (status === "Fresh" || status.includes("Good")) return "#10b981";
    if (status === "Average") return "#f59e0b";
    return "#ef4444";
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // --- 4. REAL-TIME GPS LOCATION & MAP LOGIC ---
  const geoNotification = document.getElementById("geoNotification");
  const geoNotificationText = document.getElementById("geoNotificationText");
  const retryGeoBtn = document.getElementById("retryGeoBtn");

  if (retryGeoBtn) {
    retryGeoBtn.addEventListener("click", () => {
      detectUserGPS(true);
    });
  }

  // Auto trigger permission request on scroll to storeSection or page load
  let locationRequested = false;

  function triggerLocationOnScroll() {
    if (!locationRequested && storeSection) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !locationRequested) {
            locationRequested = true;
            detectUserGPS();
          }
        });
      }, { threshold: 0.1 });
      observer.observe(storeSection);
    }
  }
  triggerLocationOnScroll();

  purchaseNowBtn.addEventListener("click", () => {
    storeSection.classList.remove("hidden");
    selectedProduceName.textContent = resultProduceName.textContent;
    storeSection.scrollIntoView({ behavior: "smooth" });
    detectUserGPS();
  });

  detectLocationBtn.addEventListener("click", () => detectUserGPS(true));
  radiusSelect.addEventListener("change", fetchStoresAndPrices);

  function detectUserGPS(userInitiated = false) {
    if ("geolocation" in navigator) {
      if (detectLocationBtn) detectLocationBtn.innerHTML = "📍 Locating Live GPS...";
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          if (detectLocationBtn) detectLocationBtn.innerHTML = `📍 GPS Active (${userCoords.lat.toFixed(2)}, ${userCoords.lng.toFixed(2)})`;
          if (geoNotification) geoNotification.classList.add("hidden");
          fetchStoresAndPrices();
        },
        (err) => {
          console.warn("Geolocation fallback active:", err.message);
          if (detectLocationBtn) detectLocationBtn.innerHTML = "📍 Default Location";
          if (geoNotification) {
            geoNotification.classList.remove("hidden");
            if (geoNotificationText) {
              geoNotificationText.textContent = "Location access denied or unavailable. Displaying default center. Please enable location access for accurate 20 KM nearby store results.";
            }
          }
          fetchStoresAndPrices();
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      if (geoNotification) geoNotification.classList.remove("hidden");
      fetchStoresAndPrices();
    }
  }

  async function fetchStoresAndPrices() {
    const radius = radiusSelect ? (radiusSelect.value || 20) : 20;
    try {
      const url = `/api/nearby-stores?lat=${userCoords.lat}&lng=${userCoords.lng}&itemKey=${currentProduceKey}&radius=${radius}&placeName=${encodeURIComponent(currentPlaceName)}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        renderAgmarknetBanner(data.marketPricing.agmarknetBenchmark);
        renderStoreList(data.marketPricing.storePrices, data.stores);
        initLeafletMap(data.userLocation, data.stores);
      }
    } catch (err) {
      console.error("Error fetching stores:", err);
    }
  }

  function renderAgmarknetBanner(benchmark) {
    mandiPriceVal.textContent = benchmark.mandiWholesaleRate;
    mandiTrendVal.textContent = benchmark.trend;
    mandiGradeVal.textContent = benchmark.grade;
  }

  function renderStoreList(storePrices, stores) {
    storesList.innerHTML = "";

    storePrices.forEach((sp) => {
      const matchedStore = stores.find((s) => s.id === sp.storeId) || {};

      const card = document.createElement("div");
      card.className = "store-card";
      card.innerHTML = `
        <div class="store-title">
          <h3>${sp.storeName}</h3>
          <span class="deal-tag">${sp.dealTag}</span>
        </div>
        <div class="store-meta">
          📍 ${sp.distanceKm} km away • ${sp.storeType} • ⭐ ${matchedStore.rating || 4.5} (${matchedStore.reviewsCount || 100}+ reviews)
        </div>
        <div class="store-pricing">
          <div>
            <span class="store-price">${sp.formattedPrice}</span>
            <div class="mandi-diff">${sp.priceSavings}</div>
          </div>
          <span class="status-badge ${sp.inStock ? 'fresh' : 'spoiled'}">${sp.stockStatus}</span>
        </div>
        <button class="btn btn-success btn-block" ${!sp.inStock ? 'disabled' : ''} onclick="openOrderModal('${sp.storeId}', '${escapeQuotes(sp.storeName)}', ${sp.pricePerKg})">
          ${sp.inStock ? '🛍️ Order from Store' : 'Out of Stock'}
        </button>
      `;
      storesList.appendChild(card);
    });
  }

  function escapeQuotes(str) {
    return str.replace(/'/g, "\\'");
  }

  function initLeafletMap(userLoc, stores) {
    if (!leafletMap) {
      leafletMap = L.map("map").setView([userLoc.lat, userLoc.lng], 14);
      L.tileLayer("http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
        attribution: "&copy; Google Maps"
      }).addTo(leafletMap);
    } else {
      leafletMap.setView([userLoc.lat, userLoc.lng], 14);
      mapMarkers.forEach((marker) => leafletMap.removeLayer(marker));
      mapMarkers = [];
    }

    // Custom Pulsing "Your Location / Searched Place" Marker
    const locationIcon = L.divIcon({
      className: "custom-location-marker",
      html: '<div class="pulse-marker">📍</div>',
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    const userMarker = L.marker([userLoc.lat, userLoc.lng], { icon: locationIcon })
      .addTo(leafletMap)
      .bindPopup(`<b>📍 Searched / Live GPS Location</b><br>Lat: ${userLoc.lat.toFixed(4)}, Lng: ${userLoc.lng.toFixed(4)}`)
      .openPopup();

    mapMarkers.push(userMarker);

    stores.forEach((store) => {
      const storeMarker = L.marker([store.latitude, store.longitude])
        .addTo(leafletMap)
        .bindPopup(`<b>${store.name}</b><br>${store.address}<br>Dist: ${store.distanceKm} km`);
      mapMarkers.push(storeMarker);
    });
  }

  // --- 5. MAP PLACE SEARCH & GOOGLE MAP LAYER TOGGLE ---
  const mapSearchInput = document.getElementById("mapSearchInput");
  const mapSearchBtn = document.getElementById("mapSearchBtn");
  const layerGoogleBtn = document.getElementById("layerGoogleBtn");
  const layerOsmBtn = document.getElementById("layerOsmBtn");

  let currentMapLayer = "google";
  let tileLayerGroup = null;

  if (mapSearchBtn && mapSearchInput) {
    mapSearchBtn.addEventListener("click", performPlaceSearch);
    mapSearchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") performPlaceSearch();
    });
  }

  async function performPlaceSearch() {
    const query = mapSearchInput.value.trim();
    if (!query) return;

    mapSearchBtn.disabled = true;
    mapSearchBtn.textContent = "Searching...";

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const results = await res.json();

      if (results && results.length > 0) {
        const place = results[0];
        userCoords = { lat: parseFloat(place.lat), lng: parseFloat(place.lon) };
        currentPlaceName = place.display_name.split(",")[0].trim();

        if (detectLocationBtn) detectLocationBtn.innerHTML = `📍 ${currentPlaceName}`;
        if (selectedProduceName) {
          selectedProduceName.textContent = `${resultProduceName.textContent || 'Produce'} near ${currentPlaceName}`;
        }

        fetchStoresAndPrices();
      } else {
        alert(`No location results found for "${query}". Try searching another city or landmark.`);
      }
    } catch (err) {
      alert("Place search error: " + err.message);
    } finally {
      mapSearchBtn.disabled = false;
      mapSearchBtn.textContent = "Search Place";
    }
  }

  if (layerGoogleBtn && layerOsmBtn) {
    layerGoogleBtn.addEventListener("click", () => {
      currentMapLayer = "google";
      layerGoogleBtn.classList.add("active");
      layerOsmBtn.classList.remove("active");
      switchMapTileLayer();
    });

    layerOsmBtn.addEventListener("click", () => {
      currentMapLayer = "osm";
      layerOsmBtn.classList.add("active");
      layerGoogleBtn.classList.remove("active");
      switchMapTileLayer();
    });
  }

  function switchMapTileLayer() {
    if (!leafletMap) return;
    if (tileLayerGroup) leafletMap.removeLayer(tileLayerGroup);

    if (currentMapLayer === "google") {
      tileLayerGroup = L.tileLayer("http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"],
        attribution: "&copy; Google Maps"
      });
    } else {
      tileLayerGroup = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
      });
    }
    tileLayerGroup.addTo(leafletMap);
  }

  // --- 6. CHECKOUT MODAL & ORDER PROCESSING ---
  window.openOrderModal = (storeId, storeName, pricePerKg) => {
    selectedStoreForOrder = { storeId, storeName, pricePerKg };
    modalStoreName.textContent = storeName;
    modalItemName.textContent = resultProduceName.textContent || "Red Gala Apple";
    modalUnitPrice.textContent = `$${pricePerKg.toFixed(2)} / kg`;
    orderQtyInput.value = 2;
    updateModalTotal();

    const orderSuccessState = document.getElementById("orderSuccessState");
    const checkoutForm = document.getElementById("checkoutForm");
    if (orderSuccessState) orderSuccessState.classList.add("hidden");
    if (checkoutForm) checkoutForm.classList.remove("hidden");
    if (closeOrderModalBtn) closeOrderModalBtn.classList.remove("hidden");

    orderModal.classList.remove("hidden");
  };

  const closeSuccessBtn = document.getElementById("closeSuccessBtn");
  if (closeSuccessBtn) {
    closeSuccessBtn.addEventListener("click", () => {
      orderModal.classList.add("hidden");
    });
  }

  const undoOrderBtn = document.getElementById("undoOrderBtn");
  if (undoOrderBtn) {
    undoOrderBtn.addEventListener("click", () => {
      const orderSuccessState = document.getElementById("orderSuccessState");
      const checkoutForm = document.getElementById("checkoutForm");
      if (orderSuccessState) orderSuccessState.classList.add("hidden");
      if (checkoutForm) checkoutForm.classList.remove("hidden");
      if (closeOrderModalBtn) closeOrderModalBtn.classList.remove("hidden");
    });
  }

  if (closeOrderModalBtn) {
    closeOrderModalBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      orderModal.classList.add("hidden");
    });
  }

  if (orderQtyInput) {
    orderQtyInput.addEventListener("input", updateModalTotal);
  }

  function updateModalTotal() {
    if (!selectedStoreForOrder) return;
    const qty = parseFloat(orderQtyInput.value) || 1;
    const total = qty * selectedStoreForOrder.pricePerKg;
    modalTotalPayable.textContent = `$${total.toFixed(2)}`;
  }

  if (checkoutForm) {
    checkoutForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const confirmBtn = document.getElementById("confirmOrderBtn");
      if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = `⏳ Placing Store Order...`;
      }

      const qty = parseFloat(orderQtyInput.value) || 1;
      const addr = document.getElementById("custAddress").value.trim();
      const pay = document.getElementById("payMethod").value;

      try {
        const res = await fetch("/api/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storeId: selectedStoreForOrder.storeId,
            itemKey: currentProduceKey,
            quantityKg: qty,
            deliveryAddress: addr,
            paymentMethod: pay
          })
        });
        const data = await res.json();
        if (data.success) {
          const orderSuccessState = document.getElementById("orderSuccessState");
          const successOrderDetails = document.getElementById("successOrderDetails");
          if (successOrderDetails) {
            successOrderDetails.textContent = `Order #${data.order.orderId} placed with ${selectedStoreForOrder.storeName} (${qty} kg ${modalItemName.textContent}). Total Paid: $${data.order.totalAmount.toFixed(2)}`;
          }
          if (checkoutForm) checkoutForm.classList.add("hidden");
          if (closeOrderModalBtn) closeOrderModalBtn.classList.add("hidden");
          if (orderSuccessState) orderSuccessState.classList.remove("hidden");
        } else {
          alert("Order error: " + (data.message || "Failed to process order."));
        }
      } catch (err) {
        alert("Order error: " + err.message);
      } finally {
        if (confirmBtn) {
          confirmBtn.disabled = false;
          confirmBtn.innerHTML = `Confirm & Place Store Order`;
        }
      }
    });
  }
});
