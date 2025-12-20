import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import crypto from "crypto";

const user_schema= new mongoose.Schema({

    name:{type:String,required:true,trim:true},
    email:{type:String,required:true,lowercase:true},
    password:{type:String,required:true,trim:true},
    refreshToken:{type:String,
        default:""
    },
    tokenVersion:{type:Number,
      default:1,
    },
   resetPasswordToken:{type:String},
   resetPasswordExpire:{type:Date}
    
},{timestamps:true})


user_schema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password,10);
  
});


user_schema.methods.comparePassword = async function (user_password) {
  console.log("Entered password:", user_password);
  console.log("Hashed password in DB:", this.password);

  let res=await bcrypt.compare(user_password, this.password);
  return res
};

user_schema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};



const User=new mongoose.model("User",user_schema)

export default User;