const User = require("../models/User");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");



const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// let token;

const googleAuthController = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    let user = await User.findOne({ googleMail: payload.email });

    if (!user) {
      user = await User.create({
        googleId: payload.sub,
        googleName: payload.name,
        googleMail: payload.email,
        googlePhoto: payload.picture,
        isVerified: true,
        agreed: true,
        emailOtpExpiry: null,
        emailOtp: null,
      });
    }

    // ✅ GENERATE JWT USING MONGODB _id
    const jwtToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("auth_token", jwtToken, {
      httpOnly: true,
      secure: isProduction,        // true in production (HTTPS), false in localhost
      sameSite: isProduction ? "none" : "lax",  // "none" required for cross-origin (Vercel → Render)
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      status: "success",
      message: "Login Successfully with Google",
      token: jwtToken,
      data: user
    });

  } catch (error) {
    console.log(error);
    // return response(res, 400, "Invalid token");
    res.status(400).json({ message: "Invalid token" });
  }
}

module.exports = { googleAuthController };