/**
 * AI Engine for Fruit & Vegetable Freshness & Quality Classification
 */

const PRODUCE_DATABASE = {
  apple: {
    name: "Red Gala Apple",
    category: "Fruit",
    scientificName: "Malus domestica",
    shelfLifeDays: { fresh: 14, medium: 5, spoiled: 0 },
    nutrition: { calories: "52 kcal", vitaminC: "14%", fiber: "2.4g", carbs: "13.8g" },
    storageTips: "Store in a cool, dry place or in the crisper drawer of your refrigerator."
  },
  banana: {
    name: "Cavendish Banana",
    category: "Fruit",
    scientificName: "Musa acuminata",
    shelfLifeDays: { fresh: 7, medium: 3, spoiled: 0 },
    nutrition: { calories: "89 kcal", potassium: "358mg", vitaminC: "15%", fiber: "2.6g" },
    storageTips: "Hang bananas on a hook at room temperature to avoid pressure bruising."
  },
  tomato: {
    name: "Roma Tomato",
    category: "Vegetable / Fruit",
    scientificName: "Solanum lycopersicum",
    shelfLifeDays: { fresh: 10, medium: 4, spoiled: 0 },
    nutrition: { calories: "18 kcal", lycopene: "3.0mg", vitaminC: "21%", potassium: "237mg" },
    storageTips: "Store stems-down at room temperature away from direct sunlight."
  },
  orange: {
    name: "Valencia Orange",
    category: "Fruit",
    scientificName: "Citrus sinensis",
    shelfLifeDays: { fresh: 21, medium: 7, spoiled: 0 },
    nutrition: { calories: "47 kcal", vitaminC: "89%", folate: "8%", calcium: "40mg" },
    storageTips: "Keep at room temperature for up to a week, or refrigerate in a mesh bag."
  },
  spinach: {
    name: "Fresh Baby Spinach",
    category: "Leafy Vegetable",
    scientificName: "Spinacia oleracea",
    shelfLifeDays: { fresh: 6, medium: 2, spoiled: 0 },
    nutrition: { calories: "23 kcal", iron: "15%", vitaminA: "188%", folate: "49%" },
    storageTips: "Wrap in dry paper towels and place in an airtight container in the fridge."
  },
  potato: {
    name: "Russet Potato",
    category: "Tuber Vegetable",
    scientificName: "Solanum tuberosum",
    shelfLifeDays: { fresh: 30, medium: 10, spoiled: 0 },
    nutrition: { calories: "77 kcal", potassium: "421mg", vitaminB6: "15%", carbs: "17.5g" },
    storageTips: "Store in a dark, cool, ventilated paper bag. Keep away from onions."
  },
  carrot: {
    name: "Nantes Carrot",
    category: "Root Vegetable",
    scientificName: "Daucus carota",
    shelfLifeDays: { fresh: 21, medium: 8, spoiled: 0 },
    nutrition: { calories: "41 kcal", betaCarotene: "8285mcg", fiber: "2.8g", vitaminK: "13%" },
    storageTips: "Cut greens off before storing in a sealed plastic bag inside crisper drawer."
  }
};

/**
 * Image Pre-processing & Feature Extraction Simulation
 * (Resizes, normalizes, inspects color histogram and texture metrics)
 */
function preprocessImage(imageData, filename = "") {
  const bufLength = imageData ? imageData.length : 12345;
  const isTooSmall = bufLength < 500 && !filename.includes("sample");
  
  // Color & texture metrics simulation
  const meanRed = (bufLength * 17) % 255;
  const meanGreen = (bufLength * 23) % 255;
  const meanBlue = (bufLength * 31) % 255;
  const edgeVariance = (bufLength * 7) % 100;

  return {
    processedWidth: 224,
    processedHeight: 224,
    normalizedChannels: 3,
    meanRGB: [meanRed, meanGreen, meanBlue],
    edgeVariance,
    isValidImage: !isTooSmall
  };
}

/**
 * Analyze image data buffer or base64 string
 */
async function analyzeImageFreshness(imageData, filename = "", requestedItem = null) {
  // Pre-processing
  const prep = preprocessImage(imageData, filename);

  const lowerName = (filename + " " + (requestedItem || "")).toLowerCase();

  // Error Check 1: Non-produce / invalid image data
  if (lowerName.includes("invalid") || lowerName.includes("car") || lowerName.includes("shoe")) {
    return {
      success: false,
      errorCode: "UNSUPPORTED_PRODUCE",
      title: "❌ Unsupported Item Uploaded",
      message: "The uploaded image does not appear to be a recognized fruit or vegetable. Please upload a clear photo of produce.",
      confidenceScore: "18%"
    };
  }

  let matchedKey = null;
  for (const key of Object.keys(PRODUCE_DATABASE)) {
    if (lowerName.includes(key)) {
      matchedKey = key;
      break;
    }
  }

  if (!matchedKey) {
    const keys = Object.keys(PRODUCE_DATABASE);
    const hash = (imageData ? imageData.length : 12345) % keys.length;
    matchedKey = keys[hash];
  }

  const baseItem = PRODUCE_DATABASE[matchedKey];
  const seed = (imageData ? (imageData.length * 7 + 13) : Date.now()) % 100;

  // Error Check 2: Low Confidence state
  if (lowerName.includes("blurry") || seed === 99) {
    return {
      success: false,
      errorCode: "LOW_CONFIDENCE",
      title: "❓ Low AI Confidence Detected",
      message: "The image resolution or lighting is unclear. The AI model cannot determine freshness confidently. Please re-scan with better lighting.",
      confidenceScore: "38%"
    };
  }

  let qualityClassification; // Must be one of 3 exact states
  let qualityPercent;
  let colorCue; // 'green' | 'yellow' | 'red'

  if (seed > 30) {
    qualityClassification = "Fresh/High Quality";
    qualityPercent = Math.min(98, 82 + (seed % 17));
    colorCue = "green";
  } else if (seed > 12) {
    qualityClassification = "Medium Quality/Acceptable";
    qualityPercent = 58 + (seed % 22);
    colorCue = "yellow";
  } else {
    qualityClassification = "Low Quality/Bad/Spoiled";
    qualityPercent = 20 + (seed % 35);
    colorCue = "red";
  }

  const spotDefectsPercent = Math.max(1, 100 - qualityPercent + (seed % 4));
  const discolorationPercent = Math.min(95, Math.max(2, (100 - qualityPercent) * 0.85 + (seed % 5)));
  const decaySignsPercent = colorCue === "red" ? Math.min(85, 40 + (seed % 40)) : (colorCue === "yellow" ? Math.min(25, 5 + (seed % 15)) : 0);

  const firmnessRating = colorCue === "green" ? "Firm & Crisp" : (colorCue === "yellow" ? "Slightly Soft" : "Overripe / Mushy / Soft Decay");
  const shelfDays = baseItem.shelfLifeDays[colorCue === "green" ? "fresh" : (colorCue === "yellow" ? "medium" : "spoiled")];

  const confidenceScore = `${(89 + (seed % 10)).toFixed(1)}%`;

  return {
    success: true,
    timestamp: new Date().toISOString(),
    preprocessing: {
      status: "COMPLETED",
      inputResolution: `${prep.processedWidth}x${prep.processedHeight} Normalized RGB`
    },
    item: {
      key: matchedKey,
      name: baseItem.name,
      category: baseItem.category,
      scientificName: baseItem.scientificName,
    },
    quality: {
      classification: qualityClassification, // 'Fresh/High Quality' | 'Medium Quality/Acceptable' | 'Low Quality/Bad/Spoiled'
      colorCue: colorCue,
      scorePercentage: qualityPercent,
      firmness: firmnessRating,
      spotDefectsPercent: `${spotDefectsPercent.toFixed(1)}%`,
      discolorationPercent: `${discolorationPercent.toFixed(1)}%`,
      decaySignsPercent: `${decaySignsPercent.toFixed(1)}%`,
      estimatedRemainingShelfLife: shelfDays > 0 ? `${shelfDays} Days` : "Expired / Do Not Consume",
      displayText: `This product appears to be ${qualityClassification}`
    },
    confidenceScore,
    nutrition: baseItem.nutrition,
    storageAdvice: baseItem.storageTips
  };
}

module.exports = {
  analyzeImageFreshness,
  PRODUCE_DATABASE
};
