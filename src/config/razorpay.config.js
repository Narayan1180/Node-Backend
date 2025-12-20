import Razorpay from "razorpay"
//const Razorpay = require("razorpay");
console.log(process.env.RAZORPAY_KEY_ID,process.env.RAZORPAY_SECRET,process.env.JWT_SECRET)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET
});


export default  razorpay;
