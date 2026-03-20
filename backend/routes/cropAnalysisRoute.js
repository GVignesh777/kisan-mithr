const express = require('express');
const router = express.Router();
const multer = require('multer');
const { analyzeCropImage } = require('../controllers/cropAnalysisController');

// Set up Multer to store the uploaded image in memory (Buffer) instead of disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // Strict 5MB limit requested
  },
  fileFilter: (req, file, cb) => {
    // Only allow specific formats per requirements
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, JPEG, and PNG are allowed.'), false);
    }
  }
});

router.post('/', upload.single('image'), analyzeCropImage);

module.exports = router;
