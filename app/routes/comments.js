const express = require('express');
const router = express.Router();
const postDataBaseUtilityes = require('../db/post-db-utils.js');
const userDataBaseUtilityes = require('../db/user-db-utils.js');
const Post = require('../models/post-schema');
const User = require('../models/user-schema');
const Comment = require('../models/comment-schema');
const commentDatabaseUtilityes = require('../db/comment-db-utils.js');
const { addNewComment } = require('../db/comment-db-utils.js');


router.get('/getComments/:postId', async (req, res) => {
    var sendingInformation = {};
    if (req.session.userInformation == undefined || req.session.userInformation == null) {
        res.redirect('/');
        return;
    }
    var isAjaxRequest = req.xhr;
    if (!isAjaxRequest) {
        res.redirect('/');
        return;
    }
    const postId = req.params.postId;
    var sendingCommentsData = [];
    const comments = await commentDatabaseUtilityes.getCommentsForAPost(postId);
    sendingInformation.commentData = await commentDatabaseUtilityes.getCommentsDisplayInformation(comments);
    res.send(sendingInformation);
    return;
})

router.post('/newComment', async (req, res) => {
    var sendingInformation = {};
    if (req.session.userInformation == undefined || req.session.userInformation == null) {
        res.redirect('/');
        return;
    }
    var isAjaxRequest = req.xhr;
    if (!isAjaxRequest) {
        res.redirect('/');
        return;
    }
    const postId = req.body.postId;
    const userId = await userDataBaseUtilityes.getUserIdOfThisUser(req.session.userInformation.userEmailId);
    const comment = req.body.comment;
    sendingInformation.commentData = await addNewComment(postId, userId, comment);
    res.send(sendingInformation);
    return;
})


module.exports = router;
