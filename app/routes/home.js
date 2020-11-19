const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  var sendingInformation = {};
  // ACTUAL LOGIC
  if (req.session.userInformation != undefined) {
    sendingInformation = {};
    //IT IS A REDIRECTED ROUTE FROM SIGN UP OR SIGN IN
    var temp = req.session.userInformation;
    sendingInformation.userIsAuthenticated = temp.userIsAuthenticated;
    if (temp.userIsAuthenticated == false) {
      if (temp.userRequestedForSignIn == false) {
        //USER REQUESTED FOR SIGN UP
        sendingInformation.errorMessageActive = true;
        sendingInformation.userRequestedForSignIn = false;
      } else {
        //USER REQUESTED FOR SIGN IN
        sendingInformation.errorMessageActive = false;
        sendingInformation.userRequestedForSignIn = true;
      }
      sendingInformation.userSignInCredentialDetails = temp.userSignInCredentialDetails;
      //DONT GET CONFUSED HERE. THIS IS ONLY CONTROL CHECK. THE ACTUAL RESPONSE IS SENT AT BOTTOM.
    } else {
      //VALID USER
      //THIS ROUTE IS IN ACTIVITY FILE
      res.redirect("/user/home");
      return;
    }
  } else {
    // FRESH VISITER TO THE PAGE. **(NOT USER)**
    sendingInformation = {
      userIsAuthenticated: false,
      errorMessageActive: false,
      userRequestedForSignIn: false,
      userSignInCredentialDetails: {
        email: false,
        password: false,
      },
    };
  }
  //THE DEFAULT IS USED AS USER AUTHENTICATION IS FAILED
  res.render("landing-page", sendingInformation);
  req.session.destroy();
  return;
});

module.exports = router;

// let verifiedUser = false;
// if (req.session.user == null || req.session.user == undefined) verifiedUser = false;
// else verifiedUser = true;
// sendingInformation = {
//   user: {
//     isAuthenticated: verifiedUser,
//   },
//   errorMessageActive: false,
//   userRequestedForSignIn: false,
//   userSignInCredentialDetails: {
//     email: false,
//     password: false,
//   },
// };
