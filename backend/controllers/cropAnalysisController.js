const CropAnalysis = require("../models/CropAnalysis");

const generatePrompt = (targetLang) => {
    let langInstruction = "Keep language very simple, professional, and farmer-friendly in ENGLISH.";
    if (targetLang === 'hi') langInstruction = "TRANSLATE ALL JSON VALUES (symptoms, cause, treatment, prevention, etc.) strictly into HINDI. The JSON keys must remain English, but the values must be Hindi.";
    if (targetLang === 'te') langInstruction = "TRANSLATE ALL JSON VALUES (symptoms, cause, treatment, prevention, etc.) strictly into TELUGU. The JSON keys must remain English, but the values must be Telugu.";

    return `You are a professional agricultural plant disease expert AI.
Analyze the uploaded plant or crop image meticulously.

Identify the following and return the analysis STRICTLY in generic JSON form. Do not output markdown code blocks (\`\`\`json) or any conversational text. Respond ONLY with a valid, parseable JSON object.

The JSON object MUST follow this exact schema:
{
  "crop": "Name of the crop/plant",
  "disease": "Specific name of the disease or pest infection. If none, write 'Healthy'",
  "confidence": "Low", "Medium", or "High",
  "symptoms": "Detailed explanation of visible symptoms.",
  "cause": "What might have caused this disease.",
  "treatment": "Practical, step-by-step treatment methods farmers can immediately follow.",
  "prevention": "Steps to prevent this disease in future crop lifecycles.",
  "organic_solution": "Organic or natural treatment options.",
  "chemical_solution": "Safe pesticide or fungicide usage if urgently required.",
  "safety_advice": "Proper safe usage of standard pesticides safely.",
  "disclaimer": "⚠ This is an AI-based analysis and may not always be accurate. Please consult a local agricultural officer, plant doctor, or crop expert before applying treatments."
}
${langInstruction}
`;
};

const axios = require("axios");
const sharp = require("sharp");
const { uploadFromBuffer } = require("../config/cloudinaryConfig");

const analyzeCropImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image provided. Please upload a clear crop picture." });
        }

        const { userId, language, location, userName } = req.body;

        // 1. Process and Optimize Image with Sharp
        let optimizedBuffer;
        try {
            optimizedBuffer = await sharp(req.file.buffer)
                .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 80 })
                .toBuffer();
        } catch (sharpErr) {
            console.error("Image processing error:", sharpErr);
            optimizedBuffer = req.file.buffer;
        }

        const base64Image = optimizedBuffer.toString("base64");
        const imageDataUri = `data:image/jpeg;base64,${base64Image}`;
        
        // 2. Call Groq Llama 4 Scout Vision Model
        let responseText = "";
        try {
            const prompt = generatePrompt(language || 'en');
            
            const response = await axios.post(
                "https://api.groq.com/openai/v1/chat/completions",
                {
                    model: "meta-llama/llama-4-scout-17b-16e-instruct",
                    messages: [
                        {
                            role: "user",
                            content: [
                                { type: "text", text: prompt },
                                {
                                    type: "image_url",
                                    image_url: { url: imageDataUri }
                                }
                            ]
                        }
                    ],
                    temperature: 0.1,
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                    timeout: 45000
                }
            );
            
            responseText = response.data.choices[0].message.content;
            
        } catch (apiErr) {
            const fs = require('fs');
            const errorDetails = {
                message: apiErr.message,
                data: apiErr.response?.data,
                status: apiErr.response?.status
            };
            fs.appendFileSync('crop-error.log', `[${new Date().toISOString()}] Groq Vision API Error: ${JSON.stringify(errorDetails, null, 2)}\n`);
            console.error("Groq Vision API Error:", apiErr.response?.data || apiErr.message || apiErr);
            return res.status(502).json({ error: "Plant AI model is temporarily unavailable." });
        }
        
        // 3. Parse JSON safely
        let structuredAnalysis;
        try {
            const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            structuredAnalysis = JSON.parse(cleanJson);
        } catch (jsonErr) {
            console.error("Failed to parse AI structure:", responseText);
            return res.status(500).json({ error: "Failed to interpret plant analysis." });
        }
        
        // 4. Upload to Cloudinary for permanent storage
        let cloudUrl = "";
        try {
            const uploadResult = await uploadFromBuffer(optimizedBuffer);
            cloudUrl = uploadResult.secure_url;
        } catch (cloudErr) {
            console.error("Cloudinary upload failed, falling back to buffer string:", cloudErr);
            cloudUrl = imageDataUri; // Fallback
        }

        // 5. Store History into Database
        const cropHistory = new CropAnalysis({
            userId: userId || null,
            imageURL: cloudUrl,
            cropName: structuredAnalysis.crop,
            disease: structuredAnalysis.disease,
            confidence: ['Low', 'Medium', 'High'].includes(structuredAnalysis.confidence) ? structuredAnalysis.confidence : 'Medium',
            symptoms: structuredAnalysis.symptoms,
            cause: structuredAnalysis.cause,
            treatment: structuredAnalysis.treatment,
            prevention: structuredAnalysis.prevention,
            organic_solution: structuredAnalysis.organic_solution,
            chemical_solution: structuredAnalysis.chemical_solution,
            safety_advice: structuredAnalysis.safety_advice,
            disclaimer: structuredAnalysis.disclaimer,
            location: location || 'Unknown',
            date: new Date()
        });

        await cropHistory.save();
        
        // 6. Return response to Frontend
        res.status(200).json({ ...structuredAnalysis, imageUrl: cloudUrl });

    } catch (error) {
        console.error("Crop Analysis Root Error:", error);
        res.status(500).json({ error: "An unexpected error occurred while analyzing the crop image." });
    }
};

module.exports = {
    analyzeCropImage
};
