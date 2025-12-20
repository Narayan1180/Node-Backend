
import Product from "../models/product.model.js";
import path from "path";
import { fileURLToPath } from "url";
import { cloudinaryUploader } from "../utils/cloudinary.util.js";
import { authMiddlware } from "../middlewares/auth.middleware.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//import redisClient from "../config/redis.js"
export const ShowAddProduct= async(req,res)=>{

    return res.sendFile(path.join(__dirname,"../public","product.html"))

}

export const createProduct= async(req,res)=>{
   try{
    const {name,image,price,category,seller,stock}=req.body;
    const filePath=req.file.path
    console.log(req.body,req.file)
    const result= await cloudinaryUploader(filePath)
    console.log(result)
    
    const product=new Product({name,image:result.secure_url,price,category,seller,stocks:stock});
    await product.save()
    return res.status(200).json({message:"image successfully uploaded to the cloud"})

   }

   catch(error){
    console.log(error.message)
    return res.status(400).json({message:"product Creation failed"})
   }


}

export const showDashBoard = async(req,res)=>{

    const products= await Product.find({});

    return res.render("dashboard.ejs",{products,name:req.user.name})
}


export const Filterdashboard = async (req, res) => {
  const { search, category } = req.query;
 console.log(search,category)
  let filter = {};

  if (search) {
    filter.name = { name: search.trim() };
  }

  if (category) {
    filter.category = category;
  }

  const products = await Product.find({name:search,category:category});
  console.log(products,filter)
  return res.render("dashboard.ejs",{products,name:req.user.name})

  /* res.render("dashboard", {
    products,
    name: req.user.name,
    search,
    category
  });*/
};




export const dashboard = async (req, res) => {
  try {
    const { search, category } = req.query;
    console.log(search,category)
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const skip = (page - 1) * limit;

    let filter = {};
    /*const cacheKey = `products:${JSON.stringify({search,category,currentPage:page})}`

    const cached = await redisClient.get(cacheKey);
    if (cached){
        console.log("From Redis")
        return res.render("pagination.ejs", {products:JSON.parse(cached),currentPage:page,totalPages:5,search,category}
    ); 



    }*/
    if (search && search.trim() !== "") {
      filter.name = { $regex: search, $options: "i" };
    }

    if (category && category !== "") {
      filter.category = category;
    }

    const totalProducts = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalPages = Math.ceil(totalProducts / limit);
    
    //await redisClient.setEx(cacheKey, 300, JSON.stringify(products));


    res.render("pagination.ejs", {
      products,
      currentPage: page,
      totalPages,
      search,
      category
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong");
  }
};

