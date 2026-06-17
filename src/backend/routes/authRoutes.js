import express from 'express';
import {
  registerInit,
  registerVerify,
  loginUser,
  sendOTP,
  verifyOTPLogin,
} from '../controllers/authController.js';

const router = express.Router();

// Registration with OTP
router.post('/register-init', registerInit);
router.post('/register-verify', registerVerify);

// Login
router.post('/login', loginUser);

// OTP Login
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTPLogin);

export default router;
