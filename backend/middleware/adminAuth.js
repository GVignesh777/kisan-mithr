const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const requireAdmin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret_key");

      req.user = await Admin.findById(decoded.id).select("-password");

      if (!req.user || (req.user.role !== "admin" && req.user.role !== "superadmin")) {
        return res.status(401).json({ message: "Not authorized as an admin" });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { requireAdmin };
