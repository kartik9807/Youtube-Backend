const express = require('express');
const { registerUser,loginUser,logoutUser, refreshAccessToken,
    getCurrentUser,updateAccount,updateImages,currentPasswordChange,
    getUserChannelProfile, getWatchHistory } = require('../controllers/user.controller.js');

const {upload} = require('../middlewares/multer.middleware.js');
const { isLoggedin } = require('../middlewares/auth.middleware.js');
const router = express.Router();


router.route('/register').post(upload.fields([
    {
        name:'avatar',
        maxCount:1
    },
    {
        name:'coverImage',
        maxCount:1
    }
]),registerUser)

router.route('/login').post(loginUser)

// secure routes
router.route('/logout').get(isLoggedin,logoutUser)
router.route('/getUser').get(isLoggedin,getCurrentUser)
router.route('/updateAccount').patch(isLoggedin,updateAccount)
router.route('/updatePassword').patch(isLoggedin,currentPasswordChange)
router.route('/updateImages').patch(isLoggedin,upload.fields([
    {
        name:'avatar',
        maxCount:1
    },
    {
        name:'coverImage',
        maxCount:1
    }
]),updateImages)

router.route('/refreshToken').get(refreshAccessToken)

router.route('/channelProfile/:username').get(isLoggedin,getUserChannelProfile);
router.route('/watchHistory').get(isLoggedin,getWatchHistory);

module.exports = router
