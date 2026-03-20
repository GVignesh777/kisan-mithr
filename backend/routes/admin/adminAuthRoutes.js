const express = require('express');
const { loginAdmin, getAdminProfile, seedAdmin } = require('../../controllers/admin/adminAuthController');
const { requireAdmin } = require('../../middleware/adminAuth');

const router = express.Router();

router.post('/login', loginAdmin);
router.get('/profile', requireAdmin, getAdminProfile);
router.post('/seed', seedAdmin); // Should probably be removed or secured in production

module.exports = router;
