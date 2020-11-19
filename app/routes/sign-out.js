const express = require("express");
const router = express.Router();

router.get("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) res.send("session expiration error");
    res.redirect("/");
  });
});

module.exports = router;
