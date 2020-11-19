const express = require("express");
const router = express.Router();
const userAuthentication = require("../db/check-user.js");
const User = require("../models/user-schema");

router.post("/signup", async (req, res) => {
  var sendingInformation = undefined;
  req.session.userInformation = undefined;
  //TO CHECK IF THE EXISTING USER SIGNS UP AGAIN
  if (await userAuthentication.checkIfUserExists(req.body.email)) {
    req.session.userInformation = {
      userIsAuthenticated: false,
      userRequestedForSignIn: false,
      userSignInCredentialDetails: {
        email: false,
        password: false,
      },
      userEmailId: req.body.email.trim(),
    };
    req.session.save(err => {
      if (err) res.send("opps ! session expired");
      else {
        res.redirect("/");
        return;
      }
    });
    return;
  }
  //IF CONTROL GETS HERE..USER EMAIL IS NEW
  const result = await addUser(req.body);
  //IF ADDING USER INTO DATABASE FAILED THROW ERROR.
  if (result == false) {
    req.session.userInformation = {
      userIsAuthenticated: false,
      userRequestedForSignIn: false,
      userSignInCredentialDetails: {
        email: false,
        password: false,
      },
      userEmailId: req.body.email.trim(),
    };
    req.session.save(err => {
      if (err) res.send("opps ! session expired");
      else {
        res.redirect("/");
        return;
      }
    });
    return;
  }
  //USER IS VALIDATED
  req.session.userInformation = {
    userIsAuthenticated: true,
    userRequestedForSignIn: false,
    userSignInCredentialDetails: {
      email: false,
      password: false,
    },
    userEmailId: req.body.email.trim(),
  };
  req.session.save(err => {
    if (err) res.send("opps ! session expired");
    else {
      res.redirect("/");
      return;
    }
  });
  return;
});

const addUser = async userDetails => {
  try {
    const newUser = new User(userDetails);
    let saveUser = await newUser.save();
    if (!saveUser) return false;
    return saveUser;
  } catch (e) {
    return false;
  }
};

module.exports = router;
