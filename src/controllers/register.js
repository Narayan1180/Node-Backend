import mongoose from "mongoose"
import validator from "validator"
import User from "../models/User.models.js"
import path from "path"
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs"
import file_upload from "../models/fileUpload.model.js";
import Product from "../models/product.model.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { accessToken,refreshToken,verifyRefreshToken,verifyAccessToken } from "../utils/utl.loginToken.js"


export const  registerPage =(req,res)=>{
   return res.sendFile(path.join(__dirname,"../public","register.html"))

}

export const  loginPage =(req,res)=>{
  res.render("login.ejs")
  //return res.sendFile(path.join(__dirname,"../public","login.html"))

}


export const registerController =  async (req,res)=>{
    try {
        const {name,email,password}=req.body
        console.log(name,email,password)
        if (!validator.isEmail(email)){
            req.flash("error_msg","Please Enter Valid Email Address.")

            return res.status(400).redirect("/register")}
    
        const check = await User.findOne({email})
        console.log(check)
        if (check){
            req.flash("error_msg","User already registered Please logIn!.")

            return res.status(400).redirect("/login")}

        //const hash_password= await bcrypt.hash(password,10)

        const user = new User({name,email,password})
    
        await user.save()
        
        req.flash("success_msg","User Registered Successfully.")
        return res.status(200).redirect("/login")
       } 

catch (error) {
    console.error(error)
    return res.status(500).json({"err":error.message})
}

}

const CookieOption = { httpOnly: true,
      sameSite: process.env.NODE_ENV==="production"?"strict":"lax",
      secure: process.env.NODE_ENV==="production",
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
    }

export const loginController = async (req, res) => {
  try {
    let { email, password } = req.body;

    email = email.trim();
    password = password.trim();

    const user = await User.findOne({ email });
    console.log("User found:", user);

    if (!user){
      req.flash("error_msg","Please Enter Valid Email Address Or Register.")

      return res.status(400).redirect("/login");}

    const match =  await user.comparePassword(password,user.password);
    //console.log( await bcrypt.hash("12345",10))
    console.log("Password match:", match,password,user.password);

    if (!match){
      req.flash("error_msg","Wrong Password.")

      return res.status(400).redirect("/login");}

    // Generate tokens
    const accessTokenValue = await accessToken(user._id);
    const refreshTokenValue = await refreshToken(user._id,user.tokenVersion);
    console.log(accessTokenValue,refreshTokenValue)
    // Save refresh token
    user.refreshToken = refreshTokenValue;
    await user.save();

    res.cookie("refreshToken", refreshTokenValue, {CookieOption})
    res.cookie("accessToken", accessTokenValue, {CookieOption}
);
    /*let result= await file_upload.find({})
    console.log(result)
    let html='<html>'
    result.forEach(r=>{
      console.log(r.url)
      html+=`<img src=${r.url} alt="some image" width="300">`
    })
    html+= `<a href="/logout"
  style="display:inline-block; padding:8px 16px; background:red; color:white; text-decoration:none; border-radius:5px;">
  Logout
</a>
`+`</html>`
    res.send(html)
    /*return res.json({
      accessToken: accessTokenValue,
      message: "Login successful",
    }); */

   //const products= await Product.find({})
   console.log(user.name)
  req.flash("success_msg","User logged in Successfully.")

   return res.redirect("/show/dashboard")
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


export const refresh = async(req,res)=>{

  try{

      const  token=req.cookies?.refreshToken;
      console.log(token)

      let payload

      if (!token){
        return res.staus(401).json({"message":"token Not Found"})
     }

    
    try {

            payload=  verifyRefreshToken(token)

  } catch (error) {
    console.log("err",error)
    return res.status(401).json({message:"Invalid or expired refreshToken"})
  } 
  console.log(payload)
  const user_id = payload.id
  const token_v=payload.v
  console.log(user_id,token_v)
  const user= await User.findById(user_id)
  console.log(token_v,user.tokenVersion,payload)
  if (!user)
  {
    return res.status(401).json({message:"User not found"})}

  if (token_v!=user.tokenVersion){
    return res.status(401).json({message:"token version mismatch"})}

  if (!user.refreshToken || token!=user.refreshToken)
   { return res.status(401).json({message:"refresh Token mismatch or possible reuse"})}
  console.log(user)
  const new_accessToken = accessToken(user._id)
  const new_refreshToken=refreshToken(user._id,token_v+1)

  user.refreshToken =new_refreshToken
  user.tokenVersion=token_v+1
  await user.save()
  res.cookie("refreshToken",new_refreshToken,CookieOption)

  res.json({"acccessToken":new_accessToken})

}
catch(error){

  return res.status(401).json({message:error.message})
}

}


export const logout = async(req,res)=>{
 
  try {
    console.log("req.cookies",req.cookies)

    const Cookies = req.cookies

    if (Cookies){

      for (let cookie in Cookies){
        console.log(cookie)
        res.clearCookie(cookie,CookieOption)
      }
    }
    /*const token= req.cookies?.refreshToken

    if (!token){
      res.clearCookie("refreshToken",CookieOption)
      return res.json({message:"logged Out"})
    }

    const user= await User.findOne({refreshToken:token})

    if (user){
      user.refreshToken=""
      await user.save()}

    res.clearCookie("refreshToken",CookieOption) */
    console.log(req.cookies)
    res.status(200).redirect("/login")

    
  } catch (error) {
      res.status(400).json({message:"logout failed"})
  }

  

  


}
