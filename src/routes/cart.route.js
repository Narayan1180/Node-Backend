import express from "express";
import { addToCart ,showCartItems,cartUpdate,removeCart} from "../controllers/cart.controller.js";
import { authMiddlware } from "../middlewares/auth.middleware.js";
const router=express.Router()

router.get("/items",authMiddlware,showCartItems)
router.post("/add",authMiddlware,addToCart)
router.post("/update",authMiddlware,cartUpdate)
router.post("/remove",authMiddlware,removeCart)

export default router;