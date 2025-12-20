import jwt from "jsonwebtoken";

export const accessToken= (userId)=>{

    const token=  jwt.sign({id:userId},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRE})

    return token
}

export const refreshToken= (userId,tokenVersion)=>{

    const token=  jwt.sign({id:userId,v:tokenVersion},process.env.REFRESH_SECRET,{expiresIn:process.env.REFRESH_EXPIRE})

    return token
}


export const verifyAccessToken= (token)=> {
    const user=jwt.verify(token,process.env.JWT_SECRET)
    return user
}

export const verifyRefreshToken = (token)=>{
    try {
        const user=jwt.verify(token,process.env.REFRESH_SECRET)
        return user
    } catch (error) {
        console.log("invalid refresh token")
    }
}