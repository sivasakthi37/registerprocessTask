const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Step 1: Initial registration with email
router.post('/register/email', async (req, res) => {
    try {
        const { email } = req.body;
        
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user && user.isVerified) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date();
        otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes

        // Create or update user
        if (!user) {
            user = new User({
                email,
                otp: {
                    code: otp,
                    expiresAt: otpExpiry
                }
            });
        } else {
            user.otp = {
                code: otp,
                expiresAt: otpExpiry
            };
        }
        await user.save();

        // Send OTP email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Registration OTP',
            text: `Your OTP for registration is: ${otp}`
        });

        res.json({ message: 'OTP sent successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Step 2: Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        if (!user.otp || user.otp.code !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (new Date() > user.otp.expiresAt) {
            return res.status(400).json({ message: 'OTP expired' });
        }

        user.isVerified = true;
        user.otp = undefined;
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email } = req.body;
        
        const user = await User.findOne({ email });
        if (!user || !user.isVerified) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
