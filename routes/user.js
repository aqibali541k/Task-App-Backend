const express = require("express");
const authRouter = express.Router();
const User = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const { upload } = require("../config/cloudinary");
const authMiddleware = require("../middleware/authmiddleware");
const SECRET = "secretkey"; // env me rakhna later

authRouter.post("/register", upload.single("profilePic"), async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const profilePic = req.file ? req.file.path : "";

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields required" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            profilePic
        });

        await user.save();

        const token = jwt.sign(
            { id: user._id, email: user.email },
            SECRET,
            { expiresIn: "1d" }
        );

        res.status(201).json({
            message: "User created successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profilePic: user.profilePic
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// 🔑 LOGIN
authRouter.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profilePic: user.profilePic
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 🆘 FORGOT PASSWORD
authRouter.post("/forgot-password", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ message: "There is no user with that email" });
        }

        const resetToken = crypto.randomBytes(20).toString("hex");

        user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save();

        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please go to: \n\n ${resetUrl}`;

        try {
            await sendEmail({
                email: user.email,
                subject: "Password reset token",
                message,
            });

            res.status(200).json({ message: "Email sent successfully" });
        } catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();

            // Usually we return 500, but since credentials are dummy we still want success so user can check terminal logs
            return res.status(200).json({ message: "Email logic complete (check backend terminal if using dummy credentials)" });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 🔄 RESET PASSWORD
authRouter.put("/reset-password/:token", async (req, res) => {
    try {
        const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ message: "Password updated successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 🔄 UPDATE PROFILE PICTURE
authRouter.put("/update-profile-pic", authMiddleware, upload.single("profilePic"), async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!req.file) return res.status(400).json({ message: "No profile picture provided" });

        user.profilePic = req.file.path;
        await user.save();

        res.status(200).json({ message: "Profile picture updated", profilePic: user.profilePic });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = authRouter;