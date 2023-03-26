const { boolean } = require("joi");
const { default: mongoose } = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name Required"],
  },
  email: {
    type: String,
    required: [true, "Email required"],
    unique: true,
  },
  role: {
    type: String,
    required: [true, "Role required"],
  },
  phone: {
    type: Number,
    required: [true, "Phone required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Password required"],
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
});

const UserModal = new mongoose.model("User", userSchema);
module.exports = UserModal;
