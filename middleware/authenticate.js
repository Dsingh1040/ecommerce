const jwt = require("jsonwebtoken");
const { UserModel } = require("../model/userModel");
const{blacklistModel}=require("../model/blacklistModel")
require("dotenv").config();
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const isBlacklisted = await blacklistModel.findOne({ token });
    if (isBlacklisted) {
      return res.status(401).send({msg:"Please Login Again","error":'Token is blacklisted'});
    }
    const decodedToken = jwt.verify(token, process.env.secretkey);
    console.log(decodedToken);

    const user = await UserModel.findOne({ _id: decodedToken.userId});
    console.log("user", user._id== decodedToken.userId);
    if (!user) {
      return res.status(401).json({ msg: "Invalid Token or User not found!" });
    }
    if (user && user._id == decodedToken.userId) {
     
      req.user = user;
      console.log(user._id, "user");
      next();
    }
  } 
  catch (e) {
    console.log(e.message, "error");
    res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = { authMiddleware };