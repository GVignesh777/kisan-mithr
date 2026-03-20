const mongoose = require("mongoose");


const getHyderabadTime = () => {
  return new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true // Set to false if you prefer 24-hour railway time
  });
};





const userSchema = new mongoose.Schema({
  username: { type: String },
  email: {
    type: String,
    lowercase: true,
    validate: {
      validator: function (value) {
        // You can use a more robust regex or a library like 'validator' here
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      },
      message: "Invalid email address format",
    }
  },
  googleId: String,
  googleName: String,
  googleMail: String,
  googlePhoto: String,


  password: {
    type: String,
    required: function () {
      return !this.googleId;
    }
  },

  emailOtp: { type: String },
  emailOtpExpiry: { type: String, default: getHyderabadTime },
  profilePicture: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  about: { type: String },
  isVerified: { type: Boolean, default: false },
  role: { type: String, default: "Farmer" },
  agreed: { type: Boolean, default: false },
  createdAt: { type: String, default: getHyderabadTime },
},);

const User = mongoose.model("User", userSchema);
module.exports = User;
