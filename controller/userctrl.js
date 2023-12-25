const { generatetoken } = require('../config/jwtToken')
const user=require('../models/usermodel')
const Product=require('../models/productmodel')
const Cart=require('../models/cartmodel')
const asynchandler=require('express-async-handler')
const validatemongodbid = require('../utils/validatemongodbid')
const { generaterefreshtoken } = require('../config/refreshtoken')
const jwt=require('jsonwebtoken')
const sendEmail = require('./emailctrl')
const crypto=require('crypto')
const { hash } = require('bcrypt')

const createuser= asynchandler(async function (req,res){
    const email = req.body.email
    const finduser= await user.findOne({email:email})
    if(!finduser){
        // should create a new user
        const newuser= await user.create(req.body)
        res.json(newuser)
    }else{
     throw new Error("user already exists")
    }
    
})



const loginuserctrl=asynchandler(async (req,res)=>{
    const{email,password}=req.body 
    //check user exists or not 
    const finduser= await user.findOne({email})
   if (finduser && (await finduser.isPasswordMatched(password)) ){
    const refreshtoken=await generaterefreshtoken(finduser?._id)
    const updateuser=await user.findByIdAndUpdate(
        finduser.id,{
        refreshtoken:refreshtoken,
    }, 
    {new:true}
    );
    res.cookie('refreshtoken',refreshtoken,{
        httpOnly:true,
        maxAge:72 * 60 * 60 * 1000,
    })
    res.json({
        _id:finduser ?._id,
        firstname:finduser?.firstname,
        lastname:finduser?.firstname,
        email:finduser?.firstname,
        mobile:finduser?.firstname,
        token:generatetoken(finduser?._id)
    })
   }else{
    throw new Error("invalid credentials")
   }
})


//handle refresh token
const handlerefereshtoken=asynchandler(async(req,res)=>{
    const cookie=req.cookies
    console.log(cookie)
    if(!cookie?.refreshtoken)throw new Error ('no refresh token in cookies')
    const refreshtoken=cookie.refreshtoken
console.log(refreshtoken);
const User=await user.findOne({refreshtoken})
if(!User)throw new Error ('no refresh token present in db or not matched')
jwt.verify(refreshtoken,process.env.JWT_SECRET,(err,decoded)=>{
    if(err || user.id !==decoded.id ){
        
    } 
    const accesstoken=generatetoken(user?._id)
    res.json({accesstoken})
})

})

//logoutfunctionality

const logout=asynchandler(async(req,res)=>{
    const cookie=req.cookies
    if(!cookie?.refreshtoken)throw new Error ('no refresh token in cookies')
    const refreshtoken=cookie.refreshtoken
    const User=await user.findOne({refreshtoken})
    if(!User){
        res.clearCookie("refreshtoken",{
            httpOnly:true,
            secure:true,
        })
        return res.sendStatus(204)//forbidden
    }
    await user.findOneAndUpdate({refreshtoken:refreshtoken},{
        refreshtoken : "",
    });
    res.clearCookie("refreshtoken",{
        httpOnly:true,
        secure:true,
    });
     res.sendStatus(204)//forbidden
});



//updateuser
const updateauser=asynchandler(async(req,res)=>{
    
  const {_id}=req.User
  validatemongodbid(_id)
   try{
    const updateduser=await user.findByIdAndUpdate(_id,{
        firstname :req?.body?.firstname,
        lastname :req?.body?. lastname,
        email :req?.body?. email,
        mobile :req?.body?.mobile,
    },{
        new:true
    })
    res.json(updateduser)
   }catch(error){
    throw new Error(error)
   }
})


  //save user address

  const saveAddress=asynchandler(async(req,res,next)=>{
    const {_id}=req.User
    validatemongodbid(_id)
     try{
      const updateduser=await user.findByIdAndUpdate(_id,{
         address :req?.body?.address,
          
      },{
          new:true
      })
      res.json(updateduser)
     }catch(error){
      throw new Error(error)
     }
  })



//get all user
const getalluser=asynchandler(async (re,res)=>{
    try{
        const getusers=await user.find()
        res.json(getusers)
    }catch(error){
        throw new Error(error)
    }
})




//get single user
const getuser=asynchandler(async(req,res)=>{
    const {id}=req.params
    validatemongodbid(id)
   try{
    const getauser=await user.findById(id)
    res.json(getauser)
   }catch(error){
    throw new Error(error)
   }
})


//delete user
const deleteauser=asynchandler(async(req,res)=>{
    const {id}=req.params
    validatemongodbid(id)
   try{
    const deleteauser=await user.findByIdAndDelete(id)
    res.json(deleteauser)
   }catch(error){
    throw new Error(error)
   }
})


const blockuser=asynchandler(async (req,res)=>{
    const {id}=req.params
    validatemongodbid(id)
    try{
        const block=  await user.findByIdAndUpdate(
            id,
            {
                isBlocked :true,
            },
            {
                new :true
            }
        )
        res.json(block)

    }catch(error){
        throw new Error(error)
    }
})
const unblockuser=asynchandler(async (req,res)=>{ 
    const {id}=req.params
    validatemongodbid(_id)
    try{
        const unblock=  await user.findByIdAndUpdate(
            id,
            {
                isBlocked :false,
            },
            {
                new :true
            }
        )
        res.json({
            message:"user unblocked"
        })


    }catch(error){
        throw new Error(error)
}})


const updatePassword=asynchandler(async (req,res)=>{
    const { _id }=req.User;
    const {password} =req.body
    validatemongodbid(_id);
    const User=await user.findById(_id)
    if(password){
        User.password=password;
        const updatePassword = await User.save()
        res.json(updatePassword)
    }
    else{
        res.json(User)
    }
})



const forgotPasswordToken=asynchandler(async(req,res)=>{

    const {email}=req.body
    const User=await user.findOne({email})
    if(!User) throw new Error ("user not found with this email")
    try{
        const token = await User.createPasswordResetToken()
        await User.save()
        const resetURL=`follow this link to reset your password.this link is valid till 10mins <a href='http://localhost:4000/api/user/reset-password/${token}' >click here</a>  `
        const data={
            to:email,
            text:"hey user",
            subject:"forgot password link",
            htm:resetURL
        }
        sendEmail(data)
        res.json((token))
}catch(error){
    throw new Error(error)
}
})


const resetPassword=asynchandler(async (req,res)=>{
    const {password}=req.body
    const {token}=req.params
    const hashedToken=crypto.createHash('sha256').update(token).digest("hex")
    const User=await user.findOne({
        passwordResetToken:hashedToken,
        passwordResetExpires:{$gt:Date.now()}

    })
    if(!User)throw new Error("token expired ,plz try again later")
    User.password=password;
    User.passwordResetToken=undefined;
    User.passwordResetExpires=undefined;
    await User.save()
    res.json(User)
})



const userCart=asynchandler(async(req,res)=>{
    const {cart}=req.body
    const { _id }=req.User
    validatemongodbid(_id)
   try{
    let products=[]
    const User=await user.findById(_id)
    //if user already have products in cart
    const alreadyExistCart=await Cart.findOne({orderby:User?._id})
    if(alreadyExistCart){
        alreadyExistCart.remove()
    }
    for(let i=0;i<cart.length;i++){
        let object={};
        object.product=cart[i]._id;
        object.count=cart[i].count;
        object.color=cart[i].color;
        let getPrice=await Product.findById(cart[i]._id).select('price').exec()
        object.price=getPrice
        products.push(object)
    }
  
    let cartTotal=0
    for (let i=0;i<products.length;i++){
        cartTotal=cartTotal+products[i].price*products[i].count
    }
   let newCart=await new Cart({
    products,
    cartTotal,
    orderby:User?._id,
   }).save()
   res.json(newCart)
   }catch(error){
    throw new Error (error)
   }
})

const getUserCart = asynchandler(async (req,res)=>{
    const {_id}=req.User
    validatemongodbid(_id)
    try{
        const cart =await Cart.findOne({orderby:_id}).populate("products.product")
        res.json(cart)
    }catch(error){
        throw new Error (error)
    }
   
})

module.exports = {createuser,
    loginuserctrl,
    getalluser,
    getuser,
    deleteauser,
    updateauser ,
    blockuser,   
    handlerefereshtoken,
    unblockuser,
    logout,
    updatePassword,
    forgotPasswordToken,
    resetPassword,
    saveAddress,
    userCart,
    getUserCart
    }









// {
//     "firstname":"sachin",
//     "lastname":"tendulkar",
//     "emial":"sachin@gmail.com",
//     "mobile":"1232342434",
//     "password":"sachin567"
// }