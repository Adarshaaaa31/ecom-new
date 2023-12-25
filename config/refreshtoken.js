const jwt=require("jsonwebtoken")

const generaterefreshtoken=(id)=>{
    return jwt.sign({id},process.env.JWT_SECRET,{expiresIn:"3d"})
}
module.exports={generaterefreshtoken}