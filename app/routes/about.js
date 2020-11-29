const express = require('express');
const router = express.Router();
const getUserDetails = require("../db/get-user.js");


router.get('/about', async (req, res) => {
    sendingInformation = {};
    if (req.session.userInformation == undefined || req.session.userInformation == null) {
        res.redirect('/');
        return;
    }
    const userEmail = req.session.userInformation.userEmailId;
    const userInfoFromDatabase = await getUserDetails(userEmail.trim());
    if (req.session.userInformation.userIsAuthenticated) {
        sendingInformation.userIsAuthenticated = true;
        sendingInformation.username = userInfoFromDatabase.name;
        sendingInformation.profilePicURL = userInfoFromDatabase.profilePicURL;
        sendingInformation.profilePicURL = userInfoFromDatabase.profilePicURL;
        res.render("about", sendingInformation);
        return;
    }
    res.redirect('/');
})

module.exports = router;