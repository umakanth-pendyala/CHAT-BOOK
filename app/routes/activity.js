const express = require("express");
const router = express.Router();
const getUserDetails = require("../db/get-user.js");

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
    //SEND THE HOME (USERS) PAGE
    res.render("home", sendingInformation);
    return;
  }

  //IF THE CONTROL REACHES HERE. THE USER IS UN AUTHENTICATED. REDIRECT HIM TO HOME PAGE
  res.redirect("/");
  return;
});

module.exports = router;
