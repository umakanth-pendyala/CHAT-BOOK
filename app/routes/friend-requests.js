const express = require('express');
const router = express.Router();
const getUserDetails = require("../db/get-user.js");
const userDataBaseUtilityes = require("../db/user-db-utils.js");
const postDataBaseUtilityes = require('../db/post-db-utils.js');
const User = require('../models/user-schema');


router.get('/friendRequests', async (req, res) => {
    sendingInformation = {};
    if (req.session.userInformation == undefined) {
        res.redirect("/");
        return;
    }

    sendingInformation.pageTitle = "Friend Requests To You"
    const userEmail = req.session.userInformation.userEmailId;
    const userInfoFromDatabase = await getUserDetails(userEmail.trim());
    if (req.session.userInformation.userIsAuthenticated) {
        sendingInformation.userIsAuthenticated = true;
        sendingInformation.username = userInfoFromDatabase.name;
        sendingInformation.profilePicURL = userInfoFromDatabase.profilePicURL;
        sendingInformation.pageView = false;


        // GET FRIEND REQUESTS OF THIS USER
        const userDocument = await User.findOne({ email: userEmail });
        sendingInformation.titleSheet = await getfriendTileSheet(userDocument);
        res.render("display", sendingInformation);
        return;
    }


    res.render('/');
    return;
})


const getfriendTileSheet = async (userDocument) => {
    var sendingInformation = [];
    const userFriendRequests = userDocument.friendRequestsToYou;
    for (var i = 0; i < userFriendRequests.length; i++) {
        const temp = {};
        const friend_Id = userFriendRequests[i].friend_Id;
        temp.profileKey = friend_Id;
        // GET NAME AND EMAIL OF THIS USER
        const thisUserDocument = await User.findOne({ _id: friend_Id });
        temp.name = thisUserDocument.name;
        temp.email = thisUserDocument.email;
        temp.profilePic = thisUserDocument.profilePicURL;
        sendingInformation.push(temp);
    }
    return sendingInformation;
}



module.exports = router;