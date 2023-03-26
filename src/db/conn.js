const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/ManagementApp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connection Sucessfull");
  })
  .catch((e) => {
    console.log("Failed to make connection", e.MongoParseError);
  });
