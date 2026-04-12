const mongoose = require("mongoose");
const Farm = require("../models/Farm");
const Crop = require("../models/Crop");
const Expense = require("../models/Expense");
const Yield = require("../models/Yield");
const ResourceUsage = require("../models/ResourceUsage");
const response = require("../utils/responseHandler");
const Groq = require("groq-sdk");
const axios = require("axios");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });


// 1. Get Dashboard Overview
const getOverview = async (req, res) => {
  try {
    const farmerId = req.user.userId;

    if (!farmerId) {
        return response(res, 401, "User ID not found in token");
    }

    const fId = new mongoose.Types.ObjectId(farmerId);

    // Fetch basic stats
    const farm = await Farm.findOne({ farmerId: fId });
    const activeCrops = await Crop.find({ farmerId: fId, status: "Active" });
    
    const totalExpenses = await Expense.aggregate([
      { $match: { farmerId: fId } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    
    const totalRevenue = await Yield.aggregate([
      { $match: { farmerId: fId } },
      { $group: { _id: null, total: { $sum: "$sellingPrice" } } }
    ]);

    const profit = (totalRevenue[0]?.total || 0) - (totalExpenses[0]?.total || 0);
    const efficiencyScore = farm ? 85 : 0;

    return response(res, 200, "Overview data fetched", {
      totalLand: farm ? `${farm.landSize} ${farm.landUnit}` : null,
      activeCropsCount: activeCrops.length,
      netProfit: profit,
      healthScore: efficiencyScore,
      hasData: !!farm
    });
  } catch (error) {
    console.error("Overview Error:", error);
    return response(res, 500, "Error fetching overview", error.message);
  }
};

// 2. Get Financial Trends
const getFinancialTrends = async (req, res) => {
  try {
    const farmerId = req.user.userId;
    const fId = new mongoose.Types.ObjectId(farmerId);

    const expensesByMonth = await Expense.aggregate([
      { $match: { farmerId: fId } },
      {
        $group: {
          _id: { $month: "$date" },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const revenueByMonth = await Yield.aggregate([
      { $match: { farmerId: fId } },
      {
        $group: {
          _id: { $month: "$harvestDate" },
          total: { $sum: "$sellingPrice" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const trends = months.map((m, i) => {
      const exp = expensesByMonth.find(e => e._id === i + 1)?.total || 0;
      const rev = revenueByMonth.find(r => r._id === i + 1)?.total || 0;
      return { month: m, income: rev, expenses: exp };
    });

    return response(res, 200, "Trends fetched", trends);
  } catch (error) {
    return response(res, 500, "Trends Error", error.message);
  }
};

// 3. Save Farm Data
const saveFarmData = async (req, res) => {
  try {
    const farmerId = req.user.userId;
    const { landSize, landUnit, location, soilType } = req.body;
    const fId = new mongoose.Types.ObjectId(farmerId);

    let farm = await Farm.findOne({ farmerId: fId });
    if (farm) {
      farm.landSize = landSize;
      farm.landUnit = landUnit;
      farm.location = location;
      farm.soilType = soilType;
      await farm.save();
    } else {
      farm = new Farm({ farmerId: fId, landSize, landUnit, location, soilType });
      await farm.save();
    }

    return response(res, 200, "Farm data saved", farm);
  } catch (error) {
    return response(res, 500, "Error saving farm", error.message);
  }
};


// 4. Add Expense
const addExpense = async (req, res) => {
  try {
    const farmerId = req.user.userId;
    const { cropId, category, amount, date, description } = req.body;
    const expense = new Expense({ farmerId, cropId, category, amount, date, description });
    await expense.save();
    return response(res, 201, "Expense added", expense);
  } catch (error) {
    return response(res, 500, "Error adding expense", error.message);
  }
};

// 5. Add Crop
const addCrop = async (req, res) => {
  try {
    const farmerId = req.user.userId;
    const { name, variety, plantedAcreage, plantingDate } = req.body;
    const crop = new Crop({ farmerId, name, variety, plantedAcreage, plantingDate });
    await crop.save();
    return response(res, 201, "Crop added", crop);
  } catch (error) {
    return response(res, 500, "Error adding crop", error.message);
  }
};

// 6. Get Yield Analytics
const getYieldAnalytics = async (req, res) => {
  try {
    const farmerId = req.user.userId;
    const yields = await Yield.find({ farmerId }).populate('cropId');
    
    const yieldStats = yields.reduce((acc, curr) => {
      const name = curr.cropId?.name || "Unknown";
      if (!acc[name]) acc[name] = { crop: name, current: 0, historical: 0 };
      acc[name].current += curr.quantity;
      return acc;
    }, {});

    return response(res, 200, "Yield analytics fetched", Object.values(yieldStats));
  } catch (error) {
    return response(res, 500, "Yield Error", error.message);
  }
};

// 7. Get Resource Usage Breakdown
const getResources = async (req, res) => {
  try {
    const farmerId = req.user.userId;
    const fId = new mongoose.Types.ObjectId(farmerId);
    
    const resources = await ResourceUsage.aggregate([
      { $match: { farmerId: fId } },
      { $group: { _id: "$type", value: { $sum: "$quantity" } } }
    ]);

    const formatted = resources.map(r => ({
      name: r._id,
      value: r.value,
      color: r._id === 'Water' ? '#0ea5e9' : r._id === 'Fertilizer' ? '#84cc16' : '#f59e0b'
    }));

    return response(res, 200, "Resources fetched", formatted);
  } catch (error) {
    return response(res, 500, "Resource Error", error.message);
  }
};

// 8. Get AI-Powered Insights
const getAIInsights = async (req, res) => {
  try {
    const farmerId = req.user.userId;
    if (!farmerId) return response(res, 401, "User ID not found");
    const fId = new mongoose.Types.ObjectId(farmerId);

    // 1. Fetch Data
    const farm = await Farm.findOne({ farmerId: fId });
    const crops = await Crop.find({ farmerId: fId, status: "Active" });
    const expenses = await Expense.find({ farmerId: fId });
    const yields = await Yield.find({ farmerId: fId }).sort({ harvestDate: -1 }).limit(5);
    const resources = await ResourceUsage.find({ farmerId: fId });

    // 2. Fetch Weather
    let weatherData = { current: "N/A", forecast: "N/A" };
    if (farm && farm.location) {
      try {
        const geoRes = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(farm.location)}&count=1&language=en&format=json`);
        if (geoRes.data.results && geoRes.data.results.length > 0) {
          const { latitude, longitude } = geoRes.data.results[0];
          const weatherRes = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&daily=temperature_2m_max&timezone=auto`);
          weatherData.current = `${weatherRes.data.current.temperature_2m}°C, Code: ${weatherRes.data.current.weather_code}`;
          weatherData.forecast = `Max Temp: ${weatherRes.data.daily.temperature_2m_max[0]}°C`;
        }
      } catch (e) {
        console.error("Weather fetch failed for insights", e.message);
      }
    }

    // 3. Structure JSON for Groq
    const inputPayload = {
      farmer: {
        location: farm?.location || "Unknown",
        landSize: farm ? `${farm.landSize} ${farm.landUnit}` : "Unknown"
      },
      crops: crops.map(c => ({
        name: c.name,
        variety: c.variety,
        stage: calculateCropStage(c.plantingDate, c.expectedHarvestDate),
        sowingDate: c.plantingDate
      })),
      expenses: {
        fertilizer: expenses.filter(e => e.category === 'Fertilizer').reduce((a, b) => a + b.amount, 0),
        pesticide: expenses.filter(e => e.category === 'Pesticide').reduce((a, b) => a + b.amount, 0),
        labor: expenses.filter(e => e.category === 'Labor').reduce((a, b) => a + b.amount, 0),
        irrigation: expenses.filter(e => e.category === 'Irrigation').reduce((a, b) => a + b.amount, 0)
      },
      yield: {
        expected: "N/A",
        previous: yields.length > 0 ? `${yields[0].quantity} ${yields[0].unit}` : "N/A"
      },
      resources: {
        waterUsage: resources.filter(r => r.type === 'Water').reduce((a, b) => a + b.quantity, 0),
        fertilizerUsage: resources.filter(r => r.type === 'Fertilizer').reduce((a, b) => a + b.quantity, 0),
        pesticideUsage: resources.filter(r => r.type === 'Pesticide').reduce((a, b) => a + b.quantity, 0)
      },
      weather: weatherData
    };

    // 4. Call Groq
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a professional Agriculture AI analyst for the "Kisan Mithr" platform. 
          Your goal is to provide data-driven insights based ONLY on the provided farmer data.
          STRICT RULES:
          1. NO market price suggestions, Mandi prices, or market-based predictions.
          2. Focus ONLY on crop health, resource optimization, risk mitigation, and cost savings.
          3. Return the response in STRICT JSON format as specified.
          4. Output MUST be a single JSON object.
          
          REQUIRED RESPONSE JSON SCHEMA:
          {
            "priorityAlerts": [
              { "title": "String", "description": "String", "severity": "High/Medium/Low", "confidence": "0-100" }
            ],
            "optimizationSuggestions": [
              { "title": "String", "description": "String", "severity": "Medium", "confidence": "0-100" }
            ],
            "riskPredictions": [
              { "title": "String", "description": "String", "severity": "High", "confidence": "0-100" }
            ],
            "costSavingTips": [
              { "title": "String", "description": "String", "severity": "Low", "confidence": "0-100" }
            ]
          }`
        },
        {
          role: "user",
          content: JSON.stringify(inputPayload)
        }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content);

    return response(res, 200, "AI Insights generated", {
      insights: aiResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("AI Insights Error:", error);
    return response(res, 500, "Error generating AI insights", error.message);
  }
};

// Helper to calculate crop stage
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
  
  if (progress < 15) return "Early Growth / Seedling";
  if (progress < 40) return "Vegetative Stage";
  if (progress < 70) return "Flowering / Reproductive";
  if (progress < 95) return "Maturation Stage";
  return "Ready for Harvest";
};

// 9. Get Growth Scenarios
const getGrowthScenarios = async (req, res) => {
  try {
    const farmerId = req.user.userId;
    const fId = new mongoose.Types.ObjectId(farmerId);

    const farm = await Farm.findOne({ farmerId: fId });
    const yields = await Yield.find({ farmerId: fId }).populate('cropId');
    const expenses = await Expense.find({ farmerId: fId });

    if (!farm) {
      return response(res, 200, "Farm profile missing", { scenarios: [], hasData: false });
    }

    // If no historical data, we can still simulate based on farm location/soil
    const hasHistory = yields.length > 0 && expenses.length > 0;


    // Aggregate Historical Performance by Crop Name
    const cropHistory = {};
    yields.forEach(y => {
      const name = y.cropId?.name || "Unknown";
      if (!cropHistory[name]) cropHistory[name] = { revenue: 0, quantity: 0, area: 0, cost: 0, count: 0 };
      cropHistory[name].revenue += y.sellingPrice || 0;
      cropHistory[name].quantity += y.quantity || 0;
      cropHistory[name].area += y.cropId?.plantedAcreage || 0;
      cropHistory[name].count++;
    });

    expenses.forEach(e => {
      // Try to find the crop name from the cropId or just general categories
      // For simplicity in this simulation, we'll map expenses to crop history if cropId matches
      const crop = yields.find(y => y.cropId?._id.toString() === e.cropId?.toString());
      if (crop) {
        const name = crop.cropId?.name;
        if (cropHistory[name]) cropHistory[name].cost += e.amount;
      }
    });

    const historicalStats = Object.keys(cropHistory).map(name => ({
      name,
      avgYieldPerAcre: cropHistory[name].area > 0 ? (cropHistory[name].quantity / cropHistory[name].area).toFixed(2) : 0,
      avgSellingPrice: cropHistory[name].quantity > 0 ? (cropHistory[name].revenue / cropHistory[name].quantity).toFixed(2) : 0,
      avgCostPerAcre: cropHistory[name].area > 0 ? (cropHistory[name].cost / cropHistory[name].area).toFixed(2) : 0,
      avgProfitPerAcre: cropHistory[name].area > 0 ? ((cropHistory[name].revenue - cropHistory[name].cost) / cropHistory[name].area).toFixed(2) : 0,
    }));    // 4. Fetch Weather Context (with defaults for missing location)
    let weatherData = "No location provided for terminal weather analysis.";
    const userLocation = farm?.location || "India (General)";
    const userSoil = farm?.soilType || "Alluvial/Mixed";

    if (farm?.location) {
      try {
        const geoRes = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(farm.location)}&count=1&language=en&format=json`);
        if (geoRes.data.results?.length > 0) {
          const { latitude, longitude } = geoRes.data.results[0];
          const weatherRes = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,precipitation_sum&timezone=auto`);
          weatherData = `Max Temp: ${weatherRes.data.daily.temperature_2m_max[0]}°C, Rain: ${weatherRes.data.daily.precipitation_sum[0]}mm`;
        }
      } catch (e) { 
        console.error("Weather error:", e.message); 
      }
    }

    // Call Groq to generate scenarios
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert Agricultural Growth Planner for "Kisan Mithr". 
          Your goal is to suggest 2-3 best upcoming crop options for a farmer.
          
          INPUTS PROVIDED:
          1. Historical Performance: ${historicalStats.length > 0 ? JSON.stringify(historicalStats) : "NO historical data available for this specific farm yet."}
          2. Physical Context: Location (${userLocation}), Soil Type (${userSoil}), and Land Size (${farm.landSize} ${farm.landUnit}).
          3. Environmental Context: Current weather forecast (${weatherData}).
          
          STRICT RULES:
          1. If "Historical Performance" is missing, use your agricultural knowledge to suggest the most profitable and stable crops specifically for ${userLocation} with ${userSoil} soil.
          2. Provide realistic profit estimates (range in ₹) based on regional averages for ${userLocation}.
          3. No generic placeholder text. Be specific about varieties suitable for these conditions.
          4. Return as JSON object with 'scenarios' array.
          5. Scenario schema: { cropName, estimatedProfit, duration, riskLevel (High/Medium/Low), confidenceScore (0-100), reasoning }`
        },
        {
          role: "user",
          content: `Generate growth planning scenarios for a ${farm.landSize} ${farm.landUnit} farm in ${userLocation} with ${userSoil} soil. Historical data: ${historicalStats.length > 0 ? "Provided" : "None"}.`
        }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const aiScenarios = JSON.parse(completion.choices[0].message.content);

    return response(res, 200, "Scenarios generated", {
        scenarios: aiScenarios.scenarios || [],
        hasData: true,
        timestamp: new Date().toISOString()
    });


  } catch (error) {
    console.error("Growth Scenario Error:", error);
    return response(res, 500, "Error generating growth scenarios", error.message);
  }
};

// 10. Get ROI Analysis
const getROIStats = async (req, res) => {
  try {
    const farmerId = req.user.userId;
    const fId = new mongoose.Types.ObjectId(farmerId);

    const expenses = await Expense.aggregate([
      { $match: { farmerId: fId } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
    ]);

    const revenue = await Yield.aggregate([
      { $match: { farmerId: fId } },
      { $group: { _id: null, total: { $sum: "$sellingPrice" } } }
    ]);

    const totalCost = expenses[0]?.total || 0;
    const totalRev = revenue[0]?.total || 0;
    const avgProfit = totalRev - totalCost;
    
    const roi = totalCost > 0 ? ((avgProfit / totalCost) * 100).toFixed(1) : 0;

    return response(res, 200, "ROI analysis fetched", {
        targetROI: (parseFloat(roi) + 5).toFixed(1), // Target 5% improvement
        suggestedInvestment: (totalCost / (expenses[0]?.count || 1) * 1.1).toFixed(0), // Avg expense + 10%
        paybackPeriod: totalRev > 0 ? Math.ceil((totalCost / (totalRev / 12))) : 0, // Months
        currentROI: roi
    });

  } catch (error) {
    return response(res, 500, "ROI Stats Error", error.message);
  }
};

// 11. Custom Growth Simulation
const simulateGrowth = async (req, res) => {
  try {
    const farmerId = req.user.userId;
    const { cropName, area } = req.body;
    const fId = new mongoose.Types.ObjectId(farmerId);

    if (!cropName || !area) {
        return response(res, 400, "Crop name and area are required for simulation");
    }

    const farm = await Farm.findOne({ farmerId: fId });
    if (!farm) {
      return response(res, 200, "Farm profile missing", { scenarios: [], hasData: false });
    }

    const yields = await Yield.find({ farmerId: fId }).populate('cropId');
    const expenses = await Expense.find({ farmerId: fId });

    // Aggregate Historical Context
    const cropHistory = {};
    yields.forEach(y => {
      const name = y.cropId?.name || "Unknown";
      if (!cropHistory[name]) cropHistory[name] = { revenue: 0, cost: 0, area: 0 };
      cropHistory[name].revenue += y.sellingPrice || 0;
      cropHistory[name].area += y.cropId?.plantedAcreage || 0;
    });

    // Fetch Weather Context
    let weatherData = "N/A";
    if (farm?.location) {
      try {
        const geoRes = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(farm.location)}&count=1&language=en&format=json`);
        if (geoRes.data.results?.length > 0) {
          const { latitude, longitude } = geoRes.data.results[0];
          const weatherRes = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,precipitation_sum&timezone=auto`);
          weatherData = `Forecast Max: ${weatherRes.data.daily.temperature_2m_max[0]}°C, Prec: ${weatherRes.data.daily.precipitation_sum[0]}mm`;
        }
      } catch (e) { console.error("Weather error:", e.message); }
    }

    const userLocation = farm?.location || "India (General)";
    const userSoil = farm?.soilType || "Alluvial/Mixed";

    // Call Groq to generate a specific simulation
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert Agricultural Simulator.
          The user wants to simulate a harvest for a SPECIFIC crop they chose.
          
          CROP TO SIMULATE: ${cropName}
          LAND AREA: ${area} ${farm.landUnit}
          
          PHYSICAL CONTEXT: Location (${userLocation}), Soil Type (${userSoil}).
          WEATHER CONTEXT: ${weatherData}
          
          TASK:
          1. Predict the outcome for ${cropName} on ${area} ${farm.landUnit}.
          2. Use your knowledge of typical yields and costs for this crop in ${userLocation}.
          3. Return a SINGLE scenario object in JSON.
          
          RESPONSE SCHEMA:
          {
            "cropName": "String",
            "estimatedProfit": "String (e.g. ₹XXXk)",
            "duration": "String (e.g. 120 days)",
            "riskLevel": "High/Medium/Low",
            "confidenceScore": "0-100",
            "reasoning": "Detailed technical reason for this outcome"
          }`
        },
        {
          role: "user",
          content: `Simulate the harvest for ${cropName} on my ${area} ${farm.landUnit} farm.`
        }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const aiResult = JSON.parse(completion.choices[0].message.content);

    return response(res, 200, "Simulation complete", {
        scenario: aiResult,
        timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Simulation Error:", error);
    return response(res, 500, "Error running simulation", error.message);
  }
};

module.exports = {
  getOverview,
  getFinancialTrends,
  saveFarmData,
  addExpense,
  addCrop,
  getYieldAnalytics,
  getResources,
  getAIInsights,
  getGrowthScenarios,
  getROIStats,
  simulateGrowth
};



