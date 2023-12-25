const mongoose=require('mongoose')
const MONGO_URI=process.env.MONGO_URI

exports.connect=()=>{
    mongoose.connect(MONGO_URI)
    .then(()=>console.log("database connected"))
    .catch(()=>console.log("database not connected"))
}