const mongoose=require("mongoose")

const cartProductSchema=mongoose.Schema({
    productId: { type: String, required: true },
    quantity: { type: Number, required: true },
})
const CartProductModel=mongoose.model("cartProduct",cartProductSchema)

module.exports={
    CartProductModel
}