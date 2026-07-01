const express = require('express');
const { 
    register, 
    verifyOtp, 
    login, 
    getDashboard, 
    forgotPassword, 
    resetPassword
 } = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/dashboard', authenticateToken, getDashboard);

module.exports = router;