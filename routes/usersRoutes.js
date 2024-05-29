const router = require("express").Router();
const {
  getAllUsers,
  profile,
  profileUpdate,
  profilePhoto,
  deleteProfile,
} = require("../controllers/usersCtr");
const { objectIdValidation } = require("../middleware/idConfirming");
const photoUploade = require("../middleware/photoUpload");
const {
  verifyToken,
  verifyAdmin,
  userBySelfOrAdmin,
} = require("../middleware/verifyToken");

// /api/users/all
router.get("/all", verifyAdmin, getAllUsers);

// /api/users/profile/:id
router
  .route("/profile/:id")
  .get(objectIdValidation, profile) // get profile
  .put(objectIdValidation, verifyToken, profileUpdate) // update profile
  .delete(objectIdValidation, userBySelfOrAdmin, deleteProfile);

router.post(
  "/profile",
  [verifyToken, photoUploade.single("image")],
  profilePhoto
); // upload profile foto
module.exports = router;
