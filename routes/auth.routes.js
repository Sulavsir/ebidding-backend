const express = require("express");
const { body } = require("express-validator");
const { signUp, signIn, logout } = require("../controllers/auth.controller");
const validate = require("../middleware/validator.middleware");
const { checkAuth } = require("../middleware/check-auth.middleware");
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
    .isURL()
    .withMessage("Profile Image should be a valid URL."),
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

router.post("/sign-up", signUpValidator, signUp);
router.post("/sign-in", signInValidator, signIn);
router.post("/logout",checkAuth() ,logout);

module.exports = router;
