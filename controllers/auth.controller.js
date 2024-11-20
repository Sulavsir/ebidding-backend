const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY } = require("../config/constant");

const signUp = async (req, res) => {
  try {
    const { name, email, password, roles, profileImage, personalInterests } =
      req.body;

    if (!["Sales", "Customer"].includes(roles)) {
      return res.status(400).json({
        message: "Invalid role. Only 'Sales' or 'Customer' roles are allowed.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      roles: [roles], // Either 'Sales' or 'Customer'
      profileImage,
      personalInterests,
    });

    await newUser.save();

    res.status(201).json({
      message: "User signed up successfully.",
      data: {
        name: newUser.name,
        email: newUser.email,
        roles: newUser.roles,
        profileImage: newUser.profileImage,
        personalInterests: newUser.personalInterests,
      },
    });
  } catch (error) {
    console.error("Error during sign-up:", error);
    res.status(500).json({ message: "An error occurred while signing up." });
  }
};

const signIn = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      res.status(401).json({
        message: "Invalid Credentials.",
      });
      return;
    }
    const isValidPassword = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (isValidPassword) {
      const token = jwt.sign(
        {
          _id: user._id,
          email: user.email,
          roles: user.roles,
          name: user.name,
        },
        JWT_SECRET_KEY,
        {
          expiresIn: "10d",
        }
      );

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 10);

      res.cookie("token", token, {
        httpOnly: true,
        expires: expiresAt,
      });

      res.status(200).json({
        message: "Succesfully signed in.",
        token,
        user,
        expiresAt,
      });
      return;
    }

    res.status(401).json({
      message: "Invalid Credentials.",
    });
  } catch (error) {
    console.error("Error during sign-in:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while signing in." });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({
      message: "User logged out successfully",
    });
  } catch (error) {
    console.error("Error during logout:", error);
    return res.status(500).json({
      message: "An error occurred while logging out.",
    });
  }
};

module.exports = {
  signIn,
  signUp,
  logout,
};
