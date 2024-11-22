const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      default: "",
    },
    personalInterests: {
      type: [String],
      default: [],
    },
    resetPasswordToken: { type: String }, 
    resetPasswordExpires: { type: Date },
    roles: {
      type: [String],
      enum: ["Sales", "Customer", "Admin", "Super Admin"],
      default: ["Customer"], // Default role is Customer
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
