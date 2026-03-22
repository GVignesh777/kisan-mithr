const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const otpTemplate = require("../templates/otpTemplate");
const forgotPassword = require("../templates/forgotPassTemplate");
dotenv.config();

// ----------------------
// Email Transporter
// ----------------------
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : '',
    },
    port: 587,
    secure: false,
    requireTLS: true, // 🔒 ensures encryption
    family: 4, // 🔥 MUST be here
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    socketTimeout: 15000,
});

transporter.verify((error, success) => {
    if (error) {
        console.log("Gmail services connection failed");
    } else {
        console.log('Gmail configured properly and ready to send email');
    }
});

// send otp to email

const sendOtpToEmail = async (email, otp) => {

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your Kisan Mithr OTP Code",
        html: otpTemplate(otp),
    };
    await transporter.sendMail(mailOptions);
    // console.log(`✅ Email OTP sent to ${email}`);
    console.log(otp);
}

// send forgot password email

const forgotPasswordEmail = async (email, resetURL) => {
    const mailOptionsForgotPass = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Password Reset Request",
        html: forgotPassword(resetURL),
    }

    await transporter.sendMail(mailOptionsForgotPass);
    console.log("token", resetURL);
    // res.status(200).json({
    //     success: true,
    //     message: "If an account exists, reset link has been sent to email",
    // });
}


module.exports = {
    sendOtpToEmail,
    forgotPasswordEmail,
};