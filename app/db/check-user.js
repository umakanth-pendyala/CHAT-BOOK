const mongooes = require("mongoose");
const User = require("../models/user-schema.js");

const checkIfUserExists = async email => {
  try {
    const userExists = await User.exists({ email: email.trim() });
    if (userExists) return true;
    return false;
  } catch (e) {
    return false;
  }
};

const checkIfUserExistsAndPasswordIsValid = async (email, password) => {
  try {
    const user = await User.findOne({ email: email.trim() });
    const validPassword = await user.comparePassword(password.trim());
    if (validPassword) return true;
    return false;
  } catch (e) {
    return false;
  }
};

module.exports = userAuthentication = {
  checkIfUserExists,
  checkIfUserExistsAndPasswordIsValid,
};
