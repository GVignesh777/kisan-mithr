const mongoose = require("mongoose");
const Farm = require("../models/Farm");
const Crop = require("../models/Crop");
const Notification = require("../models/Notification");
const response = require("../utils/responseHandler");
const Groq = require("groq-sdk");
const axios = require("axios");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Helper to calculate crop stage (copied from analyticsController)
const calculateCropStage = (plantingDate, expectedHarvestDate) => {
  if (!plantingDate) return "Unknown";
  const start = new Date(plantingDate);
  const now = new Date();
  
  if (!expectedHarvestDate) {
    const weeks = Math.floor((now - start) / (7 * 24 * 60 * 60 * 1000));
    return `Week ${weeks}`;
  }
  
  const end = new Date(expectedHarvestDate);
  const total = end - start;
  const elapsed = now - start;
  const progress = (elapsed / total) * 100;
  
  if (progress < 15) return "Sowing / Early Growth";
  if (progress < 40) return "Growing Stage";
  if (progress < 75) return "Maturing / Flowering";
  return "Ready for Harvest";
};

const getPlatformOverview = async (req, res) => {
  try {
    const farmerId = req.user.userId;
    const fId = new mongoose.Types.ObjectId(farmerId);

    // 1. Fetch Farm & Crops
    const farm = await Farm.findOne({ farmerId: fId });
    const activeCrops = await Crop.find({ farmerId: fId, status: "Active" });

    // 2. Check if data is missing
    if (!farm || !farm.location || !farm.landSize) {
      return response(res, 200, "Incomplete profile", { 
        requiresAction: true, 
        missingFields: ["location", "landSize", "soilType"] 
      });
    }

    // 3. Process Summary Data
    const processedCrops = activeCrops.map(c => ({
      name: c.name,
      stage: calculateCropStage(c.plantingDate, c.expectedHarvestDate),
      plantedArea: `${c.plantedAcreage} ${farm.landUnit || 'Acres'}`,
      isUrgent: false // Can be expanded with health logic
    }));

    // 4. Fetch Notifications for the last 48 hours
    const recentNotifs = await Notification.find({
       $or: [
           { region: farm.location },
           { region: "Global" },
           { region: { $exists: false } }
       ]
    }).sort({ createdAt: -1 }).limit(5);

    // 5. Groq AI Intelligence (Best Crop & Tips)
    let aiInsights = { 
        bestCrop: "Calculating...", 
        reasoning: "Fetching AI guidance...", 
        tips: ["Ensuring soil health", "Monitoring moisture"] 
    };

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a professional Agriculture AI for Kisan Mithr. 
                    Based on the farmer's data, suggest the BEST crop to grow THIS SEASON and provide 3 actionable farming tips.
                    Keep tips short (under 15 words). Provide reasoning based on location and soil.`
                },
                {
                    role: "user",
                    content: `Location: ${farm.location}, Soil: ${farm.soilType || 'Mixed'}, Land: ${farm.landSize} ${farm.landUnit}. 
                    Active Crops: ${activeCrops.map(c => c.name).join(", ")}. 
                    Current Season: ${new Date().toLocaleDateString('en-US', { month: 'long' })}.`
                }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });

        // Expected JSON: { "bestCrop": "", "reasoning": "", "tips": ["", "", ""] }
        aiInsights = JSON.parse(completion.choices[0].message.content);
    } catch (aiErr) {
        console.error("AI Insights Error:", aiErr.message);
    }

    // 6. Return Final Overview
    return response(res, 200, "Platform overview fetched", {
      requiresAction: false,
      farmSummary: {
        totalLand: `${farm.landSize} ${farm.landUnit}`,
        location: farm.location,
        activeCropsCount: activeCrops.length,
        processedCrops
      },
      aiGuidance: aiInsights,
      alerts: recentNotifs.map(n => ({
        id: n._id,
        title: n.title,
        message: n.message,
        type: n.senderName === 'Admin' ? 'emergency' : 'info',
        time: n.createdAt
      }))
    });

  } catch (error) {
    console.error("Overview Error:", error);
    return response(res, 500, "Error fetching platform overview", error.message);
  }
};

module.exports = {
  getPlatformOverview
};
