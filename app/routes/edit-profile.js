const express = require('express');
const router = express.Router();
const getUserDetails = require("../db/get-user.js");
const userDataBaseUtilityes = require("../db/user-db-utils.js");
const postDataBaseUtilityes = require('../db/post-db-utils.js');
const User = require('../models/user-schema');
const path = require("path");
const multer = require("multer");


// SET STORAGE ENGINE
const storage = multer.diskStorage({
    // destination: "./public/posts/",
    destination: (req, file, callback) => {
        const imageFileTypes = /jpeg|jpg|png|gif/;
        let storagePath;

        if (imageFileTypes.test(path.extname(file.originalname))) {
            storagePath = "./public/posts/";
            return callback(null, storagePath);
        }
        else {
            callback("ERROR: Invalid File Type");
            return;
        }
    },
    filename: function (req, file, cb) {
        // FIELD NAME IS THE NAME YOU ASSIGNED TO THE INPUT FIELD IN EJS FILE
        cb(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100000000000,
    },
    fileFilter: (req, file, cb) => {
        //CUSTOM FUNCTION TO CHOOSE ONLY IMAGE AND VIDO FILES
        checkFileType(file, cb);
    },
}).single('img');

const checkFileType = (file, cb) => {
    const imageFileTypes = /jpeg|jpg|png|gif/;
    //CHECK THE EXTENCTION
    const isImageExtenction = imageFileTypes.test(
        path.extname(file.originalname).toLowerCase()
    );
    //CHECK THE MIME TYPE
    const isImageMimeType = imageFileTypes.test(file.mimetype);

    if (
        (isImageExtenction && isImageMimeType)
    ) {
        return cb(null, true);
    } else {
        return cb("Invalid file type");
    }
};



router.get('/editProfile', async (req, res) => {
    var sendingInformation = {};
    if (req.session.userInformation == undefined) {
        res.redirect("/");
        return;
    }

    sendingInformation.pageTitle = "Friend Requests"
    const userEmail = req.session.userInformation.userEmailId;
    const userInfoFromDatabase = await getUserDetails(userEmail.trim());
    if (req.session.userInformation.userIsAuthenticated) {
        sendingInformation.userIsAuthenticated = true;
        sendingInformation.username = userInfoFromDatabase.name;
        sendingInformation.profilePicURL = userInfoFromDatabase.profilePicURL;
        sendingInformation.pageView = false;
        sendingInformation.userData = await getUserData(userEmail);
        // console.log(sendingInformation);
        res.render("edit-page", sendingInformation);
        return;
    }
    res.render('edit-page');
})

router.post('/updateProfile', (req, res) => {
    if (req.session.userInformation == undefined) {
        res.redirect('/');
        return;
    }

    upload(req, res, async (err) => {
        if (err) {
            console.log(err);
            res.send("file upload failed");
            return;
        }
        else {
            const updatingObject = {};
            const userEmail = req.session.userInformation.userEmailId;
            const result = await updateUserData(req.file, req.body, userEmail);
            res.redirect('/user/editProfile');
            return;
        }
    });

    // res.redirect('/user/editProfile');
    // return;
})

const updateUserData = async (fileInformation, textInformation, email) => {
    const userId = await userDataBaseUtilityes.getUserIdOfThisUser(email.trim());
    const userDocument = await User.findOne({ _id: userId });
    if (fileInformation) {
        const filePath = `/posts/${fileInformation.filename}`
        userDocument.profilePicURL = filePath;
    }
    userDocument.name = textInformation.name ? textInformation.name : userDocument.name;
    if (textInformation.relationshipStatus == "Single" || textInformation.relationshipStatus == "Taken") {
        userDocument.relationshipStatus = textInformation.relationshipStatus ? textInformation.relationshipStatus : undefined;
    }
    userDocument.profession = textInformation.profession ? textInformation.profession : undefined;
    try {
        userDocument.phoneNumber = textInformation.phoneNumber ? textInformation.phoneNumber : undefined;
        parseInt(userDocument.phoneNumber);
    } catch (e) {
        userDocument.phoneNumber = '9550422046';
    }
    userDocument.dateOfBirth = textInformation.dateOfBirth ? textInformation.dataOfBirth : userDocument.dateOfBirth;

    if (textInformation.gender) {
        if (textInformation.gender == 1) {
            userDocument.gender = "Male"
        } else if (textInformation.gender == 2) {
            userDocument.gender = "Female"
        } else if (textInformation.gender == 3) {
            userDocument.gender = "Other";
        }
    }
    userDocument.bio = textInformation.bio ? textInformation.bio : undefined;
    const updatedUserDocument = new User(userDocument);
    const saveUpdatedUser = await updatedUserDocument.save();
    if (saveUpdatedUser) {
        return true;
    } else {
        return false;
    }
}

const getUserData = async (email) => {
    var sendingInformation = {};
    try {
        const userId = await userDataBaseUtilityes.getUserIdOfThisUser(email.trim());
        const userDocument = await User.findOne({ _id: userId });

        sendingInformation = {
            name: userDocument.name,
            email: userDocument.email,
            dateOfBirth: userDocument.dataOfBirth,
            profilePicURL: userDocument.profilePicURL,
            relationshipStatus: userDocument.relationshipStatus || "not defined",
            currentProfession: userDocument.profession || "not defined",
            phoneNumber: userDocument.phoneNumber || "not mentioned",
            dateOfBirth: userDocument.dateOfBirth,
            gender: userDocument.gender || "This detail is not mentioned",
            description: userDocument.bio || "description is not provided",
        }
        return sendingInformation;
    } catch (e) {
        console.log(e);
        return false;
    }
}

module.exports = router;