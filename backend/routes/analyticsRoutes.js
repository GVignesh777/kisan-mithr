const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getOverview,
  getFinancialTrends,
  saveFarmData,
  addExpense,
  addCrop,
  getYieldAnalytics,
  getResources,
  getAIInsights,
  getGrowthScenarios,
  getROIStats,
  simulateGrowth
} = require("../controllers/analyticsController");
const { getPlatformOverview } = require("../controllers/platformController");




const router = express.Router();

// All analytics routes require authentication
router.use(authMiddleware);

router.get("/overview", getOverview);
router.get("/platform-overview", getPlatformOverview);
router.get("/financial-trends", getFinancialTrends);
router.get("/yields", getYieldAnalytics);
router.get("/resources", getResources);
router.get("/insights", getAIInsights);
router.get("/growth/scenarios", getGrowthScenarios);
router.get("/growth/roi", getROIStats);


router.post("/farm", saveFarmData);
router.post("/growth/simulate", simulateGrowth);

router.post("/expense", addExpense);
router.post("/crop", addCrop);

module.exports = router;
