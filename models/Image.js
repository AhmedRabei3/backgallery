const mongoose = require("mongoose");
const Joi = require("joi");

const ImageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    image: {
      type: Object,
      default: {
        url: "",
        publicId: null,
      },
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Image = mongoose.model("Image", ImageSchema);

function validateCreateImage(obj) {
  const schema = Joi.object({
    title: Joi.string().trim().required(),
    description: Joi.string(),
    category: Joi.string().trim(),
  });
  return schema.validate(obj);
}

function validateUpdateImage(obj) {
  const schema = Joi.object({
    title: Joi.string().trim(),
    description: Joi.string(),
    category: Joi.string().trim(),
  });
  return schema.validate(obj);
}

module.exports = {
  Image,
  validateCreateImage,
  validateUpdateImage,
};
