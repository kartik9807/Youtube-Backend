const { Router } = require('express');
const {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet,
} = require("../controllers/tweet.controller.js")
const {isLoggedin} = require("../middlewares/auth.middleware.js")

const router = Router();
router.use(isLoggedin); // Apply isLoggedin middleware to all routes in this file

router.route("/").post(createTweet);
router.route("/user/:userId").get(getUserTweets);
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);

module.exports = router