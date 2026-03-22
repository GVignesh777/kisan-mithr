const { Resend } = require('resend');
const dotenv = require("dotenv");
const otpTemplate = require("../templates/otpTemplate");
const forgotPassword = require("../templates/forgotPassTemplate");
const welcomeTemplate = require("../templates/welcomeTemplate");
dotenv.config();

// Initialize Resend with the API Key
const resend = new Resend(process.env.RESEND_API_KEY);

const SENDER_EMAIL = "Kisan Mithr <kisanmithr3377@gmail.com>";

// Core reusable email function
const sendEmail = async (to, subject, htmlContent) => {
    try {
        const data = await resend.emails.send({
            from: SENDER_EMAIL,
            to: to,
            subject: subject,
            html: htmlContent,
        });

        if (data.error) {
            console.error("Resend API Error details:", data.error);
            throw new Error(data.error.message);
        }

        console.log(`✅ Email sent successfully to ${to}`);
        return data;
    } catch (error) {
        console.error("❌ Failed to send email via Resend:", error.message || error);
        throw error; // Let the caller decide how to handle the error
    }
}

// ----------------------------------------
// specific email service wrappers
// ----------------------------------------

const sendOtpToEmail = async (email, otp) => {
    const subject = "Your Kisan Mithr OTP Code";
    const html = otpTemplate(otp);
    await sendEmail(email, subject, html);
    console.log("OTP generated:", otp);
}

const forgotPasswordEmail = async (email, resetURL) => {
    const subject = "Password Reset Request - Kisan Mithr";
    const html = forgotPassword(resetURL);
    await sendEmail(email, subject, html);
    console.log("Password reset token generated:", resetURL);
}

const sendWelcomeEmail = async (email, username) => {
    const subject = "Welcome to Kisan Mithr! 🌱";
    const html = welcomeTemplate(username);
    // Notice we do NOT throw here so controller can gracefully fail
    try {
        await sendEmail(email, subject, html);
    } catch (err) {
        console.error(`Warning: Welcome email failed for ${email}`);
    }
}

module.exports = {
    sendOtpToEmail,
    forgotPasswordEmail,
    sendWelcomeEmail,
    sendEmail // export the generic function for reuse
};


module.exports = {
    sendOtpToEmail,
    forgotPasswordEmail,
};