const { json } = require('body-parser');
const Product=require('../models/productmodel')
const asynchandler=require('express-async-handler')
const mongoose = require('mongoose');
const slugify=require('slugify')

const createproduct=asynchandler(async(req,res)=>{
    try{
        if(req.body.title){
            req.body.slug=slugify(req.body.title)
        }
        const newProduct=await Product.create(req.body)
        res.json( newProduct)
    }catch(error){
        throw new Error (error)
    }
})



const updateProduct=asynchandler(async(req,res)=>{
    const {id} =req.params
    try{
        if(req.body.title){
            req.body.slug=slugify(req.body.title)
        }
        const updatedProduct = await Product.findOneAndUpdate(
            { _id: id}, // Convert id to ObjectId
            req.body,
            { new: true }
        );
        res.json(updatedProduct);
    }catch(error){
        throw new Error (error)
    }
})



const deleteProduct=asynchandler(async(req,res)=>{
    const {id} =req.params
    try{
       
        const deleteProduct = await Product.findOneAndDelete(
            { _id: id}, 
            req.body,
            { new: true }
        );
        res.json(deleteProduct);
    }catch(error){
        throw new Error (error)
    }
})



const getaProduct=asynchandler(async(req,res)=>{
    const {id}=req.params
    try{
        const findProduct=await Product.findById(id)
        res.json(findProduct)
    }catch(error){
        throw new Error(error)
    }
})

const getAllProduct=asynchandler(async(req,res)=>{
    try{
        //filtering
        const queryObj={...req.query}
        const excludeFields=["page","sort","limit","fields"]
        excludeFields.forEach((el)=>delete queryObj[el])
        console.log(queryObj)
        let queryStr=JSON.stringify(queryObj)
        queryStr=queryStr.replace(/\b(gte|gt|lte|lt)\b/g,(match)=>`$${match}`)
        const query =Product.find(JSON.parse(queryStr))


        //sorting
        if(req.query.sort){
            const sortBy=req.query.sort.split(",").join(" ")
            query =query.sort(sortBy)
        }else{
            query=query.sort("-createdAt")
        }


        //limiting the fields
        if(req.query.fields){
            const fields=req.query.fields.split(",").join(" ")
            query=query.select("-__v")
        }

        //pagination

        const page=req.query.page;
        const limit= req.query.limit;
        const skip=(page -1) * limit;
        query=query.skip(skip).limit(limit);
        if(req.query.page){
            const productCount=await Product.countDocuments()
            if(skip>=productCount)throw  new Error('this page does not exists')
        }


        const product=await query
        res.json(product)
    }catch(error){
        throw new Error(error)
    }
})

module.exports={createproduct,getaProduct,getAllProduct,updateProduct,deleteProduct}