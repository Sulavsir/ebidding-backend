const express = require("express");
const { body } = require("express-validator");
const {
  signUp,
  signIn,
  logout,
  forgetPassword,
  resetPassword
} = require("../controllers/auth.controller");
const validate = require("../middleware/validator.middleware");
const { checkAuth } = require("../middleware/check-auth.middleware");
const upload = require("../middleware/file-uploads.middleware");
const router = express.Router();

const signUpValidator = [
  body("email")
    .notEmpty()
    .isEmail()
    .withMessage("Please provide a valid email address."),
  body("name")
    .isLength({ min: 3, max: 100 })
    .notEmpty()
    .withMessage("Name is required and should be at least 3 characters long."),
  body("password").notEmpty().withMessage("Password is required."),
  body("roles")
    .notEmpty()
    .isIn(["Sales", "Customer"])
    .withMessage("Roles can only be 'Sales' or 'Customer'."),
  body("profileImage")
    .optional()
    .custom((value, { req }) => {
      // Check if the file is present in the request
      if (req.file) {
        // File is uploaded, check the file type if necessary
        const validMimeTypes = ["image/jpeg", "image/png", "image/gif"];
        if (!validMimeTypes.includes(req.file.mimetype)) {
          throw new Error(
            "Invalid file type. Only JPEG, PNG, and GIF are allowed."
          );
        }
      }
      return true;
    }),

  body("personalInterests")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Personal interests should be at least 3 characters long."),
  validate,
];

const signInValidator = [
  body("email")
    .notEmpty()
    .isEmail()
    .withMessage("Please provide a valid email address."),
  body("password").notEmpty().withMessage("Password is required."),
  validate,
];

router.post("/sign-up", upload.single("profileImage"), signUpValidator, signUp);
router.post("/sign-in", signInValidator, signIn);
router.post("/forgot-password", forgetPassword);
router.post("/reset-password/:resetToken", resetPassword);
router.post("/logout", checkAuth(), logout);

module.exports = router;
