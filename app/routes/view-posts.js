const express = require('express');
const router = express.Router();
const postDataBaseUtilityes = require('../db/post-db-utils.js');
const userDataBaseUtilityes = require('../db/user-db-utils');
const getUserDetails = require("../db/get-user.js");


router.get('/viewposts', async (req, res) => {
    // TAKE A LOOK AT THIS LATER.
    const userId = req.params.userId;
    var sendingInformation = {};
    if (req.session.userInformation == undefined || req.session.userInformation == null) {
        res.redirect('/');
        return;
    }
    const userEmail = req.session.userInformation.userEmailId;
    if (userEmail == undefined || userEmail == null) {
        res.redirect('/');
        return;
    }
    const userInfoFromDatabase = await getUserDetails(userEmail.trim());
    if (req.session.userInformation.userIsAuthenticated) {
        sendingInformation.userIsAuthenticated = true;
        sendingInformation.username = userInfoFromDatabase.name;
        const userIdFromDataBase = await userDataBaseUtilityes.getUserIdOfThisUser(userEmail);
        const numberOfFriendRequests = await userDataBaseUtilityes.getNumberOfFriendsOfThisUser(userEmail.trim());
        sendingInformation.numberOfFriendRequests = numberOfFriendRequests;
        sendingInformation.profilePicURL = userInfoFromDatabase.profilePicURL;
        sendingInformation.userId = userIdFromDataBase;
        //SEND THE HOME(INNER PAGE) (USERS) PAGE
        // console.log(await postDataBaseUtilityes.getPostsListForTheUser(userEmail));
        sendingInformation.postData = [];
        sendingInformation.likeInformation = [];
        sendingInformation.pageView = true;
        res.render("home", sendingInformation);
        return;
    }

    //IF THE CONTROL REACHES HERE. THE USER IS NOT AUTHENTICATED. REDIRECT HIM TO LANDING PAGE
    res.redirect("/");
    return;
})

router.get('/getPage/:pageNumber', async (req, res) => {
    var isAjaxRequest = req.xhr;
    if (!isAjaxRequest) {
        res.redirect('/');
        return;
    }
    const pageNumber = req.params.pageNumber;
    var sendingInformation = {};
    sendingInformation.postData = [];
    var stillPagesAreAvailible = true;
    const postData = await postDataBaseUtilityes.getAllPostsOfUser(req.session.userInformation.userEmailId);
    if (pageNumber * 10 < postData.length) {
        //STILL SOME POSTS ARE AVAILIBLE
        for (var i = (pageNumber * 10) - 10; i < pageNumber * 10; i++) {
            sendingInformation.postData.push(postData[i]);
        }
        stillPagesAreAvailible = true;
    }
    if (pageNumber * 10 > postData.length && (pageNumber * 10) - 10 < postData.length) {
        //IT IS IN SOME RANGE
        for (var i = (pageNumber * 10) - 10; i < postData.length; i++) {
            sendingInformation.postData.push(postData[i]);
        }
        stillPagesAreAvailible = false;
    }
    if ((pageNumber * 10) - 10 > postData.length) {
        sendingInformation = {};
        sendingInformation.postData = [];
        stillPagesAreAvailible = false;
    }
    const userIdFromDataBase = await userDataBaseUtilityes.getUserIdOfThisUser(req.session.userInformation.userEmailId);
    sendingInformation.likeInformation = setWhatPostUserLikedInPirticularRange(sendingInformation.postData, userIdFromDataBase);
    sendingInformation.userId = userIdFromDataBase;
    res.send(sendingInformation);
    return;
})


/**
 * 
 * @param {*} postData 
 * @param {*} userId
 * THIS FUNCTION BASICALLY TAKES POST DATA(ALL THE DIFFERNET POSTS OF SAME USER OR DIFFERNET USER) 
 * AND CHECKS IF IT LIKED BY THAT PIRTICULAR USERID 
 */
const setWhatPostUserLikedInPirticularRange = (postData, userId) => {
    const sendingData = [];
    for (var k = 0; k < postData.length; k++) {
        for (var i = 0; i < postData[k].likes.likedBy.length; i++) {
            if (postData[k].likes.likedBy[i].user.equals(userId)) {
                sendingData.push({ likeStatus: true });
            } else {
                sendingData.push({ likeStatus: false });
            }
        }
        if (postData[k].likes.likedBy.length == 0) {
            sendingData.push({ likeStatus: false });
        }
    }
    return sendingData;
}




module.exports = router;