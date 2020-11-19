const express = require("express");
const connecter = require("./app/db/connecter.js");
const mongoose = require("mongoose");
const User = require("./app/models/user-schema");
const app = express();

require("./app/routes/index")(app);

const successfull = connecter();

const compareUser = async () => {
  const user = await User.findOne({ email: "1@gitam.in" });
  // console.log(user);
  // console.log(await user.comparePassword("1234"));
};

if (successfull) {
  app.listen(4000, () => console.log("server is launched"));
  compareUser();
} else {
  console.log("server launch failed");
}
