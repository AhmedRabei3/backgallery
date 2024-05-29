const { User, validateUpdate } = require("../models/User");
const { Image } = require("../models/Image");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");
const {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
  cloudinaryRemoveMultipleImage,
} = require("../utils/cloudinary");
const { param } = require("../routes/usersRoutes");

/**------------------------------------
 * @descriptions Get all users data
 * @Method GET
 * @route /users/all
 * @access private ( admin only )
 *------------------------------------*/

exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find()
    .select(["username", "email", "profilePhoto"])
    .populate("images");
  res.status(200).json(users);
});

/**------------------------------------
 * @descriptions Get user profile
 * @Method GET
 * @route /users/profile/:id
 * @access  public
 *------------------------------------*/

exports.profile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select(["username", "email", "profilePhoto", "bio", "createdAt"])
      .populate("images");
    user
      ? res.status(200).json(user)
      : res.status(404).json({ message: "User not found" });
  } catch (error) {
    console.log(error);
  }
});

/**------------------------------------
 * @descriptions update user profile
 * @Method put
 * @route /users/profile/:id
 * @access  private (only account owner )
 *------------------------------------*/

exports.profileUpdate = asyncHandler(async (req, res) => {
  const { error } = validateUpdate(req.body);
  if (error) return res.status(401).json({ message: error.details[0].message });
  if (req.user.id != req.params.id)
    return res
      .status(403)
      .json({ message: "You dont have a permession's to update this account" });
  let user = await User.findById(req.user.id);
  if (user) {
    const validPass = bcrypt.compareSync(req.body.password, user.password);
    if (!validPass)
      return res.status(400).send("You shuld input your password to confirm");
    user.username = req.body.username;
    user.bio = req.body.bio;
    user.save();
    res.status(200).json({ message: "Profile updated !", user });
  } else {
    res.status(404).json({ message: "not found !" });
  }
});

/**----------------------------------------------------
 * @descriptions profile photo upload
 * @Method post
 * @route /users/photo-upload
 * @access  private (logged in account owner)
 *----------------------------------------------------*/
exports.profilePhoto = asyncHandler(async (req, res) => {
  // validation
  if (!req.file) {
    return res
      .status(400)
      .json({ message: "please select a photo to upload !" });
  }
  // get path of image
  const imgPath = path.join(__dirname, `../images/${req.file.filename}`);
  // upload to cloudinary
  const result = await cloudinaryUploadImage(imgPath);
  // get the user from db
  const user = await User.findById(req.user.id);
  // delete old profile photo if exist
  if (user.profilePhoto.publicId !== null) {
    await cloudinaryRemoveImage(user.profilePhoto.publicId);
  }
  // change profile photo field in db
  user.profilePhoto = {
    url: result.secure_url,
    publicId: result.public_id,
  };
  await user.save();
  // send response to client
  res.status(200).json({
    message: " uploaded photo successfully ",
    profilePhoto: {
      url: result.secure_url,
      publicId: result.public_id,
    },
  });
  // remove image from server
  fs.unlinkSync(imgPath);
});

/**----------------------------------------------------
 * @descriptions delete profile
 * @Method DELETE
 * @route /users/profile/:id
 * @access  private (admin || user by himself)
 *----------------------------------------------------*/
exports.deleteProfile = asyncHandler(async (req, res) => {
  // 1. get the user from db
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "user not found" });
  // 2. get all images from db
  const images = await Image.find({ user: user._id });
  // 3. get public ids from pic
  if (images) {
    const publicIds = images.map((img) => img.publicId);
    // 4. delete all images that belongs to this user
    if (publicIds?.length > 0) {
      await cloudinaryRemoveMultipleImage(publicIds);
    }
  }
  // 5. delete profile photo from cloudinary
  if (user.profilePhoto.publicId !== null) {
    await cloudinaryRemoveImage(user.profilePhoto.publicId);
  }
  // 6. delete likes & comments
  await Image?.deleteMany({ user: user._id });

  await User.deleteOne(user);

  res.status(200).json({ message: "user deleted successfully" });
});
