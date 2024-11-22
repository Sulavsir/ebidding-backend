const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY, SMTP_EMAIL, SMTP_PWD } = require("../config/constant");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const signUp = async (req, res) => {
  try {
    const { name, email, password, roles, personalInterests } = req.body;

    const profileImage = req.file ? req.file.path : null;

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
const forgetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    // Set the reset token and expiration time in the user's record
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
    await user.save();

    const resetLink = `http://localhost:3003/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL, 
        pass: process.env.SMTP_PWD,
      },
    });

    // Setup email options
    const mailOptions = {
      to: user.email,
      from: "sulav2236@gmail.com",
      subject: "Password Reset Request",
      html: `
      <p>Hello,</p>
      <p>We received a request to reset the password for your account.</p>
      <p>To reset your password, please click the link below:</p>
      <a href="${resetLink}">Reset Your Password</a>
      <p>If you did not request this, please ignore this email. Your password will not be changed.</p>
      <p>This link will expire in 1 hour for security purposes.</p>
      <p>Thank you,</p>
      <p>YourApp Team</p>
    `,
    };
    await transporter.sendMail(mailOptions);

    res.status(200).send({ message: "Password reset link sent to your email" });
  } catch (error) {
    console.error("Error sending password reset emasl:", error);
    res.status(500).send({ message: "Error sending password reset link" });
  }
};

// Password reset route handler
const resetPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { newPassword } = req.body;

  try {
    // Find the user with the provided reset token
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .send({ message: "Invalid or expired reset token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).send({ message: "Password has been successfully reset" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).send({ message: "Server error" });
  }
};

module.exports = {
  signIn,
  signUp,
  logout,
  forgetPassword,
  resetPassword,
};
