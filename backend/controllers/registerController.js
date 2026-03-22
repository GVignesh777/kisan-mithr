const User = require("../models/User");
const bcrypt = require("bcryptjs");
const response = require("../utils/responseHandler");
const otpGenerate = require("../utils/otpGenerator");
const generateToken = require("../utils/generateToken");




// send otp to registering user

const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return response(res, 400, "All fields are required");
        }

        // Generate OTP
        const otp = otpGenerate();
        const expiry = new Date(Date.now() + 5 * 60 * 1000);

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if user already exists
        let user = await User.findOne({ email });

        if (user) {
            if (user.isVerified) {
                return response(res, 400, "User already exists");
            } else {
                // User exists but unverified. Update details and resend OTP.
                user.username = username;
                user.password = hashedPassword;
                user.emailOtp = otp;
                user.emailOtpExpiry = expiry;
                await user.save();
            }
        } else {
            // Create user with FULL DATA
            user = new User({
                username,
                email,
                password: hashedPassword,
                emailOtp: otp,
                emailOtpExpiry: expiry,
                isVerified: false,
            });
            await user.save();
        }

        return response(res, 200, "User account partially created", { user, otp });

    } catch (error) {
        console.error(error);
        return response(res, 500, "Internal server error");
    }
};


// verify otp

const verifyOtp = async (req, res) => {
    if (!req.body) {
        return res.status(400).json({ message: "Request body missing" });
    }
    console.log("Body:", req.body);
    const { email, otp } = req.body;

    try {
        let user;
        if (email) {
            user = await User.findOne({ email });
            if (!user) {
                return response(res, 404, "User not found");
            }

            const now = new Date();
            if (!user.emailOtp || String(user.emailOtp) !== String(otp) || now > new Date(user.emailOtpExpiry)) {
                return response(res, 400, "Invalid or expired otp");
            };
            user.isVerified = true;
            user.emailOtp = null;
            user.emailOtpExpiry = null;
            await user.save();
        }
        else {
            console.log("enter the email and password");
        }
        const token = generateToken(user?._id);
        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: false,      // true only in production with HTTPS
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        console.log("token in register controll:", token);
        return response(res, 200, 'Otp verified successfully', { token, user });
    } catch (error) {
        console.error(error);
        return response(res, 500, "Internal server error");
    }
};





// Profile

const updateProfile = async (req, res) => {
    const { username, agreed, about } = req.body;
    const userId = req.user?._id || req.user?.userId;

    try {
        const user = await User.findById(userId);
        console.log(user);
        const file = req.file;
        if (file) {
            const uploadResult = await uploadFileToCloudinary(file);
            console.log(uploadResult);
            user.profilePicture = uploadResult?.secure_url;
        } else if (req.body.profilePicture) {
            user.profilePicture = req.body.profilePicture;
        }

        if (username) user.username = username;
        if (agreed) user.agreed = agreed;
        if (about) user.about = about;
        await user.save();
        return response(res, 200, 'User profile updated successfully', user);
    } catch (error) {
        console.error(error);
        return response(res, 500, "Internal server error");
    }
}


const selectRole = async (req, res) => {
    try {
        // const { userId } = req.user?._id || req.user?.userId;

        const userId = req.user?._id || req.user?.userId;
        const { role } = req.body;
        console.log('userId', userId)
        console.log('role', role)
        if (!role) {
            console.log("please select a role to Continue..");
            return response(res, 400, "please select a role to Continue..");
        }
        const user = await User.findById(userId);
        user.role = role.id;
        await user.save();
        return response(res, 200, 'User role updated successfully', user);
    } catch (error) {
        console.error(error);
        return response(res, 500, "Internal server error");
    }
}




const checkAuthenticated = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.userId;
        if (!userId) {
            return response(res, 404, "unauthorized, please login before access Kisan Mithr");
        }
        console.log('userId', userId);
        const user = await User.findById(userId);
        if (!user) {
            return response(res, 404, "user not found");
        }
        return response(res, 200, "user retrived and allow to use Kisan Mithr", user);
    } catch (error) {
        console.error(error);
        return response(res, 500, "Internal server error");
    }
}

const logout = (req, res) => {
    try {
        res.cookie("auth_token", "", { expires: new Date(0) });
        return response(res, 200, "user logout successfully");
    } catch (error) {
        console.error(error);
        return response(res, 500, "Internal server error");
    }
}

module.exports = {
    registerUser,
    verifyOtp,
    updateProfile,
    selectRole,
    checkAuthenticated,
    logout,
}