const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ status: false, message: "Email and password are required" });
    }
    // Check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ status: false, message: "Invalid email or password" });
    }



    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ status: false, message: "Invalid email or password" });
    }
    const userData = {
      id: user._id,
      email: user.email,
      username: user.username,
    };

    const token = generateToken(user?._id);
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: false,      // true only in production with HTTPS
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // return response(res, 200, "Login Successfull!!!", { email });
    return res.status(200).json({
      message: "Login successful",
      status: true,
      token,
      user: userData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};

module.exports = loginUser;