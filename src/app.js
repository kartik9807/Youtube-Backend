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
const tweetRouter = require(path.join(__dirname,'routes/tweet.route.js'))
const subscriptionRouter = require(path.join(__dirname,'routes/subscription.route.js'))
const videoRouter = require(path.join(__dirname,'routes/video.route.js'))
const commentRouter = require(path.join(__dirname,'routes/comment.route.js'))
const likeRouter = require(path.join(__dirname,'routes/like.route.js'))
const playlistRouter = require(path.join(__dirname,'routes/playlist.route.js'))
const dashboardRouter = require(path.join(__dirname,'routes/dashboard.route.js'))

// declaring routes
app.use('/api/v1/users',userRouter);
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)



module.exports = app