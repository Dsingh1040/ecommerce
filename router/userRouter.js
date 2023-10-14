const express=require("express")
require("dotenv").config()
const {UserModel}=require("../model/userModel")
const{blacklistModel}=require("../model/blacklistModel")
const bcrypt=require("bcrypt")
const cookie=require("cookie-parser")
const jwt=require("jsonwebtoken")
const userRouter=express.Router()

/* user registration code present here */
userRouter.post("/register",async(req,res)=>{
    const {username,email,password,role}=req.body
    try{
        if(!email||!username||!password){
            return res.status(401).send({error:"Please provide all the fields"})
            }
            //check for duplicate email and username 
            let existingEmail = await UserModel.findOne({"email":email})
            console.log('existing',existingEmail)

            if (existingEmail) {
                return res.status(203).send({message: "This Email or Username is already taken."});
               
                }else if (!existingEmail){
                    //hash password
                    bcrypt.hash(password, 5,async(err,hash)=> {
                        if(err) res.send({"msg":"Something Went Wrong","error":err.message})
                        
                        else{
                            const user=new UserModel({username,email,password:hash,role})
                            await user.save()
                            res.send({"msg":"User has been Registered"})
                        }
                    });
                }
    }
   
        catch(err){
            res.send({"msg":"User not registered","error":err.message})
    
        }
})


/* user login code present here */
userRouter.post("/login", async (req, res) => {
    let { email, password } = req.body;
    try {
        // get data from body
        const user = await UserModel.findOne({ email }); // Use findOne instead of find to get a single user

        if (user) {
            bcrypt.compare(password, user.password, (err, result) => {
                if (err || !result) {
                    return res.status(401).send({ error: 'Invalid Credentials' });
                } else {
                    // Generate Access Token with short expiration time (15 minutes)
                    const accessToken = jwt.sign({ userId: user._id }, process.env.secretkey, {
                        
                        expiresIn: '7d'
                    });

                    // Generate Refresh Token with longer expiration time (30 days)
                    const refreshToken = jwt.sign({ userId: user._id }, process.env.refreshSecretKey, {
                        expiresIn: '30d'
                    });

                    // Set cookies in the response
                    res.cookie('access_token', accessToken, { maxAge: 900000, httpOnly: true });
                    console.log(res.cookie)
                    res.cookie('refresh_token', refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });

                    res.json({ msg: "Login Successfully", accessToken, refreshToken });
                }
            });
        } else {
            res.send({ msg: "Wrong Credentials" });
        }
    } catch (error) {
        res.send({ msg: "Something Went Wrong", error: error.message });
    }
});

userRouter.get("/getnewtoken", (req, res) => {
    const refresh_token = req.headers.authorization;

    if (!refresh_token) {
        return res.status(401).json({ message: "Login Again" });
    }

    jwt.verify(refresh_token, process.env.refreshSecretKey, (err, decoded) => {
        if (err) {

            return res.status(401).json({ message: "Invalid or expired refresh token. Please Login First" });
        } else {
            
            const newAccessToken = jwt.sign({ userId: decoded.userId }, process.env.secretkey, {
                expiresIn: "1h"
            });
           
            return res.status(200).json({ message: "Login Successfully", token: newAccessToken });
        }
    });
});

/* Logout code given here */

userRouter.post('/logout', async (req, res) => {
    try {
        // Add token to blacklist collection
        const token = req.headers.authorization;

        // Check if the token is already blacklisted
        const existingToken = await blacklistModel.findOne({ token });
        if (existingToken) {
            return res.status(400).json({ message: 'Token already blacklisted' });
        }

        const blacklistedToken = new blacklistModel({ token });
        await blacklistedToken.save();

        res.status(200).send('Logged out successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = {
    userRouter
};