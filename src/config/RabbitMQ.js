// config/rabbit.js
import amqp from "amqplib";

let channel;

export async function connectRabbit() {
  if (channel) return channel; // reuse connection
  const conn = await amqp.connect(process.env.RABBITMQ_URL);
  channel = await conn.createChannel();
  console.log("rabbitMq Is connected")
  await channel.assertQueue("notification.email", { durable: true });
  return channel;
}

export function getChannel() {
  if (!channel) throw new Error("RabbitMQ not connected yet");
  return channel;
}
