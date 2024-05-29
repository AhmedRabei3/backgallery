const path = require("path");
const multer = require("multer");

// Photo storage
const photoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../images"));
  },
  filename: function (req, file, cb) {
    if (file) {
      cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
    } else {
      cb(null, false);
    }
  },
});

// Upload photo middleware
const photoUploade = multer({
  storage: photoStorage,
  limits: { fileSize: 1024 * 1024 * 5 }, // max limit 5mb
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb({ message: "unsupported file format" }, false);
    }
  },
});

module.exports = photoUploade;
