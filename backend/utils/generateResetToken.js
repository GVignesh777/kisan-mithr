const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');


const resetToken = crypto.randomBytes(32).toString("hex");
// Hash token before saving to DB
const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

// (userId) => {
//     return jwt.sign({ userId }, process.env.JWT_SECRET, {
//         expiresIn: '1y'
//     })
// }

module.exports = {resetToken, hashedToken};