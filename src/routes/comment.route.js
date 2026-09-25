const { Router } = require('express');
const {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} = require("../controllers/comment.controller.js")
const {isLoggedin} = require("../middlewares/auth.middleware.js")

const router = Router();

router.use(isLoggedin); // Apply isLoggedin middleware to all routes in this file

router.route("/:videoId").get(getVideoComments).post(addComment);
router.route("/channel/:commentId").delete(deleteComment).patch(updateComment);

module.exports = router