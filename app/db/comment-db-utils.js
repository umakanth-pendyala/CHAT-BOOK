const postDataBaseUtilityes = require('../db/post-db-utils.js');
const userDataBaseUtilityes = require('../db/user-db-utils');
const Post = require('../models/post-schema');
const User = require('../models/user-schema');
const Comment = require('../models/comment-schema');


const commentDatabaseUtilityes = {
    getCommentsForAPost: async function (postId) {
        try {
            const commentsData = await Comment.findOne({ post_Id: postId });
            return commentsData.comments;
        } catch (e) {
            return false;
        }
    },
    getCommentsDisplayInformation: async function (comments) {
        const sendingInformation = [];
        try {
            for (var i = 0; i < comments.length; i++) {
                const temp = {};
                const userInformation = await User.findOne({ _id: comments[i].user_id });
                temp.username = userInformation.name;
                temp.timeOfComment = comments[i].timeOfComment;
                temp.profileImage = userInformation.profilePicURL
                temp.comment = comments[i].comment;
                sendingInformation.push(temp);
            }
            return sendingInformation;
        } catch (e) {
            console.log(e);
            return false;
        }
    },

    /**
     * 
     * @param {*} postId 
     * @param {*} userId 
     * @param {*} comment 
     * ADDS A NEW COMMENT AND RETURNS THE THE UPDATED COMMENTS
     */
    addNewComment: async function (postId, userId, comment) {
        var sendingInformation = [];
        try {
            var commentInformationForAPost = await Comment.findOne({ post_Id: postId });
            const commentObject = {
                user_id: userId,
                comment: comment
            }
            commentInformationForAPost.comments.push(commentObject);
            const temp = new Comment(commentInformationForAPost);
            const result = await temp.save();

            const comments = await commentDatabaseUtilityes.getCommentsForAPost(postId);
            sendingInformation = await commentDatabaseUtilityes.getCommentsDisplayInformation(comments);
            return sendingInformation;
        } catch (e) {
            console.log(e);
            return [];
        }
    },
};


module.exports = commentDatabaseUtilityes;