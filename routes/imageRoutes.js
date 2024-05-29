const router = require("express").Router();
const {
  addImage,
  getAllImage,
  getImage,
  getImageCount,
  deleteImage,
  updateImageInfo,
  updateImage,
  toggleLike,
} = require("../controllers/ImageCtr");
const photoUploade = require("../middleware/photoUpload");
const { verifyToken } = require("../middleware/verifyToken");
const { objectIdValidation } = require("../middleware/idConfirming");

// /api/images
router
  .route("/")
  .post([verifyToken, photoUploade.single("image")], addImage)
  .get(getAllImage);

router.get("/count", getImageCount);
router
  .route("/:id")
  .get(objectIdValidation, getImage)
  .delete([objectIdValidation, verifyToken], deleteImage)
  .put([objectIdValidation, verifyToken], updateImageInfo);

router.put(
  "/update/:id",
  [objectIdValidation, verifyToken, photoUploade.single("image")],
  updateImage
);

// likes roter
router.route("/likes/:id").put([objectIdValidation, verifyToken], toggleLike);

module.exports = router;
