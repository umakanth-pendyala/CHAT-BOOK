const mongoose = require('mongoose');
const User = require('../models/user-schema');
const Post = require('../models/post-schema');
const userDataBaseUtilityes = require('../db/user-db-utils');
const Comment = require('../models/comment-schema');


const postDataBaseUtilityes = {
    createPostsDocumentForUser: async function (email) {
        const userId = await userDataBaseUtilityes.getUserIdOfThisUser(email.trim());
        if (userId != false) {
            const postTable = new Post({ user: userId });
            let savePostTable = await postTable.save();
            if (!savePostTable) {
                return false;
            }

            return true;
        } else {
            return false;
        }
    },
    addNewPost: async function (fileData, userTitle, email) {
        try {
            var fileType;
            if (fileData != undefined) {
                if ((/video/).test(fileData.mimetype)) fileType = 'videos';
                else fileType = 'posts'
            }
            const userId = await userDataBaseUtilityes.getUserIdOfThisUser(email.trim());
            const postInformation = {
                postTitle: userTitle,
                postURL: fileData != undefined ? `/${fileType}/${fileData.filename}` : null,
                postType: fileData != undefined ? fileData.mimetype : null,
            }
            const result = await Post.findOneAndUpdate(
                {
                    user: userId
                },
                {
                    $push: { postInformation: postInformation }
                }
            )

            const data = await Post.findOne({ user: userId });
            const id = data.postInformation[data.postInformation.length - 1]._id;
            console.log(result)
            //CREATE A COMMENT TABLE HERE
            const saved = await this.createACommentDocumentForAPost(id);
            return true;
        }
        catch (e) {
            return false;
        }
    },
    getLatestPost: async (email) => {
        try {
            const userId = await userDataBaseUtilityes.getUserIdOfThisUser(email.trim());
            const postDocument = await Post.findOne({ user: userId });
            if (postDocument != null || postDocument != undefined) {
                // return postDocument.postInformation.length > 0 ? postDocument.postInformation[0] : [null]
                return postDocument.postInformation[postDocument.postInformation.length - 1];
            }
            return false;
        } catch (e) {
            return false;
        }
    },
    getPostsListForTheUser: async function (email) {
        var postDocuments = [];
        try {
            const userLatestPost = await this.getLatestPost(email.trim());
            if (userLatestPost != null || userLatestPost != undefined) {
                userLatestPost._doc.ownersId = await userDataBaseUtilityes.getUserIdOfThisUser(email.trim());
                const userDetails = await User.findOne({ email: email.trim() })
                userLatestPost._doc.username = userDetails.name;
                // console.log(userLatestPost, "user latest post");
                postDocuments.push(userLatestPost);
            }
            const friendsIds = await userDataBaseUtilityes.getUserFriendIds(email.trim());
            if (friendsIds.length == 0) return postDocuments;

            for (id of friendsIds) {
                const postDocument = await Post.findOne({ user: id.id }) || null;
                const postInformation = postDocument.postInformation;
                if (postInformation.length > 0) {
                    const tempData = await User.findOne({ _id: id.id })
                    for (post of postInformation) {
                        post._doc.ownersId = id.id;
                        post._doc.username = tempData.name;
                        // console.log(post, "post infmation hope there is username in that")
                        postDocuments.push(post);
                    }
                }
            }
            // console.log("post data here", postDocuments);
            return postDocuments;
        } catch (e) {
            return false;
        }
    },
    getAllPostsOfUser: async (email) => {
        var postDocuments = [];
        try {
            const userId = await userDataBaseUtilityes.getUserIdOfThisUser(email.trim());
            const postDocument = await Post.findOne({ user: userId });
            if (postDocument != null || postDocument != undefined) {
                return postDocument.postInformation;
            }
            return false;
        } catch (e) {
            return;
        }
    },
    getAllPostsOfUserById: async (userId) => {
        var postDocuments = [];
        try {
            const postDocument = await Post.findOne({ user: userId });
            if (postDocument != null || postDocument != undefined) {
                return postDocument.postInformation;
            }
            return false;
        } catch (e) {
            return;
        }
    },
    likeAPost: async (likersEmail, postOwnersId, ownersPostId) => {
        var sendingObject = {};
        try {
            const likersUserId = await userDataBaseUtilityes.getUserIdOfThisUser(likersEmail.trim());
            const postDocument = await Post.findOne({ user: postOwnersId });
            for (var i = 0; i < postDocument.postInformation.length; i++) {
                if (postDocument.postInformation[i]._id == ownersPostId) {
                    //CHECK IF THE USER ARLEADY LIKED THE PPOST OF YES REMOVE IT
                    for (var k = 0; k < postDocument.postInformation[i].likes.likedBy.length; k++) {
                        console.log(postDocument.postInformation[i].likes.likedBy[k].user, likersUserId);
                        if (postDocument.postInformation[i].likes.likedBy[k].user.equals((likersUserId))) {
                            postDocument.postInformation[i].likes.numberOfLikes--;
                            postDocument.postInformation[i].likes.likedBy.splice(k, 1);
                            const newPostDocument = new Post(postDocument);
                            const result = await newPostDocument.save();
                            sendingObject.postLiked = true;
                            sendingObject.numberOfLikes = postDocument.postInformation[i].likes.numberOfLikes;
                            return sendingObject;
                        }
                    }
                    postDocument.postInformation[i].likes.numberOfLikes++;
                    postDocument.postInformation[i].likes.likedBy.push({
                        user: likersUserId,
                    })
                    const newPostDocument = new Post(postDocument);
                    const result = await newPostDocument.save();
                    sendingObject.postLiked = true;
                    sendingObject.numberOfLikes = postDocument.postInformation[i].likes.numberOfLikes;
                    return sendingObject;
                }
            }

            return false;
        } catch (e) {
            console.log(e);
            sendingObject.postLiked = false;
            sendingObject.numberOfLikes = -1;
            return sendingObject;
        }
    },
    createACommentDocumentForAPost: async function (postId) {
        try {
            const newCommentTable = new Comment({ post_Id: postId });
            const result = await newCommentTable.save();
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }

    }
}


const sortThePostsAccordingToTime = () => {

}

module.exports = postDataBaseUtilityes;