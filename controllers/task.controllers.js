const { mongoose } = require("mongoose");
const Task = require("../models/Task");
const User = require("../models/User");
const taskController = {};
const { validationResult } = require("express-validator");

//CREATE A TASK
taskController.createTask = async (req, res, next) => {
  const data = req.body;

  try {
    // Check inputs keys accepted
    const allowedField = ["name", "status", "description"];

    let filterKeys = Object.keys(data);
    filterKeys.forEach((key) => {
      if (!allowedField.includes(key)) {
        const error = new Error("Invalid Fields");
        error.statusCode = 400;
        throw error;
      }

      //Check blank filter values
      if (!data[key]) {
        delete data[key];
        filterKeys = Object.keys(data);
      }
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const createdTask = await Task.create(data);

    // await createdTask.save();

    res
      .status(200)
      .send({ message: "Task created successfully", data: createdTask });
  } catch (error) {
    next(error);
  }
};

//BROWSE ALL TASKS
taskController.browseTask = async (req, res, next) => {
  try {
    const filter = req.query;

    const allowedField = ["name", "status", "createdAt", "assignees"];

    //Check filter queries qualified
    let filterKeys = Object.keys(filter);
    filterKeys.forEach((key) => {
      if (!allowedField.includes(key)) {
        const error = new Error("Invalid filter fields");
        error.statusCode = 400;
        throw error;
      }

      //Check blank filter values
      if (!filter[key]) {
        delete filter[key];
        filterKeys = Object.keys(filter);
      }
    });

    //Check taskList return
    const { createdAt, ...other } = filter;

    let taskList = await Task.find(other).populate("assignees");

    if (filterKeys.includes("createdAt")) {
      let filterDate = new Date(filter.createdAt);
      filterDate = filterDate.toLocaleDateString("en-us");
      taskList = taskList.filter((task) => {
        let createdDate = new Date(task.createdAt);
        createdDate = createdDate.toLocaleDateString("en-us");
        return filterDate === createdDate;
      });
    }

    res.send(taskList);
  } catch (error) {
    next(error);
  }
};

//GET A TASK BY ID
taskController.getTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    //Check valid ID or not
    const foundTask = await Task.findOne({ _id: id, isDeleted: false });

    if (!foundTask) {
      const error = new Error("Invalid ID");
      error.statusCode = 401;
      throw error;
    } else {
      res.status(200).send({ data: foundTask });
    }
  } catch (error) {
    next(error);
  }
};

//ASSIGN/ UNASSIGN TASK
taskController.updateAssignees = async (req, res, next) => {
  const assignedUser = req.body;
  const { id } = req.params;

  try {
    //Check ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error("Invalid ID Params");
      error.statusCode = 401;
      throw error;
    }

    //Check filter queries qualified
    const allowedField = ["assignees"];

    const filterKeys = Object.keys(assignedUser);
    filterKeys.forEach((key) => {
      if (!allowedField.includes(key)) {
        const error = new Error("Invalid Update Fields");
        error.statusCode = 400;
        throw error;
      }

      //Check blank filter values
      if (!assignedUser[key]) delete assignedUser[key];
    });

    //Check taskID is valid with current Tasklist
    let foundTask = await Task.findOne({ _id: id, isDeleted: false }).populate(
      "assignees"
    );

    if (!foundTask) {
      const error = new Error("No tasks found");
      error.statusCode = 501;
      throw error;
    }

    //Check Assign UserID Valid
    let foundUser = await User.findOne({
      _id: assignedUser.assignees,
    }).populate("tasks");

    if (!foundUser) {
      const error = new Error("Assignee's ID invalid");
      error.statusCode = 501;
      throw error;
    }

    //Current tasks in User collection
    let currentTasks = foundUser.tasks; //Array

    //Current assignees in Task collection
    let currentAssignees = foundTask.assignees; //String ID

    //Check if user was assigned this task
    let result = currentAssignees
      ? currentAssignees._id.toString() === assignedUser.assignees
      : currentAssignees === assignedUser.assignees;

    if (!result) {
      //ASSIGN FUNCTION
      foundTask.assignees = mongoose.Types.ObjectId(assignedUser.assignees);

      if (currentTasks.length === 0) {
        foundUser.tasks = foundTask;
      } else {
        currentTasks.forEach((task) => {
          let result = task._id.toString() === id;
          if (result) {
            const error = new Error("Duplicated tasks assignment");
            error.statusCode = 401;
            throw error;
          }
        });

        foundUser.tasks = [...currentTasks, foundTask];
      }

      foundTask.save();
      foundUser.save();
      res.status(200).send({ foundUser });
    } else {
      //UNASSIGN FUNCTION
      foundTask.assignees = undefined;

      currentTasks.forEach((task, index) => {
        let result = task._id.toString() === id;
        foundUser.tasks = currentTasks.splice(index, 1);
      });

      foundTask.save();
      foundUser.save();
      res.status(200).send({ foundTask });
    }
  } catch (error) {
    next(error);
  }
};

//UPDATE TASK STATUS
taskController.updateStatus = async (req, res, next) => {
  const { id } = req.params;
  const update = req.body;
  const allowedQuery = ["status"];
  const allowedValue = ["pending", "working", "review", "done", "archive"];
  try {
    //Check if ID exists
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error("Invalid ID Params");
      error.statusCode = 401;
      throw error;
    }

    //Check unallowed query
    const filterKeys = Object.keys(update);
    filterKeys.forEach((key) => {
      if (!allowedQuery.includes(key)) {
        const error = new Error("Invalid filter fields");
        error.statusCode = 400;
        throw error;
      }

      if (!allowedValue.includes(update.status)) {
        const error = new Error("Invalid status type");
        error.statusCode = 400;
        throw error;
      }

      //Check blank filter values
      if (!update[key]) delete update[key];
    });

    //Check condition for updating
    let updateTask = await Task.findOne({ _id: id, isDeleted: false });
    if (!updateTask) {
      const error = new Error("Task does not exist");
      error.statusCode = 400;
      throw error;
    }

    if (updateTask.status === "done" && update.status !== "archive") {
      const error = new Error("Unallowed status type change");
      error.statusCode = 401;
      throw error;
    }
    //Assuming input type = select in FE
    updateTask.status = update.status;

    updateTask.save();

    res.send(updateTask);
  } catch (error) {
    next(error);
  }
};

//DELETE TASK
taskController.deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const update = { isDeleted: true };

    //Check if task was deleted already
    let foundTask = await Task.findOne({ _id: id, isDeleted: false });

    if (!foundTask) {
      const error = new Error("Task does not exist");
      error.statusCode = 400;
      throw error;
    } else {
      await Task.findByIdAndUpdate(id, update, {
        returnOriginal: false,
      });

      res.status(200).send(foundTask);
    }
  } catch (error) {
    next(error);
  }
};

module.exports = taskController;
