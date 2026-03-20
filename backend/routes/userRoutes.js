const express = require("express");
const registerColtroller = require("../controllers/registerController");
const loginUser = require("../controllers/loginController");
const { multerMiddleware } = require("../config/cloudinaryConfig");
const authmiddleware = require("../middleware/authMiddleware");
const resetRouter = require("../controllers/forgotPassController");
const { googleAuthController, checkGoogleAuthenticated } = require("../controllers/googleAuthController");
const router = express.Router();

router.post("/register", registerColtroller.registerUser);
router.post("/verifyOtp", registerColtroller.verifyOtp);
router.post("/login", loginUser);
router.post("/google-login", googleAuthController)
router.post("/selectRole", authmiddleware, registerColtroller.selectRole);
router.get('/logout',registerColtroller.logout);



router.post("/forgotPassword", resetRouter.forgotPassword);
router.post("/resetPassword/:token", resetRouter.resetPassword);




router.put('/updateProfile', authmiddleware, multerMiddleware, registerColtroller.updateProfile);
router.get('/check-auth', authmiddleware, registerColtroller.checkAuthenticated);
// router.get('/check-google-auth', authMiddleware, checkGoogleAuthenticated);

module.exports = router;