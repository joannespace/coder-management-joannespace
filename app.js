require("dotenv").config();
const cors = require("cors");
const mongoose = require("mongoose");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const { send } = require("process");

//CONNECT TO MONGDB_URI

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log(`Database Connected`))
  .catch((error) => {
    error.statusCode = 500;
    throw error;
  });

var app = express();

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const indexRouter = require("./routes/index");
app.use("/", indexRouter);

//HANDLE 404
app.use((req, res, next) => {
  const error = new Error("Page Not Found");
  error.statusCode = 404;
  next(error);
});

//ERROR HANDLING MIDDLEWARE
app.use((err, req, res, next) => {
  err.statusCode
    ? res.status(err.statusCode).send(err.message)
    : res.send(err.message);
});

module.exports = app;
