const mongoose = require('mongoose');
const { update } = require('../models/user-schema');
const userSchema = require('../models/user-schema');
const User = require('../models/user-schema');

const userDataBaseUtilityes = {
    getNumberOfFriendsOfThisUser: async (email) => {
        try {
            const userDocument = await User.findOne({ email: email });
            if (userDocument != null || userDocument != undefined) {
                return userDocument.friendRequestsToYou.length;
            }
            else {
                return false;
            }
        }
        catch (e) {
            return false;
        }
    },
    // THIS ACUTALLY RETURNS IDS OF THE USER FRIENDS (DATABASE UPDATED) ***********
    getTheFriendsNamesAndIdsOfThisUser: async (userId) => {
        try {
            const userDocument = await User.findOne({ _id: userId });
            if (userDocument != null || userDocument != undefined) return userDocument.friends;
            return false;
        }
        catch (e) {
            return false;
        }
    },
    getUserIdOfThisUser: async (email) => {
        try {
            const userId = (await User.findOne({ email: email }))._id;
            if (userId != null || userId != undefined) return userId;
            return false;
        } catch (e) {
            return false;
        }
    },
    getUserFriendIds: async (email) => {
        var friendIds = [];
        try {
            const userDocument = await User.findOne({ email: email.trim() });
            const friends = userDocument.friends;
            for (var i = 0; i < friends.length; i++) {
                friendIds.push({ id: friends[i].friend_id });
            }
            // friendIds = friends;
            return friendIds;
        } catch (e) {
            return friendIds;
        }
    },
    getUserDetailsForThisId: async (userId) => {
        try {
            const userDocument = await User.findOne({ _id: userId });
            if (!userDocument) return false;
            return userDocument;
        } catch (e) {
            console.log(e);
            return false;
        }
    },
    checkIfFriend: async function (mainUserEmailId, profilerUserId) {
        try {
            const mainUserId = await userDataBaseUtilityes.getUserIdOfThisUser(mainUserEmailId.trim());
            const porfilerUserDocument = await User.findOne({ _id: profilerUserId });

            for (var i = 0; i < porfilerUserDocument.friends.length; i++) {
                if (porfilerUserDocument.friends[i].friend_id.equals(mainUserId)) {
                    // HE IS A FRIEND
                    return true;
                }
            }
            return false;
        } catch (e) {
            console.log(e);
            return false;
        }
    },
    checkIfUserIdExists: async (userId) => {
        try {
            const userExists = await User.exists({ _id: userId });
            if (userExists) return true;
            return false;
        } catch (e) {
            console.log(e);
            return false;
        }
    },
    addThisUserToProfilerFriendRequests: async function (userEmail, profilerId) {
        try {
            const friend_Id = await userDataBaseUtilityes.getUserIdOfThisUser(userEmail.trim());
            const profilerDocument = await User.findOne({ _id: profilerId });
            profilerDocument.friendRequestsToYou.push({ friend_Id: friend_Id });
            const updateProfilerDocument = new User(profilerDocument);
            const result = await updateProfilerDocument.save();
            if (result) {
                return true;
            }
            return false;
        } catch (e) {
            console.log(e);
            return false;
        }
    },
    addToFriendRequestsByYou: async function (userEmail, profilerId) {
        try {
            const userId = await userDataBaseUtilityes.getUserIdOfThisUser(userEmail.trim());
            const userDocument = await userDataBaseUtilityes.getUserDetailsForThisId(userId);
            userDocument.friendRequestsByYou.push({ friend_Id: profilerId });
            const updateUserDocument = new User(userDocument);
            const result = await updateUserDocument.save();
            if (result) {
                return true;
            }
            return false;
        } catch (e) {
            console.log(e);
            return false;
        }
    },
    checkIfHeSentFriendRequest: async function (userEmail, profileId) {
        try {

            const userId = await userDataBaseUtilityes.getUserIdOfThisUser(userEmail.trim());
            const userDocument = await User.findOne({ _id: userId });
            for (var i = 0; i < userDocument.friendRequestsToYou.length; i++) {
                if (userDocument.friendRequestsToYou[i].friend_Id.equals(profileId)) {
                    return true;
                }
            }
            return false;
        } catch (e) {
            console.log(e);
            return false;
        }
    },
    checkIfYouHaveSentFriendRequest: async function (userEmail, profileId) {
        try {
            const userId = await userDataBaseUtilityes.getUserIdOfThisUser(userEmail.trim());
            const userDocument = await User.findOne({ _id: userId });
            for (var i = 0; i < userDocument.friendRequestsByYou.length; i++) {
                if (userDocument.friendRequestsByYou[i].friend_Id.equals(profileId)) {
                    return true;
                }
            }
            return false;
        } catch (e) {
            console.log(e);
            return false;
        }
    },
    acceptFriendRequest: async function (userEmail, profilerId) {
        try {
            const userId = await userDataBaseUtilityes.getUserIdOfThisUser(userEmail.trim());
            const profilerDocument = await User.findOne({ _id: profilerId });
            const userDocument = await User.findOne({ _id: userId });
            // REMOVE THE FRIEND REQUESTS BY-YOU ELEMENT IN THE ARRAY
            for (var i = 0; i < profilerDocument.friendRequestsByYou.length; i++) {
                if (profilerDocument.friendRequestsByYou[i].friend_Id.equals(userId)) {
                    profilerDocument.friendRequestsByYou.splice(i, 1);
                    break;
                }
            }
            // UPDATE THE USER DOCUMENT
            userDocument.friends.push({ friend_id: profilerId });
            // UPDATE THE FRIEND REQUESTS TO YOU ARRAY
            for (var i = 0; i < userDocument.friendRequestsToYou.length; i++) {
                if (userDocument.friendRequestsToYou[i].friend_Id.equals(profilerId)) {
                    userDocument.friendRequestsToYou.splice(i, 1);
                    break;
                }
            }
            // SAVE THE NEW USER DOCUMENT AND PROFILER DOCUMENT
            const updatedUserDocument = new User(userDocument);
            const updateProfilerDocument = new User(profilerDocument);
            const saveUpdatedUserDocument = await updatedUserDocument.save();
            const saveUpdatedProfilerDocument = await updateProfilerDocument.save();
            if (saveUpdatedProfilerDocument && saveUpdatedUserDocument) {
                return true;
            }
            return false;
        } catch (e) {
            console.log(e);
            return false;
        }
    }
}

module.exports = userDataBaseUtilityes;