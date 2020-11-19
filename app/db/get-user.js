const mongoose = require("mongoose");
const User = require("../models/user-schema");

const gerUserDetails = async email => {
  try {
    const result = (await User.findOne({ email: email })) || false;
    return result;
  } catch (e) {
    //RETURN FALSE IF USER IS NOT FOUND
    return false;
  }
};

module.exports = gerUserDetails;
