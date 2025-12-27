import { Order } from "../models/order.model.js";
import User from "../models/User.models.js";
import Product from "../models/product.model.js";
import Cart from "../models/cart.model.js";
import razorpay from "../config/razorpay.config.js";

import { resend,sendOrderPlacedEMail } from "../utils/email.util.js";
export const  CheckOutPage = async(req,res)=>{
    console.log("hello user u r inside order::")
    const cartItem= await Cart.find({"user":req.user.id}).populate("items.product");

    console.log(cartItem[0].items);


    const orderItems= cartItem[0].items.map(item=>({
        "product":item.product._id,
        "productName":item.product.name,
        "priceAtPurchase":item.product.price,
        "quantity":item.quantity,

        "subTotal":item.product.price*item.quantity

    }))
   // console.log(orderItems)
    const totalAmount=orderItems.reduce((sum,i)=>sum+i.subTotal,0);


    //const order=  await Order.create({user:req.user.id,items:orderItems,totalAmount:totalAmount,status:"PENDING"});

    

   // const your_order = await Order.findOne({"user":req.user.id})


    res.render("checkOut.ejs",{items:orderItems,totalAmount:totalAmount,    disclaimer: `*\Final amount will be calculated at order placement\*`
});

    

}


export const CreateOrder = async (req,res)=>{



 //console.log("hello user u r inside order::",req.body)
try {
        const cartItem= await Cart.find({"user":req.user.id}).populate("items.product");
    
       // console.log(cartItem[0].items);
    
    
        const orderItems= cartItem[0].items.map(item=>({
            "product":item.product._id,
            "productName":item.product.name,
            "priceAtPurchase":item.product.price,
            "quantity":item.quantity,
    
            "subTotal":item.product.price*item.quantity
    
        }))
        //console.log(orderItems)
        const totalAmount=orderItems.reduce((sum,i)=>sum+i.subTotal,0);
    
    
        const order=  await Order.create({user:req.user.id,items:orderItems,totalAmount:totalAmount,Address:req.body,status:"PENDING"});
        console.log("hello")
        let razorpayOrder
       
try {
             razorpayOrder = await razorpay.orders.create({
            amount: Math.round(totalAmount * 100), // paise
            currency: "INR",
            receipt: order._id.toString()})
    
} catch (error) {
    console.log("error in creating razorOrder:",error)
}      ;

     // console.log(razorpayOrder)
      console.log(JSON.stringify(razorpayOrder, null, 2));
    
      order.razorpayOrderId = razorpayOrder.id;
      console.log("razor")
      await order.save();
     console.log("hiii",process.env.RAZORPAY_KEY_ID)
      // 3️⃣ Render payment page
      res.render("razorpay.ejs", {
        razorpayKey: process.env.RAZORPAY_KEY_ID,
        orderId: order._id,
        razorpayOrderId: razorpayOrder.id,
        amount: totalAmount
      });
    
} catch (error) {
    console.error(error.message)
    return res.status(400).json({message:"something went wrong"})
    
}};

    

   //const your_order = await Order.findOne({"user":req.user.id})

   //res.redirect("/order/order-items")





export const OrderItem = async(req,res)=>{
       console.log(req.params.id)
       const your_order = await Order.findOne({"_id":req.params.id})
       console.log(your_order)
       res.render("orderItem.ejs",{order:your_order})

}


// controllers/order.controller.js
//import Order from "../models/order.model.js";

export const getOrder = async (req, res) => {
  try {
    console.log("hey>>>",req.params.id)
    const order = await Order.findById(req.params.id)
      .populate("items.product")
      .populate("user");

    if (!order) return res.status(404).send("Order not found");

    res.render("singOrder.ejs", { order });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};



import crypto from "crypto";
//import Order from "../models/order.model.js";

export const verifyPayment = async (req, res) => {
  try {
    console.log(req.body)
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      orderId
    } = req.body;

    // 1️⃣ Generate expected signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(sign)
      .digest("hex");

    // 2️⃣ Compare signatures
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    // 3️⃣ Update order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.status = "PAID";
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpayOrderId = razorpay_order_id;

    await order.save();



// async (non-blocking)

  sendOrderPlacedEMail(req.user.email, order._id)
  .catch(err => console.error("Email failed", err));


    res.json({ success: true, orderId: order._id });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }




};


export const trackOrder = async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId)
    .populate("items.product")
    .populate("user", "email");
  //console.log("insidde:",order)
  if (!order) {
    return res.status(404).render("error", {
      message: "Order not found"
    });
  }

  res.render("trackOrder", { order });
};



export const razorpayWebhook = async(req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  const signature = req.headers["x-razorpay-signature"];
  const body = req.body;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  if (expectedSignature !== signature) {
    return res.status(400).send("Invalid signature");
  }

  const event = JSON.parse(body.toString());

  if (event.event === "payment.captured") {
    const razorpayOrderId = event.payload.payment.entity.order_id;

    // Update order status
    await Order.findOneAndUpdate(
      { razorpayOrderId },
      { status: "PAID" }
    );
  }
  req.flash("success_msg","Payment Successful")
  res.status(200).send("OK");
};


export const getAllOrders = async (req, res, next) => {
  const orders = await Order.find({ user: req.user.id,status:{$ne:"CANCELLED"} })
    .sort({ createdAt: -1 });

  res.render("allOrder.ejs", {
    orders
  });
};



export const cancellOrder = async(req,res)=>{

   // console.log("hii ",req.params,req.body)


    const yourOrder= await Order.findById({"_id":req.params.id})

    if (!yourOrder){
      req.flash("error_msg", "This order cannot be cancelled");

      return res.redirect("/order/allOrders")
    }

    if (yourOrder.status==="PAID"){
          
          req.flash("error_msg", "This order cannot be cancelled");
          return res.redirect("/order/allOrders")


    }


    if (yourOrder.status!="PAID"){
      console.log(yourOrder.status)
        yourOrder.status="CANCELLED"

      await yourOrder.save()
      req.flash("success_msg","Your Order Cancelled Successfully")
      return res.redirect("/order/allOrders")

      return res.status(200).json({message:"Your Order Canceeled Succefully"})
    }
    yourOrder.status="CANCELLED"
   
    await yourOrder.save()

    req.flash("success_msg","Your order has been cancelled")
    
    res.redirect("/order/allOrders")



}


export const payForOrder = async(req,res)=>{

try {
    console.log("retry pay:",req.params)
  
    const your_order = await Order.findById({_id:req.params.id})
  
    console.log(your_order)
  
    if (!your_order){
      return res.status(400).json({message:"Order Does not exist"})
    }
     
    let razorpayOrder
         
  try {
               razorpayOrder = await razorpay.orders.create({
              amount: Math.round(your_order.totalAmount * 100), // paise
              currency: "INR",
              receipt: your_order._id.toString()})
      
  } catch (error) {
      console.log("error in creating razorOrder:",error)
  }      ;
  
       // console.log(razorpayOrder)
        console.log(JSON.stringify(razorpayOrder, null, 2));
      
        your_order.razorpayOrderId = razorpayOrder.id;
        console.log("razor")
        await your_order.save();
       console.log("hiii",process.env.RAZORPAY_KEY_ID)
        // 3️⃣ Render payment page
        res.render("razorpay.ejs", {
          razorpayKey: process.env.RAZORPAY_KEY_ID,
          orderId: your_order._id,
          razorpayOrderId: razorpayOrder.id,
          amount: your_order.totalAmount
        });
  
  
} catch (error) {
  res.status(500).json({meassgae:"Your Payment Failed"})
  
}
}
