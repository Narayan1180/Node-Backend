import Product from "../models/product.model.js";
import User from "../models/User.models.js";
import Cart from "../models/cart.model.js";


export const addToCart = async(req,res)=>{

    console.log("user:",req.user,req.body["productId"],req.body.productId)

    const user = await User.findOne({"_id":req.user.id})

    const product=await Product.findOne({"_id":req.body.productId})

    if ((!user)||(!product)){
        console.log("something went wrong")
        return res.satus(401).redirect("/show/dashboard")

    }
   // console.log(user,product)
   // console.log(user._id,product._id,req.body.productId)

    const cart_user = await Cart.findOne({"user":req.user.id})
    console.log(cart_user)
    if (!cart_user){
           const cartItem= new Cart({user:user._id,items:[{"product":product._id,"quantity":1}]})
           await cartItem.save()
           return     res.status(200).json({message:"success",cartCount:1})




    }
    else{

        const findIndexOfproductId = cart_user.items.findIndex(item=>item.product._id.toString()===product._id.toString())
        console.log("index found",findIndexOfproductId)
        if (findIndexOfproductId>-1){
            cart_user.items[findIndexOfproductId].quantity+=1
            console.log("inside")
        }

        else{
            console.log("inside",cart_user)
            cart_user.items.push({"product":product._id,"qunatity":1})
        }
    }

    await cart_user.save()
    console.log("Items Successfully added to the Cart")
    const redirectUrl = req.headers.referer || "/show/dashboard";
    console.log(redirectUrl)
    req.flash("success_msg","items added to the cart")
    res.status(200).json({message:"success",cartCount:cart_user.items.length})
     console.log(cart_user.items.length)
      


    
}

export const showCartItems= async(req,res)=>{

    console.log("welcoem to Cart",req.user,req.user.id)

    const user= await User.findOne({"_id":req.user.id})
    console.log(user)
    if (!user){
        return res.redirect("/show/dashboard")
    }

    const cartItems = await Cart.find({"user":req.user.id}).populate("items.product")//find returns array
    console.log(cartItems)
    if (cartItems.length==0){
        req.flash("error_msg", "User don,t have items in cart please add to create it.");

        return res.redirect("/show/dashboard")
    }
    cartItems[0].items.forEach( item=>{
        console.log("your tem:",item)
    })
  // console.log("lok at u r ",cartItems[0].items)

    res.render("showCart.ejs",{cart:cartItems[0].items})
}

export const cartUpdate = async(req,res)=>{
      console.log("u r inside cart update ::",req.body)
      console.log(req.user)

      const user_id= req.user.id;
      const productId=req.body.productId;
      console.log(user_id,productId)

      const user_cart = await Cart.findOne({"user":user_id}).populate("items.product")
      console.log(user_cart.items)


    const findIndexOfproductId = user_cart.items.findIndex(item=>item.product._id.toString()===productId.toString())
    console.log("index found",findIndexOfproductId)
    if (findIndexOfproductId>-1){

        if (req.body.action==="increase"){
                   user_cart.items[findIndexOfproductId].quantity+=1

        }
        if (req.body.action==="decrease" && user_cart.items[findIndexOfproductId].quantity>0){
            user_cart.items[findIndexOfproductId].quantity-=1

        }}

               await user_cart.save()

     const product=user_cart.items[findIndexOfproductId]
     const total=product.product.price*product.quantity
     const grandTotal=  user_cart.items.reduce((sum,item)=>sum+item.product.price*item.quantity,0)
     
   //  console.log(total,grandTotal,user_cart.items[findIndexOfproductId])

        
     return res.json({ success: true, cartCount:0, itemQty: user_cart.items[findIndexOfproductId].quantity,total:total,grandTotal:grandTotal
 });

     return res.redirect("/cart/items")

}


export const removeCart = async(req,res)=>{

    //console.log(req.user.id,req.body)

    const user_cart= await Cart.findOne({user:req.user.id}).populate("items.product")
    const indexOfProduct= user_cart.items.findIndex(item=>item.product._id.toString()==req.body.productId)
    //console.log(user_cart.items,findIndex)

    if (indexOfProduct!=-1){
        //console.log(user_cart.items[findIndex])
        user_cart.items.splice(indexOfProduct,1)
    }
    await user_cart.save()

    return res.redirect("/cart/items")


}

export const count_cart= async(req,res)=>{
try {
    
        const user = await Cart.findOne({"user":req.user.id})
        let cartCount=0
        if (user){
            cartCount= user.items.length
        }
    
        res.json({cartCount:cartCount})
} catch (error) {
    console.error(error)
    res.status(500).json({cartCount:0})
    
}

}

