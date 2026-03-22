const User = require("../models/User");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();


/**
 * @desc    Send reset password link
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const user = await User.findOne({ email });

        // Always send same response for security
        if (!user) {
            return res.status(200).json({
                success: true,
            });
        }

        // // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");

        // const resetToken = resetToken();
        // const hashedToken = resetToken.hashedToken()

        // // Hash token before saving to DB
        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
        await user.save();

        // Create reset URL (change frontend URL if deployed)
        const resetURL = `http://localhost:3000/resetPassword/${resetToken}`;

        // Setup complete - pass payload back to frontend for EmailJS dispatch
        res.status(200).json({
            success: true,
            resetURL: resetURL,
            message: "If an account exists, reset link has been sent to email",
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};


/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password/:token
 * @access  Public
 */
const resetPassword = async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: "Password is required",
            });
        }

        // Hash token from params
        const hashedToken = crypto
            .createHash("sha256")
            .update(req.params.token)
            .digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired token",
            });
        }

        // Update password (hashed by pre-save middleware)
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;

        // Remove reset fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Password reset successful",
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};


module.exports = {
    forgotPassword,
    resetPassword,
};