import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import db from '../config/db.js';
import { findUserByEmail, createUser } from '../models/User.js';
import { generateOTP, verifyOTP, clearOTP } from '../utils/otpHelper.js';
import { client as twilioClient } from '../utils/twilioClient.js';

dotenv.config();
const SECRET = process.env.JWT_SECRET_KEY || "testsecret";

// ✅ Function to safely send OTP via Twilio with fallback
const sendOTPViaTwilio = async (phone, otp) => {
  try {
    if (process.env.USE_TWILIO === 'true') {
      await twilioClient.messages.create({
        body: `Your OTP for Insurance Portal login is ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: `+91${phone}`,
      });
      console.log(`✅ OTP sent via Twilio to ${phone}`);
      return { success: true };
    }
    throw new Error('Twilio disabled by config');
  } catch (error) {
    console.warn(`⚠️ Twilio failed for ${phone}:`, error.message);
    console.log(`📋 Fallback OTP for ${phone}: ${otp}`);
    return { success: false, message: 'Twilio failed, OTP printed to console' };
  }
};

// -------------------- REGISTER FLOW --------------------
export const registerInit = async (req, res) => {
  try {
    const {
      name, email, phone, password,
    } = req.body;
    const existing = await findUserByEmail(email);
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const otp = generateOTP(phone);
    const twilioResult = await sendOTPViaTwilio(phone, otp);

    global.tempUsers = global.tempUsers || {};
    global.tempUsers[phone] = {
      name, email, phone, password,
    };

    res.status(200).json({
      message: twilioResult.success
        ? 'OTP sent successfully'
        : 'Twilio limit reached — OTP printed in backend console',
    });
  } catch (err) {
    console.error('RegisterInit Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// STEP 2: Verify OTP and complete registration
export const registerVerify = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!verifyOTP(phone, otp)) { return res.status(400).json({ message: 'Invalid or expired OTP' }); }

    const userDraft = global.tempUsers?.[phone];
    if (!userDraft) { return res.status(400).json({ message: 'Registration session expired' }); }

    const hashed = await bcrypt.hash(userDraft.password, 10);
    await createUser({
      name: userDraft.name,
      email: userDraft.email,
      phone: userDraft.phone,
      password: hashed,
    });

    clearOTP(phone);
    delete global.tempUsers[phone];

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// -------------------- LOGIN FLOW --------------------
export const loginUser = async (req, res) => {
  try {
    console.log('Received login request:', req.body);
    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const minutesLeft = Math.ceil(
        (new Date(user.lockedUntil) - new Date()) / 60000,
      );
      return res
        .status(403)
        .json({ message: `Account locked. Try again in ${minutesLeft} min.` });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      const failedAttempts = (user.failedAttempts || 0) + 1;
      let lockedUntil = null;
      if (failedAttempts >= 5) { lockedUntil = new Date(Date.now() + 15 * 60 * 1000); }
      await db.query(
        'UPDATE Users SET failedAttempts = ?, lockedUntil = ? WHERE id = ?',
        [failedAttempts, lockedUntil, user.id],
      );
      const remaining = 5 - failedAttempts;
      return res.status(401).json({
        message:
          failedAttempts >= 5
            ? 'Account locked for 15 minutes due to repeated failures.'
            : `Invalid password. ${remaining} attempt(s) left.`,
      });
    }

    await db.query('UPDATE Users SET failedAttempts = 0, lockedUntil = NULL WHERE id = ?', [user.id]);
    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    console.error('🔥 Login error:', err);
    res.status(500).json({ error: err.message });
  }
};

// -------------------- OTP LOGIN FLOW --------------------
export const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone number is required' });

    const [userRows] = await db.execute('SELECT * FROM Users WHERE phone = ?', [phone]);
    const user = userRows[0];
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      return res.status(403).json({ message: 'Account locked. Try again later.' });
    }

    const otp = generateOTP(phone);
    const twilioResult = await sendOTPViaTwilio(phone, otp);

    res.status(200).json({
      message: twilioResult.success
        ? 'OTP sent successfully'
        : 'Twilio limit reached — OTP printed in backend console',
    });
  } catch (err) {
    console.error('Send OTP Error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const verifyOTPLogin = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const [userRows] = await db.execute('SELECT * FROM Users WHERE phone = ?', [phone]);
    const user = userRows[0];
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!verifyOTP(phone, otp)) {
      const failedAttempts = (user.failedAttempts || 0) + 1;
      let lockedUntil = null;
      if (failedAttempts >= 5) { lockedUntil = new Date(Date.now() + 15 * 60 * 1000); }
      await db.query(
        'UPDATE Users SET failedAttempts = ?, lockedUntil = ? WHERE id = ?',
        [failedAttempts, lockedUntil, user.id],
      );
      return res.status(401).json({
        message:
          failedAttempts >= 5
            ? 'Account locked for 15 minutes due to repeated OTP failures.'
            : 'Invalid OTP. Please try again.',
      });
    }

    await db.query('UPDATE Users SET failedAttempts = 0, lockedUntil = NULL WHERE id = ?', [user.id]);
    clearOTP(phone);
    const token = jwt.sign({ id: user.id, phone }, SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
