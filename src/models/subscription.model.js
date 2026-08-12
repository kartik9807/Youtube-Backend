const mongoose = require('mongoose');
const subscriptionSchema = new mongoose.Schema({
    subscriber:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    channel:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
},{timestamps:true});

module.exports = mongoose.model("Subscription",subscriptionSchema);

//! How this subscriber model is used to get subscribers , subscribed_to, channels 
//? In this subscriber model we have two things subscriber and channel if we want 
//* 1) no. of subscriber to a particular channel so basically i will search the channel name in the document and collect that document
// and count the no. of documents to get the subscriber count.

//* 2) no. of subscribed channels of a user , find the document having the username and get the particular channel name from it 
// and here we got the array of channels hence no of subscribed channel.

//* 3) if subscribed or not check (subscribed / subscribe) check userID in that particular channel document if not found then false else true