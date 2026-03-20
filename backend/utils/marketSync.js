const axios = require("axios");
const MarketPrice = require("../models/MarketPrice");

const syncPricesCore = async () => {
    try {
        const API_KEY = process.env.DATA_GOV_API_KEY;
        
        if (!API_KEY) {
            console.warn("External API sync failed: No API Key. Falling back to local internal simulation.");
            return runSimulation();
        }

        let allRecords = [];

        // 1. Fetch Priority States Exhaustively (No aggressive limit)
        const priorityStates = ["Telangana", "Andhra Pradesh", "Kerala", "Karnataka"];
        console.log("Starting exhaustive fetch for Priority States...");

        for (const state of priorityStates) {
            let offset = 0;
            const limit = 2000;
            let hasMoreRecords = true;

            console.log(`Fetching all market records for ${state}...`);

            while (hasMoreRecords) {
                try {
                    const response = await axios.get(
                        "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070",
                        {
                            params: {
                                "api-key": API_KEY,
                                format: "json",
                                "filters[state]": state,
                                limit: limit,
                                offset: offset
                            }
                        }
                    );

                    const records = response.data.records;
                    
                    if (records && records.length > 0) {
                        allRecords = allRecords.concat(records);
                        offset += limit;
                        
                        // Extremely high cap just as a safety net for edge case API infinite loops
                        if (records.length < limit || offset >= 100000) {
                            hasMoreRecords = false;
                        } else {
                            await new Promise(r => setTimeout(r, 200));
                        }
                    } else {
                        hasMoreRecords = false;
                    }
                } catch (err) {
                    console.error(`API Error on ${state} offset ${offset}:`, err.message);
                    hasMoreRecords = false;
                }
            }
        }

        // 2. Fetch General India (Limited to recent 5000 to save bandwidth)
        console.log("Starting general fetch for remaining India states...");
        let genOffset = 0;
        let genHasMore = true;

        while (genHasMore) {
            try {
                const response = await axios.get(
                    "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070",
                    {
                        params: {
                            "api-key": API_KEY,
                            format: "json",
                            limit: 2000,
                            offset: genOffset
                        }
                    }
                );

                const records = response.data.records;
                
                if (records && records.length > 0) {
                    allRecords = allRecords.concat(records);
                    genOffset += 2000;
                    
                    if (records.length < 2000 || genOffset >= 20000) {
                        genHasMore = false;
                    } else {
                        await new Promise(r => setTimeout(r, 200));
                    }
                } else {
                    genHasMore = false;
                }
            } catch (err) {
                console.error(`API Error on General fetch offset ${genOffset}:`, err.message);
                genHasMore = false;
            }
        }

        // 3. Deduplicate
        const uniqueRecordsMap = new Map();
        allRecords.forEach(record => {
            const key = `${record.state}-${record.district}-${record.market}-${record.commodity}`;
            if (!uniqueRecordsMap.has(key)) {
                uniqueRecordsMap.set(key, record);
            }
        });
        
        const finalRecords = Array.from(uniqueRecordsMap.values());

        if (finalRecords.length > 0) {
            console.log(`Successfully aggregated ${finalRecords.length} unique records from the API. Clearing old DB...`);
            
            // Per functional requirements: "Before inserting new data, clear old records to avoid duplicates."
            await MarketPrice.deleteMany({});
            await MarketPrice.insertMany(finalRecords);
            
            return { message: 'Market prices synchronized via Data.gov API', updatedRecords: finalRecords.length };
        } else {
            console.warn("API returned 0 records across all states. Falling back to simulation.");
            return runSimulation();
        }
        
    } catch (error) {
        console.warn("Fatal Sync Error:", error.message);
        return runSimulation();
    }
};

const runSimulation = async () => {
    let updatedCount = 0;
    const prices = await MarketPrice.find({});
    for (let price of prices) {
      const fluctuation = 1 + (Math.random() * 0.1 - 0.05);
      price.modal_price = Math.round(price.modal_price * fluctuation) || 1000;
      price.min_price = Math.round(price.modal_price * 0.9); 
      price.max_price = Math.round(price.modal_price * 1.1); 
      price.arrival_date = new Date().toISOString().split('T')[0];
      await price.save();
      updatedCount++;
    }
    return { message: 'Market prices systematically updated locally (API unavailable)', updatedRecords: updatedCount };
};

module.exports = syncPricesCore;
