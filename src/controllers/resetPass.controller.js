import crypto from "crypto";
import bcrypt from  "bcryptjs";
import User from "../models/User.models.js";
import { fileURLToPath } from "url";
import path from"path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const showForgetPassword= (req,res)=>{
    return res.sendFile(path.join(__dirname,"../public","forgetPassword.html"))
}

export const showResetPassword= (req,res)=>{
    const { token } = req.params;

    //return res.sendFile(path.join(__dirname,"../public","resetPassword.html"))
     res.render("reserPassword.ejs",{token})
}

export const forgetPassword = async(req,res)=>{
    
  try {
      const email = req.body
      
      const user = await User.findOne(email)
  
      if (!user){
          return res.status(400).json({message:"User Does not exist"})
      }
        
      
     const resetToken = user.getResetPasswordToken();
    
  
      await user.save();
  
      const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
  
      //res.json({message:resetUrl})
      return res.redirect(`/reset-password/${resetToken}`)
  } catch (error) {
    console.error(error)
    return res.status(500).json({message:error.message});
    
  }

} 



export const resetPassword = async(req,res)=>{

    try {
        console.log(req.params)
        const token=req.params.token ;
        console.log(req.body)
        const newPassword= req.body.password
        console.log(newPassword,req.body.password)
        console.log("token",token)
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex")
        console.log(hashedToken)
        const user = await User.findOne({resetPasswordToken:hashedToken,resetPasswordExpire:{$gt:Date.now()}})
    
        if (!user){
            return res.status(400).json({message:"User doest exist"})
        }

    
        user.password=newPassword;
        user.resetPasswordToken=undefined;
        user.resetPasswordExpire=undefined;
    
        await user.save({validateBeforeSave:false})
    
        return res.status(200).json({message:"password changed successFully"})
    
    } catch (error) {

        console.error(error)
        return res.status(500).json({message:error.message})
        
    }
}


