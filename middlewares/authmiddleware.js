const user=require('../models/usermodel')
const jwt=require("jsonwebtoken")
const asynchandler=require('express-async-handler')
const dotenv=require('dotenv').config()


const authmiddleware=asynchandler(async(req,res,next)=>{
    let token;
    if(req?.headers?.authorization?.startsWith('Bearer')){
        token=req.headers.authorization.split(" ")[1]
        try{
            if(token){
                const decoded=jwt.verify(token,process.env.JWT_SECRET)
                const User=await user.findById(decoded?.id)
                req.User=User
                next()
            }
        }catch(error){
            throw new Error ('not authorized token expired ,please login again')
        }
    }else{
        throw new Error("there is no token attached to header")
    }
})
const isadmin=asynchandler(async(req,res,next)=>{
    const {email}=req.User
    const adminuser=await user.findOne({email})
    if(adminuser.role !=="admin"){
        throw new Error("you  are not an admin ")
    }else{
        next()
    }
})


module.exports={authmiddleware,isadmin}