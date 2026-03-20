const axios = require('axios');

// Helper to map WMO codes to human readable strings
const getWeatherCondition = (code) => {
    if (code === 0) return "Clear Sky";
    if (code === 1 || code === 2 || code === 3) return "Partly Cloudy";
    if (code === 45 || code === 48) return "Foggy";
    if (code >= 51 && code <= 55) return "Drizzle";
    if (code >= 61 && code <= 65) return "Rain";
    if (code >= 71 && code <= 75) return "Snow";
    if (code >= 80 && code <= 82) return "Showers";
    if (code >= 95) return "Thunderstorm";
    return "Clear";
};

// Get weather for a specific location
exports.getWeatherByLocation = async (req, res) => {
    try {
        const { location } = req.params;

        // 1. Geocode the location string using a free geocoding API
        const geoResponse = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`);
        
        if (!geoResponse.data.results || geoResponse.data.results.length === 0) {
            return res.status(404).json({ error: "Location not found" });
        }

        const { latitude, longitude, name, admin1, country } = geoResponse.data.results[0];
        const formattedLocation = `${name}${admin1 ? `, ${admin1}` : ''}`;

        // 2. Fetch the weather data using Lat/Lng from Open-Meteo (Free, No Auth required!)
        // Fetching current temp, wind, rain prob, humidity, and 7 days daily max/min
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,precipitation_probability_max&timezone=auto`;
        
        const weatherResponse = await axios.get(weatherUrl);
        const data = weatherResponse.data;

        // 3. Format into a clean response for the frontend
        
        // 3. Format into a clean response for the frontend

        const forecast = data.daily.time.map((timeStr, idx) => {
            const dateObj = new Date(timeStr);
            return {
                day: dateObj.toLocaleDateString('en-IN', { weekday: 'short' }),
                temp: Math.round(data.daily.temperature_2m_max[idx]),
                condition: getWeatherCondition(data.daily.weather_code[idx]),
                rainProb: data.daily.precipitation_probability_max[idx]
            };
        });

        const formattedData = {
            location: formattedLocation,
            current: {
                temp: Math.round(data.current.temperature_2m),
                humidity: Math.round(data.current.relative_humidity_2m),
                rainProb: data.current.precipitation_probability,
                windSpeed: Math.round(data.current.wind_speed_10m),
                condition: getWeatherCondition(data.current.weather_code)
            },
            forecast: forecast
        };

        res.json(formattedData);

    } catch (error) {
        console.error("Open-Meteo Weather Fetch Error:", error);
        res.status(500).json({ error: "Failed to fetch weather data" });
    }
};

// Get weather using exact Lat/Lng coordinates for higher precision
exports.getWeatherByCoords = async (req, res) => {
    try {
        const { lat, lng } = req.query;
        if (!lat || !lng) return res.status(400).json({ error: "Latitude and longitude are required" });

        // 1. Reverse geocode to get city name (Using OpenCage API)
        let formattedLocation = "Current Location";
        try {
            const openCageKey = process.env.OPENCAGE_API_KEY;
            if (openCageKey) {
                const geoRes = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${openCageKey}`);
                if (geoRes.data && geoRes.data.status.code === 200 && geoRes.data.results.length > 0) {
                    const components = geoRes.data.results[0].components;
                    let city = components.city || components.town || components.village || components.county;
                    let state = components.state;
                    
                    if (city && state) {
                        formattedLocation = `${city}, ${state}`;
                    } else if (city) {
                        formattedLocation = city;
                    } else {
                        formattedLocation = geoRes.data.results[0].formatted;
                    }
                }
            } else {
                // Fallback to Free API if no OpenCage Key is present
                const geoRes = await axios.get(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
                if (geoRes.data && geoRes.data.city) {
                    formattedLocation = `${geoRes.data.city}, ${geoRes.data.principalSubdivision || ''}`.replace(/,\s*$/, "");
                } else if (geoRes.data && geoRes.data.locality) {
                    formattedLocation = `${geoRes.data.locality}, ${geoRes.data.principalSubdivision || ''}`.replace(/,\s*$/, "");
                }
            }
        } catch (e) { console.error("Reverse geocoding failed", e.message); }

        // 2. Fetch advanced agricultural weather data from Open-Meteo
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,et0_fao_evapotranspiration,sunrise,sunset&timezone=auto`;
        
        const weatherResponse = await axios.get(weatherUrl);
        const data = weatherResponse.data;

        // 3. Format Data
        const forecast = data.daily.time.map((timeStr, idx) => {
            const dateObj = new Date(timeStr);
            return {
                day: dateObj.toLocaleDateString('en-IN', { weekday: 'short' }),
                date: dateObj.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
                tempMax: Math.round(data.daily.temperature_2m_max[idx]),
                tempMin: Math.round(data.daily.temperature_2m_min[idx]),
                condition: getWeatherCondition(data.daily.weather_code[idx]),
                rainProb: data.daily.precipitation_probability_max[idx],
                uvIndex: data.daily.uv_index_max[idx],
                evapotranspiration: data.daily.et0_fao_evapotranspiration[idx], // mm/day
                sunrise: new Date(data.daily.sunrise[idx]).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                sunset: new Date(data.daily.sunset[idx]).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
            };
        });

        // Generate a dynamic farming recommendation based on current data
        let recommendation = "Weather is stable. Proceed with normal farming activities.";
        const todayForecast = forecast[0];
        if (todayForecast.rainProb > 60) {
            recommendation = "High chance of rain. Delay pesticide spraying and irrigation.";
        } else if (data.current.wind_speed_10m > 20) {
            recommendation = "Strong winds detected. Avoid spraying activities to prevent pesticide drift.";
        } else if (todayForecast.uvIndex > 8 || todayForecast.tempMax > 38) {
            recommendation = "Extreme heat/UV today. Ensure crops have sufficient water and livestock are shaded.";
        } else if (todayForecast.evapotranspiration > 5 && todayForecast.rainProb < 20) {
            recommendation = "High water loss (evapotranspiration) expected. Increase irrigation if soil is dry.";
        }

        const formattedData = {
            location: formattedLocation,
            current: {
                temp: Math.round(data.current.temperature_2m),
                humidity: Math.round(data.current.relative_humidity_2m),
                rainProb: data.current.precipitation_probability,
                windSpeed: Math.round(data.current.wind_speed_10m),
                windDirection: data.current.wind_direction_10m,
                pressure: data.current.surface_pressure,
                isDay: data.current.is_day,
                condition: getWeatherCondition(data.current.weather_code)
            },
            farmingRecommendation: recommendation,
            forecast: forecast
        };

        res.json(formattedData);

    } catch (error) {
        console.error("Open-Meteo Coords Fetch Error:", error);
        res.status(500).json({ error: "Failed to fetch weather data by coordinates" });
    }
};
