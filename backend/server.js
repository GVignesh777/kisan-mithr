// server.js
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: true, // dynamically reflects request origin
  credentials: true
}));
app.use(cookieParser());


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));


// Routes registration...



const userRoutes = require("./routes/userRoutes");
app.use("/api", userRoutes);


const aiRouter = require("./routes/aiRouter");
app.use("/api", aiRouter);

const conversationRoutes = require("./routes/conversationRoutes");
app.use("/api", conversationRoutes);

const marketRoute = require("./routes/marketRoute");
app.use("/api/market", marketRoute);

const weatherRoute = require("./routes/weatherRoute");
app.use("/api/weather", weatherRoute);

const chatRoute = require("./routes/chatRoute");
app.use("/api/chats", chatRoute);

const aiRoute2 = require("./routes/aiRoute2");
app.use("/api", aiRoute2);

const cropAnalysisRoute = require('./routes/cropAnalysisRoute');
app.use('/api/analyze-crop', cropAnalysisRoute);

const feedbackRoute = require('./routes/feedbackRoute');
app.use('/api/feedback', feedbackRoute);

const satelliteRoute = require('./routes/satelliteRoute');
app.use('/api/satellite', satelliteRoute);

const adminAuthRoutes = require("./routes/admin/adminAuthRoutes");
app.use("/api/admin/auth", adminAuthRoutes);

const adminRoutes = require("./routes/admin/adminRoutes");
app.use("/api/admin", adminRoutes);

const startMarketPriceCron = require("./cron/marketPriceCron.js");


// start cron job
startMarketPriceCron();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
