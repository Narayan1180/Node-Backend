import { ShowAddProduct,createProduct,showDashBoard,Filterdashboard,dashboard } from "../controllers/product.controller.js";
import express from "express";
import { upload } from "../utils/multer.util.js";
import { authMiddlware } from "../middlewares/auth.middleware.js";

const router=express.Router()


router.get("/product",authMiddlware,ShowAddProduct)
router.get("/dashboard",authMiddlware,showDashBoard)
router.post("/product-create",upload.single("image"),createProduct)
router.get("/product/filter",authMiddlware,Filterdashboard)
router.get("/filter",authMiddlware,dashboard)

export default router;