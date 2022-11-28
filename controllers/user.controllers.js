const Task = require("../models/Task");
const User = require("../models/User");
const { validationResult } = require("express-validator");
const userController = {};

//CREATE A USER
userController.createUser = async (req, res, next) => {
  const data = req.body;
  const allowedQuery = ["name", "role"];
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    //Check if allowedQuery matches
    let dataKeys = Object.keys(data);
    dataKeys.forEach((key) => {
      if (!allowedQuery.includes(key) || dataKeys === 0) {
        const error = new Error("Invalid input fields");
        error.statusCode = 500;
        throw error;
      }

      if (!data[key]) {
        delete data[key];
        dataKeys = Object.keys(data);
      }
    });

    //Check if duplicated user data
    let duplicateUser = await User.findOne({
      name: { $eq: data.name },
      role: { $eq: data.role },
    });

    if (duplicateUser) {
      const error = new Error(
        `Duplicated data with userID ${duplicateUser._id}`
      );
      error.statusCode = 401;
      throw error;
    }

    //Execute if inputs are validated
    const newUser = await User.create(data);

    // await newUser.save();

    res
      .status(200)
      .send({ message: "User created successfully", data: newUser });
  } catch (error) {
    next(error);
  }
};

//GET ALL USERS
userController.getAllUsers = async (req, res, next) => {
  const filter = req.query;
  const allowedQuery = ["name"];
  try {
    //Check if allowedQuery matches
    let filterKeys = Object.keys(filter);
    filterKeys.forEach((key) => {
      if (!allowedQuery.includes(key) || filterKeys === 0) {
        const error = new Error("Invalid input fields");
        error.statusCode = 500;
        throw error;
      }

      if (!filter[key]) {
        delete filter[key];
        filterKeys = Object.keys(filter);
      }
    });

    //Filter user list
    const userList = await User.find(filter)
      .sort({ createAt: -1 })
      .populate("tasks");

    if (!userList) {
      const error = new Error("Internal Database Error");
      error.statusCode = 500;
      throw error;
    }

    res.status(200).send({ data: userList });
  } catch (error) {
    next(error);
  }
};

//GET USER BY ID
userController.getOneUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const foundUser = await User.findById(id).populate("tasks");

    if (!foundUser) {
      const error = new Error("Invalid ID");
      error.statusCode = 400;
      throw error;
    }

    res.status(200).send({ data: foundUser });
  } catch (error) {
    next(error);
  }
};

//GET ALL TASKS OF A USER
userController.getUserTask = async (req, res, next) => {
  const { id } = req.params;

  try {
    let foundUser = await User.findById(id).populate("tasks");

    if (!foundUser) {
      const error = new Error("Invalid ID");
      error.statusCode = 400;
      throw error;
    }

    res.status(200).send({ data: foundUser.tasks });
  } catch (error) {
    console.log(error);
  }
};

module.exports = userController;
