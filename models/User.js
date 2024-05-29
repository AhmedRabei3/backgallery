const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");

const ModelSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      minLength: 3,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minLength: 3,
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
    },
    profilePhoto: {
      type: Object,
      default: {
        url: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png",
        publicId: null,
      },
    },
    bio: {
      type: String,
      default: "",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// populate all images that belongs to this user
ModelSchema.virtual("images", {
  ref: "Image",
  foreignField: "user",
  localField: "_id",
});

// generate auth token
ModelSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, isAdmin: this.isAdmin },
    process.env.SECRET_KEY,
    { expiresIn: "7d" }
  );
};

const User = mongoose.model("User", ModelSchema);

// vaidate user register info
function validateRegister(obj) {
  const schema = Joi.object({
    username: Joi.string().trim().min(3).max(100).required(),
    email: Joi.string().trim().min(3).max(100).required().email(),
    password: Joi.string().trim().min(6).required(),
  });
  return schema.validate(obj);
}

//vaidate Login Info
function validateLogin(obj) {
  const schema = Joi.object({
    email: Joi.string().trim().min(3).required().email(),
    password: Joi.string().trim().min(6).required(),
  });
  return schema.validate(obj);
}

// Update info validations
function validateUpdate(obj) {
  const schema = Joi.object({
    password: Joi.string().trim().min(6).required(),
    username: Joi.string().trim().min(3).max(100).required(),
    bio: Joi.string(),
  });
  return schema.validate(obj);
}

module.exports = {
  User,
  validateRegister,
  validateLogin,
  validateUpdate,
};
