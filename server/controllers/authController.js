import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js';
import { text } from 'express';
import transporter from '../config/nodemailer.js';

export const register = async (req,res)=> {
        console.log("BODY:", req.body);
    console.log("CONTENT TYPE:", req.headers["content-type"]);
    const {name,email,password} = req.body ;

    if(!name || !email || !password ){
        return res.json({
            success:false,message:'Missing Details'
        })
    }

    try{
        const existingUser = await userModel.findOne({email})
        if(existingUser){
            return res.json({
                success:false,message:"User Already Exists"
            })
        }
        const hashedPassword = await bcrypt.hash(password,10);

        const user = new userModel({
            name,email,password:hashedPassword
        });

        await user.save();

        const token  = jwt.sign({id:user._id},process.env.JWT_SECRET,{ expiresIn :'7d'});

        res.cookie('token',token ,{
            httpOnly:true,
            secure:process.env.NODE_ENV ==="production",
            sameSite:process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge:7*24*60*60*1000 
        })

        //sending welcome email
        const mailOptions={
            from :process.env.SENDER_EMAIL,
            to:email,
            subject:"welcome to Swapnil's Stack",
            text:`Welcome to Swapnil's Website.Your Account has been created with Email id: ${email}`
        }

        await transporter.sendMail(mailOptions);

        return res.json({
            success:true,message:"User register Sucessfully"
        });

    } catch(error){
       res.json({
         success:false,message:error.message
       }) 
    }
}

export const login = async (req,res) =>{
    const {email,password}= req.body;
    if(!email || !password ){
        res.json({
            success:false,message:"email and password are required"
        })
    }
    try{
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({
                success:false,message:"invaild email"
            })
        }
        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.json({
                success:false,message:"invaild password"
            })
        }

        const token  = jwt.sign({id:user._id},process.env.JWT_SECRET,{ expiresIn :'7d'});

        res.cookie('token',token ,{
            httpOnly:true,
            secure:process.env.NODE_ENV ==="production",
            sameSite:process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge:7*24*60*60*1000 
        })

        return res.json({
            success:true
        })


    }catch(err){
        return res.json({
            success:false,message:err.message
        })
    }
}

export const logout = async (req,res)=>{
  try {
    res.clearCookie('token',{
            httpOnly:true,
            secure:process.env.NODE_ENV ==="production",
            sameSite:process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge:7*24*60*60*1000         
    })

    return res.json({
        success:true,message:"Logged Out"
    })
  } catch (err) {
    return res.json({
      success: false,
      message: err.message,
    });
  }
}

// send verifiation otp to the user's email 
export const sendVerifyOtp = async (req,res)=>{
    try {
        const {userId}=req.body;

        const user = await userModel.findById(userId);
        
        if(user.isAccountVerified){
            return res.json({
                success:false,message:"Account Already Verified"
            })
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.verifyOtp = otp;
        user.verifyOtpExpireAT= Date.now()+24 * 60 * 60 *1000

        await user.save();
        const mailOption={
            from :process.env.SENDER_EMAIL,
            to:user.email,
            subject:"Account Verification Otp",
            text:`Your OTP is ${otp}.Verify this Account With This Otp.`
        }
        await transporter.sendMail(mailOption);

        res.json({
            success:true,
            message:"Verification OTP send on Email"
        })

    } catch (error) {
        res.json({success:false,message:error.message});
    }
}

export const verifyEmail = async (req,res)=>{
    const {userId,otp} = req.body;

    if(!userId || !otp){
        return res.json({
            success:false,
            message:"missing details"
        })
    }
    try {
        const user = await userModel.findById(userId);

        if(!user){
            return res.json({
                success:false,
                message:'user not found'
            })
        }
        
        if(user.verifyOtp === '' || user.verifyOtp !==otp){
           return res.json({
                success:false,
                message:'invaild Otp'
            })  
        }

        if(user.verifyOtpExpireAT < Date.now()){
             return res.json({
                success:false,
                message:'Otp expired'
            })
        }

        user.isAccountVerified=true;
        user.verifyOtp='';
        user.verifyOtpExpireAT=0;
        
        await user.save();

        return res.json({
            success:true,
            message:"email verified sucessfully"
        })
        
    } catch (error) {
        res.json({success:false,message:error.message});
    }
}