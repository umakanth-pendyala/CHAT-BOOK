const express = require('express');
const router = express.Router();
const postDataBaseUtilityes = require('../db/post-db-utils.js');
const userDataBaseUtilityes = require('../db/user-db-utils');
const getUserDetails = require("../db/get-user.js");

router.get('/viewProfile/:userId', async (req, res) => {
    const profileId = req.params.userId;
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

    // check if the user id entered is valid or not
    const userExists = await userDataBaseUtilityes.checkIfUserIdExists(profileId);
    if (!userExists) {
        // SEND USER TO A PAGE SAYING THAT USER DO NOT EXIST
    }

    const userInfoFromDatabase = await getUserDetails(userEmail.trim());
    const profileInformationFromDatabase = await userDataBaseUtilityes.getUserDetailsForThisId(profileId);
    if (req.session.userInformation.userIsAuthenticated) {
        // THIS IS MAINLY FOR NAV BAR SETTING STYLES
        sendingInformation.postData = [];
        sendingInformation.likeInformation = [];
        sendingInformation.userIsAuthenticated = true;
        sendingInformation.username = userInfoFromDatabase.name;
        const userIdFromDataBase = await userDataBaseUtilityes.getUserIdOfThisUser(userEmail);

        sendingInformation.profilePicURL = userInfoFromDatabase.profilePicURL;
        sendingInformation.userId = userIdFromDataBase;

        let profileInformation = {
            name: profileInformationFromDatabase.name,
            email: profileInformationFromDatabase.email,
            relationshipStatus: profileInformationFromDatabase.relationshipStatus || "not defined",
            currentProfession: profileInformationFromDatabase.currentProfesson || "not defined",
            phoneNumber: profileInformationFromDatabase.phoneNumber || "not mentioned",
            dateOfBirth: profileInformationFromDatabase.dateOfBirth,
            gender: profileInformationFromDatabase.gender || "This detail is not mentioned",
            description: profileInformationFromDatabase.description || "description is not provided",
        }
        sendingInformation.profileInformation = profileInformation;
        sendingInformation.profileId = profileId;
        sendingInformation.pageView = true;

        // CHECK IF THE SAME USER IS CHECKING HIS PROFILE
        if (userIdFromDataBase == profileId) {
            sendingInformation.sameuser = true
            sendingInformation.isFriend = false
            sendingInformation.activateAcceptFriendRequestMethod = false;
            sendingInformation.activateSendFriendRequest = false;
            sendingInformation.message = "POSTS";

            // SET POST DATA AND ACTIVATE THE PAGE VIEW METHOD
            res.render('profile-page', sendingInformation);
            return;
        }


        //CHECK IF THE PROFILER IS A FRIEND AND IF HE IS A FRIEND THEN SHOW HIS POSTS.
        const isFriend = await userDataBaseUtilityes.checkIfFriend(userEmail, profileId);
        if (isFriend) {
            sendingInformation.sameuser = false;
            sendingInformation.isFriend = true;
            sendingInformation.activateAcceptFriendRequestMethod = false;
            sendingInformation.activateSendFriendRequest = false;
            sendingInformation.message = "POSTS";
            // THE PROFILER IS NOT A FRIEND
            // CHECK IF PROFILER ARLEADY SENT ANY FRIEND REQUEST TO HIM
            const heSentFriendRequest = await userDataBaseUtilityes.checkIfHeSentFriendRequest(userEmail, profileId);
            if (heSentFriendRequest) {
                // THAT PROFILER ARLEADY SENT YOU A FRIEND REQUEST
                sendingInformation.message = "ACCEPT FRIEND REQUEST"
                sendingInformation.isFriend = true;
                sendingInformation.sameuser = false;
                sendingInformation.activateAcceptFriendRequestMethod = true;
                // sendingInformation.activateSendFriendRequest = false;

            } else {
                // THE PROFILER DID NOT SEND ANY FRIEND REQUEST
                // CHECK IF YOU HAVE SENT ANY FRIEND REQUEST
                sendingInformation.message = "ACCEPT FRIEND REQUEST"
                sendingInformation.isFriend = true;
                sendingInformation.sameuser = false;
                sendingInformation.activateAcceptFriendRequestMethod = false;

            }
        } else {
            // THE PROFILER IS NOT A FRIEND
            // CHECK IF PROFILER ARLEADY SENT ANY FRIEND REQUEST TO HIM
            const heSentFriendRequest = await userDataBaseUtilityes.checkIfHeSentFriendRequest(userEmail, profileId);
            if (heSentFriendRequest) {
                // THAT PROFILER ARLEADY SENT YOU A FRIEND REQUEST
                sendingInformation.message = "ACCEPT FRIEND REQUEST"
                sendingInformation.isFriend = false;
                sendingInformation.sameuser = false;
                sendingInformation.activateAcceptFriendRequestMethod = true;
                // sendingInformation.activateSendFriendRequest = false;

            } else {
                // THE PROFILER DID NOT SEND ANY FRIEND REQUEST
                // CHECK IF YOU HAVE SENT ANY FRIEND REQUEST
                sendingInformation.message = "ACCEPT FRIEND REQUEST"
                sendingInformation.isFriend = false;
                sendingInformation.sameuser = false;
                sendingInformation.activateAcceptFriendRequestMethod = false;

            }
            // CHECK IF YOU HAVE SENT THE FRIEND REQUEST
            const youArleadySentFriendRequest = await userDataBaseUtilityes.checkIfYouHaveSentFriendRequest(userEmail, profileId);
            if (youArleadySentFriendRequest) {
                sendingInformation.message = "FRIEND REQUEST SENT"
                sendingInformation.isFriend = false;
                sendingInformation.sameuser = false
                // sendingInformation.activateAcceptFriendRequestMethod = false;
                sendingInformation.activateSendFriendRequest = false;
            } else {
                sendingInformation.message = "NOT FRIENDS YET"
                sendingInformation.isFriend = false;
                sendingInformation.sameuser = false
                // sendingInformation.activateAcceptFriendRequestMethod = false;
                sendingInformation.activateSendFriendRequest = true;
            }
            sendingInformation.isFriend = false;
        }
        sendingInformation.profileId = profileId;
        sendingInformation.pageView = true;
        res.render("profile-page", sendingInformation);
        return;
    }

    //IF THE CONTROL REACHES HERE. THE USER IS NOT AUTHENTICATED. REDIRECT HIM TO LANDING PAGE
    res.redirect("/");
    return;
})


/**
 * ASSUMPTIONS: THE USER WONT MESS UP WITH SEND REQUEST BUTTON IN THE FRONT END
 */
router.post("/viewProfile/addFriend", async (req, res) => {
    var sendingInformation = {};
    var isAjaxRequest = req.xhr;
    if (!isAjaxRequest) {
        res.redirect('/');
        return;
    }
    const userEmail = req.session.userInformation.userEmailId;
    const profilerUserId = req.body.profileId;
    // PLACE IT IN FRIEND REQUESTS TO YOU TO THE PROFILER
    const friendRequestPlaced = await userDataBaseUtilityes.addThisUserToProfilerFriendRequests(userEmail, profilerUserId);
    // PLACE IT IN FRIEND REQUESTS BY YOU USER.
    const updateUserDocument = await userDataBaseUtilityes.addToFriendRequestsByYou(userEmail, profilerUserId);

    if (friendRequestPlaced && updateUserDocument) {
        sendingInformation.friendRequestSuccessfull = true;
        res.send(sendingInformation);
        return;
    } else {
        sendingInformation.friendRequestSuccessfull = false;
        res.send(sendingInformation);
        return;
    }

})

router.post('/viewProfile/acceptFriendRequest', async (req, res) => {
    const profileId = req.body.profilerId;
    var sendingInforamtion = {};
    const userEmail = req.session.userInformation.userEmailId;
    if (userEmail == undefined || userEmail == null) {
        res.redirect('/');
        return;
    }

    const friendRequestAccepted = await userDataBaseUtilityes.acceptFriendRequest(userEmail, profileId);
    if (friendRequestAccepted) {
        sendingInforamtion.requestAccepted = true;
    } else {
        sendingInforamtion.requestAccepted = false;
    }
    res.send(sendingInforamtion);
    return;
})

router.get('/viewProfile/getPage/:pageNumber/:profileId', async (req, res) => {
    var isAjaxRequest = req.xhr;
    if (!isAjaxRequest) {
        res.redirect('/');
        return;
    }
    const pageNumber = req.params.pageNumber;
    var sendingInformation = {};
    sendingInformation.postData = [];
    var stillPagesAreAvailible = true;
    const postData = await postDataBaseUtilityes.getAllPostsOfUserById(req.params.profileId);
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
    sendingInformation.userId = req.params.profileId;
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


// const numberOfFriendRequests = await userDataBaseUtilityes.getNumberOfFriendsOfThisUser(userEmail.trim());
// sendingInformation.numberOfFriendRequests = numberOfFriendRequests;
//SEND THE HOME(INNER PAGE) (USERS) PAGE
// console.log(await postDataBaseUtilityes.getPostsListForTheUser(userEmail));

module.exports = router;