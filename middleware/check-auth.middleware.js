const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY } = require("../config/constant");

const checkAuth = (roles) => {
  return (req, res, next) => {
    const token = req.cookies?.token || req.headers.token;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    try {
      const user = jwt.verify(token, JWT_SECRET_KEY);

      // Check if the user has at least one of the required roles
      if (!roles.some((role) => user.roles.includes(role))) {
        return res
          .status(403)
          .json({ message: "Forbidden: You don't have the required role" });
      }

      req.authUser = user; 
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Unauthorized: Token expired" });
      }

      console.error("Authorization error:", error);
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
  };
};

module.exports = {
  checkAuth,
};
