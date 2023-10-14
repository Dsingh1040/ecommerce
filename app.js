const express=require("express")
require("dotenv").config()
const {connection}=require("./config/db")
const {userRouter}=require("./router/userRouter")
const {productRouter} = require('./router/productRouter')
const{authMiddleware}=require("./middleware/authenticate")
const { cartRouter } = require("./router/cartRouter")
const cors=require("cors")
const app=express()

app.use(cors())

app.use(express.json())


app.get("/",async(req,res)=>{
    try{
        res.send("Home-Page")
    }
    catch(error){
        console.log(`Error:${error}`)
    }
})

app.use("/user",userRouter)

app.use(authMiddleware)
app.use("/product",productRouter)
app.use("/cart",cartRouter)




/* Dont touch below code  */
const port=process.env.port||3000
app.listen(`${port}`,async()=>{
    try{
        await connection
        console.log("Database connected Successfully")
       
    }
    catch(error){
        console.log('Error', error.message)
    }
    console.log(`Server running in port ${port}`)
})