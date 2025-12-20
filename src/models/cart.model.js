import mongoose from "mongoose"

const Cart_Schema = new mongoose.Schema(

{
      user :{ type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true

      },

      items:

        [
           {
            product: {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Product",
            },
        quantity:{
            type:Number,
            default:1
        }
    }
    ]
}
    
)

const Cart = new mongoose.model("Cart",Cart_Schema);

export default Cart;