import express, { Router } from "express"
import { getUser, loginUser, registerUser, updateUser } from "../controller/user.controller.js"
import { otpMatch, otpResend } from "../verifyemail/mailVerify.js"
import { authMiddleware } from "../middleware/userAuth.js"
import { upload } from "../middleware/cloudinary.js"


const router= express.Router()


router.post("/register",registerUser)
router.post("/login",loginUser)
router.post("/otpmatch",otpMatch)
router.post("/otpresend",otpResend)
router.get("/getuser",authMiddleware,getUser)

router.put("/update", authMiddleware, upload.single("dp"), updateUser);





export default router
