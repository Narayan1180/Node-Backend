
import { setRandomFallback } from "bcryptjs";
import { getChannel } from "../config/RabbitMQ.js";
import { sendOrderPlacedEMail } from "./email.util.js";
async function startEmailWorker() {
  const channel = getChannel();

  channel.consume(
    "notification.email",
    async (msg) => {
      if (!msg) return;
      const emailData = JSON.parse(msg.content.toString());
      console.log("Sending email:", emailData);

        sendOrderPlacedEMail(emailData.email,emailData.orderId)
        console.log("Email sent ✅");
        channel.ack(msg); // acknowledge after success
      
    },
    { noAck: false }
  );

  console.log("Email worker started ✅");
}

export default startEmailWorker;
