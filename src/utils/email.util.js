// utils/sendEmail.js
/*import nodemailer from "nodemailer";

export const sendOrderPlacedEmail = async (to, order) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"Shop App" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Order Confirmed - ${order._id}`,
    html: `
      <h2>Payment Successful ✅</h2>
      <p>Your order has been placed.</p>
      <p><strong>Order ID:</strong> ${order._id}</p>
      <p><strong>Total:</strong> ₹${order.totalAmount}</p>
      <a href="${process.env.BASE_URL}/order/track/${order._id}">
        Track your order
      </a>
    `
  });
};*/


import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);


export const sendOrderPlacedEMail =  (to, orderId) => {
  try {
    const response =  resend.emails.send({
      from: `MyShop <onboarding@resend.dev>`,
      to,
      subject: "Order Confirmed 🎉",
      html: `
        <h2>Order Confirmed</h2>
        <p>Your order <b>${orderId}</b> has been placed.</p>
        <a href="${process.env.BASE_URL}/order/order-items/${orderId}">
          Track Order
        </a>
      `
    });

    return response;
  } catch (error) {
    console.error("Email send failed:", error);
    throw error;
  }
};




  



