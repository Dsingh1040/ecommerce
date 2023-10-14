const express = require("express");
const{checkRole}=require("../middleware/authorise")
const { ProductModel } = require("../model/productmodel");

const productRouter = express.Router();

/* ================================= This route is used for getting data using searching sort category =============================== */
productRouter.get("/",checkRole('read'),async (req, res) => {
  const category = req.query.category;
  const name = req.query.name;
  const sortData = req.query.sort;
  try {
    if (category) {
      const data = await ProductModel.find({ category });
      res.status(200).json(data);
    } else if (sortData && category) {
      if (sortData == "asc") {
        const data = await ProductModel.find({ category }).sort({ price: 1 });
        res.status(200).json(data);
      } else {
        const data = await ProductModel.find({ category }).sort({ price: -1 });
        res.status(200).json(data);
      }
    } else if (sortData) {
      if (sortData == "asc") {
        const data = await ProductModel.find().sort({ price: 1 });
        res.status(200).json(data);
      } else {
        const data = await ProductModel.find().sort({ price: -1 });
        res.status(200).json(data);
      }
    } else if (name) {
      const data = await ProductModel.find({ name });
      res.status(200).json(data);
    } else {
      const data = await ProductModel.find();
      res.status(200).json(data);
    }
  } catch (error) {
    res.status(404).send({"msg":"Data not Found","error":error.message})
  }
});


/* ============================== This Route is used for Searching ==================================== */ 
productRouter.post("/search", checkRole('read','write'),async (req, res) => {
    try {
        let searchText = new RegExp(`${req.body.text}`, 'i');
        const products = await ProductModel.find({
            $or: [{ 'name': searchText }, { 'description': searchText }]
        });

        if (products.length === 0) {
            return res.status(404).json({ "error": "No Products found" });
        }

        return res.status(200).json(products);
    } catch (error) {
        return res.status(500).json({ 'error': 'Internal Server Error', 'message': error.message });
    }
});


/* =========================== This route for Adding the data to the database ====================================== */

productRouter.post("/create",checkRole('write'),async(req,res)=>{
    const payload=req.body
    try{
        const product=new ProductModel(payload)
        await product.save()
        res.status(200).json("Product Created Successfully!")
    }
    catch(error){
        res.status(400).send({"msg":"product not created","error":error.message})
    }
})

/* ================================== This Route for Updating the data ========================= */

productRouter.patch("/update/:id",checkRole('update'),async(req,res)=>{
    const productId= req.params.id;
    try{
    await ProductModel.findByIdAndUpdate({_id:productId})
    return res.status(200).json({"msg":`product with id:${productId} has been updated Successfully`})
    }
    catch(error){
        return   res.status(401).send({'msg':'Not Updated','Error':error.message})
    }

})

/* ================================== This Route for Deleted  the data ============================= */

productRouter.delete("/delete/:id", checkRole('delete'),async (req, res) => {
  const productId = req.params.id;
  try {
    await ProductModel.findByIdAndDelete(productId); // Pass productId directly as a string
    res.status(200).json({ "msg": `The Product of ${productId} is deleted successfully` });
  } catch (error) {
    res.status(400).send({ "msg": "Unable to delete", "error": error.message });
  }
});


module.exports={
    productRouter
}