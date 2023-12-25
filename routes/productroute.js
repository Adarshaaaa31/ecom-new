const express=require('express')
const { createproduct, getaProduct, getAllProduct,updateProduct,deleteProduct } = require('../controller/productctrl')
const {isadmin,authmiddleware}=require('../middlewares/authmiddleware')
const router=express.Router()

router.post('/',authmiddleware,isadmin,createproduct)
router.get('/:id',getaProduct)
router.put('/:id',authmiddleware,isadmin,updateProduct)
router.delete('/:id',authmiddleware,isadmin,deleteProduct)
router.get('/',getAllProduct)



module.exports=router