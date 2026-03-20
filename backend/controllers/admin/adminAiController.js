const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * POST /api/admin/ai-chat
 * Body: { message, history: [{role, content}], model? }
 */
const adminAiChat = async (req, res) => {
  try {
    const { message, history = [], model = "llama-3.3-70b-versatile" } = req.body;

    if (!message) return res.status(400).json({ success: false, error: "message required" });

    const systemPrompt = `You are the Kisan Mithr Admin AI — a powerful analytics and business intelligence assistant embedded inside the admin dashboard of an Indian agricultural marketplace called Kisan Mithr.

Your role is to assist the platform admin with:
- Analyzing market price trends (AGMARKNET data)
- Identifying disease outbreak patterns from crop disease reports
- Reviewing user engagement, buyer behavior, and farmer activity
- Generating actionable recommendations to improve outcomes
- Summarizing AI conversation logs and support tickets
- Identifying system health issues and platform improvements

Be data-driven, concise, and professional. Format answers with bullet points where appropriate.
Always relate insights back to improving farmer livelihoods and buyer satisfaction.
If asked something outside the platform context, politely redirect to admin-relevant topics.`;

    // Build message chain with history
    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-10),
      { role: "user", content: message }
    ];

    const completion = await groq.chat.completions.create({
      model,
      messages,
      temperature: 0.5,
      max_tokens: 1024,
    });

    const response = completion.choices[0]?.message?.content || "No response generated.";
    res.json({ success: true, response });

  } catch (error) {
    console.error("Admin AI error:", error.message);
    res.status(500).json({ success: false, error: "AI request failed: " + error.message });
  }
};

module.exports = { adminAiChat };
