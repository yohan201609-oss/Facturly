const express = require('express');
const router = express.Router();
const { updateProfile, upgradeToPremium, uploadLogo } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.put('/profile', updateProfile);
router.post('/upgrade', upgradeToPremium);
router.post('/upload-logo', upload.single('logo'), uploadLogo);

module.exports = router;

module.exports = router;
