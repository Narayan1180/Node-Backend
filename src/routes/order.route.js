import express from "express";
import { OrderItem,CheckOutPage,CreateOrder,getOrder,verifyPayment,razorpayWebhook ,trackOrder,getAllOrders,cancellOrder,payForOrder} from "../controllers/order.controller.js";
import { authMiddlware } from "../middlewares/auth.middleware.js";
const router = express.Router();

// routes/order.routes.js



//router.get("/:id",authMiddlware, getOrder);

router.get("/ord/:id",authMiddlware, getOrder);
router.get("/check-out",authMiddlware,CheckOutPage)

router.get("/order-items/:id",authMiddlware,OrderItem)
router.post("/create-order",authMiddlware,CreateOrder)
router.post("/payment/verify/",authMiddlware,verifyPayment)
// routes/order.routes.js
router.get("/track/:orderId", authMiddlware, trackOrder);
router.post("/webhook/razorpay", express.raw({ type: "application/json" }), razorpayWebhook);

router.get("/allOrders",authMiddlware,getAllOrders)

router.post("/cancel/:id",authMiddlware,cancellOrder)
router.get("/pay/:id",authMiddlware,payForOrder)

export default router;



