
import "./config/env.js"; // 👈 MUST be line 1

import express from "express";
import mongoose from "mongoose";
import file_upload from "./models/fileUpload.model.js";
import path from "path"
import multer from "multer";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { v2 as cloudinary } from "cloudinary";

import authRouter from "./routes/route.auth.js";
import productRouter from "./routes/route.product.js"
import cookieParser from "cookie-parser"
import orderRouter from "./routes/order.route.js"
import cartRouter from "./routes/cart.route.js";

import { connectRedis } from "./config/redis.js";

const app=express()

import session from "express-session";
import flash from "connect-flash";
//await connectRedis()
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secretKey",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(flash());

// Make flash messages available in all EJS templates
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

//app.use(express.urlencoded({ extended: true }));  // for form POSTs

app.use(express.urlencoded({ extended: true }));
//app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public")));

app.set("views", path.join(__dirname, "views"));

app.set("view engine", "ejs");
//app.set("views", path.join(process.cwd(), "src/views"));


app.use(cookieParser())
app.use(express.json());

app.use("/",authRouter)
app.use("/show",productRouter)
app.use("/cart",cartRouter)
app.use("/order",orderRouter)


app.get("/", (req, res) => {
  res.redirect("/login");
});

const port=process.env.PORT

mongoose.connect(process.env.MONGO_URL).then(()=>console.log("MongoDb is connected")).catch((err)=>{console.log(err)})





// ------------------ Cloudinary Config ------------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ------------------ Multer Local Storage ------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/uploads"); // local folder to store file temporarily
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // unique file name
  },
});

const upload = multer({ storage });

// ------------------ Express ------------------
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>File Upload Test</title>
      </head>
      <body style="font-family: Arial; padding: 40px;">
        <h2>Upload File to Cloudinary</h2>

        <form action="/upload" method="POST" enctype="multipart/form-data">
          <input type="file" name="file" required />
          <br /><br />
          <button type="submit">Upload</button>
        </form>

      </body>
    </html>
  `);
});


// ------------------ FILE UPLOAD ROUTE ------------------
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;
    
    console.log(req.file)
    console.log(filePath)
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "src/uploads",
    });
    console.log(result)

    const image = new file_upload({url:result["secure_url"],public_id:result["public_id"],size:result["bytes"]})
    await image.save()
    // Delete local file after upload
    //fs.unlinkSync(filePath);

    res.json({
      message: "File uploaded successfully",
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ------------------ Start Server ------------------

app.listen(port,()=>{console.log(`Server is listening to the port ${port}`)})








