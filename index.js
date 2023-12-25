const express=require('express')
const app=express()
const dotenv=require('dotenv').config()
const PORT=process.env.PORT
const authRouter=require('./routes/authroute')
const productrouter=require('./routes/productroute')
const bodyParser = require('body-parser')
const cookieparser=require('cookie-parser')
const { notfound, errorhandler } = require('./middlewares/errorhandler')
require('./config/dbconnect').connect()
const  morgan=require('morgan')


app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
app.use(cookieparser())
app.use('/api/user',authRouter)
app.use('/api/product',productrouter)

app.use(notfound)
app.use(errorhandler)










app.listen(PORT, ()=>console.log(`server  is running at ${PORT}`))