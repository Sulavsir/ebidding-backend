const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY } = require("../config/constant");

const checkAuth = (role) => {
  return (req, res, next) => {
    const token = req.cookies?.token || req.headers.token;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    try {
      const user = jwt.verify(token, JWT_SECRET_KEY);

      // Check if the user has the required role
      if (!user.roles.includes(role)) {
        return res
          .status(403)
          .json({ message: "Forbidden: You don't have the required role" });
      }

      req.authUser = user; // Attach user data to the request object
      next();
    } catch (error) {
       if (error.name === "TokenExpiredError") {
         return res
           .status(401)
           .json({ message: "Unauthorized: Token expired" });
       }
      console.error("Authorization error:", error);
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
  };
};

// useCase = checkAuth('customer') , checkAuth('Admin')

// const checkAuth = (req, res, next) => {
//   console.log(req.cookies);

//   const token = req.cookies.token ?? req.headers.token;
//   try {
//     const user = jwt.verify(token, JWT_SECRET_KEY);

//     req.authUser = user;
//     next();
//   } catch (error) {
//     res.status(401).json({ message: "Unauthorized" });
//   }
// };
// // roles = ['Customer', 'Admin', 'Super Admin' ]
// // roles.includes('customer')
// const checkAuthAdmin = (req, res, next) => {
//   const token = req.cookies.token ?? req.headers.token;
//   try {
//     const user = jwt.verify(token, JWT_SECRET_KEY);
//     console.log(user);
//     if (!user.roles.includes("Admin")) {
//       res.status(401).json({ message: "Unauthorized action" });
//       return;
//     }
//     req.authUser = user;
//     next();
//   } catch (error) {
//     res.status(401).json({ message: "Unauthorized" });
//   }
// };

module.exports = {
  checkAuth,
};
