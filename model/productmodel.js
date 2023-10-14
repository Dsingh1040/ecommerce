const mongoose=require("mongoose")

const productSchema=mongoose.Schema({
    name:String,
    image:String,
    size:String,
    price:String,
    description:String,
    rating:String,
    category:String
})

const ProductModel=mongoose.model("products",productSchema)
module.exports={ProductModel} //exporting the model to be used in other files
