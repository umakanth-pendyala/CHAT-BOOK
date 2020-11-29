const express = require('express');
const postDataBaseUtilityes = require('../db/post-db-utils.js');
const userDataBaseUtilityes = require('../db/user-db-utils');
const router = express.Router();

router.post('/like', async (req, res) => {
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
    const userEmail = req.session.userInformation.userEmailId;
    const postOwnersId = req.body.postOwnersId;
    const ownersPostId = req.body.ownersPostId;

    const objectObtained = await postDataBaseUtilityes.likeAPost(userEmail, postOwnersId, ownersPostId);
    if (objectObtained.postLiked) {
        sendingInformation.postLiked = true;
        sendingInformation.numberOfLikes = objectObtained.numberOfLikes;
    } else {
        sendingInformation.postLiked = false;
        sendingInformation.numberOfLikes = objectObtained.numberOfLikes;
    }
    res.send(sendingInformation);
    return;
})

module.exports = router;