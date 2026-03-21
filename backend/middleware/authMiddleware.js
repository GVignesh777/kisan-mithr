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
        return response(res, 401, "Invalid or expired token");
    }
}




module.exports = authMiddleware;