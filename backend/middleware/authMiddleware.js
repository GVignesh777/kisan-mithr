const response = require("../utils/responseHandler");
const jwt = require("jsonwebtoken");


const authMiddleware = (req, res, next) => {
    let authToken = req.cookies?.auth_token;
    
    // Fallback to Authorization header if cookie is missing
    if (!authToken && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        authToken = req.headers.authorization.split(' ')[1];
    }

    if(!authToken) {
        return response(res, 401, "authorization token missing. please provide token");
    }
    try {
        const decode = jwt.verify(authToken, process.env.JWT_SECRET);
        req.user = decode;
        next();
    } catch (error) {
        console.error("JWT Verification Error:", error.message);

        // Define cookie options for clearing (must match the options used when setting)
        const isProduction = process.env.NODE_ENV === "production";
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
        };

        if (error.name === "TokenExpiredError") {
            res.clearCookie("auth_token", cookieOptions);
            return response(res, 401, "Token expired, please login again");
        }

        res.clearCookie("auth_token", cookieOptions);
        return response(res, 401, "Invalid token or session expired");
    }
}




module.exports = authMiddleware;