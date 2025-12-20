import mongoose from "mongoose"


const file_schema = new mongoose.Schema({

    url:{type:String,
        required:true,
    },

    public_id:{
        type:String,
        required:true,
    },

    size:{
        type:Number,
        default:0
    }

},{timestamps:true})

const file_upload = new mongoose.model("File",file_schema)

export default file_upload