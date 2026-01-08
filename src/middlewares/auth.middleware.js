import User from "../models/User.models.js"
import jwt from "jsonwebtoken";
export const authMiddlware = async(req,res,next)=>{

    try {
        const access_Token= req.cookies.accessToken
       // console.log("acees_token",access_Token,req.cookies)
       console.log(req.headers)
        if (!access_Token){
            return res.redirect("/login")
        }
        const decoded=jwt.verify(access_Token,process.env.JWT_SECRET)
        req.user=decoded
        const user= await User.findOne({"_id":req.user.id})

        req.user.email=user.email;
        req.user.name=user.name
       // console.log(req.user.id,decoded,req.user.email,req.user.name)
       console.log(decoded)
        next()
        
    } catch (error) {

        console.error("err:",error.message)
        res.status(401).redirect("/login")
        
    }
}