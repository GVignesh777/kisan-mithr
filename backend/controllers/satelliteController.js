const nasaService = require("../services/nasaService");
const axios = require("axios");

/**
 * Fetches high-resolution imagery metadata from NASA
 */
const getNasaImagery = async (req, res) => {
  try {
    const { bbox, dateStart, dateEnd } = req.body;
    // Default bbox for Hyderabad if not provided: [minLon, minLat, maxLon, maxLat]
    const defaultBbox = [78.4, 17.3, 78.5, 17.4];

    const scenes = await nasaService.searchImagery(
      bbox || defaultBbox,
      dateStart || '2023-01-01T00:00:00Z',
      dateEnd || '2023-12-31T23:59:59Z'
    );

    res.json({ status: "success", scenes });
  } catch (error) {
    console.error("NASA Imagery Error:", error.message);
    res.status(500).json({ status: "error", message: "Failed to fetch NASA satellite data." });
  }
};

/**
 * Fetches NASA Astronomy Picture of the Day
 */
const getNasaApod = async (req, res) => {
  try {
    const apod = await nasaService.getApod();
    res.json({ status: "success", data: apod });
  } catch (error) {
    console.error("NASA APOD Error:", error.message);
    res.status(500).json({ status: "error", message: "Failed to fetch NASA APOD." });
  }
};

/**
 * Generates a scientific satellite health diagnostic report
 */
const analyzeSatelliteIndices = async (req, res) => {
  try {
    const { indices, cropName, language, source } = req.body;

    if (!indices) {
      return res.status(400).json({ error: "Missing index data for analysis." });
    }

    const { ndvi, evi, moisture, temp, rain, humidity, solar } = indices;

    let targetLanguage = "English";
    if (language === "hi") targetLanguage = "Hindi";
    if (language === "te") targetLanguage = "Telugu";

    let dataContext = "";
    if (source === "NASA POWER") {
        dataContext = `
- **Temperature:** ${temp || "N/A"}°C
- **Rainfall:** ${rain || "N/A"}mm
- **Relative Humidity:** ${humidity || "N/A"}%
- **Solar Radiation:** ${solar || "N/A"} W/m²
`;
    } else {
        dataContext = `
- **NDVI:** ${ndvi?.mean || ndvi || "N/A"}
- **EVI:** ${evi?.mean || evi || "N/A"}
- **Moisture:** ${moisture?.mean || moisture || "N/A"}
`;
    }

    const prompt = `
You are a Satellite Agronomy and Climate Expert. Analyze the following environmental/satellite data from **${source || 'Agri-Sensors'}** for a **${cropName || "General Crop"}** farm:

${dataContext}

**Task:**
Provide a professional "Command Center" style diagnostic report including:
1. **Executive Summary**: Overall farm status.
2. **Climate Influence**: How the current weather parameters affecting the crop.
3. **Growth Prediction**: Assessment based on solar and moisture.
4. **Actionable Recommendations**.

Respond in **${targetLanguage}**. Use structured headers.
`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "You are a professional satellite agronomy expert." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ report: response.data.choices[0].message.content });
  } catch (error) {
    console.error("Satellite Analysis Error:", error.message);
    res.status(500).json({ error: "Failed to generate satellite diagnostic report." });
  }
};

/**
 * Fetches aggregated satellite and climate data for a specific location
 */
const getSatelliteData = async (req, res) => {
  try {
    const { lat, lon, dateStart, dateEnd } = req.body;
    
    if (!lat || !lon) {
      return res.status(400).json({ status: "error", message: "Latitude and Longitude are required." });
    }

    const start = dateStart || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const end = dateEnd || new Date().toISOString().split('T')[0];

    // Start POWER request (essential)
    const powerPromise = nasaService.getPowerData(lat, lon, start, end);
    
    // Generate high-reliability GIBS imagery URL (Instant, no API call needed to construct)
    const gibsUrl = nasaService.getGibsImageryUrl(lat, lon, end);
    
    // Attempt high-resolution Landsat imagery if desired, but don't block
    let landsatImagery = null;
    try {
        // Run Landsat fetch with a very short timeout since GIBS is our main view
        const landsatPromise = nasaService.getEarthImagery(lat, lon, end, 1);
        const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(null), 5000));
        landsatImagery = await Promise.race([landsatPromise, timeoutPromise]);
    } catch (e) {
        console.warn("Landsat fallback skipped:", e.message);
    }

    const powerData = await powerPromise;

    res.json({ 
      status: "success", 
      data: {
        climate: powerData,
        imagery: landsatImagery || { url: gibsUrl, date: end, source: 'NASA GIBS' }
      }
    });
  } catch (error) {
    console.error("Satellite Data Aggregation Error:", error.message);
    res.status(500).json({ status: "error", message: "Failed to aggregate NASA satellite data." });
  }
};

module.exports = {
  getNasaImagery,
  getNasaApod,
  analyzeSatelliteIndices,
  getSatelliteData
};

