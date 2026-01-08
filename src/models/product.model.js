import mongoose from "mongoose"

const product_schema= new mongoose.Schema({
    name:{type:String,
        required:true,
    },
    brand:{type:String,required:true},
    image:{type:String,
        required:true,
    },
    price:{type:Number,
        required:true,
    },
    category:{type:String,
        required:true,
        enum:["Electronics","Clothing","Foods","Fashion","Books"]
    },
    seller:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    stocks:{type:Number,
        default:0,
        required:true
    }
})


const Product = new mongoose.model("Product",product_schema)

export default Product