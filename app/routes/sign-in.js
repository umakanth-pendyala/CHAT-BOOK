const express = require("express");
const router = express.Router();
const userAuthentication = require("../db/check-user.js");
const User = require("../models/user-schema");

router.post("/signin", async (req, res) => {
  let sendingInformation = undefined;
  req.session.userInformation = undefined;
  if (await userAuthentication.checkIfUserExists(req.body.Semail)) {
    if (await userAuthentication.checkIfUserExistsAndPasswordIsValid(req.body.Semail, req.body.Spassword)) {
      //VALID EMAIL AND VALID PASSWORD
      req.session.userInformation = {
        userIsAuthenticated: true,
        userRequestedForSignIn: true,
        userSignInCredentialDetails: {
          email: true,
          password: true,
        },
        userEmailId: req.body.Semail.trim(),
      };
      res.redirect("/");
      return;
    } else {
      //VALID EMAIL INVALID PASSWORD
      req.session.userInformation = {
        userIsAuthenticated: false,
        userRequestedForSignIn: true,
        userSignInCredentialDetails: {
          email: true,
          password: false,
        },
        userEmailId: req.body.Semail.trim(),
      };
      req.session.save(err => {
        if (err) res.send("opps ! session expired");
        else {
          res.redirect("/");
          return;
        }
      });
      // res.render("landing-page", sendingInformation);
      sendingInformation = undefined;
      return;
    }
  } else {
    //INVALID EMAIL
    req.session.userInformation = {
      userIsAuthenticated: false,
      userRequestedForSignIn: true,
      userSignInCredentialDetails: {
        email: false,
        password: false,
      },
      userEmailId: req.body.Semail.trim(),
    };
    req.session.save(err => {
      if (err) res.send("opps ! session expired");
      else {
        res.redirect("/");
        return;
      }
    });
    // res.render("landing-page", sendingInformation);
    sendingInformation = undefined;
    return;
  }
});

module.exports = router;
