const fs = require("fs");
const path = require("path");
const asyncHandler = require("express-async-handler");
const {
  Image,
  validateCreateImage,
  validateUpdateImage,
} = require("../models/Image");
const { User } = require("../models/User");
const {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
} = require("../utils/cloudinary");

/**------------------------------------------------
 * @description Add a new Image
 * @methode POST
 * @route /api/image
 * @access private (only logged in user)
 *-------------------------------------------------*/

module.exports.addImage = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "no image provided" });
  const { error } = validateCreateImage(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const imgPath = path.join(__dirname, `../images/${req.file.filename}`);
  const result = await cloudinaryUploadImage(imgPath);
  const image = await Image.create({
    title: req.body.title,
    description: req.body.description,
    user: req.user.id,
    image: {
      url: result.secure_url,
      publicId: result.public_id,
    },
  });
  res.status(201).json(image);
  fs.unlinkSync(imgPath);
});

/**------------------------------------------------
 * @description get all Image
 * @methode GET
 * @route /api/image
 * @access public (all user)
 *-------------------------------------------------*/

module.exports.getAllImage = asyncHandler(async (req, res) => {
  const IMAGE_PER_PAGE = 8;
  const { pageNumber } = req.query;
  let image;
  // paginations
  const page = pageNumber || 1;
    image = await Image.find()
      .skip((page - 1) * IMAGE_PER_PAGE)
      .limit(IMAGE_PER_PAGE)
      .sort({ createdAt: -1 })
      .populate("user", "-password");

  res.status(200).json(image);
});

/**------------------------------------------------
 * @description get specific Image
 * @methode GET
 * @route /api/image/:id
 * @access public (all user)
 *-------------------------------------------------*/

module.exports.getImage = asyncHandler(async (req, res) => {
  const image = await Image.findById(req.params.id).populate("user", [
    "-password",
  ]);
  image
    ? res.status(200).json(image)
    : res.status(404).json({ message: "image not found" });
});

/**------------------------------------------------
 * @description get Image count
 * @methode GET
 * @route /api/image/count
 * @access public (all user)
 *-------------------------------------------------*/

module.exports.getImageCount = asyncHandler(async (req, res) => {
  const imageCount = await Image.countDocuments();
  res.status(200).json(imageCount);
});

/**------------------------------------------------
 * @description Delete image
 * @methode DELETE
 * @route /api/image/:id 
 * @access private (owner of image or admin)
 *-------------------------------------------------*/
module.exports.deleteImage = asyncHandler(async (req, res) => {
  const image = await Image.findById(req.params.id);
  if (!image) return res.status(404).json({ message: "Image not found" });

  if (req.user.isAdmin || req.user.id === image.user.toString()) {
    await cloudinaryRemoveImage(image.image.publicId);
    await Image.deleteOne(image);
    return res
      .status(200)
      .json({ message: "Image deleted", imageId: image._id });
  } else {
    res.status(403).json({ message: "access denied" });
  }
});

/**------------------------------------------------
 * @description Update image info
 * @methode PUT
 * @route /api/image/:id
 * @access private (owner of image)
 *-------------------------------------------------*/
module.exports.updateImageInfo = asyncHandler(async (req, res) => {
  const { error } = validateUpdateImage(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  let image = await Image.findById(req.params.id);
  if (!image) return res.status(404).json({ message: "Image not found" });
  if (req.user.id !== image.user.toString())
    return res.status(403).json({ message: "access denied" });

  image = await Image.updateOne(
    image,
    {
      title: req.body.title,
      description: req.body.description,
    },
    { new: true }
    
  ).populate("user", "-password");
  res.status(201).json({
    title: req.body.title,
    description: req.body.description,
  });
});
/**------------------------------------------------
 * @description Update image
 * @methode PUT
 * @route /api/image/update/:id
 * @access private (owner of image)
 *-------------------------------------------------*/
module.exports.updateImage = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "no image provided" });

  let image = await Image.findById(req.params.id);
  if (!image) return res.status(404).json({ message: "Image not found" });
  if (req.user.id !== image.user.toString())
    return res.status(403).json({ message: "access denied" });

  await cloudinaryRemoveImage(image.image.publicId);

  const imgPath = path.join(__dirname, `../images/${req.file.filename}`);
  const result = await cloudinaryUploadImage(imgPath);
  image = await Image.updateOne(image, {
    image: result.secure_url,
    publicId: result.public_id,
  });
  fs.unlinkSync(imgPath);
  res.status(201).json(image);
});

/**------------------------------------------------
 * @description toggle like
 * @methode PUT
 * @route /api/image/likes/:id
 * @access private (only logged in user)
 *-------------------------------------------------*/
module.exports.toggleLike = asyncHandler(async (req, res) => {
  let image = await Image.findById(req.params.id);
  if (!image) return res.status(404).json({ message: "Image not found" });

  const alreadyLike = image.likes.find(
    (user) => user.toString() === req.user.id
  );

  if (alreadyLike) {
    image.likes = image.likes.filter((user) => user.toString() !== req.user.id);
  } else {
    image.likes.push(req.user.id);
  }

  await image.save();
  res.status(200).json(image);
});
