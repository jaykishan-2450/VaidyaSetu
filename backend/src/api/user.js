const express = require("express");
const { UserModel } = require("../model/user-schema");
const { extractLatLngFromUrl } = require("../utils/geocode");
const { OtpModel } = require("../model/otp-schema");

const userRouter = express.Router();

const bcrypt = require("bcryptjs");

// Middleware to validate registration
async function validateRegistration(req, res, next) {
    const { email, password, confirmPassword, otp } = req.body;

    if (!email || !password || !confirmPassword || !otp) {
        return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    // Find latest OTP for this email
    const otpRecord = await OtpModel.findOne({ email }).sort({ createdAt: -1 });
    if (!otpRecord) {
        return res.status(400).json({ message: "OTP not found or expired" });
    }

    // Check if OTP expired (10 min)
    if (otpRecord.createdAt < Date.now() - 1000 * 60 * 10) {
        return res.status(400).json({ message: "OTP expired" });
    }

    // Compare OTP
    const isMatch = await bcrypt.compare(otp + "", otpRecord.otp);
    if (!isMatch) {
        return res.status(400).json({ message: "Invalid OTP" });
    }

    // Optionally, delete OTP after use
    await OtpModel.deleteMany({ email });

    next();
}

// Register new user
userRouter.post("/register", validateRegistration, async (req, res) => {
    try {
        const { email, password } = req.body;
        // Encrypt password before saving
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new UserModel({ email, password: hashedPassword });
        await user.save();
        const userObj = user.toObject();
        delete userObj.password;
        res.status(201).json({
            message: "User registered successfully",
            user: userObj
        });
    } catch (err) {
        res.status(400).json({ message: "User registration failed", error: err.message });
    }
});

// Login user
userRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email" });
        }

        // Compare encrypted password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const userObj = user.toObject();
        delete userObj.password;

        res.status(200).json({
            message: "Login successful",
            user: userObj
        });
    } catch (err) {
        res.status(500).json({ message: "Login failed", error: err.message });
    }
});

// Update user location
userRouter.post("/location", async (req, res) => {
    try {
        const { userId, googleMapsUrl } = req.body;
        if (!userId || !googleMapsUrl) {
            return res.status(400).json({ message: "userId and googleMapsUrl are required" });
        }
        const coords = await extractLatLngFromUrl(googleMapsUrl);
        if (!coords) {
            return res.status(400).json({ message: "Could not extract coordinates from Google Maps URL" });
        }
        const user = await UserModel.findByIdAndUpdate(
            userId,
            {
                location: {
                    type: "Point",
                    coordinates: [coords.lng, coords.lat],
                    googleMapsUrl
                }
            },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const userObj = user.toObject();
        delete userObj.password;
        res.status(200).json({ message: "Location updated", user: userObj });
    } catch (err) {
        res.status(500).json({ message: "Failed to update location", error: err.message });
    }
});

module.exports = { userRouter };