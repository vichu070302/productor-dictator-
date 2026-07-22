/**
 * AI Engine - Gemini Vision Freshness Detection
 */
require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

if (!process.env.GEMINI_API_KEY) {
    console.log("Gemini API Key missing");
}

const PRODUCE_DATABASE = {
    apple: {
        name: "Apple",
        category: "Fruit",
        scientificName: "Malus domestica",
        nutrition: {
            calories: "52 kcal",
            vitaminC: "14%",
            fiber: "2.4 g"
        },
        storageTips: "Store inside a refrigerator."
    },

    banana: {
        name: "Banana",
        category: "Fruit",
        scientificName: "Musa acuminata",
        nutrition: {
            calories: "89 kcal",
            potassium: "358 mg",
            fiber: "2.6 g"
        },
        storageTips: "Store at room temperature."
    },

    tomato: {
        name: "Tomato",
        category: "Vegetable",
        scientificName: "Solanum lycopersicum",
        nutrition: {
            calories: "18 kcal",
            vitaminC: "21%"
        },
        storageTips: "Store away from direct sunlight."
    },

    orange: {
        name: "Orange",
        category: "Fruit",
        scientificName: "Citrus sinensis",
        nutrition: {
            calories: "47 kcal",
            vitaminC: "89%"
        },
        storageTips: "Keep refrigerated."
    },

    potato: {
        name: "Potato",
        category: "Vegetable",
        scientificName: "Solanum tuberosum",
        nutrition: {
            calories: "77 kcal"
        },
        storageTips: "Store in a cool dark place."
    },

    spinach: {
        name: "Spinach",
        category: "Leafy Vegetable",
        scientificName: "Spinacia oleracea",
        nutrition: {
            calories: "23 kcal",
            iron: "15%"
        },
        storageTips: "Keep refrigerated."
    },

    carrot: {
        name: "Carrot",
        category: "Vegetable",
        scientificName: "Daucus carota",
        nutrition: {
            calories: "41 kcal"
        },
        storageTips: "Store inside refrigerator."
    }
};

function detectProduce(name) {

    const n = name.toLowerCase();

    for (const key of Object.keys(PRODUCE_DATABASE)) {

        if (n.includes(key)) {
            return key;
        }

    }

    return "apple";
}

async function analyzeImageFreshness(imageData, filename = "", requestedItem = null) {

    try {

        if (!imageData) {
            return {
                success: false,
                error: "No image received"
            };
        }


        // Convert image buffer to Base64
        const base64Image = imageData.toString("base64");


        const prompt = `
You are an expert agricultural AI quality inspector.

Analyze this fruit or vegetable image.

Return ONLY JSON.
Do not add markdown.
Do not add explanations.

JSON format:

{
 "productName":"",
 "category":"",
 "freshnessStatus":"",
 "freshnessScore":0,
 "shelfLife":"",
 "firmness":"",
 "defects":"",
 "storageAdvice":"",
 "confidence":0
}

Rules:

freshnessStatus must be one of:
- Fresh
- Medium
- Spoiled

freshnessScore must be between 0 and 100.

Analyze:
- Color
- Texture
- Spots
- Damage
- Ripeness
- Overall quality
`;


        const result = await ai.models.generateContent({

            model: "gemini-2.5-flash",

          contents: [
    {
        role: "user",
        parts: [
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: base64Image
                }
            },
            {
                text: prompt
            }
        ]
    }
]

        });


        let aiText = result.text;


        // Remove possible markdown formatting
        aiText = aiText
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();



        const aiData = JSON.parse(aiText);



        const produceKey = detectProduce(
            aiData.productName
        );


        const databaseItem = PRODUCE_DATABASE[produceKey];



        return {

            success: true,


            timestamp: new Date().toISOString(),


            item: {

                key: produceKey,

                name: aiData.productName ||
                    databaseItem.name,

                category:
                    aiData.category ||
                    databaseItem.category,

                scientificName:
                    databaseItem.scientificName

            },


            quality: {

                classification:
                    aiData.freshnessStatus,


                scorePercentage:
                    aiData.freshnessScore,


                firmness:
                    aiData.firmness,


                spotDefectsPercent:
                    aiData.defects,


                discolorationPercent:
                    "AI detected",


                decaySignsPercent:
                    "AI detected",


                estimatedRemainingShelfLife:
                    aiData.shelfLife,


                displayText:
                    `This product appears to be ${aiData.freshnessStatus}`

            },


            confidenceScore:
                aiData.confidence + "%",


            nutrition:
                databaseItem.nutrition,


            storageAdvice:
                aiData.storageAdvice ||
                databaseItem.storageTips

        };


    }

    catch(error) {


        console.error(
            "Gemini AI Error:",
            error
        );


        return {

            success:false,

            error:
                error.message

        };

    }

}

module.exports = {
    analyzeImageFreshness,
    PRODUCE_DATABASE
};