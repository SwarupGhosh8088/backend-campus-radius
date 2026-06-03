import nodemailer from "nodemailer"
import { User } from "../module/user.module.js"


export const verifyMail = async (otp, email) => {

    //transponder
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        }
    })

  const mailConfigurations = {
  from: process.env.SMTP_USER,
  to: email,
  subject: "Verify Your Email Address",
  html: `
    <div style="background:#f4f6f9;padding:40px 20px;font-family:Arial,sans-serif;">
      <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background:#4f46e5;padding:25px;text-align:center;">
        
          <h1 style="color:white;margin:0;font-size:24px;">
            Campus Radius
          </h1>
        </div>

        <!-- Content -->
        <div style="padding:40px 30px;text-align:center;">
          <h2 style="color:#1f2937;margin-bottom:15px;">
            Email Verification
          </h2>

          <p style="color:#6b7280;font-size:16px;line-height:1.6;">
            Thank you for joining Campus Radius. Please use the verification code below to complete your registration.
          </p>

          <div style="
            background:#eef2ff;
            border:2px dashed #4f46e5;
            border-radius:10px;
            padding:20px;
            margin:30px 0;
          ">
            <h1 style="
              margin:0;
              letter-spacing:8px;
              color:#4f46e5;
              font-size:38px;
            ">
              ${otp}
            </h1>
          </div>

          <p style="color:#ef4444;font-weight:bold;">
            This OTP will expire in 5 minutes.
          </p>

          <p style="color:#6b7280;font-size:14px;margin-top:25px;">
            If you didn't request this verification, you can safely ignore this email.
          </p>
        </div>

        <!-- Footer -->
        <div style="
          background:#f9fafb;
          padding:20px;
          text-align:center;
          border-top:1px solid #e5e7eb;
        ">
          <p style="margin:0;color:#6b7280;font-size:13px;">
            © ${new Date().getFullYear()} Campus Radius. All rights reserved.
          </p>

          <p style="margin-top:8px;color:#9ca3af;font-size:12px;">
            Secure • Fast • Trusted
          </p>
        </div>
      </div>
    </div>
  `,
};

    //mail send

    transporter.sendMail(mailConfigurations, function (e, info) {
        if (e) {
            console.log(e)
            return
        }
        console.log("Success", info.response)
    })



}


export const otpMatch = async (req, res) => {
    const { email, otp } = req.body

    try {

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Please enter OTP"
            })
        }

        const user = await User.findOne({ email })

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "First register your email"
            })
        }

         //otp expiry time
        if (user.otpExpiry < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "OTP Expired"
            });
        }

        if (otp !== user.otp) {
            return res.status(400).json({
                success: false,
                message: "OTP not Matched !"
            })

        }
       
        user.otp = null
        user.otpExpiry = null
        user.isVerified = true
        await user.save()

        return res.status(200).json({
            success: true,
            message: "OTP Matched"
        })



    } catch (e) {
        return res.status(500).json({
            success: false,
            message: e.message
        })
    }
}


export const otpResend =async(req,res)=>
{
    const {email}=req.body

    try{

        if(!email)
        {
           return res.status(400).json({
                success: false,
                message: "Enter all Fields"
            }) 
        }

        const user =await User.findOne({email})

        if(!user)
        {
            return res.status(400).json({
                success: false,
                message: "Please Register first"
            })
        }
        if(user.isVerified)
        {
             return res.status(400).json({
                success: false,
                message: "You are already registered with this email"
            })

        }

        const otp=Math.floor(1000 + Math.random() * 9000).toString();
        

        user.otp = otp;

        user.otpExpiry = Date.now() + 5 * 60 * 1000;
        await user.save()

        verifyMail(otp,email)
        return res.status(200).json({
            success: true,
            message: "OTP sent successfully"
        })
        


    }
    catch (e) {
        return res.status(500).json({
            success: false,
            message: e.message
        })
    }


}