import { loginController,registerPage,loginPage,registerController,logout,refresh } from "../controllers/register.js";
import { forgetPassword,resetPassword,showForgetPassword,showResetPassword } from "../controllers/resetPass.controller.js";
import express from "express"

const router=express.Router()

router.get("/login",loginPage)
router.get("/register",registerPage)
router.post("/login",loginController)

router.post("/register",registerController)
router.get("/logout",logout)
router.get("/refresh",refresh)
router.get("/forget-password",showForgetPassword)
router.get("/reset-password/:token",showResetPassword)

/*router.get("/reset-password/:token", (req, res) => {
  const token = req.params.token; // this works because URL matches route
  res.send(`
    <form method="POST" action="/reset-password/${token}">
      <input type="password" name="password" />
      <button type="submit">Update</button>
    </form>
  `);
});*/

router.post("/forget-password",forgetPassword)
router.post("/reset-password/:token",resetPassword)
export default router


