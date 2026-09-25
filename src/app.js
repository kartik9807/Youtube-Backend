const express = require('express');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const path = require('path')
const app = express()
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
app.use(bodyParser.json())
app.use(express.json({limit:"16kb"})) // data limitation
app.use(express.urlencoded({extended:true,limit:"16kb"})); // extended true for nested url content
app.use(express.static(path.join(__dirname,"public")))
app.use(cookieParser())

app.get('/',(_,res)=>{
    res.send("working!!!");
})

// importing router
const userRouter = require(path.join(__dirname,'routes/user.route.js'))

// declaring routes
app.use('/api/v1/users',userRouter);



module.exports = app