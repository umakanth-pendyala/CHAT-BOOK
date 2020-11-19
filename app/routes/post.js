const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");

/**
 * PATH MODULE IS USED TO EXTRACT THE FILE EXTENCTION OF THE FILE USING path.extname(<filename>)
 */

// SET STORAGE ENGINE
const storage = multer.diskStorage({
  // destination: "./public/posts/",
  destination: (req, file, callback) => {
    const imageFileTypes = /jpeg|jpg|png|gif/;
    const videoFileTypes = /mp4/;
    let storagePath;

    if (imageFileTypes.test(path.extname(file.originalname))) {
      storagePath = "./public/posts/";
      return callback(null, storagePath);
    } else if (videoFileTypes.test(path.extname(file.originalname))) {
      storagePath = "./public/videos/";
      return callback(null, storagePath);
    } else {
      callback("ERROR: Invalid File Type");
      return;
    }
  },
  filename: function (req, file, cb) {
    // FIELD NAME IS THE NAME YOU ASSIGNED TO THE INPUT FIELD IN EJS FILE
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100000000000 },
  fileFilter: (req, file, cb) => {
    //CUSTOM FUNCTION TO CHOOSE ONLY IMAGE AND VIDO FILES
    checkFileType(file, cb);
  },
}).fields([
  { name: "video", maxCount: 1 },
  { name: "img", maxCount: 1 },
]);
/*.single("video"); is used for single input field*/

const checkFileType = (file, cb) => {
  const imageFileTypes = /jpeg|jpg|png|gif/;
  const videoFileTypes = /mp4/;
  //CHECK THE EXTENCTION
  const isImageExtenction = imageFileTypes.test(path.extname(file.originalname).toLowerCase());
  const isVideoExtenction = videoFileTypes.test(path.extname(file.originalname).toLowerCase());
  //CHECK THE MIME TYPE
  const isImageMimeType = imageFileTypes.test(file.mimetype);
  const isVideoMimeType = videoFileTypes.test(file.mimetype);

  if ((isImageExtenction && isImageMimeType) || (isVideoExtenction && isVideoMimeType)) {
    return cb(null, true);
  } else {
    return cb("Invalid file type");
  }
};

router.post("/upload", async (req, res) => {
  upload(req, res, err => {
    if (err) {
      console.log(err);
      res.send("file upload failed");
      return;
    } else {
      // console.log(req.file);
      console.log(req.body.message);
      res.send("file uploaded");
    }
  });
});

module.exports = router;
