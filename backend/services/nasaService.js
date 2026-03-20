const axios = require('axios');

const NASA_CMR_BASE = 'https://cmr.earthdata.nasa.gov/search';
const NASA_GIBS_BASE = 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best';

// Utility for retrying requests with exponential backoff
const fetchWithRetry = async (config, retries = 3, backoff = 1000) => {
    try {
        return await axios({
            timeout: 10000, // Default 10s
            ...config
        });
    } catch (error) {
        const isRetryable = error.response && (error.response.status === 503 || error.response.status === 504 || error.response.status === 429);
        if (retries > 0 && (isRetryable || !error.response)) {
            console.warn(`NASA API Retrying (${retries} left): ${config.url}. Error: ${error.message}`);
            await new Promise(resolve => setTimeout(resolve, backoff));
            return fetchWithRetry(config, retries - 1, backoff * 2);
        }
        throw error;
    }
};

/**
 * NASA Open API Service
 */
const nasaService = {
    /**
     * Search for satellite imagery metadata (Landsat, MODIS) via NASA CMR
     */
    async searchImagery(bbox, dateStart, dateEnd) {
        try {
            const response = await fetchWithRetry({
                method: 'get',
                url: `${NASA_CMR_BASE}/granules.json`,
                params: {
                    short_name: 'Landsat8_L1',
                    bounding_box: bbox.join(','),
                    temporal: `${dateStart},${dateEnd}`,
                    page_size: 10,
                    sort_key: '-start_date'
                }
            });

            return response.data.feed.entry.map(entry => ({
                id: entry.id,
                date: entry.time_start,
                thumbnail: entry.links?.find(l => l.rel.includes('browse'))?.href || null,
                dataLink: entry.links?.[0]?.href,
                cloudCover: entry.cloud_cover || 0
            }));
        } catch (error) {
            console.error('NASA CMR Search Error:', error.message);
            return [];
        }
    },

    /**
     * Get constructs for NASA GIBS
     */
    getGibsTileUrl(layerName, date) {
        const formattedDate = date.split('T')[0];
        return `${NASA_GIBS_BASE}/${layerName}/default/${formattedDate}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`;
    },

    /**
     * Fetch agricultural climate data from NASA POWER API
     */
    async getPowerData(lat, lon, startDate, endDate) {
        try {
            const start = startDate.replace(/-/g, '');
            const end = endDate.replace(/-/g, '');
            
            const response = await fetchWithRetry({
                method: 'get',
                url: 'https://power.larc.nasa.gov/api/temporal/daily/point',
                params: {
                    parameters: 'T2M,PRECTOTCORR,RH2M,WS2M,ALLSKY_SFC_SW_DWN',
                    community: 'AG',
                    longitude: lon,
                    latitude: lat,
                    start: start,
                    end: end,
                    format: 'JSON'
                }
            });
            return response.data;
        } catch (error) {
            console.error('NASA POWER API Error:', error.message);
            throw error;
        }
    },

    /**
     * Constructs a high-reliability NASA GIBS WMS URL for a specific location
     * Using MODIS Terra Corrected Reflectance (Daily Global True Color)
     */
    getGibsImageryUrl(lat, lon, date) {
        const d = new Date(date);
        const formattedDate = d.toISOString().split('T')[0];
        
        // Calculate a 0.1 degree bounding box (approx 10km x 10km)
        const dim = 0.05; 
        const minLat = parseFloat(lat) - dim;
        const maxLat = parseFloat(lat) + dim;
        const minLon = parseFloat(lon) - dim;
        const maxLon = parseFloat(lon) + dim;

        // WMS 1.3.0 EPSG:4326 uses Lat,Lon order for BBOX
        const bbox = `${minLat},${minLon},${maxLat},${maxLon}`;
        
        const params = new URLSearchParams({
            SERVICE: 'WMS',
            REQUEST: 'GetMap',
            LAYERS: 'MODIS_Terra_CorrectedReflectance_TrueColor',
            VERSION: '1.3.0',
            WIDTH: '1024',
            HEIGHT: '1024',
            CRS: 'EPSG:4326',
            BBOX: bbox,
            TIME: formattedDate,
            FORMAT: 'image/png'
        });

        return `https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?${params.toString()}`;
    },

    /**
     * Fetch satellite imagery metadata from NASA Earth Imagery API (Legacy, slow)
     */
    async getEarthImagery(lat, lon, date, retryDays = 5) {
        let currentDate = new Date(date);
        
        for (let i = 0; i <= retryDays; i++) {
            const targetDate = currentDate.toISOString().split('T')[0];
            try {
                // For fallback dates, we use a shorter timeout and fewer retries to keep UI responsive
                const isPrimary = i === 0;
                const response = await fetchWithRetry({
                    method: 'get',
                    url: 'https://api.nasa.gov/planetary/earth/assets',
                    params: {
                        lon: lon,
                        lat: lat,
                        date: targetDate,
                        dim: 0.1,
                        api_key: process.env.NASA_API_KEY || 'DEMO_KEY'
                    },
                    timeout: isPrimary ? 15000 : 8000 // 15s for primary, 8s for fallbacks
                }, isPrimary ? 2 : 1); // 2 retries for primary, 1 for fallbacks
                
                if (response.data && response.data.url) {
                    if (i > 0) console.log(`NASA Earth Imagery: Found asset on fallback date ${targetDate}`);
                    return response.data;
                }
            } catch (error) {
                const isFinalRetry = i === retryDays;
                if (error.response?.status === 503 || error.response?.status === 404 || error.code === 'ECONNABORTED' || !error.response) {
                    if (!isFinalRetry) {
                        console.warn(`NASA Imagery unavailable/timeout for ${targetDate}, scanning previous day...`);
                        currentDate.setDate(currentDate.getDate() - 1);
                        continue;
                    }
                }
                console.error(`NASA Earth Imagery Final Error (${targetDate}):`, error.message);
                if (isFinalRetry) break;
            }
        }
        return null;
    },

    /**
     * Fetch the Astronomy Picture of the Day (APOD)
     */
    async getApod() {
        try {
            const response = await fetchWithRetry({
                method: 'get',
                url: 'https://api.nasa.gov/planetary/apod',
                params: { api_key: process.env.NASA_API_KEY || 'DEMO_KEY' }
            });
            return response.data;
        } catch (error) {
            console.error('NASA APOD Error:', error.message);
            return null;
        }
    }
};

module.exports = nasaService;
