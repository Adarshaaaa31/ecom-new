const express=require('express')
const {createuser, loginuserctrl, getalluser, getuser, deleteauser, updateauser, blockuser, unblockuser, handlerefereshtoken, logout,updatePassword,forgotPasswordToken,resetPassword,saveAddress, userCart,getUserCart} = require('../controller/userctrl')
const {authmiddleware, isadmin} = require('../middlewares/authmiddleware')
const router =express.Router()

router.post("/forgot-password",forgotPasswordToken)
router.put("/reset-password/:token",resetPassword)
router.post('/register',createuser)
router.post
router.put('/password',authmiddleware,updatePassword)
router.post('/login',loginuserctrl)
router.post("/cart",authmiddleware, userCart)
router.get('/alluser',getalluser)

router.get('/refresh',handlerefereshtoken)
router.get('/logout',logout)
router.get("/cart",authmiddleware,getUserCart)
router.get('/:id',authmiddleware,isadmin,getuser)

router.delete('/:id',deleteauser)
router.put('/edit-user',authmiddleware,updateauser)
router.put('/save-address',authmiddleware,saveAddress)
router.put('/block-user/:id',authmiddleware,isadmin,blockuser)
router.put('/unblock-user/:id',authmiddleware,isadmin,unblockuser)



module.exports = router

