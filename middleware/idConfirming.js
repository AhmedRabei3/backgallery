const mongoose = require("mongoose");

// validation of provided id
module.exports.objectIdValidation = async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: "Invalid id" });
  }
  next();
};
