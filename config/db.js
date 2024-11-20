const mongoose = require("mongoose");
const { MONGO_DB_URL } = require("./constant");


const connectDb = async () => {
  try {
    await mongoose.connect(MONGO_DB_URL);
    console.log("Database Connected");
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectDb;
