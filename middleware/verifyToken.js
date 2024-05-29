const jwt = require("jsonwebtoken");

// verify token
function verifyToken(req, res, next) {
  const authToken = req.headers.authorization;
  if (authToken) {
    const token = authToken.split(" ")[1];
    try {
      const payload = jwt.verify(token, process.env.SECRET_KEY);
      req.user = payload;
      next();
    } catch (error) {
      res.status(401).json({ message: "Invalide token , access denied" });
    }
  } else {
    res.status(401).json({ message: "No token prvided , access denied" });
  }
}

// verify admin
function verifyAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      res
        .status(403)
        .json({ message: "Access denied ,permessions for admins only" });
    }
  });
}
function userBySelfOrAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.isAdmin || req.user.id === req.params.id) {
      next();
    } else {
      res
        .status(403)
        .json({
          message:
            "Access denied ,permessions for admins only or user by himself",
        });
    }
  });
}

module.exports = {
  verifyToken,
  verifyAdmin,
  userBySelfOrAdmin,
};
