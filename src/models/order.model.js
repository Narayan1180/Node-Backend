import mongoose from "mongoose";



const Order_Schema = new mongoose.Schema({

    user:{type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    items:[{product:{type:mongoose.Schema.Types.ObjectId,
            ref:"Product",required:true},
     productName:{type:String,
        required:true},
    
    priceAtPurchase:{type:Number,required:true},

    quantity:{type:Number,min:1,required:true},


    subTotal:{type:Number,required:true},

   }],
    
   totalAmount:{type:Number,required:true},
    
   Address:{name:{type:String},
          phone:{type:String, match: /^[6-9]\d{9}$/
},
          address1:{type:String,},
          city:{type:String},
          state:{type:String},
          pincode:{type:String,    match: /^\d{6}$/
}
         },

    status:{type:String,
        enum:["PENDING","FAILED","PAID","SHIPPED","CANCELLED","DELIVERED"],
        default:"PENDING"},

    razorpayOrderId:String,
    razorpayPaymentId:String

},{timestamps:true})

Order_Schema.index({user:1});
Order_Schema.index({status:1});


export const Order = new mongoose.model("Order",Order_Schema);