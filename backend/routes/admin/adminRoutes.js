const express = require('express');
const { requireAdmin } = require('../../middleware/adminAuth');

const { getDashboardStats } = require('../../controllers/admin/adminDashboardController');
const { getAllUsers, blockUser, unblockUser, deleteUser } = require('../../controllers/admin/adminUserController');
const { getCropReports, updateReportStatus, deleteReport } = require('../../controllers/admin/adminDiseaseController');
const { getConversations } = require('../../controllers/admin/adminConversationController');
const { getImages, updateImageStatus, deleteImage } = require('../../controllers/admin/adminImageController');
const { getMarketPrices, addMarketPrice, updateMarketPrice, deleteMarketPrice, syncMarketPrices } = require('../../controllers/admin/adminMarketController');
const { getNotifications, createNotification, deleteNotification, getFeedback, getSystemHealth, getUnreadNotificationsCount, markNotificationAsRead } = require('../../controllers/admin/adminSystemController');
const { adminAiChat } = require('../../controllers/admin/adminAiController');

const router = express.Router();

router.use(requireAdmin); // Protect all routes below

// Dashboard Analytics
router.get('/dashboard', getDashboardStats);

// Users Management
router.get('/users', getAllUsers);
router.put('/users/:id/block', blockUser);
router.put('/users/:id/unblock', unblockUser);
router.delete('/users/:id', deleteUser);

// Disease Reports
router.get('/crop-reports', getCropReports);
router.put('/crop-reports/:id', updateReportStatus);
router.delete('/crop-reports/:id', deleteReport);

// AI Conversations
router.get('/conversations', getConversations);

// Image Moderation
router.get('/images', getImages);
router.put('/images/:id', updateImageStatus);
router.delete('/images/:id', deleteImage);

// Market Prices
router.get('/market-prices', getMarketPrices);
router.post('/market-prices/sync', syncMarketPrices);
router.post('/market-prices', addMarketPrice);
router.put('/market-prices/:id', updateMarketPrice);
router.delete('/market-prices/:id', deleteMarketPrice);

// System logs, notifications, feedback
router.get('/notifications/unread-count', getUnreadNotificationsCount);
router.put('/notifications/:id/mark-read', markNotificationAsRead);

router.get('/notifications', getNotifications);
router.post('/notifications', createNotification);
router.delete('/notifications/:id', deleteNotification);

router.get('/feedback', getFeedback);
router.get('/health', getSystemHealth);

// Admin AI Chat
router.post('/ai-chat', adminAiChat);

module.exports = router;
