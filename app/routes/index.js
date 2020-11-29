const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const router = express.Router();

module.exports = app => {
  app.use(express.static("public"));
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );
  // app.use(bodyParser.json());
  app.set("view engine", "ejs");
  app.use(
    session({
      secret: "some-random-secret-key",
      resave: true,
      saveUninitialized: false,
      cookie: {},
    })
  );

  //USER ROUTES
  app.use("/", require("../routes/home.js"));
  app.use("/user", require("../routes/sign-up.js"));
  app.use("/user", require("../routes/sign-in.js"));
  app.use("/user", require("../routes/activity.js"));
  app.use("/user", require("../routes/post.js"));
  app.use("/user", require("../routes/sign-out.js"));
  app.use('/user', require('../routes/view-posts.js'));
  app.use('/user', require('../routes/handle-likes.js'));
  app.use('/user', require('../routes/comments.js'));
  app.use('/user', require('../routes/view-profile.js'));
  app.use('/user', require('../routes/friend-requests.js'));
  app.use('/user', require('../routes/request-history.js'));
  app.use('/user', require('../routes/edit-profile.js'));
  app.use('/', require('../routes/about.js'));
};
