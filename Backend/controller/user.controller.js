import { User } from "../module/user.module.js";
import { otpResend, verifyMail } from "../verifyemail/mailVerify.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { configDotenv } from "dotenv";
import cors from "cors";


export const registerUser = async (req, res) => {

    const { email, password } = req.body;

    try {

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        const existingUser = await User.findOne({ email });

        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        if (existingUser && existingUser.isVerified) {
            return res.status(400).json({
                success: false,
                message: "User already registered with this email"
            });
        }

        if (existingUser && !existingUser.isVerified) {

            existingUser.otp = otp;
            existingUser.otpExpiry = Date.now() + 5 * 60 * 1000;

            await existingUser.save();

            await verifyMail(otp, email);

            return res.status(200).json({
                success: true,
                message: "OTP resent successfully"
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            email,
            password: hashPassword,
        });

        const token = jwt.sign(
            { id: newUser._id },
            process.env.SECRET_KEY,
            { expiresIn: "1d" }
        );

        newUser.otp = otp;
        newUser.otpExpiry = Date.now() + 5 * 60 * 1000;
        newUser.token = token;

        await newUser.save();

        await verifyMail(otp, email);

        return res.status(201).json({
            success: true,
            message: "OTP sent successfully",
            data: newUser
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const loginUser = async (req, res) => {

    const { email, password } = req.body

    try {

        if (!email || !password) {
            return res.status(400).json(
                {
                    success: false,
                    message: "All the fields are required"
                })

        }


        const user = await User.findOne({ email })

        if (!user  ) {
            return res.status(400).json(
             
                {
                    success: false,
                    message: "You are not Registered"
                })
        }


        if (!user.isVerified ) {

            return res.status(400).json(
                {
                    success: false,
                    message: "You are not Verified"
                })
        }


        const isMatch = await bcrypt.compare(
            password,
            user.password
        )

        if (!isMatch) {
            return res.status(400).json(
                {
                    success: false,
                    message: "Wrong password Entered"
                })
        }



        const token = await jwt.sign({
            id: user._id,
            username: user.username,
        },
            process.env.SECRET_KEY,
            {
                expiresIn: "7d",
            }
        )

        user.token = token
        user.isLoggedIn = true
        user.otp = null
        user.otpExpiry = null

        await user.save()



        return res.status(201).json(
            {
                success: true,
                message: "User Login Successfull",
                data: user
            })

    }
    catch (e) {

        return res.status(500).json({
            success: false,
            message: e.message

        })



    }

}

export const updateUser = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized user",
            });
        }


        const { username, college, phone, role } = req.body;

        if (!username || !college || !phone) {
            return res.status(400).json({
                success: false,
                message: "Please Enter All Details",
            });
        }

        // block admin spoofing
        if (role === "admin") {
            return res.status(403).json({
                success: false,
                message: "Not allowed",
            });
        }

        // phone validation (basic India-friendly check)
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({
                success: false,
                message: "Invalid phone number",
            });
        }

        const updateData = {
            username,
            phone,
            college,
        };

        if (req.file) {
            updateData.dp = req.file.path;
        }

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        ).select("-password -otp");

        return res.status(200).json({
            success: true,
            message: "Updated Successfully",
            data: user,
        });

    } catch (e) {
        return res.status(500).json({
            success: false,
            message: e.message,
        });
    }
};

export const getUser = async (req, res) => {
    const userId = req.user?.id;

    try {
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }

        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found, please log in again",
            });
        }

        return res.status(200).json({
            success: true,
            message: "User data fetched successfully",
            data: user,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }

}