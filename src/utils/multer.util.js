import multer  from "multer";

import {v2 as cloudinary} from "cloudinary";


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

export const upload = multer({ storage });



/*
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
}) */
