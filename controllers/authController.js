const { validateRegister, validateLogin, User } = require("../models/User");
const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");

/**----------------------------------------
 * @description Register a new user
 * @route /auth/reg
 * @access Public
 * @Method POST
 ----------------------------------------*/
exports.register = asyncHandler(async (req, res) => {
  const { error } = validateRegister(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  // Check if user already exists
  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).json({message : "User already registered"});

  user = new User({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
  });
  await user.save();

  res.status(200).json({
    message: "You are welcokme",
    id: user._id,
    username: user.username,
    profilePhoto: user.profilePhoto,
    token: user.generateAuthToken(),
    bio: user.bio,
  });

  //res.status(201).json({ message: "Register successfully , please login" });
});

/**----------------------------------------
 * @description Register a new user
 * @route /auth/login
 * @access Public
 * @Method POST
 ----------------------------------------*/
exports.login = asyncHandler(async (req, res) => {
  const { error } = validateLogin(req.body);
  if (error) return res.status(400).json(error.details[0].message);
  // Check if user exists
  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(404).json({ message: "Not found" });
  // Check if password is correct
  const validPass = bcrypt.compareSync(req.body.password, user.password);
  if (!validPass)
    return res.status(400).json({ message: "Invalid password or email" });
  //
  res.status(200).json({
    message: "Welcom back",
    id: user._id,
    username: user.username,
    profilePhoto: user.profilePhoto,
    token: user.generateAuthToken(),
    bio: user.bio,
  });
});
