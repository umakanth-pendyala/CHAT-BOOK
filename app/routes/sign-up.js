const express = require("express");
const router = express.Router();
const userAuthentication = require("../db/check-user.js");
const User = require("../models/user-schema");
const postDataBaseUtilityes = require('../db/post-db-utils');
const bcrypt = require('bcrypt');



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
	//SET THE DEFAULT IMAGE URL HERE
	req.body.profilePicURL = '/images/DEFAULT_PROFILE.JPG'
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
	//CREATE THE POSTS TABLE FOR THIS USER
	var postTableCreated = await postDataBaseUtilityes.createPostsDocumentForUser(req.body.email);
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
		console.log(userDetails);
		if (userDetails.gender == 1) userDetails.gender = "Male";
		else if (userDetails.gender == 2) userDetails.gender = "Female";
		else userDetails.gender = "Other"
		console.log(userDetails.gender);
		const hash = bcrypt.hashSync(userDetails.password.trim(), 10);
		userDetails.password = hash;
		const newUser = new User(userDetails);
		let saveUser = await newUser.save();
		if (!saveUser) return false;
		return saveUser;
	} catch (e) {
		return false;
	}
};

module.exports = router;
