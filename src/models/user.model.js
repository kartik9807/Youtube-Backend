const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true        
    },
    fullname:{
        type:String,
        required:true,
        trim:true,
        index:true
    },
    avatar:{
        type:String,
        required:true,
    }, // cloudinary url
    coverImage:{
        type:String,
    },
    password:{
        type:String,
        required:[true,"Password is required"],
    },
    refreshToken:String,
    watchHistory:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video"
    }]
},{timestamps:true})


//! important to know before writting mongoose middleware
// Regular (callback-based) middleware → call next().
// async middleware → don't call next(); just return, await, or throw.
// Avoid mixing both patterns in the same middleware unless you have a specific reason, because it can lead to confusing behavior.
// When user.save() is called,

//? When the async function finishes, its Promise resolves.
//* Mongoose sees
//* "The Promise has resolved, so the middleware is complete."
//* No next() is needed.

// Mongoose internally behaves roughly like
// await middleware.call(user);
//? Middleware finished
//? Continue saving document
// in callback we manually tell that move to next middleware using next()

userSchema.pre('save',async function(){
    if(!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
});
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password);
}
userSchema.methods.generateAccessToken = function (){
    return jwt.sign({
        _id:this._id,
        username:this.username,
        email:this.email,
        fullname:this.fullname
    },process.env.ACCESS_TOKEN_KEY,{
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    })
}
userSchema.methods.generateRefreshToken = function (){
    return jwt.sign({
        _id:this._id,
    },process.env.REFRESH_TOKEN_KEY,{
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    })
}
module.exports = mongoose.model("User",userSchema);