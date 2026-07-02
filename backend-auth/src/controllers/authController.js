const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');
const { sendOTP } = require('../config/mailer');
const { sendPasswordResetEmail } = require('../config/mailer');
const { getProfileByUserId, updateProfileByUserId } = require('../services/profileService');


// Handle User Registration
const register = async (req, res) => {
  const { email, password, name } = req.body;
  const isDevelopment = process.env.NODE_ENV !== 'production';

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ error: 'Email already verified. Please login.' });
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    const hashedPassword = await bcrypt.hash(password, 10);

    // Upsert: Create user if they don't exist, or update OTP if they exist but aren't verified yet
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        otp,
        otpExpiresAt,
        name: name || null,
        role: 'USER',
      },
      create: {
        email,
        password: hashedPassword,
        otp,
        otpExpiresAt,
        name: name || null,
        role: 'USER',
      },
    });

    // Send the email
    const emailSent = await sendOTP(user.email, otp);

    res.status(201).json({
      message: emailSent
        ? 'OTP sent to email. Please verify to complete registration.'
        : 'Account created, but email delivery is unavailable in this environment. Use the development OTP to verify.',
      ...(isDevelopment && !emailSent ? { devOtp: otp } : {}),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process registration.' });
  }
};

// --- 2. Verify OTP ---
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (user.isVerified) return res.status(400).json({ error: 'User is already verified.' });
    if (user.otp !== otp) return res.status(400).json({ error: 'Invalid OTP.' });
    if (new Date() > user.otpExpiresAt) return res.status(400).json({ error: 'OTP has expired.' });

    // Mark as verified and clear the OTP fields
    await prisma.user.update({
      where: { email },
      data: { isVerified: true, otp: null, otpExpiresAt: null },
    });

    res.json({ message: 'Email successfully verified! You can now log in.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// --- 3. Login (Updated) ---
const login = async (req, res) => {
  const { email, password } = req.body;

 try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // BLOCK LOGIN IF NOT VERIFIED
    if (!user.isVerified) {
      return res.status(403).json({ error: 'Please verify your email using the OTP sent to you before logging in.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '2h' }
    );

    res.json({
      message: 'Login successful',
      token,
      role: user.role,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
  console.error("========== LOGIN ERROR ==========");
  console.error(error);
  console.error(error.stack);

  return res.status(500).json({
    error: "Internal server error."
  });
}
};

const getProfile = async (req, res) => {
  try {
    const profile = await getProfileByUserId(req.user.id);

    return res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      success: false,
      message: statusCode === 500 ? 'Internal server error.' : error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const profile = await updateProfileByUserId(req.user.id, req.body);

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: profile,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      success: false,
      message: statusCode === 500 ? 'Internal server error.' : error.message,
    });
  }
};

// --- 4. Forgot Password ---
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const isDevelopment = process.env.NODE_ENV !== 'production';

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return a generic message for security (prevents email enumeration)
      return res.json({ message: 'If that email exists, a reset code has been sent.' });
    }

    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const resetOtpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await prisma.user.update({
      where: { email },
      data: { resetOtp, resetOtpExpiresAt },
    });

    const emailSent = await sendPasswordResetEmail(user.email, resetOtp);

    res.json({
      message: 'If that email exists, a reset code has been sent.',
      ...(isDevelopment && !emailSent ? { devResetOtp: resetOtp } : {}),
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// --- 5. Reset Password ---
const resetPassword = async (req, res) => {
  const { email, resetOtp, newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.resetOtp !== resetOtp) {
      return res.status(400).json({ error: 'Invalid reset code.' });
    }

    if (new Date() > user.resetOtpExpiresAt) {
      return res.status(400).json({ error: 'Reset code has expired. Please request a new one.' });
    }

    // Hash the new password and clear the reset fields
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: { 
        password: hashedPassword,
        resetOtp: null, 
        resetOtpExpiresAt: null 
      },
    });

    res.json({ message: 'Password successfully reset. You can now log in with your new password.' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// --- 4. Dashboard (Protected) ---
const getDashboard = (req, res) => {
  res.json({
    message: 'Welcome to your private dashboard data!',
    user: req.user,
  });
};

module.exports = {
  register,
  verifyOtp,
  login,
  getDashboard,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
};