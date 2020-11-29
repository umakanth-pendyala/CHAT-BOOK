const express = require("express");
const router = express.Router();
const getUserDetails = require("../db/get-user.js");
const userDataBaseUtilityes = require("../db/user-db-utils.js");
const postDataBaseUtilityes = require('../db/post-db-utils.js');
const User = require('../models/user-schema');

router.get("/home", async (req, res) => {
  var sendingInformation = {};
  if (req.session.userInformation == undefined) {
    res.redirect("/");
    return;
  }
  const userEmail = req.session.userInformation.userEmailId;
  const userInfoFromDatabase = await getUserDetails(userEmail.trim());
  if (req.session.userInformation.userIsAuthenticated) {
    sendingInformation.userIsAuthenticated = true;
    sendingInformation.username = userInfoFromDatabase.name;
    sendingInformation.profilePicURL = userInfoFromDatabase.profilePicURL;
    const userIdFromDataBase = await userDataBaseUtilityes.getUserIdOfThisUser(userEmail);
    const numberOfFriendRequests = await userDataBaseUtilityes.getNumberOfFriendsOfThisUser(userEmail.trim());
    sendingInformation.numberOfFriendRequests = numberOfFriendRequests;
    sendingInformation.userId = userIdFromDataBase;

    //SEND THE HOME(INNER PAGE) (USERS) PAGE
    // console.log(await postDataBaseUtilityes.getPostsListForTheUser(userEmail));
    try {
      sendingInformation.postData = (await postDataBaseUtilityes.getPostsListForTheUser(userEmail));
      sendingInformation.likeInformation = setWhatPostUserLiked(sendingInformation.postData, userIdFromDataBase);
    } catch (e) {
      console.log(e);
    }
    for (var i = 0; i < sendingInformation.postData.length; i++) {
      sendingInformation.postData[i].username = sendingInformation.postData[i]._doc.username;
      sendingInformation.postData[i].ownersId = sendingInformation.postData[i]._doc.ownersId;
    }
    sendingInformation.pageView = false;
    res.render("home", sendingInformation);
    return;
  }

  //IF THE CONTROL REACHES HERE. THE USER IS NOT AUTHENTICATED. REDIRECT HIM TO LANDING PAGE
  res.redirect("/");
  return;
});

router.get('/getFriends/:userId', async (req, res) => {
  var isAjaxRequest = req.xhr;
  if (!isAjaxRequest) {
    res.redirect('/');
    return;
  }
  const userId = req.params.userId;
  // if (userId != null || userId != undefined) {
  //   var sendingInformation = [];
  //   const userFriends = await userDataBaseUtilityes.getTheFriendsNamesAndIdsOfThisUser(userId);
  //   for (var i = 0; i < userFriends.length; i++) {
  //     const userDetails = {};
  //     const document = await User.findOne({ _id: userFriends[i].friend_id });
  //     userDetails.friend_id = userFriends[i].friend_id;
  //     userDetails.friend_name = document.name;
  //     userDetails.imageURL = document.profilePicURL;
  //     sendingInformation.push(userDetails);
  //   }
  //   if (sendingInformation.length >= 0) {
  //     res.send(sendingInformation);
  //     return;
  //   }
  //   else {
  //     res.send('database error');
  //     return;
  //   }
  // }
  var sendingInformation = [];
  const userDocuments = await User.find({});
  for (var i = 0; i < userDocuments.length; i++) {
    const singleUserDocument = userDocuments[i];

    for (var k = 0; k < singleUserDocument.friends.length; k++) {
      if (singleUserDocument._id.equals(userId)) {
        continue;
      }
      if (singleUserDocument.friends[k].friend_id.equals(userId)) {
        const tempObject = {};
        tempObject.friend_id = singleUserDocument._id;
        tempObject.friend_name = singleUserDocument.name;
        tempObject.imageURL = singleUserDocument.profilePicURL;
        sendingInformation.push(tempObject);
      }
    }
  }
  console.log(sendingInformation);
  res.send(sendingInformation);
  return;
})

const setWhatPostUserLiked = (postData, userId) => {
  const sendingData = [];
  for (var i = 0; i < postData.length; i++) {
  }
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
