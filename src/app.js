const express = require("express");
var bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("./utils/jwt.utils");
const UserModal = require("./models/userModal");
const jwtConfig = require("./config/jwt.config");
const authGuard = require("./middleware/auth.middleware");
require("dotenv").config();
const cors = require("cors");

const port = process.env.PORT || 3000;
const app = express();
require("./db/conn");
app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

app.post("/register", async (req, res) => {
  console.log("req:", req?.body);

  try {
    const isExist = await UserModal.findOne({
      email: req.body.email,
    });
    console.log("this exist already:", isExist);
    if (isExist) {
      return res
        .status(400)
        .send({ success: false, message: "Email Already Exist" });
    }
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    console.log("password matched: ", password);
    if (password === confirmPassword) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      console.log("hashed: ", hashedPassword);

      const registerUser = new UserModal({
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        phone: req.body.phone,
        password: hashedPassword,
        isBlocked: req.body.isBlocked || false,
      });
      const registered = await registerUser.save();
      console.log("registered", registered);

      try {
        var token = jwt.createToken({
          id: registered._id,
        });
      } catch (err) {
        console.error("error signing json web token:", err);
      }

      console.log("token:", token);
      registered["token"] = token;
      const objWithToken = { ...registered._doc, token: token };
      if (registered) {
        res.status(200).send({ success: true, data: objWithToken });
      }
    } else {
      return res
        .status(400)
        .send({ success: false, message: "Password Not Matching" });
    }
  } catch {
    (err) => {
      res.status(400).send(err);
    };
  }
});

app.post("/login", async (req, res) => {
  const user = await UserModal.findOne({
    email: req.body.email,
  });
  if (!user) {
    return res.status(400).send({ success: false, message: "User Not Exist" });
  } else if (!user.isBlocked) {
    const isMatched = await bcrypt.compare(req.body.password, user.password);
    if (isMatched) {
      try {
        var token = jwt.createToken({
          id: user._id,
        });
      } catch (err) {
        console.error("error signing json web token:", err);
      }
      const objWithToken = { ...user._doc, token: token };

      return res.status(200).send({ success: true, data: objWithToken });
    } else {
      return res
        .status(400)
        .send({ success: false, message: "invalid Credentials" });
    }
  } else {
    return res
      .status(400)
      .send({ success: false, message: "You are blocked!" });
  }
});

// block user

app.post("/toggleblockuser", authGuard, async (req, res) => {
  console.log("called");
  const requestingUser = await UserModal.findById(req.user.id);
  console.log("11111111111111111111", requestingUser);
  if (requestingUser.role === "admin") {
    const user = await UserModal.findById(req.query.id);
    if (!user) {
      return res.status(400).send({ success: false, data: "User not found" });
    }
    user.isBlocked = !user.isBlocked; // toggle the block status
    const updatedUser = await user.save();
    return res.status(200).send({ success: true, data: updatedUser });
  } else {
    return res.status(400).send({
      success: false,
      data: "You have no permission to block/unblock users",
    });
  }
});

// unblock
app.post("/toggleblock", authGuard, async (req, res) => {
  const requestingUser = await UserModal.findById(req.user.id);

  if (requestingUser.role === "admin") {
    const user = await UserModal.findById(req.query.id);
    if (!user) {
      return res.status(400).send({ success: false, data: "User not found" });
    }
    user.isBlocked = !user.isBlocked; // toggle the block status
    const updatedUser = await user.save();
    if (updatedUser.isBlocked) {
      return res.status(200).send({ success: true, data: "User blocked" });
    } else {
      return res.status(200).send({ success: true, data: "User unblocked" });
    }
  } else {
    return res.status(400).send({
      success: false,
      data: "You have no permission to block/unblock users",
    });
  }
});
// get all users

app.post("/getallusers", authGuard, async (req, res) => {
  const requestingUser = await UserModal.find({ _id: req.user.id });
  console.log("ree", requestingUser);
  if (requestingUser[0]?.role === "admin") {
    const users = await UserModal.find({ role: "user" });
    return res.status(200).send({ success: true, data: users });
  } else {
    return res
      .status(400)
      .send({ success: false, data: "Yo have no permission to see All users" });
  }
});

// exports.getAllUser = async (req, res) => {
//   const user = await UserModal.find({});
//   return res.json(user);
// };
app.listen(port, () => {
  console.log("app is listining on" + port);
});
