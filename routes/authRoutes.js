const router = require("express").Router();
const { register, login } = require("../controllers/authController");

// api/auth/reg
router.post("/reg", register);
// api/auth/login
router.post("/login", login);

module.exports = router;
